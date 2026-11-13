-- ============================================================================
-- MIGRATION: 20261112000003_access_tokens_and_security_hardening.sql
-- DESCRIPTION: Arquitectura de Tokens Criptográficos (128-bit SHA-256),
--              Blindaje de Cálculo Server-Side en submit_fast_judge_score,
--              Protección estricta de notas aprobadas (official_approved),
--              Eliminación de fallbacks legados en texto plano,
--              Resolución explícita de pgcrypto y Aislamiento de Clubes.
-- AUTHOR: Comercial Hels SpA
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- FASE 1: EXTENSIÓN PGCRYPTO Y RESOLUCIÓN ROBUSTA DE ESQUEMAS
-- ----------------------------------------------------------------------------
-- No asumir un esquema fijo ni duplicar/fallar si pgcrypto ya existe en otro esquema.
-- En Supabase suele residir en 'extensions', pero en algunas instancias preexistentes está en 'public'.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
      CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
    ELSE
      CREATE EXTENSION pgcrypto WITH SCHEMA public;
    END IF;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- FASE 2: TABLA DE TOKENS CRIPTOGRÁFICOS DE ALTA ENTROPÍA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.championship_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id UUID NOT NULL REFERENCES public.championships(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('judge', 'delegate')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_access_token_hash UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS idx_access_tokens_champ_type 
  ON public.championship_access_tokens (championship_id, access_type, is_active);

CREATE INDEX IF NOT EXISTS idx_access_tokens_hash 
  ON public.championship_access_tokens (token_hash) 
  WHERE is_active = true;

-- Blindaje absoluto de la tabla de tokens: NI anon NI authenticated tienen acceso directo
REVOKE ALL ON public.championship_access_tokens FROM PUBLIC, anon, authenticated;
ALTER TABLE public.championship_access_tokens ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- FASE 3: TABLA DE RATE LIMITING Y AUDITORÍA DE INTENTOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.access_attempt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  endpoint_type TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_access_attempts_ip_time 
  ON public.access_attempt_logs (ip_hash, endpoint_type, attempted_at);

REVOKE ALL ON public.access_attempt_logs FROM PUBLIC, anon, authenticated;
ALTER TABLE public.access_attempt_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- FASE 4: BLINDAJE DE submit_fast_judge_score (CÁLCULO SERVER-SIDE Y BLOQUEO CRUZADO)
-- ----------------------------------------------------------------------------
-- Cero fallbacks a texto plano: validación estricta y exclusiva contra token_hash.
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
SET search_path = pg_catalog, extensions, public
AS $$
DECLARE
  v_score_id UUID;
  v_input_hash TEXT;
  v_token_valid BOOLEAN := false;
  v_champ_status public.championship_status;
  v_champ_org_id UUID;
  v_existing_score_record RECORD;
  v_attempt INT;
  
  -- Variables de validación de gimnasta, categoría y aparato
  v_reg_champ_id UUID;
  v_reg_status public.registration_status;
  v_category_id UUID;
  v_category_discipline public.gymnastics_discipline;
  v_category_scoring_regime public.scoring_regime_type;
  v_category_default_d NUMERIC(5, 3);
  v_apparatus_discipline public.gymnastics_discipline;
  v_apparatus_code TEXT;
  v_app_is_enabled BOOLEAN := false;
  v_fixed_d_override NUMERIC(5, 3);
  
  -- Variables de cálculo matemático server-side
  v_calc_d NUMERIC(5, 3);
  v_calc_e_avg NUMERIC(5, 3);
  v_calc_deductions NUMERIC(5, 3);
  v_calc_final NUMERIC(5, 3);
  v_e_count INT;
  v_e_sum NUMERIC(10, 3) := 0;
  v_item NUMERIC;
BEGIN
  -- Normalización de intento
  v_attempt := COALESCE(p_attempt_number, 1);
  IF v_attempt NOT IN (1, 2) THEN
    RAISE EXCEPTION 'OPERIX_VAL_ERROR: El número de intento debe ser 1 o 2.';
  END IF;

  -- 1. VERIFICACIÓN CRIPTOGRÁFICA EXCLUSIVA DEL TOKEN DE JUEZ
  IF p_judge_code IS NULL OR length(trim(p_judge_code)) < 8 THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: Token de juez inválido.';
  END IF;

  -- Cálculo dinámico y seguro de SHA-256 (resuelto vía search_path: pg_catalog, extensions, public)
  v_input_hash := encode(digest(trim(p_judge_code)::bytea, 'sha256'), 'hex');

  -- Consultar estado del campeonato
  SELECT status, organization_id
  INTO v_champ_status, v_champ_org_id
  FROM public.championships
  WHERE id = p_championship_id;

  IF v_champ_status IS NULL THEN
    RAISE EXCEPTION 'OPERIX_AUTH_ERROR: Campeonato no encontrado.';
  END IF;

  -- Comprobar si existe token activo de juez (SIN FALLBACK EN TEXTO PLANO)
  SELECT true INTO v_token_valid
  FROM public.championship_access_tokens
  WHERE championship_id = p_championship_id
    AND access_type = 'judge'
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
    AND token_hash = v_input_hash;

  IF NOT COALESCE(v_token_valid, false) THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: Token de juez no válido o no autorizado para este campeonato.';
  END IF;

  -- Actualizar timestamp de último uso
  UPDATE public.championship_access_tokens
  SET last_used_at = timezone('utc'::text, now())
  WHERE token_hash = v_input_hash;

  -- 2. VERIFICAR QUE EL CAMPEONATO PERMITA INGRESO DE NOTAS
  IF v_champ_status NOT IN ('in_progress', 'registration_closed') THEN
    RAISE EXCEPTION 'OPERIX_STATUS_ERROR: El campeonato no se encuentra en estado habilitado para juzgamiento en vivo.';
  END IF;

  -- 3. VERIFICAR PERTENENCIA DE LA INSCRIPCIÓN AL CAMPEONATO (BLOQUEO DE CRUCE C2)
  SELECT r.championship_id, r.status, r.category_id, cat.discipline, cat.scoring_regime, cat.default_fixed_d_score
  INTO v_reg_champ_id, v_reg_status, v_category_id, v_category_discipline, v_category_scoring_regime, v_category_default_d
  FROM public.registrations r
  JOIN public.categories cat ON cat.id = r.category_id
  WHERE r.id = p_registration_id;

  IF v_reg_champ_id IS NULL OR v_reg_champ_id <> p_championship_id THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: La inscripción no pertenece al campeonato especificado.';
  END IF;

  IF v_reg_status <> 'approved' THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: La inscripción no se encuentra en estado aprobado.';
  END IF;

  -- 4. VERIFICAR APARATO Y DISCIPLINA (GAM/GAF)
  SELECT a.discipline, a.code INTO v_apparatus_discipline, v_apparatus_code
  FROM public.apparatuses a
  WHERE a.id = p_apparatus_id;

  IF v_apparatus_discipline IS NULL THEN
    RAISE EXCEPTION 'OPERIX_VAL_ERROR: Aparato inexistente.';
  END IF;

  IF v_apparatus_discipline <> v_category_discipline THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: Incompatibilidad de disciplina. El aparato % pertenece a % pero la categoría es %.',
      v_apparatus_code, v_apparatus_discipline, v_category_discipline;
  END IF;

  -- Solo Salto (VT) permite intento 2
  IF v_attempt = 2 AND v_apparatus_code <> 'VT' THEN
    RAISE EXCEPTION 'OPERIX_VAL_ERROR: El segundo intento solo está reglamentado para el aparato Salto (VT).';
  END IF;

  -- 5. VERIFICAR QUE EL APARATO ESTÉ ASIGNADO A LA CATEGORÍA
  SELECT true, ca.fixed_d_score 
  INTO v_app_is_enabled, v_fixed_d_override
  FROM public.category_apparatuses ca
  WHERE ca.category_id = v_category_id AND ca.apparatus_id = p_apparatus_id;

  IF NOT COALESCE(v_app_is_enabled, false) THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: El aparato % no está habilitado para la categoría.', v_apparatus_code;
  END IF;

  -- --------------------------------------------------------------------------
  -- CÁLCULO MATEMÁTICO SERVER-SIDE (FUENTE DE VERDAD INALTERABLE)
  -- --------------------------------------------------------------------------
  -- Régimen de puntuación: obligatorio vs libre
  IF v_category_scoring_regime = 'obligatory' THEN
    v_calc_d := COALESCE(v_fixed_d_override, v_category_default_d, 10.000);
  ELSE
    v_calc_d := COALESCE(p_d_score, 0.000);
  END IF;

  IF v_calc_d < 0.000 OR v_calc_d > 15.000 THEN
    RAISE EXCEPTION 'OPERIX_VAL_ERROR: Valor D-Score (%) fuera de rango permitido (0 - 15.0).', v_calc_d;
  END IF;

  -- Validación de deducciones neutras
  v_calc_deductions := COALESCE(p_neutral_deductions, 0.000);
  IF v_calc_deductions < 0.000 OR v_calc_deductions > 10.000 THEN
    RAISE EXCEPTION 'OPERIX_VAL_ERROR: Deducciones neutras fuera de rango permitido.';
  END IF;

  -- Cálculo de E-Score Server-Side a partir del JSONB
  v_e_count := jsonb_array_length(COALESCE(p_e_scores, '[]'::jsonb));
  IF v_e_count > 0 THEN
    FOR i IN 0..(v_e_count - 1) LOOP
      v_item := (p_e_scores->>i)::NUMERIC;
      IF v_item < 0.000 OR v_item > 10.000 THEN
        RAISE EXCEPTION 'OPERIX_VAL_ERROR: Nota E individual (%) fuera del rango FIG 0.0 - 10.0.', v_item;
      END IF;
      v_e_sum := v_e_sum + v_item;
    END LOOP;
    v_calc_e_avg := round(v_e_sum / v_e_count, 3);
  ELSE
    v_calc_e_avg := COALESCE(p_e_score_avg, 0.000);
    IF v_calc_e_avg < 0.000 OR v_calc_e_avg > 10.000 THEN
      RAISE EXCEPTION 'OPERIX_VAL_ERROR: Promedio E fuera de rango 0.0 - 10.0.';
    END IF;
  END IF;

  -- Puntuación Final Oficial = D + E - Deducciones (mínimo 0.000)
  v_calc_final := GREATEST(0.000, round(v_calc_d + v_calc_e_avg - v_calc_deductions, 3));

  -- --------------------------------------------------------------------------
  -- PROTECCIÓN ESTRICTA DE NOTAS APROBADAS (official_approved)
  -- --------------------------------------------------------------------------
  SELECT id, status, championship_id, d_score, e_score_avg, neutral_deductions, final_score
  INTO v_existing_score_record
  FROM public.scores
  WHERE registration_id = p_registration_id
    AND apparatus_id = p_apparatus_id
    AND attempt_number = v_attempt;

  IF v_existing_score_record.id IS NOT NULL THEN
    -- Rechazo categórico si ya fue aprobada oficialmente
    IF v_existing_score_record.status = 'official_approved' THEN
      RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: La nota para este gimnasta ya ha sido aprobada oficialmente por el Juez Árbitro y no puede ser modificada desde la terminal rápida.';
    END IF;

    -- Bloqueo de intento de modificar nota asociada a otro campeonato
    IF v_existing_score_record.championship_id <> p_championship_id THEN
      RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: La puntuación existente no pertenece a este campeonato.';
    END IF;
  END IF;

  -- Upsert de la puntuación calculada en estado provisional
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
    v_calc_d,
    COALESCE(p_e_scores, '[]'::jsonb),
    v_calc_e_avg,
    v_calc_deductions,
    v_calc_final,
    'provisional',
    p_judge_name,
    'Calculado y enviado en vivo desde FastJudgeTerminal: ' || p_judge_name || ' (Intento ' || v_attempt || ')'
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

-- ----------------------------------------------------------------------------
-- FASE 5: RECTIFICACIÓN AUDITADA POR JUEZ ÁRBITRO / ADMINISTRADOR
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_modify_approved_score(
  p_score_id UUID,
  p_new_d_score NUMERIC(5, 3),
  p_new_e_scores JSONB,
  p_new_neutral_deductions NUMERIC(5, 3),
  p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, extensions, public
AS $$
DECLARE
  v_uid UUID;
  v_score RECORD;
  v_e_count INT;
  v_e_sum NUMERIC(10, 3) := 0;
  v_item NUMERIC;
  v_calc_e_avg NUMERIC(5, 3);
  v_calc_final NUMERIC(5, 3);
  v_prev_json JSONB;
  v_new_json JSONB;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'OPERIX_AUTH_ERROR: Debe iniciar sesión para modificar una nota aprobada.';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) < 5 THEN
    RAISE EXCEPTION 'OPERIX_VAL_ERROR: Debe ingresar un motivo justificado (mínimo 5 caracteres) para la rectificación de nota.';
  END IF;

  SELECT s.*, c.organization_id 
  INTO v_score
  FROM public.scores s
  JOIN public.championships c ON c.id = s.championship_id
  WHERE s.id = p_score_id;

  IF v_score.id IS NULL THEN
    RAISE EXCEPTION 'OPERIX_VAL_ERROR: Puntuación no encontrada.';
  END IF;

  -- Comprobar si el usuario es platform_admin o head_judge / org_admin de esa organización
  IF NOT (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND platform_role = 'platform_admin')
    OR EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = v_score.organization_id 
        AND om.user_id = v_uid 
        AND om.role IN ('org_admin', 'competition_manager', 'head_judge')
        AND om.is_active = true
    )
  ) THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: No tiene privilegios de Juez Árbitro ni Administrador en la organización de este campeonato.';
  END IF;

  -- Calcular nuevo E-Score
  v_e_count := jsonb_array_length(COALESCE(p_new_e_scores, '[]'::jsonb));
  IF v_e_count > 0 THEN
    FOR i IN 0..(v_e_count - 1) LOOP
      v_item := (p_new_e_scores->>i)::NUMERIC;
      v_e_sum := v_e_sum + v_item;
    END LOOP;
    v_calc_e_avg := round(v_e_sum / v_e_count, 3);
  ELSE
    v_calc_e_avg := v_score.e_score_avg;
  END IF;

  v_calc_final := GREATEST(0.000, round(p_new_d_score + v_calc_e_avg - p_new_neutral_deductions, 3));

  v_prev_json := jsonb_build_object(
    'd_score', v_score.d_score,
    'e_scores', v_score.e_scores,
    'e_score_avg', v_score.e_score_avg,
    'neutral_deductions', v_score.neutral_deductions,
    'final_score', v_score.final_score,
    'status', v_score.status
  );

  v_new_json := jsonb_build_object(
    'd_score', p_new_d_score,
    'e_scores', p_new_e_scores,
    'e_score_avg', v_calc_e_avg,
    'neutral_deductions', p_new_neutral_deductions,
    'final_score', v_calc_final,
    'status', 'official_approved'
  );

  -- Registrar en bitácora inmutable de auditoría
  INSERT INTO public.score_audits (
    score_id,
    organization_id,
    modified_by_user_id,
    reason,
    previous_value,
    new_value
  )
  VALUES (
    v_score.id,
    v_score.organization_id,
    v_uid,
    trim(p_reason),
    v_prev_json,
    v_new_json
  );

  -- Actualizar puntuación
  UPDATE public.scores
  SET d_score = p_new_d_score,
      e_scores = p_new_e_scores,
      e_score_avg = v_calc_e_avg,
      neutral_deductions = p_new_neutral_deductions,
      final_score = v_calc_final,
      status = 'official_approved',
      approved_by_user_id = v_uid,
      approved_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = v_score.id;

  RETURN v_score.id;
