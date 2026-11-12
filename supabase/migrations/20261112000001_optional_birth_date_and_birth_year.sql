-- ==============================================================================
-- OPERIX GYMNASTICS — MIGRACIÓN DE FLEXIBILIZACIÓN DE FECHAS DE NACIMIENTO
-- Versión: 20261112000001
-- Objetivo: Permitir el registro de gimnastas sin fecha completa (ej. torneos reales)
--           e incorporar columna birth_year para preservar el año de nacimiento.
-- Compatible con RLS existente, multi-tenancy e inmutabilidad de auditoría.
-- Desarrollado por Comercial Hels SpA
-- Fecha: 12 de noviembre de 2026
-- ==============================================================================

BEGIN;

-- 1. Eliminar restricción NOT NULL de birth_date
ALTER TABLE public.gymnasts 
  ALTER COLUMN birth_date DROP NOT NULL;

-- 2. Incorporar columna opcional birth_year para guardar el año cuando no haya fecha exacta
ALTER TABLE public.gymnasts 
  ADD COLUMN IF NOT EXISTS birth_year INTEGER;

-- 3. Restricción de rango válido para birth_year (años razonables entre 1900 y 2100)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gymnasts_birth_year_check'
  ) THEN
    ALTER TABLE public.gymnasts
      ADD CONSTRAINT gymnasts_birth_year_check
      CHECK (birth_year IS NULL OR (birth_year >= 1900 AND birth_year <= 2100));
  END IF;
END $$;

-- 4. Comentarios descriptivos de esquema
COMMENT ON COLUMN public.gymnasts.birth_date IS 'Fecha de nacimiento completa (AAAA-MM-DD). Opcional para tolerar nóminas federativas con datos parciales.';
COMMENT ON COLUMN public.gymnasts.birth_year IS 'Año de nacimiento (AAAA) informado cuando no se dispone del día y mes exactos.';

COMMIT;
