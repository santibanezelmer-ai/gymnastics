-- ============================================================================
-- ROLLBACK SEGURO: rollback_20261112000002_secure_championship_codes.sql
-- DESCRIPCIÓN: Reversa segura de la migración de seguridad.
--              IMPORTANTE: NUNCA concede SELECT global a 'anon' para evitar
--              re-exponer judge_code o invite_code. En caso de requerir
--              acceso ampliado, restaura los permisos por columna pública o
--              utiliza una vista pública sanitizada.
-- ============================================================================

BEGIN;

-- 1. Mantener REVOKE sobre la tabla base para el rol anon
REVOKE SELECT ON public.championships FROM anon;

-- 2. Asegurar que anon solo pueda consultar columnas públicas explícitas
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

-- 3. Crear vista pública segura como alternativa arquitectónica
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
  created_at,
  updated_at,
  bases_url,
  contact_email,
  contact_phone,
  entry_fee_info,
  public_portal_settings,
  schedule_updated_at,
  schedule_change_notices
FROM public.championships
WHERE visibility = 'public';

GRANT SELECT ON public.public_championships TO anon, authenticated;

COMMIT;
