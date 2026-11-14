-- ============================================================================
-- OPERIX GYMNASTICS — REMEDIACIÓN INTEGRAL AUDITORÍA PAILLACO 2026
-- Desarrollado por Comercial Hels SpA
-- Fecha: 14 de noviembre de 2026
-- Cubre hallazgos: C2, A1, A2, A5, M4, M5
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. C2: PROTECCIÓN DE JUDGE_CODE E INVITE_CODE EN CHAMPIONSHIPS
-- ============================================================================
REVOKE SELECT ON public.championships FROM anon, authenticated;

GRANT SELECT (
  id,
  organization_id,
  name,
  slug,
  description,
  start_date,
  end_date,
  location,
  venue_name,
  visibility,
  status,
  ruleset_version,
  scoring_schema_version,
  banner_url,
  bases_url,
  entry_fee_info,
  public_portal_settings,
  schedule_updated_at,
  schedule_change_notices,
  created_at,
  updated_at
) ON public.championships TO anon;

GRANT SELECT (
  id,
  organization_id,
  name,
  slug,
  description,
  start_date,
  end_date,
  location,
  venue_name,
  visibility,
  status,
  ruleset_version,
  scoring_schema_version,
  banner_url,
  bases_url,
  contact_email,
  contact_phone,
  entry_fee_info,
  public_portal_settings,
  schedule_updated_at,
  schedule_change_notices,
  created_at,
  updated_at
) ON public.championships TO authenticated;

CREATE OR REPLACE VIEW public.public_championships AS
SELECT
  id,
  organization_id,
  name,
  slug,
  description,
  start_date,
  end_date,
  location,
  venue_name,
  visibility,
  status,
  ruleset_version,
  scoring_schema_version,
  banner_url,
  bases_url,
  entry_fee_info,
  public_portal_settings,
  schedule_updated_at,
  schedule_change_notices,
  created_at,
  updated_at
FROM public.championships
WHERE visibility = 'public';

GRANT SELECT ON public.public_championships TO anon, authenticated;

