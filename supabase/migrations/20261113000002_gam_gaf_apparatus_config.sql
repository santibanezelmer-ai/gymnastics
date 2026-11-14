-- ==============================================================================
-- Migration: 20261113000002_gam_gaf_apparatus_config.sql
-- Description: FASE 22 — Configuración dinámica de modalidades y aparatos GAM/GAF
--              para Operix Gymnastics.
--              1. Tabla public.championship_apparatus_configs:
--                 Configuración de aparatos habilitados, obligatorios, orden
--                 de competencia y reglas All-Around / Equipos por campeonato y modalidad.
--              2. Tabla public.category_apparatus_overrides:
--                 Sobreescritura específica por categoría/subcategoría para
--                 niveles formativos o escolares (ej. 2 o 3 aparatos).
--              3. Políticas RLS seguras: lectura pública para campeonatos activos,
--                 escritura restringida a administradores y organizadores.
--
-- Author: Desarrollado por Comercial Hels SpA para Operix Gymnastics
-- ==============================================================================

-- 1. Tabla de configuración de aparatos por campeonato y modalidad (GAM / GAF)
CREATE TABLE IF NOT EXISTS public.championship_apparatus_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id UUID NOT NULL REFERENCES public.championships(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL CHECK (discipline IN ('GAM', 'GAF', 'GR', 'TRA', 'AER', 'ACRO', 'PK')),
  enabled_apparatuses TEXT[] NOT NULL DEFAULT '{}',
  mandatory_apparatuses TEXT[] NOT NULL DEFAULT '{}',
  competition_order TEXT[] NOT NULL DEFAULT '{}',
  all_around_rules JSONB NOT NULL DEFAULT '{
    "calculation_mode": "sum_all_enabled",
    "required_apparatus_count": 0,
    "drop_lowest_count": 0,
    "allow_partial_results": true,
    "require_all_for_podium": true,
    "tie_break_rule": "olympic_fig"
  }'::jsonb,
  team_rules JSONB NOT NULL DEFAULT '{
    "enabled": true,
    "scores_per_apparatus_count": 3,
    "min_gymnasts_per_team": 3,
    "max_gymnasts_per_team": 6,
    "allow_incomplete_teams": true,
    "tie_break_rule": "highest_apparatus_total"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_championship_discipline_apparatus UNIQUE (championship_id, discipline)
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_champ_apparatus_config_champ_id 
  ON public.championship_apparatus_configs(championship_id);

CREATE INDEX IF NOT EXISTS idx_champ_apparatus_config_discipline 
  ON public.championship_apparatus_configs(discipline);

-- 2. Tabla de sobreescritura de aparatos a nivel de categoría (Formativo / Escolar)
CREATE TABLE IF NOT EXISTS public.category_apparatus_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL CHECK (discipline IN ('GAM', 'GAF', 'GR', 'TRA', 'AER', 'ACRO', 'PK')),
  enabled_apparatuses TEXT[] NOT NULL DEFAULT '{}',
  mandatory_apparatuses TEXT[] NOT NULL DEFAULT '{}',
  competition_order TEXT[] NOT NULL DEFAULT '{}',
  all_around_rules JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_category_apparatus_override UNIQUE (category_id)
);

CREATE INDEX IF NOT EXISTS idx_cat_apparatus_override_category_id 
  ON public.category_apparatus_overrides(category_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.championship_apparatus_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_apparatus_overrides ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS: Lectura pública (para el portal público, Arena TV, jueces y clubes)
DROP POLICY IF EXISTS "Public can view championship apparatus configs" ON public.championship_apparatus_configs;
CREATE POLICY "Public can view championship apparatus configs"
  ON public.championship_apparatus_configs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view category apparatus overrides" ON public.category_apparatus_overrides;
CREATE POLICY "Public can view category apparatus overrides"
  ON public.category_apparatus_overrides
  FOR SELECT
  USING (true);

-- 5. Políticas RLS: Escritura solo para administradores y organizadores del campeonato
DROP POLICY IF EXISTS "Admins and organizers can manage championship apparatus configs" ON public.championship_apparatus_configs;
CREATE POLICY "Admins and organizers can manage championship apparatus configs"
  ON public.championship_apparatus_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.championships c
      WHERE c.id = championship_apparatus_configs.championship_id
        AND (
          c.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.platform_role = 'platform_admin'
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.championships c
      WHERE c.id = championship_apparatus_configs.championship_id
        AND (
          c.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.platform_role = 'platform_admin'
          )
        )
    )
  );

DROP POLICY IF EXISTS "Admins and organizers can manage category apparatus overrides" ON public.category_apparatus_overrides;
CREATE POLICY "Admins and organizers can manage category apparatus overrides"
  ON public.category_apparatus_overrides
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.categories cat
      JOIN public.championships c ON c.id = cat.championship_id
      WHERE cat.id = category_apparatus_overrides.category_id
        AND (
          c.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.platform_role = 'platform_admin'
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.categories cat
      JOIN public.championships c ON c.id = cat.championship_id
      WHERE cat.id = category_apparatus_overrides.category_id
        AND (
          c.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.platform_role = 'platform_admin'
          )
        )
    )
  );

-- 6. Trigger para actualización automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at_apparatus_configs()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_champ_apparatus_configs_updated_at ON public.championship_apparatus_configs;
CREATE TRIGGER trg_champ_apparatus_configs_updated_at
  BEFORE UPDATE ON public.championship_apparatus_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_apparatus_configs();

DROP TRIGGER IF EXISTS trg_cat_apparatus_overrides_updated_at ON public.category_apparatus_overrides;
CREATE TRIGGER trg_cat_apparatus_overrides_updated_at
  BEFORE UPDATE ON public.category_apparatus_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_apparatus_configs();

-- Comentarios explicativos
COMMENT ON TABLE public.championship_apparatus_configs IS 'Configuración oficial y dinámica de aparatos y reglas All-Around/Equipos por campeonato y modalidad (GAM/GAF)';
COMMENT ON TABLE public.category_apparatus_overrides IS 'Sobreescrituras opcionales de aparatos habilitados para categorías específicas (formativas, escolares o promocionales)';