END;
$$;

-- ----------------------------------------------------------------------------
-- FASE 6: get_championship_by_code ENDURECIDA (EXCLUSIVAMENTE TOKEN HASH)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_championship_by_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, extensions, public
AS $$
DECLARE
  v_input_hash TEXT;
  v_champ RECORD;
  v_categories JSONB;
  v_apparatuses JSONB;
  v_registrations JSONB;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) < 8 THEN
    RETURN NULL;
  END IF;

  -- Cálculo dinámico y seguro de SHA-256 (resuelto vía search_path: pg_catalog, extensions, public)
  v_input_hash := encode(digest(trim(p_code)::bytea, 'sha256'), 'hex');

  -- Buscar campeonato ÚNICAMENTE por token hash de tipo 'judge' activo y vigente
  SELECT c.id, c.organization_id, c.name, c.slug, c.description, c.start_date, c.end_date,
         c.location, c.venue_name, c.visibility, c.status, c.ruleset_version, c.scoring_schema_version,
         c.banner_url, c.bases_url, c.contact_email, c.contact_phone, c.entry_fee_info, c.schedule_updated_at
  INTO v_champ
  FROM public.championships c
  JOIN public.championship_access_tokens t ON t.championship_id = c.id
  WHERE t.token_hash = v_input_hash
    AND t.access_type = 'judge'
    AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > timezone('utc'::text, now()))
  LIMIT 1;

  IF v_champ.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Categorías oficiales del campeonato
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'name', name,
    'code', code,
    'discipline', discipline,
    'gender', gender,
    'scoring_regime', scoring_regime,
    'default_fixed_d_score', default_fixed_d_score
  )), '[]'::jsonb)
  INTO v_categories
  FROM (
    SELECT id, name, code, discipline, gender, scoring_regime, default_fixed_d_score
    FROM public.categories
    WHERE championship_id = v_champ.id
    ORDER BY sort_order
  ) c;

  -- Aparatos habilitados en las categorías del campeonato
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'code', code,
    'name', name,
    'discipline', discipline
  )), '[]'::jsonb)
  INTO v_apparatuses
  FROM (
    SELECT DISTINCT a.id, a.code, a.name, a.discipline, a.sort_order
    FROM public.apparatuses a
    JOIN public.category_apparatuses ca ON ca.apparatus_id = a.id
    JOIN public.categories cat ON cat.id = ca.category_id
    WHERE cat.championship_id = v_champ.id
    ORDER BY a.sort_order
  ) a;

  -- Inscripciones aprobadas ordenadas por dorsal (SIN EXPOSITAR FECHAS DE NACIMIENTO)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', sub.id,
    'bib_number', sub.bib_number,
    'rotation_group', sub.rotation_group,
    'gymnast_name', sub.first_name || ' ' || sub.last_name,
    'club_name', sub.club_name,
    'category_name', sub.category_name,
    'discipline', sub.discipline,
    'scoring_regime', sub.scoring_regime,
    'default_fixed_d_score', sub.default_fixed_d_score
  )), '[]'::jsonb)
  INTO v_registrations
  FROM (
    SELECT 
      r.id,
      r.bib_number,
      r.rotation_group,
      g.first_name,
      g.last_name,
      COALESCE(cl.name, 'Sin Club') AS club_name,
      cat.name AS category_name,
      cat.discipline::TEXT AS discipline,
      cat.scoring_regime,
      cat.default_fixed_d_score
    FROM public.registrations r
    JOIN public.gymnasts g ON r.gymnast_id = g.id
    LEFT JOIN public.clubs cl ON r.club_id = cl.id
    JOIN public.categories cat ON r.category_id = cat.id
    WHERE r.championship_id = v_champ.id
      AND r.status = 'approved'
    ORDER BY r.bib_number ASC
  ) sub;

  RETURN jsonb_build_object(
    'championship', to_jsonb(v_champ),
    'categories', v_categories,
    'apparatuses', v_apparatuses,
    'registrations', v_registrations
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- FASE 7: AISLAMIENTO ESTRICTO EN get_my_club_rotations
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_club_rotations(
  p_championship_id UUID,
  p_club_id UUID DEFAULT NULL
)
RETURNS TABLE (
  registration_id UUID,
  gymnast_id UUID,
  first_name TEXT,
  last_name TEXT,
  club_id UUID,
  club_name TEXT,
  club_code TEXT,
  bib_number INT,
  category_name TEXT,
  discipline TEXT,
  subdivision TEXT,
  rotation_group TEXT,
  starting_apparatus TEXT,
  start_order INT,
  status public.registration_status,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  v_uid UUID;
  v_user_club_ids UUID[];
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'OPERIX_AUTH_ERROR: Debe iniciar sesión para consultar rotaciones de delegados.';
  END IF;

  -- 1. Si es administrador de plataforma u organizador del torneo
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_uid AND platform_role = 'platform_admin'
  ) OR EXISTS (
    SELECT 1 FROM public.championships c
    JOIN public.organization_members om ON om.organization_id = c.organization_id
    WHERE c.id = p_championship_id 
      AND om.user_id = v_uid 
      AND om.is_active = true
      AND om.role IN ('org_admin', 'competition_manager', 'head_judge')
  ) THEN
    RETURN QUERY
    SELECT 
      r.id AS registration_id,
      g.id AS gymnast_id,
      g.first_name,
      g.last_name,
      cl.id AS club_id,
      cl.name AS club_name,
      cl.code AS club_code,
      r.bib_number,
      cat.name AS category_name,
      cat.discipline::TEXT AS discipline,
      r.subdivision,
      r.rotation_group,
      r.starting_apparatus,
      r.start_order,
      r.status,
      r.updated_at
    FROM public.registrations r
    JOIN public.gymnasts g ON g.id = r.gymnast_id
    JOIN public.clubs cl ON cl.id = r.club_id
    LEFT JOIN public.categories cat ON cat.id = r.category_id
    WHERE r.championship_id = p_championship_id
      AND (p_club_id IS NULL OR r.club_id = p_club_id)
      AND r.status = 'approved'
    ORDER BY r.subdivision, r.rotation_group, r.start_order;
    RETURN;
  END IF;

  -- 2. Delegado o Entrenador de Club:
  SELECT array_agg(cm.club_id) INTO v_user_club_ids
  FROM public.club_members cm
  WHERE cm.user_id = v_uid;

  IF v_user_club_ids IS NULL OR array_length(v_user_club_ids, 1) = 0 THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: El usuario no cuenta con membresías de club activas.';
  END IF;

  IF p_club_id IS NOT NULL AND NOT (p_club_id = ANY(v_user_club_ids)) THEN
    RAISE EXCEPTION 'OPERIX_SECURITY_VIOLATION: No tiene autorización para consultar gimnastas de otro club.';
  END IF;

  RETURN QUERY
  SELECT 
    r.id AS registration_id,
    g.id AS gymnast_id,
    g.first_name,
    g.last_name,
    cl.id AS club_id,
    cl.name AS club_name,
    cl.code AS club_code,
    r.bib_number,
    cat.name AS category_name,
    cat.discipline::TEXT AS discipline,
    r.subdivision,
    r.rotation_group,
    r.starting_apparatus,
    r.start_order,
    r.status,
    r.updated_at
  FROM public.registrations r
  JOIN public.gymnasts g ON g.id = r.gymnast_id
  JOIN public.clubs cl ON cl.id = r.club_id
  LEFT JOIN public.categories cat ON cat.id = r.category_id
  WHERE r.championship_id = p_championship_id
    AND r.club_id = ANY(v_user_club_ids)
    AND (p_club_id IS NULL OR r.club_id = p_club_id)
    AND r.status = 'approved'
  ORDER BY r.subdivision, r.rotation_group, r.start_order;
END;
$$;

-- ----------------------------------------------------------------------------
-- FASE 8: PRIVILEGIOS MÍNIMOS Y REVOCACIÓN DE PUBLIC
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.submit_fast_judge_score FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_fast_judge_score TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_championship_by_code FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_championship_by_code TO anon, authenticated;

REVOKE ALL ON FUNCTION public.admin_modify_approved_score FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_modify_approved_score TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_club_rotations(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_club_rotations(UUID, UUID) TO authenticated;

-- Revocación de columnas privadas para authenticated también
REVOKE SELECT (judge_code, invite_code) ON public.championships FROM authenticated;

-- ----------------------------------------------------------------------------
-- FASE 9: VISTA PÚBLICA SEGURA CON security_invoker = true
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_championships 
WITH (security_invoker = true)
AS
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
  created_at,
  updated_at,
  bases_url,
  contact_email,
  contact_phone,
  entry_fee_info,
  public_portal_settings,
  schedule_updated_at,
  schedule_change_notices
FROM public.championships;

REVOKE ALL ON public.public_championships FROM PUBLIC;
GRANT SELECT ON public.public_championships TO anon, authenticated;

COMMIT;
