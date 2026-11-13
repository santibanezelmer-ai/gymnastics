-- ============================================================================
-- ROLLBACK: rollback_20261112000003_secure_rollback.sql
-- DESCRIPTION: Reversión segura de la migración 00003.
--              IMPORTANTE: NUNCA restaura SELECT global a anon sobre championships
--              ni reexpone judge_code o invite_code. Mantiene permisos por columna.
-- AUTHOR: Comercial Hels SpA
-- ============================================================================

BEGIN;

-- 1. Eliminar de forma segura funciones de modificación administrativa
DROP FUNCTION IF EXISTS public.admin_modify_approved_score(UUID, NUMERIC, JSONB, NUMERIC, TEXT);

-- 2. Eliminar tablas accesorias de tokens y rate limiting
DROP TABLE IF EXISTS public.access_attempt_logs CASCADE;
DROP TABLE IF EXISTS public.championship_access_tokens CASCADE;

-- 3. Restaurar versión de get_championship_by_code de la migración 00002 (sin tokens)
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
  SELECT 
    id, organization_id, name, slug, description, start_date, end_date,
    location, venue_name, visibility, status, ruleset_version, scoring_schema_version,
    banner_url, bases_url, contact_email, contact_phone, entry_fee_info, schedule_updated_at
  INTO v_champ
  FROM public.championships
  WHERE upper(judge_code) = upper(trim(p_code))
  LIMIT 1;

  IF v_champ IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'name', name, 'code', code, 'discipline', discipline,
    'gender', gender, 'scoring_regime', scoring_regime, 'default_fixed_d_score', default_fixed_d_score
  )), '[]'::jsonb)
  INTO v_categories
  FROM (
    SELECT id, name, code, discipline, gender, scoring_regime, default_fixed_d_score
    FROM public.categories WHERE championship_id = v_champ.id ORDER BY sort_order
  ) c;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'code', code, 'name', name, 'discipline', discipline
  )), '[]'::jsonb)
  INTO v_apparatuses
  FROM (
    SELECT DISTINCT a.id, a.code, a.name, a.discipline
    FROM public.apparatuses a
    JOIN public.category_apparatuses ca ON ca.apparatus_id = a.id
    JOIN public.categories cat ON cat.id = ca.category_id
    WHERE cat.championship_id = v_champ.id
    ORDER BY a.discipline
  ) a;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', sub.id, 'bib_number', sub.bib_number, 'rotation_group', sub.rotation_group,
    'gymnast_name', sub.first_name || ' ' || sub.last_name, 'club_name', sub.club_name,
    'category_name', sub.category_name, 'scoring_regime', sub.scoring_regime,
    'default_fixed_d_score', sub.default_fixed_d_score
  )), '[]'::jsonb)
  INTO v_registrations
  FROM (
    SELECT 
      r.id, r.bib_number, r.rotation_group, g.first_name, g.last_name,
      coalesce(cl.name, 'Sin Club') AS club_name, cat.name AS category_name,
      cat.scoring_regime, cat.default_fixed_d_score
    FROM public.registrations r
    JOIN public.gymnasts g ON r.gymnast_id = g.id
    LEFT JOIN public.clubs cl ON r.club_id = cl.id
    JOIN public.categories cat ON r.category_id = cat.id
    WHERE r.championship_id = v_champ.id AND r.status = 'approved'
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

-- 4. Reafirmar permisos estrictos: nunca conceder SELECT sobre judge_code o invite_code a anon
REVOKE SELECT ON public.championships FROM anon;
GRANT SELECT (
  id, organization_id, name, slug, description, start_date, end_date,
  location, venue_name, visibility, status, ruleset_version, scoring_schema_version,
  banner_url, created_at, updated_at, bases_url, contact_email, contact_phone,
  entry_fee_info, public_portal_settings, schedule_updated_at, schedule_change_notices
) ON public.championships TO anon;

COMMIT;
