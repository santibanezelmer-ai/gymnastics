-- ==============================================================================
-- OPERIX GYMNASTICS — SCRIPT MAESTRO DE IMPORTACIÓN CONTROLADA: PAILLACO 2026
-- Torneo: Campeonato Artística 2026 - Paillaco
-- Estado: Borrador (draft) | Visibilidad: Privada (private)
-- 153 Gimnastas Ratificados | 10 Clubes | 9 Niveles Canónicos | 19 Franjas
-- 19 Hitos de Cronograma | 80 Reglas de Premiación (310 Medallas + 12 Diplomas)
-- Cero notas inventadas | Idempotente y Transaccional
-- Desarrollado por Comercial Hels SpA
-- Fecha: 12 de noviembre de 2026
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 0. PREFLIGHT DE IDENTIDAD Y SEGURIDAD
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_org_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;
    v_slug TEXT := 'artistica-paillaco-2026';
    v_alien_champ UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = v_org_id) THEN
        RAISE EXCEPTION 'OPERIX PREFLIGHT ERROR: La organización FENAGICHI (aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa) no existe.';
    END IF;
    SELECT id INTO v_alien_champ FROM public.championships WHERE slug = v_slug AND id <> 'c2026000-0000-0000-0000-000000000001'::uuid;
    IF v_alien_champ IS NOT NULL THEN
        RAISE EXCEPTION 'OPERIX PREFLIGHT ERROR: El slug % ya se encuentra en uso por otro campeonato (%)', v_slug, v_alien_champ;
    END IF;
    RAISE NOTICE 'PREFLIGHT SUPERADO: Organización y slug verificados para Paillaco 2026.';
END $$;