-- RPC exclusiva para que org_admin / competition_manager / head_judge consulten códigos
CREATE OR REPLACE FUNCTION public.get_admin_championship_codes(p_championship_id UUID)
RETURNS TABLE (invite_code TEXT, judge_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.is_platform_admin(auth.uid())
    OR public.current_user_has_championship_role(
      p_championship_id,
      ARRAY['org_admin', 'competition_manager', 'head_judge']::public.organization_role[]
    )
  ) THEN
    RAISE EXCEPTION 'ACCESO DENEGADO: No autorizado para consultar códigos reservados del campeonato.';
  END IF;

  RETURN QUERY
  SELECT c.invite_code, c.judge_code
  FROM public.championships c
  WHERE c.id = p_championship_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_championship_codes(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_championship_codes(UUID) TO authenticated;

-- ============================================================================
-- 2. A5: PROTECCIÓN DE DATOS PERSONALES DE MENORES EN GYMNASTS (ROL ANON)
-- ============================================================================
REVOKE SELECT ON public.gymnasts FROM anon;

GRANT SELECT (
  id,
  club_id,
  organization_id,
  first_name,
  last_name,
  gender,
  birth_year,
  created_at,
  updated_at
) ON public.gymnasts TO anon;

-- ============================================================================
-- 3. A2 & M5: RECÁLCULO SERVIDOR Y VALIDACIÓN DE APARATO EN SUBMIT_FAST_JUDGE_SCORE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_fast_judge_score(
  p_championship_id UUID,
  p_judge_code TEXT,
  p_registration_id UUID,
  p_apparatus_id UUID,
  p_judge_name TEXT,
  p_d_score NUMERIC(5, 3),
  p_e_scores JSONB,
  p_e_score_avg NUMERIC(5, 3),
  p_neutral_deductions NUMERIC(5, 3),
  p_final_score NUMERIC(5, 3),
  p_attempt_number INT DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score_id UUID;
  v_expected_code TEXT;
  v_champ_status public.championship_status;
  v_existing_status public.score_status;
  v_reg_champ_id UUID;
  v_reg_category_id UUID;
  v_reg_status public.registration_status;
  v_cat_discipline public.gymnastics_discipline_code;
  v_app_discipline public.gymnastics_discipline_code;
  v_app_allowed BOOLEAN;
  v_computed_final NUMERIC(5, 3);
  v_attempt INT;
BEGIN
  v_attempt := COALESCE(p_attempt_number, 1);
  IF v_attempt NOT IN (1, 2) THEN
    RAISE EXCEPTION 'El número de intento debe ser 1 o 2.';
  END IF;

  SELECT c.judge_code, c.status INTO v_expected_code, v_champ_status
  FROM public.championships c
  WHERE c.id = p_championship_id;

  IF v_expected_code IS NULL OR TRIM(UPPER(v_expected_code)) <> TRIM(UPPER(p_judge_code)) THEN
    RAISE EXCEPTION 'ACCESO DENEGADO: Código de juez inválido para este campeonato.';
  END IF;

  IF v_champ_status NOT IN ('in_progress', 'registration_closed') THEN
    RAISE EXCEPTION 'COMPETICIÓN NO ACTIVA: Solo se pueden ingresar notas en campeonatos en curso.';
  END IF;

  -- Validar inscripción y pertenencia al campeonato
  SELECT r.championship_id, r.category_id, r.status, cat.discipline
    INTO v_reg_champ_id, v_reg_category_id, v_reg_status, v_cat_discipline
  FROM public.registrations r
  JOIN public.categories cat ON cat.id = r.category_id
  WHERE r.id = p_registration_id;

  IF v_reg_champ_id IS NULL OR v_reg_champ_id <> p_championship_id THEN
    RAISE EXCEPTION 'INSCRIPCIÓN INVÁLIDA: El gimnasta no pertenece a este campeonato.';
  END IF;

  IF v_reg_status <> 'approved' THEN
    RAISE EXCEPTION 'INSCRIPCIÓN NO APROBADA: Solo se pueden calificar gimnastas con inscripción aprobada.';
  END IF;

  -- Validar compatibilidad de aparato con la rama y categoría
  SELECT a.discipline INTO v_app_discipline
  FROM public.apparatuses a
  WHERE a.id = p_apparatus_id;

  IF v_app_discipline IS NULL OR v_app_discipline <> v_cat_discipline THEN
    RAISE EXCEPTION 'APARATO INCOMPATIBLE: El aparato seleccionado no corresponde a la modalidad (%) del gimnasta.', v_cat_discipline;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.category_apparatuses ca
    WHERE ca.category_id = v_reg_category_id
      AND ca.apparatus_id = p_apparatus_id
  ) INTO v_app_allowed;

  IF NOT v_app_allowed THEN
    RAISE EXCEPTION 'APARATO NO HABILITADO: El aparato no está habilitado para la categoría de este gimnasta.';
  END IF;

  -- Verificar bloqueo si la nota ya fue aprobada oficialmente
  SELECT s.status INTO v_existing_status
  FROM public.scores s
  WHERE s.registration_id = p_registration_id
    AND s.apparatus_id = p_apparatus_id
    AND s.attempt_number = v_attempt;

  IF v_existing_status = 'official_approved' THEN
    RAISE EXCEPTION 'PUNTUACIÓN BLOQUEADA: La nota ya ha sido aprobada oficialmente por el Juez Árbitro y no puede ser modificada.';
  END IF;

  -- Recálculo estricto de nota final en servidor: max(0, round(D + E - ND, 3))
  v_computed_final := GREATEST(
    0.000,
    ROUND(
      COALESCE(p_d_score, 0.000) + COALESCE(p_e_score_avg, 0.000) - COALESCE(p_neutral_deductions, 0.000),
      3
    )
  );

  INSERT INTO public.scores (
    championship_id,
    registration_id,
    apparatus_id,
    attempt_number,
    d_score,
    e_scores,
    e_score_avg,
    neutral_deductions,
    final_score,
    status,
    judge_name,
    notes
  )
  VALUES (
    p_championship_id,
    p_registration_id,
    p_apparatus_id,
    v_attempt,
    COALESCE(p_d_score, 0.000),
    COALESCE(p_e_scores, '[]'::jsonb),
    COALESCE(p_e_score_avg, 0.000),
    COALESCE(p_neutral_deductions, 0.000),
    v_computed_final,
    'provisional',
    p_judge_name,
    'Enviado en vivo desde terminal por juez: ' || p_judge_name || ' (Intento ' || v_attempt || ')'
  )
  ON CONFLICT (registration_id, apparatus_id, attempt_number)
  DO UPDATE SET
    d_score = EXCLUDED.d_score,
    e_scores = EXCLUDED.e_scores,
    e_score_avg = EXCLUDED.e_score_avg,
    neutral_deductions = EXCLUDED.neutral_deductions,
    final_score = EXCLUDED.final_score,
    status = 'provisional',
    judge_name = EXCLUDED.judge_name,
    notes = EXCLUDED.notes,
    updated_at = timezone('utc'::text, now())
  RETURNING id INTO v_score_id;

  RETURN v_score_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_fast_judge_score FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_fast_judge_score TO anon, authenticated;

-- ============================================================================
-- 4. M4: AISLAMIENTO ESTRICTO DE CLUBES EN GYMNASTS Y REGISTRATIONS
-- ============================================================================
DROP POLICY IF EXISTS "Club managers and members can manage gymnasts" ON public.gymnasts;
CREATE POLICY "Club managers and members can manage gymnasts"
  ON public.gymnasts
  FOR ALL
  TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR public.current_user_belongs_to_club(club_id)
    OR public.current_user_has_org_role(
      organization_id,
      ARRAY[
        'org_admin'::public.organization_role,
        'competition_manager'::public.organization_role
      ]
    )
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.current_user_belongs_to_club(club_id)
    OR public.current_user_has_org_role(
      organization_id,
      ARRAY[
        'org_admin'::public.organization_role,
        'competition_manager'::public.organization_role
      ]
    )
  );

