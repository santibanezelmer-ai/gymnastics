-- ==============================================================================
-- OPERIX GYMNASTICS — SCRIPT DE IMPORTACIÓN CONTROLADA DE CAMPEONATO (2026)
-- Archivo Fuente: ARTISTICA CAMPEONATO 2026.xlsx
-- Torneo: Campeonato Artística 2026 - Paillaco
-- Estado Inicial: Borrador (draft) | Visibilidad: Privada (private)
-- Idempotente, protegido por transacción y compatible con esquema real de Supabase
-- Desarrollado por Comercial Hels SpA
-- Fecha: 12 de noviembre de 2026
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. CAMPEONATO OFICIAL (BORRADOR / PRIVADO)
-- ------------------------------------------------------------------------------
INSERT INTO public.championships (
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
    created_at,
    updated_at
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
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. CLUBES PARTICIPANTES NORMALIZADOS
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
    'c2026000-0000-0000-0000-0000000000a0'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Universidad de Los Lagos', 'Universidad de Los L', 'ULA', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- ------------------------------------------------------------------------------
-- 3. CATEGORÍAS TÉCNICAS (GAM Y GAF)
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
-- 4. CRONOGRAMA DE COMPETENCIA (PROGRAMA)
-- ------------------------------------------------------------------------------
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004001'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '08:00:00', '08:15:00', 'APERTURA GIMNASIO', 1, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004002'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '08:15:00', '09:00:00', 'CALENTAMIENTO Y PRUEBA APARATOS (GRUPO A)', 2, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004003'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '09:00:00', '09:30:00', 'DESFILE, HIMNO NACIONAL Y JURAMENTO GIMNASTA', 3, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004004'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '09:30:00', '11:15:00', 'INICIO COMPETENCIA GRUPO A FEMENINA', 4, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004005'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '12:00:00', '13:00:00', 'INICIO COMPETENCIA VARONES (GAM)', 5, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004006'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '13:00:00', '13:45:00', 'PREMIACIÓN GRUPO A Y VARONES', 6, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004007'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '14:00:00', '15:00:00', 'CALENTAMIENTO Y PRUEBA APARATOS (GRUPO B)', 7, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004008'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '15:00:00', '16:45:00', 'INICIO COMPETENCIA GRUPO B FEMENINA', 8, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.competition_schedules (
    id, championship_id, time_start, time_end, title, sort_order, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000004009'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '17:30:00', '18:30:00', 'PREMIACIÓN GRUPO B FEMENINA Y PREMIACIÓN POR EQUIPO', 9, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
-- ------------------------------------------------------------------------------
-- 5. CONFIGURACIÓN DE PREMIACIÓN (MEDALLAS)
-- ------------------------------------------------------------------------------
INSERT INTO public.championship_awards_config (
    id,
    championship_id,
    places_awarded_count,
    few_participants_rule,
    include_trophies_for_teams,
    include_club_medals,
    special_awards,
    created_at,
    updated_at
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

COMMIT;