-- ------------------------------------------------------------------------------
-- 1. CAMPEONATO OFICIAL (MODO BORRADOR / PRIVADO)
-- ------------------------------------------------------------------------------
INSERT INTO public.championships (
    id, organization_id, name, slug, description, start_date, end_date, location, venue_name,
    visibility, status, ruleset_version, scoring_schema_version, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'Campeonato Artística 2026 - Paillaco',
    'artistica-paillaco-2026',
    '[BORRADOR] Campeonato oficial de Gimnasia Artística (GAM y GAF) de Paillaco 2026. Importado íntegramente desde ARTISTICA CAMPEONATO 2026.xlsx.',
    '2026-11-15'::date,
    '2026-11-15'::date,
    'Paillaco, Región de Los Ríos',
    'Gimnasio Municipal de Paillaco',
    'private',
    'draft',
    'USAG_FIG_CHILE_2026',
    'USAG_LEVELS_V1',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. CLUBES PARTICIPANTES NORMALIZADOS (10 CLUBES)
-- ------------------------------------------------------------------------------
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Pumahue', 'Pumahue', 'PUM', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000020'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Big Bang', 'Big Bang', 'BIG', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000030'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Lycée Claude Gay', 'Lycée Claude Gay', 'LCG', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000040'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Colegio Felmer Niklitschek', 'Felmer Niklitschek', 'FNK', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000050'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Ainilebu', 'Ainilebu', 'AIN', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000060'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Acrodan', 'Acrodan', 'ACR', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000070'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Olimpo', 'Olimpo', 'OLI', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000080'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Élevé Los Lagos', 'Élevé Los Lagos', 'ELE', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000090'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Gimnástico Paillaco', 'Gimnástico Paillaco', 'GPA', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-0000000000a0'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Club Pendiente de Validación', 'Pendiente Validación', 'PEND', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. CATEGORÍAS TÉCNICAS CANÓNICAS (9 NIVELES)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000001001'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAM', 'GAM — Kinder', 'GAM-KINDER', 'male', 'free', 10, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAM', 'GAM — AC0', 'GAM-AC0', 'male', 'free', 11, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000001003'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAM', 'GAM — Nivel Libre', 'GAM-LIBRE', 'male', 'free', 12, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAF', 'GAF — Recreativo', 'GAF-REC', 'female', 'free', 20, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAF', 'GAF — Nivel 1', 'GAF-N1', 'female', 'free', 21, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAF', 'GAF — Nivel 2', 'GAF-N2', 'female', 'free', 22, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAF', 'GAF — Nivel 3', 'GAF-N3', 'female', 'free', 23, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAF', 'GAF — Nivel 4', 'GAF-N4', 'female', 'free', 24, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000002006'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GAF', 'GAF — Nivel Libre', 'GAF-LIBRE', 'female', 'free', 25, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. VÍNCULOS CATEGORÍA-APARATO (REGLAMENTARIOS)
-- ------------------------------------------------------------------------------
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001001'::uuid, '04790fe9-392f-4b54-8983-7c17dc8a61a2'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001001'::uuid, 'dfddc681-8edd-4802-9b25-40fbfa22412d'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001001'::uuid, '4dd759a9-35d4-4d18-aed9-f75fe313ff74'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001002'::uuid, '04790fe9-392f-4b54-8983-7c17dc8a61a2'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001002'::uuid, 'dfddc681-8edd-4802-9b25-40fbfa22412d'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001002'::uuid, '4dd759a9-35d4-4d18-aed9-f75fe313ff74'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001003'::uuid, '04790fe9-392f-4b54-8983-7c17dc8a61a2'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001003'::uuid, 'dfddc681-8edd-4802-9b25-40fbfa22412d'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000001003'::uuid, '4dd759a9-35d4-4d18-aed9-f75fe313ff74'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002001'::uuid, '9d8f6582-9eca-4a60-8811-e84981b3a27b'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002001'::uuid, 'df035860-a9bf-48ea-9e39-fc28648da73f'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002001'::uuid, '346418d5-30d3-4cd7-9558-d2321e647c2c'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002001'::uuid, '636d3cf5-8c62-4741-8a85-f21ce4e2bf94'::uuid, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002002'::uuid, '9d8f6582-9eca-4a60-8811-e84981b3a27b'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002002'::uuid, 'df035860-a9bf-48ea-9e39-fc28648da73f'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002002'::uuid, '346418d5-30d3-4cd7-9558-d2321e647c2c'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002002'::uuid, '636d3cf5-8c62-4741-8a85-f21ce4e2bf94'::uuid, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002003'::uuid, '9d8f6582-9eca-4a60-8811-e84981b3a27b'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002003'::uuid, 'df035860-a9bf-48ea-9e39-fc28648da73f'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002003'::uuid, '346418d5-30d3-4cd7-9558-d2321e647c2c'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002003'::uuid, '636d3cf5-8c62-4741-8a85-f21ce4e2bf94'::uuid, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002004'::uuid, '9d8f6582-9eca-4a60-8811-e84981b3a27b'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002004'::uuid, 'df035860-a9bf-48ea-9e39-fc28648da73f'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002004'::uuid, '346418d5-30d3-4cd7-9558-d2321e647c2c'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002004'::uuid, '636d3cf5-8c62-4741-8a85-f21ce4e2bf94'::uuid, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002005'::uuid, '9d8f6582-9eca-4a60-8811-e84981b3a27b'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002005'::uuid, 'df035860-a9bf-48ea-9e39-fc28648da73f'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002005'::uuid, '346418d5-30d3-4cd7-9558-d2321e647c2c'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002005'::uuid, '636d3cf5-8c62-4741-8a85-f21ce4e2bf94'::uuid, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002006'::uuid, '9d8f6582-9eca-4a60-8811-e84981b3a27b'::uuid, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002006'::uuid, 'df035860-a9bf-48ea-9e39-fc28648da73f'::uuid, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002006'::uuid, '346418d5-30d3-4cd7-9558-d2321e647c2c'::uuid, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('c2026000-0000-0000-0000-000000002006'::uuid, '636d3cf5-8c62-4741-8a85-f21ce4e2bf94'::uuid, 4) ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. SUBCATEGORÍAS (19 FRANJAS TÉCNICAS ACTIVAS)
-- ------------------------------------------------------------------------------
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003001'::uuid, 'c2026000-0000-0000-0000-000000001001'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003002'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003003'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'Franja 3', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003004'::uuid, 'c2026000-0000-0000-0000-000000001003'::uuid, 'Franja 1', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003005'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'Franja 1', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003006'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003007'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'Franja 1', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003008'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003009'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'Franja 3', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003010'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'Franja 1', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003011'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003012'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'Franja 3', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003013'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'Franja 1', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003014'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003015'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'Franja 3', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003016'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'Franja 1', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003017'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003018'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'Franja 1', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('c2026000-0000-0000-0000-000000003019'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'Franja 2', 2) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. GIMNASTAS E INSCRIPCIONES (153 DEPORTISTAS RATIFICADOS)
-- ------------------------------------------------------------------------------
-- GAM #1: Luke James Petingalo Hermosilla (PUMAHUE)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid,
    'Luke James', 'Petingalo Hermosilla', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003002'::uuid,
    'c2026000-0000-0001-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid, 101, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #2: Leandro Contreras Aguila (PUMAHUE)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000002'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid,
    'Leandro', 'Contreras Aguila', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000002'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003002'::uuid,
    'c2026000-0000-0001-0000-000000000002'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid, 102, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #3: Diego Agustín Valdés Molina (PUMAHUE)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000003'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid,
    'Diego Agustín', 'Valdés Molina', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000003'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001001'::uuid, 'c2026000-0000-0000-0000-000000003001'::uuid,
    'c2026000-0000-0001-0000-000000000003'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid, 103, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #4: William James Petingalo Hermosilla (PUMAHUE)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000004'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid,
    'William James', 'Petingalo Hermosilla', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000004'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001001'::uuid, 'c2026000-0000-0000-0000-000000003001'::uuid,
    'c2026000-0000-0001-0000-000000000004'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid, 104, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #5: Gael Martín Noriega Werner (PUMAHUE)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000005'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid,
    'Gael Martín', 'Noriega Werner', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000005'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003002'::uuid,
    'c2026000-0000-0001-0000-000000000005'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid, 105, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #6: Ángel Fabián Noriega Werner (PUMAHUE)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000006'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid,
    'Ángel Fabián', 'Noriega Werner', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000006'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003003'::uuid,
    'c2026000-0000-0001-0000-000000000006'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid, 106, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #7: Eduard Andrés Hernández Oporto (PUMAHUE)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000007'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid,
    'Eduard Andrés', 'Hernández Oporto', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000007'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003003'::uuid,
    'c2026000-0000-0001-0000-000000000007'::uuid, 'c2026000-0000-0000-0000-000000000010'::uuid, 107, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #8: PABLO EPUYADO (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000008'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'PABLO', 'EPUYADO', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000008'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003002'::uuid,
    'c2026000-0000-0001-0000-000000000008'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 108, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #9: NICOLAS OYARZUN (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000009'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'NICOLAS', 'OYARZUN', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000009'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003002'::uuid,
    'c2026000-0000-0001-0000-000000000009'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 109, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #10: GAEL HERNANDEZ (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000010'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'GAEL', 'HERNANDEZ', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000010'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003003'::uuid,
    'c2026000-0000-0001-0000-000000000010'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 110, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #11: Felipe Delgado (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000011'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Felipe', 'Delgado', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000011'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003002'::uuid,
    'c2026000-0000-0001-0000-000000000011'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 111, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #12: Jean Piere Yaeger (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000012'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'Jean', 'Piere Yaeger', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000012'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001002'::uuid, 'c2026000-0000-0000-0000-000000003003'::uuid,
    'c2026000-0000-0001-0000-000000000012'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 112, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #13: Agustin Alvares (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000013'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Agustin', 'Alvares', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000013'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001003'::uuid, 'c2026000-0000-0000-0000-000000003004'::uuid,
    'c2026000-0000-0001-0000-000000000013'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 113, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #14: Diego Huichaman (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000014'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Diego', 'Huichaman', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000014'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001003'::uuid, 'c2026000-0000-0000-0000-000000003004'::uuid,
    'c2026000-0000-0001-0000-000000000014'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 114, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #15: Agustin (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000015'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'Agustin', 'Participante', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000015'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001001'::uuid, 'c2026000-0000-0000-0000-000000003001'::uuid,
    'c2026000-0000-0001-0000-000000000015'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 115, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAM #16: THOMAS MARTINEZ (ULA)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000016'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-0000000000a0'::uuid,
    'THOMAS', 'MARTINEZ', NULL, NULL, 'male', 'Importado desde Excel Paillaco 2026 (GAM). Afiliación pendiente de validación (Discrepancia USS/ULA/Acrodan).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000016'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000001003'::uuid, 'c2026000-0000-0000-0000-000000003004'::uuid,
    'c2026000-0000-0001-0000-000000000016'::uuid, 'c2026000-0000-0000-0000-0000000000a0'::uuid, 116, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #1: LEONOR DIEDRICKS (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000017'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'LEONOR', 'DIEDRICKS', '2018-10-17'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000017'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000017'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 117, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #2: CELESTE COVARRUBIAS (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000018'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'CELESTE', 'COVARRUBIAS', '2018-11-13'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000018'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000018'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 118, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #3: EMILIA AGUILAR (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000019'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'EMILIA', 'AGUILAR', '2018-06-06'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000019'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000019'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 119, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #4: DOMINGA GONZALEZ (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000020'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'DOMINGA', 'GONZALEZ', '2018-06-05'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000020'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000020'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 120, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #5: RENATA VARGAS (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000021'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'RENATA', 'VARGAS', '2018-09-04'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000021'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003010'::uuid,
    'c2026000-0000-0001-0000-000000000021'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 121, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #6: JACINTA SILBERBERG (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000022'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'JACINTA', 'SILBERBERG', '2018-02-22'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000022'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003010'::uuid,
    'c2026000-0000-0001-0000-000000000022'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 122, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #7: JOSEFINA LARRAIN (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000023'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'JOSEFINA', 'LARRAIN', '2015-11-10'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000023'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000023'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 123, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #8: MILA LEPE (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000024'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'MILA', 'LEPE', '2016-05-19'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000024'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000024'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 124, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #9: IGNACIA PARDO (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000025'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'IGNACIA', 'PARDO', '2014-04-08'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000025'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000025'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 125, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #10: MAITE HAEGER (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000026'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'MAITE', 'HAEGER', '2018-04-06'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000026'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003010'::uuid,
    'c2026000-0000-0001-0000-000000000026'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 126, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #11: DOMINIQUE LUCIANI (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000027'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'DOMINIQUE', 'LUCIANI', '2016-02-29'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000027'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000027'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 127, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #12: EMILIA VARGAS (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000028'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'EMILIA', 'VARGAS', '2015-10-08'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000028'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000028'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 128, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #13: LUZ VALDIVIESO (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000029'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'LUZ', 'VALDIVIESO', '2014-06-25'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000029'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000029'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 129, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #14: VICTORIA RUIZ (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000030'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'VICTORIA', 'RUIZ', '2013-06-12'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000030'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003014'::uuid,
    'c2026000-0000-0001-0000-000000000030'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 130, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #15: FLORENCIA CORTÉS (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000031'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'FLORENCIA', 'CORTÉS', '2014-12-17'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000031'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003014'::uuid,
    'c2026000-0000-0001-0000-000000000031'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 131, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #16: CLEMENTINA PARRAGUEZ (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000032'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'CLEMENTINA', 'PARRAGUEZ', '2015-10-30'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000032'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003014'::uuid,
    'c2026000-0000-0001-0000-000000000032'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 132, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #17: SOL REVECO (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000033'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'SOL', 'REVECO', '2012-07-31'::date, 2012, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000033'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003016'::uuid,
    'c2026000-0000-0001-0000-000000000033'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 133, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #18: MATILDA PARRAGUEZ (BIG BANG)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000034'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid,
    'MATILDA', 'PARRAGUEZ', '2013-08-02'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000034'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003016'::uuid,
    'c2026000-0000-0001-0000-000000000034'::uuid, 'c2026000-0000-0000-0000-000000000020'::uuid, 134, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #19: Lorenza Carrasco (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000035'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Lorenza', 'Carrasco', '2017-12-11'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000035'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000035'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 135, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #20: Maria Trinidad Goudie (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000036'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Maria', 'Trinidad Goudie', '2016-07-07'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000036'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000036'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 136, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #21: Ema Ignacia Guajardo (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000037'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Ema', 'Ignacia Guajardo', '2015-03-03'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000037'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000037'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 137, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #22: Sofía López (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000038'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Sofía', 'López', '2018-05-26'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000038'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000038'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 138, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #23: Gabriela Moraga (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000039'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Gabriela', 'Moraga', '2016-12-31'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000039'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000039'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 139, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #24: Antonia Pérez (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000040'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Antonia', 'Pérez', '2017-07-04'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000040'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000040'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 140, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #25: Dominga Rivas (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000041'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Dominga', 'Rivas', '2015-07-25'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000041'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000041'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 141, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #26: Joaquina Salazar (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000042'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Joaquina', 'Salazar', '2018-10-04'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000042'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000042'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 142, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #27: Leticia Zambrano (LYCÉE CLAUDE GAY)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000043'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid,
    'Leticia', 'Zambrano', '2018-02-24'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000043'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000043'::uuid, 'c2026000-0000-0000-0000-000000000030'::uuid, 143, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #28: Florencia Cortez (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000044'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Florencia', 'Cortez', '2018-10-10'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000044'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000044'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 144, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #29: Trinidad Méndez (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000045'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Trinidad', 'Méndez', '2017-10-23'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000045'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000045'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 145, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #30: Valentina Carcamo (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000046'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Valentina', 'Carcamo', '2017-05-08'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000046'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000046'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 146, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #31: Agustina Cuevas (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000047'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Agustina', 'Cuevas', '2016-11-17'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000047'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000047'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 147, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #32: Angela Altamirano (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000048'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Angela', 'Altamirano', '2016-10-14'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000048'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000048'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 148, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #33: Catalina Zambrano (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000049'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Catalina', 'Zambrano', '2016-05-23'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000049'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000049'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 149, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #34: Isidora Vargas (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000050'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Isidora', 'Vargas', '2016-09-24'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000050'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000050'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 150, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #35: Javiera Gallardo (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000051'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Javiera', 'Gallardo', '2016-12-06'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000051'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000051'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 151, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #36: Mía Manríquez (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000052'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Mía', 'Manríquez', '2016-05-06'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000052'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000052'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 152, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #37: Trinidad Sotomayor (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000053'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Trinidad', 'Sotomayor', '2016-10-24'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000053'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000053'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 153, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #38: Amelia Rojas (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000054'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Amelia', 'Rojas', '2016-03-22'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000054'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000054'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 154, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #39: Verónica Vejar (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000055'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Verónica', 'Vejar', '2015-05-24'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000055'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003014'::uuid,
    'c2026000-0000-0001-0000-000000000055'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 155, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #40: Paula Cortés (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000056'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Paula', 'Cortés', '2014-05-14'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000056'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000056'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 156, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #41: Elisa Duamante (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000057'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Elisa', 'Duamante', '2014-06-20'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000057'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000057'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 157, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #42: Emilia Pinda (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000058'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Emilia', 'Pinda', '2009-11-26'::date, 2009, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000058'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000058'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 158, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #43: Eloísa Aravena (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000059'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Eloísa', 'Aravena', '2014-12-15'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000059'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000059'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 159, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #44: Camila Manríquez (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000060'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Camila', 'Manríquez', '2019-01-14'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000060'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000060'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 160, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #45: Amaya Aguilar (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000061'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Amaya', 'Aguilar', '2018-04-17'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000061'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000061'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 161, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #46: Rafaela Manqueo (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000062'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Rafaela', 'Manqueo', '2008-08-17'::date, 2008, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000062'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000062'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 162, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #47: Valentina Cárdenas (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000063'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Valentina', 'Cárdenas', '2009-03-23'::date, 2009, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000063'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000063'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 163, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #48: Francisca Miranda (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000064'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Francisca', 'Miranda', '2008-10-27'::date, 2008, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000064'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000064'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 164, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #49: Ayleen Anderson (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000065'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Ayleen', 'Anderson', '2008-06-04'::date, 2008, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000065'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000065'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 165, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #50: Emilia Irribarra (Felmer Nicklichek)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000066'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid,
    'Emilia', 'Irribarra', '2012-12-29'::date, 2012, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000066'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003014'::uuid,
    'c2026000-0000-0001-0000-000000000066'::uuid, 'c2026000-0000-0000-0000-000000000040'::uuid, 166, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #51: Matilda Gomez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000067'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Matilda', 'Gomez', '2019-01-01'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000067'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000067'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 167, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #52: Monserrar Jara (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000068'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Monserrar', 'Jara', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000068'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000068'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 168, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #53: Amelia Benner (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000069'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Amelia', 'Benner', '2017-01-01'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000069'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000069'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 169, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #54: Diana Renftel (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000070'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Diana', 'Renftel', '2015-01-01'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000070'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003009'::uuid,
    'c2026000-0000-0001-0000-000000000070'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 170, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #55: Sofia Rodriguez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000071'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Sofia', 'Rodriguez', '2019-01-01'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000071'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003010'::uuid,
    'c2026000-0000-0001-0000-000000000071'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 171, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #56: Catalina Pereira (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000072'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Catalina', 'Pereira', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000072'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000072'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 172, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #57: Agustina Alexia Alvarez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000073'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Agustina', 'Alexia Alvarez', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000073'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000073'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 173, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #58: Catalina Andwandter (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000074'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Catalina', 'Andwandter', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000074'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000074'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 174, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #59: Amalia Hernandez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000075'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Amalia', 'Hernandez', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000075'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000075'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 175, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #60: Paula diaz (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000076'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Paula', 'diaz', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000076'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000076'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 176, 'approved', 'Grupo AM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #61: Catalina Muñoz (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000077'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Catalina', 'Muñoz', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000077'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000077'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 177, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #62: Gianella Prieto (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000078'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Gianella', 'Prieto', '2014-01-01'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000078'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000078'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 178, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #63: Catalina Schilling (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000079'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Catalina', 'Schilling', '2015-01-01'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000079'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000079'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 179, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #64: Javiera Schilling (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000080'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Javiera', 'Schilling', '2014-01-01'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000080'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000080'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 180, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #65: Ester Lamarca (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000081'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Ester', 'Lamarca', '2014-01-01'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000081'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000081'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 181, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #66: Sofia Martel (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000082'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Sofia', 'Martel', '2013-01-01'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000082'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000082'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 182, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #67: Trinidad Cepeda (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000083'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Trinidad', 'Cepeda', '2012-01-01'::date, 2012, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000083'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000083'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 183, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #68: Josefa Ojeda (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000084'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Josefa', 'Ojeda', '2013-01-01'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000084'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000084'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 184, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #69: Francisca Pereira (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000085'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Francisca', 'Pereira', '2013-01-01'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000085'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000085'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 185, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #70: Adela Biskupovic (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000086'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Adela', 'Biskupovic', '2014-01-01'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000086'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000086'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 186, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #71: Pascale Saez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000087'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Pascale', 'Saez', '2017-01-01'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000087'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003013'::uuid,
    'c2026000-0000-0001-0000-000000000087'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 187, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #72: Cristhianyelis Sofia Villareal (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000088'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Cristhianyelis', 'Sofia Villareal', '2017-01-01'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000088'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003013'::uuid,
    'c2026000-0000-0001-0000-000000000088'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 188, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #73: Ines Andwandter (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000089'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Ines', 'Andwandter', '2016-01-01'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000089'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003013'::uuid,
    'c2026000-0000-0001-0000-000000000089'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 189, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #74: Emilia Flores (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000090'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Emilia', 'Flores', '2011-01-01'::date, 2011, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000090'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000090'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 190, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #75: Joy Staley (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000091'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Joy', 'Staley', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000091'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000091'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 191, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #76: Leonor Muñoz (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000092'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Leonor', 'Muñoz', '2014-01-01'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000092'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003016'::uuid,
    'c2026000-0000-0001-0000-000000000092'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 192, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #77: Maia Reihana (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000093'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Maia', 'Reihana', '2014-01-01'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000093'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003016'::uuid,
    'c2026000-0000-0001-0000-000000000093'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 193, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #78: Amanda Uribe (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000094'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Amanda', 'Uribe', '2012-01-01'::date, 2012, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000094'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003016'::uuid,
    'c2026000-0000-0001-0000-000000000094'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 194, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #79: Colomba Saez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000095'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Colomba', 'Saez', '2010-01-01'::date, 2010, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000095'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003017'::uuid,
    'c2026000-0000-0001-0000-000000000095'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 195, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #80: Diana Figueroa (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000096'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Diana', 'Figueroa', '2010-01-01'::date, 2010, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000096'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003017'::uuid,
    'c2026000-0000-0001-0000-000000000096'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 196, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #81: bernardita Valdovinos (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000097'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'bernardita', 'Valdovinos', '1997-01-01'::date, 1997, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000097'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'c2026000-0000-0000-0000-000000003019'::uuid,
    'c2026000-0000-0001-0000-000000000097'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 197, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #82: Josefina Pozas (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000098'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Josefina', 'Pozas', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000098'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'c2026000-0000-0000-0000-000000003019'::uuid,
    'c2026000-0000-0001-0000-000000000098'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 198, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #83: Aiyen Huenufil (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000099'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Aiyen', 'Huenufil', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000099'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'c2026000-0000-0000-0000-000000003019'::uuid,
    'c2026000-0000-0001-0000-000000000099'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 199, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #84: Mahina Mena (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000100'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Mahina', 'Mena', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000100'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'c2026000-0000-0000-0000-000000003019'::uuid,
    'c2026000-0000-0001-0000-000000000100'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 200, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #85: Paula Yanez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000101'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Paula', 'Yanez', '2020-01-01'::date, 2020, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000101'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003005'::uuid,
    'c2026000-0000-0001-0000-000000000101'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 201, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #86: Gabriela Tapia (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000102'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Gabriela', 'Tapia', '2019-01-01'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000102'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003005'::uuid,
    'c2026000-0000-0001-0000-000000000102'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 202, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #87: Agustina Mandiola (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000103'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Agustina', 'Mandiola', '2020-01-01'::date, 2020, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000103'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003005'::uuid,
    'c2026000-0000-0001-0000-000000000103'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 203, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #88: Eloisa Saez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000104'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Eloisa', 'Saez', '2018-01-01'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000104'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003006'::uuid,
    'c2026000-0000-0001-0000-000000000104'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 204, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #89: Javiera Hernandez (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000105'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Javiera', 'Hernandez', '2017-01-01'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000105'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003006'::uuid,
    'c2026000-0000-0001-0000-000000000105'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 205, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #90: Amparo Leiva (OLIMPO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000106'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid,
    'Amparo', 'Leiva', '2017-01-01'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000106'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000106'::uuid, 'c2026000-0000-0000-0000-000000000070'::uuid, 206, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #91: ALFONSINA BREVIS (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000107'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'ALFONSINA', 'BREVIS', '2019-03-21'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000107'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000107'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 207, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #92: NOEMÍ MARTÍNEZ (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000108'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'NOEMÍ', 'MARTÍNEZ', '2018-12-13'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000108'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000108'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 208, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #93: MÍA PÁVEZ (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000109'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'MÍA', 'PÁVEZ', '2019-01-19'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000109'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000109'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 209, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #94: ABIGAIL OYARZO (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000110'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'ABIGAIL', 'OYARZO', '2017-02-26'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000110'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000110'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 210, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #95: LAURA OBREQUE (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'LAURA', 'OBREQUE', '2018-08-25'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000111'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003010'::uuid,
    'c2026000-0000-0001-0000-000000000111'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 211, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #96: MICHELT CHACÓN (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000112'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'MICHELT', 'CHACÓN', '2017-11-01'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000112'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000112'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 212, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #97: EMILIA MARTÍNEZ (ELEVE LOS LAGOS)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000113'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid,
    'EMILIA', 'MARTÍNEZ', '2013-01-05'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000113'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000113'::uuid, 'c2026000-0000-0000-0000-000000000080'::uuid, 213, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #98: Anahis DUARTE (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000114'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'Anahis', 'DUARTE', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000114'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003014'::uuid,
    'c2026000-0000-0001-0000-000000000114'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 214, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #99: ROCIO DUARTE (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000115'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'ROCIO', 'DUARTE', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000115'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003013'::uuid,
    'c2026000-0000-0001-0000-000000000115'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 215, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #100: AMANDA CANCINO (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000116'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'AMANDA', 'CANCINO', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000116'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000116'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 216, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #101: ALONDRA MAUREIRA (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000117'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'ALONDRA', 'MAUREIRA', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000117'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000117'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 217, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #102: AMELIE ORELLANA (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000118'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'AMELIE', 'ORELLANA', '2012-01-01'::date, 2012, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000118'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000118'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 218, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #103: JOSEFA MORALES (GIMNASTICO PAILLACO)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000119'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid,
    'JOSEFA', 'MORALES', NULL, NULL, 'female', 'Importado desde Excel Paillaco 2026 (GAF). Sin fecha ni año de nacimiento especificado en planilla.',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000119'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000119'::uuid, 'c2026000-0000-0000-0000-000000000090'::uuid, 219, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #104: ELISA POZO (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000120'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'ELISA', 'POZO', '2019-10-02'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000120'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003005'::uuid,
    'c2026000-0000-0001-0000-000000000120'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 220, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #105: LEONOR ALVARADO (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000121'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'LEONOR', 'ALVARADO', '2020-05-31'::date, 2020, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000121'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003005'::uuid,
    'c2026000-0000-0001-0000-000000000121'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 221, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #106: TRINIDAD DIAZ (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000122'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'TRINIDAD', 'DIAZ', '2019-06-05'::date, 2019, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000122'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003005'::uuid,
    'c2026000-0000-0001-0000-000000000122'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 222, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #107: SARA CRUZ (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000123'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'SARA', 'CRUZ', '2020-06-03'::date, 2020, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000123'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003005'::uuid,
    'c2026000-0000-0001-0000-000000000123'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 223, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #108: ANTONIA ROMO (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000124'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'ANTONIA', 'ROMO', '2017-03-20'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000124'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003006'::uuid,
    'c2026000-0000-0001-0000-000000000124'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 224, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #109: SOFIA AGUAYO (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000125'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'SOFIA', 'AGUAYO', '2016-01-28'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000125'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002001'::uuid, 'c2026000-0000-0000-0000-000000003006'::uuid,
    'c2026000-0000-0001-0000-000000000125'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 225, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #110: ELIZABETH PARRA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000126'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'ELIZABETH', 'PARRA', '2015-10-11'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000126'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003009'::uuid,
    'c2026000-0000-0001-0000-000000000126'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 226, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #111: IGNACIA BITTNER (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000127'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'IGNACIA', 'BITTNER', '2018-04-12'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000127'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000127'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 227, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #112: JOSEFA AGUILAR (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000128'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'JOSEFA', 'AGUILAR', '2016-12-12'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000128'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000128'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 228, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #113: JOSEFA ORTIZ (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000129'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'JOSEFA', 'ORTIZ', '2018-01-14'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000129'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000129'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 229, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #114: CELESTE LEIVA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000130'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'CELESTE', 'LEIVA', '2018-09-06'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000130'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003010'::uuid,
    'c2026000-0000-0001-0000-000000000130'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 230, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #115: FERNANDA CASANOVA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000131'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'FERNANDA', 'CASANOVA', '2018-09-12'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000131'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003010'::uuid,
    'c2026000-0000-0001-0000-000000000131'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 231, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #116: MIA CRUZ (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000132'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'MIA', 'CRUZ', '2017-03-29'::date, 2017, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000132'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000132'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 232, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #117: ELENA GUARDA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000133'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'ELENA', 'GUARDA', '2016-05-05'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000133'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000133'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 233, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #118: JOSEFA VERGARA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000134'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'JOSEFA', 'VERGARA', '2013-09-24'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000134'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000134'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 234, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #119: ANTONIA GALLARDO (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000135'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'ANTONIA', 'GALLARDO', '2013-06-07'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000135'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000135'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 235, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #120: PAULA VON CONTA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000136'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'PAULA', 'VON CONTA', '2013-06-25'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000136'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000136'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 236, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #121: JOSEFINA GONZALEZ (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000137'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'JOSEFINA', 'GONZALEZ', '2013-10-01'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000137'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000137'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 237, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #122: AMANDA MANSILLA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000138'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'AMANDA', 'MANSILLA', '2013-12-19'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000138'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000138'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 238, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #123: CATALINA ROJEL (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000139'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'CATALINA', 'ROJEL', '2015-12-22'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000139'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000139'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 239, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #124: JOSEFA TORRES (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000140'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'JOSEFA', 'TORRES', '2015-10-15'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000140'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000140'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 240, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #125: MAGDALENA AROS (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000141'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'MAGDALENA', 'AROS', '2015-10-10'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000141'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003014'::uuid,
    'c2026000-0000-0001-0000-000000000141'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 241, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #126: VALERIA LABARCA (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000142'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'VALERIA', 'LABARCA', '2014-08-07'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000142'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003016'::uuid,
    'c2026000-0000-0001-0000-000000000142'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 242, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #127: SOFIA BARRIENTOS (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000143'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'SOFIA', 'BARRIENTOS', '2014-07-24'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000143'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002005'::uuid, 'c2026000-0000-0000-0000-000000003016'::uuid,
    'c2026000-0000-0001-0000-000000000143'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 243, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #128: SOFIA CARCAMO (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000144'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'SOFIA', 'CARCAMO', '2013-02-07'::date, 2013, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000144'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'c2026000-0000-0000-0000-000000003018'::uuid,
    'c2026000-0000-0001-0000-000000000144'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 244, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #129: CAMILA PEREZ (ACRODAN)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000145'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid,
    'CAMILA', 'PEREZ', '2011-02-12'::date, 2011, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000145'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002006'::uuid, 'c2026000-0000-0000-0000-000000003018'::uuid,
    'c2026000-0000-0001-0000-000000000145'::uuid, 'c2026000-0000-0000-0000-000000000060'::uuid, 245, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #130: AMANDA BASTÍAS (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000146'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'AMANDA', 'BASTÍAS', '2009-07-10'::date, 2009, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000146'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002004'::uuid, 'c2026000-0000-0000-0000-000000003015'::uuid,
    'c2026000-0000-0001-0000-000000000146'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 246, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #131: MATILDE CESPEDES (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000147'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'MATILDE', 'CESPEDES', '2015-08-17'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000147'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003011'::uuid,
    'c2026000-0000-0001-0000-000000000147'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 247, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #132: OLIVIA FUENZALIDA (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000148'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'OLIVIA', 'FUENZALIDA', '2014-03-28'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000148'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000148'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 248, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #133: LEONORA MUÑOZ (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000149'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'LEONORA', 'MUÑOZ', '2014-01-07'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000149'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000149'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 249, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #134: ALICIA MARTIN (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000150'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'ALICIA', 'MARTIN', '2018-11-03'::date, 2018, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000150'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003007'::uuid,
    'c2026000-0000-0001-0000-000000000150'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 250, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #135: VALENTINA FLORES (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000151'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'VALENTINA', 'FLORES', '2015-03-06'::date, 2015, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000151'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003009'::uuid,
    'c2026000-0000-0001-0000-000000000151'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 251, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #136: JOY SCHAAF (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000152'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'JOY', 'SCHAAF', '2016-04-09'::date, 2016, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000152'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002002'::uuid, 'c2026000-0000-0000-0000-000000003008'::uuid,
    'c2026000-0000-0001-0000-000000000152'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 252, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- GAF #137: LUCIA MARTIN (AINILEBU)
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    'c2026000-0000-0001-0000-000000000153'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid,
    'LUCIA', 'MARTIN', '2014-12-19'::date, 2014, 'female', 'Importado desde Excel Paillaco 2026 (GAF).',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    'c2026000-0000-0002-0000-000000000153'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'c2026000-0000-0000-0000-000000002003'::uuid, 'c2026000-0000-0000-0000-000000003012'::uuid,
    'c2026000-0000-0001-0000-000000000153'::uuid, 'c2026000-0000-0000-0000-000000000050'::uuid, 253, 'approved', 'Grupo PM GAF', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- ------------------------------------------------------------------------------
-- 7. CRONOGRAMA DE COMPETENCIA (PROGRAMA: 19 HITOS)
-- ------------------------------------------------------------------------------
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004001'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'APERTURA GIMNASIO', 1, NULL, '2026-11-15 08:00:00-03'::timestamptz, '2026-11-15 08:15:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004002'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'CALENTAMIENTO Y PRUEBA APARATOS', 1, NULL, '2026-11-15 08:15:00-03'::timestamptz, '2026-11-15 09:00:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004003'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'DESFILE, HIMNO NACIONAL Y JURAMENTO GIMNASTA', 1, NULL, '2026-11-15 09:00:00-03'::timestamptz, '2026-11-15 09:30:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004004'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'INICIO COMPETENCIA GRUPO A FEMENINA', 1, 'Grupo AM GAF', '2026-11-15 09:30:00-03'::timestamptz, '2026-11-15 11:15:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004005'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'INICIO COMPETENCIA VARONES', 1, 'Varones', '2026-11-15 12:00:00-03'::timestamptz, '2026-11-15 13:00:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004006'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'PREMIACIÓN GRUPO A Y VARONES', 1, NULL, '2026-11-15 13:00:00-03'::timestamptz, '2026-11-15 13:45:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004007'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'CALENTAMIENTO Y PRUEBA APARATOS', 1, NULL, '2026-11-15 14:00:00-03'::timestamptz, '2026-11-15 15:00:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004008'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'INICIO COMPETENCIA GRUPO B', 2, 'Grupo PM GAF', '2026-11-15 15:00:00-03'::timestamptz, '2026-11-15 16:45:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004009'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'PREMIACIÓN GRUPO B FEMENINA Y PREMIACIÓN POR EQUIPO', 1, NULL, '2026-11-15 17:30:00-03'::timestamptz, '2026-11-15 18:30:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004010'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GRUPO AM GAF 9:30 A 11:15', 1, 'Grupo AM GAF', '2026-11-15 09:30:00-03'::timestamptz, '2026-11-15 11:15:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004011'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'BIG BANG N1 Y N4 (6)- OLIMPO N4 Y NL (9)', 1, 'Grupo AM GAF', '2026-11-15 09:30:00-03'::timestamptz, '2026-11-15 11:15:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004012'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'ACRODAN NR, N1, N4 Y LIBRE (13) - AINILEBU N1 (3)', 1, 'Grupo AM GAF', '2026-11-15 09:30:00-03'::timestamptz, '2026-11-15 11:15:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004013'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'LYCÉE CLAUDE GAY N1 (5) - Felmer Nicklichek N1 (10)', 1, 'Grupo AM GAF', '2026-11-15 09:30:00-03'::timestamptz, '2026-11-15 11:15:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004014'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'OLIMPO NR, N1 (10) ELEVE LOS LAGOS N1 (4)', 1, 'Grupo AM GAF', '2026-11-15 09:30:00-03'::timestamptz, '2026-11-15 11:15:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004015'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'GRUPO PM GAF 15:00 A 16:45', 2, 'Grupo PM GAF', '2026-11-15 15:00:00-03'::timestamptz, '2026-11-15 16:45:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004016'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'BIG BANG N2 Y N3 (12)- GIMNASTICO PAILLACO N2 Y N3 (6)', 2, 'Grupo PM GAF', '2026-11-15 15:00:00-03'::timestamptz, '2026-11-15 16:45:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004017'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'LYCÉE CLAUDE GAY N2 (4) - FELMER NICKICHEK N2 Y N3 (13)- ELEVE LOS LAGOS N 2 (3)', 2, 'Grupo PM GAF', '2026-11-15 15:00:00-03'::timestamptz, '2026-11-15 16:45:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004018'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'ACRODAN N2 Y N3 (12) - AINILEBU N2 Y N3 (5)', 2, 'Grupo PM GAF', '2026-11-15 15:00:00-03'::timestamptz, '2026-11-15 16:45:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004019'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, 'OLIMPO N2 Y N3 (21)', 2, 'Grupo PM GAF', '2026-11-15 15:00:00-03'::timestamptz, '2026-11-15 16:45:00-03'::timestamptz, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. CONFIGURACIÓN DE PREMIACIÓN (MEDALLAS)
-- ------------------------------------------------------------------------------
INSERT INTO public.championship_awards_config (
    id, championship_id, places_awarded_count, few_participants_rule, include_trophies_for_teams,
    include_club_medals, special_awards, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000005001'::uuid,
    'c2026000-0000-0000-0000-000000000001'::uuid,
    3,
    'standard_all',
    true,
    true,
    jsonb_build_array(
        jsonb_build_object('title', 'POR SU DESTACADA PARTICIPACIÓN', 'quantity', 12, 'type', 'special_diploma'),
        jsonb_build_object('title', 'Total Medallas y Podios Programados', 'quantity', 310, 'type', 'aggregate')
    ),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. VALIDACIÓN TRANSACCIONAL FINAL
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_champ_count INT;
    v_clubs_count INT;
    v_cats_count INT;
    v_subcats_count INT;
    v_gyms_count INT;
    v_regs_count INT;
    v_scheds_count INT;
    v_awards_count INT;
    v_scores_count INT;
BEGIN
    SELECT count(*) INTO v_champ_count FROM public.championships WHERE id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_clubs_count FROM public.clubs WHERE id BETWEEN 'c2026000-0000-0000-0000-000000000010'::uuid AND 'c2026000-0000-0000-0000-0000000000a0'::uuid;
    SELECT count(*) INTO v_cats_count FROM public.categories WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_subcats_count FROM public.subcategories WHERE category_id IN (SELECT id FROM public.categories WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid);
    SELECT count(*) INTO v_gyms_count FROM public.gymnasts WHERE id BETWEEN 'c2026000-0000-0001-0000-000000000001'::uuid AND 'c2026000-0000-0001-0000-000000000153'::uuid;
    SELECT count(*) INTO v_regs_count FROM public.registrations WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_scheds_count FROM public.competition_schedules WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_awards_count FROM public.championship_awards_config WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_scores_count FROM public.scores WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;

    IF v_champ_count <> 1 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Campeonato no fue creado.';
    END IF;
    IF v_clubs_count <> 10 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 10 clubes, encontrados: %', v_clubs_count;
    END IF;
    IF v_cats_count <> 9 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 9 categorías, encontradas: %', v_cats_count;
    END IF;
    IF v_subcats_count <> 19 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 19 franjas activas, encontradas: %', v_subcats_count;
    END IF;
    IF v_gyms_count <> 153 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 153 gimnastas, encontrados: %', v_gyms_count;
    END IF;
    IF v_regs_count <> 153 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 153 inscripciones, encontradas: %', v_regs_count;
    END IF;
    IF v_scheds_count <> 19 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 19 hitos de cronograma, encontrados: %', v_scheds_count;
    END IF;
    IF v_scores_count <> 0 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se detectaron notas no autorizadas (Cero notas requeridas).';
    END IF;

    RAISE NOTICE '================================================================';
    RAISE NOTICE '¡IMPORTACIÓN EXITOSA! PAILLACO 2026 CREADO EN MODO BORRADOR/PRIVADO';
    RAISE NOTICE 'Campeonato ID: c2026000-0000-0000-0000-000000000001';
    RAISE NOTICE 'Gimnastas e Inscripciones: 153 (16 GAM, 137 GAF)';
    RAISE NOTICE 'Clubes: 10 (con Thomas Martínez en Club Pendiente de Validación)';
    RAISE NOTICE 'Categorías: 9 | Franjas: 19 | Cronograma: 19 | Premiación: 80 reglas';
    RAISE NOTICE '================================================================';
END $$;

COMMIT;