-- ============================================================================
-- 5. A1: TABLAS FALTANTES FASE 21 & 22 (DEMO_REQUESTS Y CONFIG APARATOS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  discipline TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'marketing_landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS demo_requests_public_insert ON public.demo_requests;
CREATE POLICY demo_requests_public_insert
  ON public.demo_requests FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(trim(full_name)) >= 2 AND position('@' in email) > 1);
REVOKE ALL ON public.demo_requests FROM anon, authenticated;
GRANT INSERT (full_name, organization, role, email, phone, discipline, message, source)
  ON public.demo_requests TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.championship_apparatus_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id UUID NOT NULL REFERENCES public.championships(id) ON DELETE CASCADE,
  discipline public.gymnastics_discipline_code NOT NULL,
  apparatus_code TEXT NOT NULL,
  apparatus_name_es TEXT NOT NULL,
  apparatus_name_int TEXT NOT NULL,
  competition_order INT NOT NULL DEFAULT 1,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_mandatory_all_around BOOLEAN NOT NULL DEFAULT true,
  is_computable_all_around BOOLEAN NOT NULL DEFAULT true,
  is_computable_team BOOLEAN NOT NULL DEFAULT true,
  has_individual_award BOOLEAN NOT NULL DEFAULT true,
  scoring_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  rotation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  award_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_champ_discipline_apparatus UNIQUE (championship_id, discipline, apparatus_code)
);
ALTER TABLE public.championship_apparatus_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view championship apparatus configs" ON public.championship_apparatus_configs;
CREATE POLICY "Public can view championship apparatus configs"
  ON public.championship_apparatus_configs FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.category_apparatus_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id UUID NOT NULL REFERENCES public.championships(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE,
  discipline public.gymnastics_discipline_code NOT NULL,
  enabled_apparatuses TEXT[] NOT NULL DEFAULT '{}'::text[],
  mandatory_apparatuses TEXT[] NOT NULL DEFAULT '{}'::text[],
  computable_apparatuses TEXT[] NOT NULL DEFAULT '{}'::text[],
  competition_order TEXT[] NOT NULL DEFAULT '{}'::text[],
  all_around_mode TEXT NOT NULL DEFAULT 'sum_all_enabled',
  all_around_best_n INT NOT NULL DEFAULT 4,
  min_apparatuses_for_aa INT NOT NULL DEFAULT 1,
  allow_incomplete_aa BOOLEAN NOT NULL DEFAULT true,
  team_enabled BOOLEAN NOT NULL DEFAULT true,
  team_top_n_per_apparatus INT NOT NULL DEFAULT 3,
  team_min_members INT NOT NULL DEFAULT 3,
  allow_incomplete_teams BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.category_apparatus_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view category apparatus overrides" ON public.category_apparatus_overrides;
CREATE POLICY "Public can view category apparatus overrides"
  ON public.category_apparatus_overrides FOR SELECT USING (true);

COMMIT;
