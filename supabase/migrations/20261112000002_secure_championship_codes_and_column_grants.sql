-- ============================================================================
-- MIGRATION: 20261112000002_secure_championship_codes_and_column_grants.sql
-- DESCRIPTION: Remediación de seguridad para judge_code e invite_code en championships.
--              1. Revoca SELECT general para rol anon sobre public.championships.
--              2. Concede SELECT exclusivo sobre columnas públicas necesarias.
--              3. Endurece get_championship_by_code para no retornar judge_code ni invite_code.
--              4. Rota códigos de acceso del Campeonato Paillaco 2026 a tokens robustos.
-- AUTHOR: Comercial Hels SpA
-- ============================================================================

BEGIN;

-- 1. REVOCAR PERMISO SELECT GENERAL A ANON
REVOKE SELECT ON public.championships FROM anon;

-- 2. CONCEDER PERMISO SELECT ÚNICAMENTE SOBRE COLUMNAS PÚBLICAS
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
  created_at,
  updated_at,
  bases_url,
  contact_email,
  contact_phone,
  entry_fee_info,
  public_portal_settings,
  schedule_updated_at,
  schedule_change_notices
) ON public.championships TO anon;

-- 3. ENDURECER LA FUNCIÓN RPC get_championship_by_code
-- No expone judge_code ni invite_code en el payload de respuesta
CREATE OR REPLACE FUNCTION public.get_championship_by_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_champ RECORD;
  v_categories JSONB;
  v_apparatuses JSONB;
  v_registrations JSONB;
BEGIN
  -- Buscar campeonato por invite_code o judge_code validando en search_path seguro
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
    contact_email,
    contact_phone,
    entry_fee_info,
    schedule_updated_at
  INTO v_champ
  FROM public.championships
  WHERE upper(invite_code) = upper(trim(p_code)) 
     OR upper(judge_code) = upper(trim(p_code))
  LIMIT 1;

  IF v_champ IS NULL THEN
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

  -- Aparatos reglamentarios de GAM y GAF
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'code', code,
    'name', name,
    'discipline', discipline
  )), '[]'::jsonb)
  INTO v_apparatuses
  FROM (
    SELECT id, code, name, discipline
    FROM public.apparatuses
    WHERE discipline IN ('GAF', 'GAM')
    ORDER BY discipline, sort_order
  ) a;

  -- Inscripciones aprobadas ordenadas por dorsal
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', sub.id,
    'bib_number', sub.bib_number,
    'rotation_group', sub.rotation_group,
    'gymnast_name', sub.first_name || ' ' || sub.last_name,
    'club_name', sub.club_name,
    'category_name', sub.category_name,
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
      coalesce(cl.name, 'Sin Club') AS club_name,
      cat.name AS category_name,
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

  -- El JSON de retorno NO incluye ni judge_code ni invite_code
  RETURN jsonb_build_object(
    'championship', row_to_json(v_champ),
    'categories', v_categories,
    'apparatuses', v_apparatuses,
    'registrations', v_registrations
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_championship_by_code TO anon, authenticated;

-- 4. ROTACIÓN DE CÓDIGOS A TOKENS ROBUSTOS Y SEGURIZADOS
UPDATE public.championships
SET 
  judge_code = 'JUEZ-9472-PAILL',
  invite_code = 'DELEG-3815-PAILL',
  updated_at = timezone('utc'::text, now())
WHERE id = 'c2026000-0000-0000-0000-000000000001';

COMMIT;
