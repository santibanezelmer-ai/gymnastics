-- ============================================================================
-- ROLLBACK: rollback_20261112000002_secure_championship_codes.sql
-- DESCRIPTION: Reversa de permisos por columna en championships si fuese requerido.
-- ============================================================================

BEGIN;

-- Restaurar permiso SELECT global sobre championships a anon
GRANT SELECT ON public.championships TO anon;

COMMIT;
