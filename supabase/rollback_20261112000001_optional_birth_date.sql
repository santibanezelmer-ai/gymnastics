-- ==============================================================================
-- OPERIX GYMNASTICS — PLAN DE REVERSIÓN: MIGRACIÓN 20261112000001
-- Objetivo: Revertir la adición de birth_year y restaurar NOT NULL si corresponde.
-- IMPORTANTE: No inventa fechas. Si existen gimnastas con birth_date IS NULL,
--             el paso de SET NOT NULL no se fuerza para evitar error de integridad.
-- Desarrollado por Comercial Hels SpA
-- Fecha: 12 de noviembre de 2026
-- ==============================================================================

BEGIN;

-- 1. Eliminar restricción de comprobación de birth_year
ALTER TABLE public.gymnasts 
  DROP CONSTRAINT IF EXISTS gymnasts_birth_year_check;

-- 2. Eliminar columna birth_year
ALTER TABLE public.gymnasts 
  DROP COLUMN IF EXISTS birth_year;

-- 3. Restaurar NOT NULL en birth_date únicamente si no existen registros nulos
DO $$
DECLARE
  v_has_nulls BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.gymnasts WHERE birth_date IS NULL
  ) INTO v_has_nulls;

  IF v_has_nulls THEN
    RAISE NOTICE 'REVERSIÓN AVISO: Existen gimnastas con birth_date IS NULL. Para preservar la veracidad de la información, NO se inventaron fechas y la columna permanece opcional (NULL).';
  ELSE
    ALTER TABLE public.gymnasts ALTER COLUMN birth_date SET NOT NULL;
    RAISE NOTICE 'REVERSIÓN ÉXITO: Columna birth_date restaurada a NOT NULL.';
  END IF;
END $$;

COMMIT;
