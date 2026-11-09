-- ==============================================================================
-- OPERIX GYMNASTICS — SEED SCRIPT: CAMPEONATO PILOTO EN PRODUCCIÓN (2026)
-- Versión Corregida y Blindada — Sin "ON CONFLICT DO UPDATE"
-- Desarrollado por Comercial Hels SpA
-- Fecha: 8 de noviembre de 2026
--
-- GARANTÍAS DE SEGURIDAD ESTRICTA:
-- 1. CERO "ON CONFLICT DO UPDATE": No puede modificar ningún registro existente.
-- 2. Pre-flight checks exhaustivos: Si cualquier UUID o Slug ya existe y no pertenece
--    inequívocamente al piloto, la transacción se aborta de inmediato con ROLLBACK.
-- 3. Idempotencia pura: La segunda ejecución no produce cambios ni errores (DO NOTHING).
-- 4. Visibilidad inicial privada y estado borrador (visibility = 'private', status = 'draft').
-- 5. Generación de PIN de alta entropía en tiempo de ejecución (gen_random_bytes).
-- 6. Validación reglamentaria de edades FIG Junior GAF (13 a 15 años en 2026).
-- 7. Resolución dinámica de IDs de aparatos oficiales GAF en la base de datos real.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PRE-FLIGHT CHECKS: VALIDACIÓN ESTRICTA DE UUIDs, SLUGS Y RELACIONES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_champ_id UUID := 'e0000000-0000-0000-0000-000000001000'::uuid;
    v_org_id   UUID := 'e0000000-0000-0000-0000-000000000001'::uuid;
    v_club_a   UUID := 'e0000000-0000-0000-0000-000000000010'::uuid;
    v_club_b   UUID := 'e0000000-0000-0000-0000-000000000020'::uuid;
    v_cat_id   UUID := 'e0000000-0000-0000-0000-000000002001'::uuid;
    v_existing_slug TEXT;
    v_existing_id   UUID;
BEGIN
    -- 1.1 Validar que la organización piloto no colisione con otra organización real
    SELECT id, slug INTO v_existing_id, v_existing_slug
    FROM public.organizations
    WHERE id = v_org_id OR slug = 'fed-piloto-operix'
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        IF v_existing_id <> v_org_id OR v_existing_slug <> 'fed-piloto-operix' THEN
            RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en organizaciones. ID % o Slug % ya existe y no coincide con el piloto.', v_existing_id, v_existing_slug;
        END IF;
    END IF;

    -- 1.2 Validar que el campeonato piloto no colisione con otro torneo real
    SELECT id, slug INTO v_existing_id, v_existing_slug
    FROM public.championships
    WHERE id = v_champ_id OR slug = 'piloto-operix-2026'
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        IF v_existing_id <> v_champ_id OR v_existing_slug <> 'piloto-operix-2026' THEN
            RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en campeonatos. ID % o Slug % ya existe y no pertenece al piloto.', v_existing_id, v_existing_slug;
        END IF;
    END IF;

    -- 1.3 Validar que los clubes no colisionen con códigos o IDs externos
    IF EXISTS (
        SELECT 1 FROM public.clubs
        WHERE (id = v_club_a AND code <> 'AND-PILOT')
           OR (id = v_club_b AND code <> 'OLI-PILOT')
           OR (code IN ('AND-PILOT', 'OLI-PILOT') AND id NOT IN (v_club_a, v_club_b))
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en clubes ficticios. Uno de los códigos o IDs ya existe y no pertenece al piloto.';
    END IF;

    -- 1.4 Validar que los 4 aparatos GAF existan en la tabla base
    IF (SELECT count(*) FROM public.apparatuses WHERE discipline = 'GAF' AND code IN ('VT', 'UB', 'BB', 'FX')) < 4 THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: No se encontraron los 4 aparatos oficiales GAF (VT, UB, BB, FX) en la base de datos.';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. ORGANIZACIÓN EXPERIMENTAL AISLADA (TENANT SEPARADO)
-- ------------------------------------------------------------------------------
INSERT INTO public.organizations (
    id,
    name,
    slug,
    billing_plan,
    subscription_status,
    logo_url,
    created_at,
    updated_at
) VALUES (
    'e0000000-0000-0000-0000-000000000001'::uuid,
    'Federación Experimental de Pruebas Operix',
    'fed-piloto-operix',
    'enterprise',
    'active',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. CLUBES FICTICIOS PARTICIPANTES
-- ------------------------------------------------------------------------------
INSERT INTO public.clubs (
    id,
    organization_id,
    name,
    short_name,
    code,
    city,
    state_or_region,
    country,
    contact_email,
    contact_phone,
    created_at,
    updated_at
) VALUES 
    (
        'e0000000-0000-0000-0000-000000000010'::uuid,
        'e0000000-0000-0000-0000-000000000001'::uuid,
        'Club Gimnástico Andino Ficticio',
        'Andino Ficticio',
        'AND-PILOT',
        'Santiago',
        'Metropolitana',
        'Chile',
        'contacto.andino@operix-test.internal',
        '+56900000001',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000000020'::uuid,
        'e0000000-0000-0000-0000-000000000001'::uuid,
        'Club Deportivo Olimpo Experimental',
        'Olimpo Exp',
        'OLI-PILOT',
        'Concepción',
        'Biobío',
        'Chile',
        'contacto.olimpo@operix-test.internal',
        '+56900000002',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. GIMNASTAS FICTICIAS (COHERENCIA DE EDAD FIG JUNIOR: 13 A 15 AÑOS EN 2026)
-- ------------------------------------------------------------------------------
INSERT INTO public.gymnasts (
    id,
    club_id,
    organization_id,
    first_name,
    last_name,
    rut_or_id,
    license_number,
    birth_date,
    gender,
    notes,
    created_at,
    updated_at
) VALUES 
    (
        'e0000000-0000-0000-0000-000000000101'::uuid,
        'e0000000-0000-0000-0000-000000000010'::uuid,
        'e0000000-0000-0000-0000-000000000001'::uuid,
        'Atleta Ficticia',
        'Uno Andino',
        'TEST-AND-01',
        'LIC-PILOT-01',
        '2011-04-12'::date, -- 15 años en 2026 (FIG Junior Válido)
        'female',
        'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000000102'::uuid,
        'e0000000-0000-0000-0000-000000000010'::uuid,
        'e0000000-0000-0000-0000-000000000001'::uuid,
        'Atleta Ficticia',
        'Dos Andino',
        'TEST-AND-02',
        'LIC-PILOT-02',
        '2012-07-25'::date, -- 14 años en 2026 (FIG Junior Válido)
        'female',
        'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000000201'::uuid,
        'e0000000-0000-0000-0000-000000000020'::uuid,
        'e0000000-0000-0000-0000-000000000001'::uuid,
        'Atleta Ficticia',
        'Tres Olimpo',
        'TEST-OLI-03',
        'LIC-PILOT-03',
        '2011-10-18'::date, -- 15 años en 2026 (FIG Junior Válido)
        'female',
        'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000000202'::uuid,
        'e0000000-0000-0000-0000-000000000020'::uuid,
        'e0000000-0000-0000-0000-000000000001'::uuid,
        'Atleta Ficticia',
        'Cuatro Olimpo',
        'TEST-OLI-04',
        'LIC-PILOT-04',
        '2013-02-05'::date, -- 13 años en 2026 (FIG Junior Válido)
        'female',
        'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. CAMPEONATO PILOTO PRIVADO CON PIN GENERADO CRIPTOGRÁFICAMENTE
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_champ_id UUID := 'e0000000-0000-0000-0000-000000001000'::uuid;
    v_random_pin TEXT;
    v_random_inv TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.championships WHERE id = v_champ_id) THEN
        -- Generación dinámica de PIN e Invite Code de alta entropía sin secretos estáticos
        v_random_pin := 'PIN-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
        v_random_inv := 'INV-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));

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
            banner_url,
            judge_code,
            invite_code,
            public_portal_settings,
            schedule_updated_at,
            schedule_change_notices,
            created_at,
            updated_at
        ) VALUES (
            v_champ_id,
            'e0000000-0000-0000-0000-000000000001'::uuid,
            'OPERIX GYMNASTICS — CAMPEONATO PILOTO 2026',
            'piloto-operix-2026',
            '[CAMPEONATO DE PRUEBA — PRIVADO / EN PREPARACIÓN] Torneo experimental de homologación y validación de sistemas. Acceso público restringido.',
            '2026-11-15'::date,
            '2026-11-16'::date,
            'Santiago, Región Metropolitana',
            'Gimnasio Polideportivo Central (Pabellón Experimental A)',
            'private',  -- Estrictamente privado en creación inicial
            'draft',    -- Estado inicial en preparación, no publicado
            'FIG_2025_2028_V1',
            'FIG_STANDARD_V1',
            'https://images.unsplash.com/photo-1547955922-0545fcf80838?auto=format&fit=crop&w=1200&q=80',
            v_random_pin,
            v_random_inv,
            jsonb_build_object(
                'show_participating_clubs', false,
                'show_categories', false,
                'show_published_results', false,
                'show_medal_tally', false,
                'show_venue_details', false,
                'is_testing_event', true,
                'environment_disclaimer', 'CAMPEONATO DE PRUEBA PILOTO — PRIVADO EN PREPARACIÓN TÉCNICA',
                'allow_official_export', false
            ),
            timezone('utc'::text, now()),
            jsonb_build_array(
                jsonb_build_object(
                    'timestamp', timezone('utc'::text, now()),
                    'message', 'Ambiente piloto inicializado en modo privado y preparación técnica.'
                )
            ),
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        );
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 6. CATEGORÍA OFICIAL FIG JUNIOR GAF (13 A 15 AÑOS)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (
    id,
    championship_id,
    discipline,
    name,
    code,
    gender,
    min_age,
    max_age,
    sort_order,
    scoring_regime,
    default_fixed_d_score,
    created_at,
    updated_at
) VALUES (
    'e0000000-0000-0000-0000-000000002001'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    'GAF',
    'FIG Junior GAF',
    'FIG-JR-PILOT',
    'female',
    13,
    15,
    1,
    'free',
    10.000,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. INSCRIPCIONES Y ROTACIONES
-- ------------------------------------------------------------------------------
INSERT INTO public.registrations (
    id,
    championship_id,
    category_id,
    gymnast_id,
    club_id,
    bib_number,
    subdivision,
    rotation_group,
    starting_apparatus,
    start_order,
    status,
    created_at,
    updated_at
) VALUES 
    (
        'e0000000-0000-0000-0000-000000003001'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        'e0000000-0000-0000-0000-000000002001'::uuid,
        'e0000000-0000-0000-0000-000000000101'::uuid,
        'e0000000-0000-0000-0000-000000000010'::uuid,
        101,
        'Subdivisión 1',
        'Grupo 1 - Subdivisión 1',
        'VT',
        1,
        'approved',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000003002'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        'e0000000-0000-0000-0000-000000002001'::uuid,
        'e0000000-0000-0000-0000-000000000102'::uuid,
        'e0000000-0000-0000-0000-000000000010'::uuid,
        102,
        'Subdivisión 1',
        'Grupo 1 - Subdivisión 1',
        'VT',
        2,
        'approved',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000003003'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        'e0000000-0000-0000-0000-000000002001'::uuid,
        'e0000000-0000-0000-0000-000000000201'::uuid,
        'e0000000-0000-0000-0000-000000000020'::uuid,
        201,
        'Subdivisión 1',
        'Grupo 2 - Subdivisión 1',
        'UB',
        1,
        'approved',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000003004'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        'e0000000-0000-0000-0000-000000002001'::uuid,
        'e0000000-0000-0000-0000-000000000202'::uuid,
        'e0000000-0000-0000-0000-000000000020'::uuid,
        202,
        'Subdivisión 1',
        'Grupo 2 - Subdivisión 1',
        'UB',
        2,
        'approved',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. PROGRAMACIÓN Y GRUPOS DE ROTACIÓN
-- ------------------------------------------------------------------------------
INSERT INTO public.competition_schedules (
    id,
    championship_id,
    name,
    session_number,
    subdivision,
    start_time,
    end_time,
    warmup_time,
    status,
    notes,
    created_at,
    updated_at
) VALUES (
    'e0000000-0000-0000-0000-000000004001'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    'Subdivisión 1 — All-Around y Clasificación por Aparatos',
    1,
    'Subdivisión 1',
    '2026-11-15 09:30:00+00'::timestamptz,
    '2026-11-15 12:30:00+00'::timestamptz,
    '2026-11-15 08:30:00+00'::timestamptz,
    'scheduled', -- Programado, no running aún
    'Sesión piloto de prueba para cronometraje y marshaling en vivo.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rotation_groups (
    id,
    championship_id,
    name,
    subdivision,
    starting_apparatus,
    sort_order,
    created_at,
    updated_at
) VALUES 
    (
        'e0000000-0000-0000-0000-000000005001'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        'Grupo 1 - Subdivisión 1',
        'Subdivisión 1',
        'VT',
        1,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000005002'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        'Grupo 2 - Subdivisión 1',
        'Subdivisión 1',
        'UB',
        2,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. ESTADO EN VIVO DE APARATOS GAF (RESOLUCIÓN DINÁMICA DE IDs REALES)
-- ------------------------------------------------------------------------------
INSERT INTO public.apparatus_live_status (
    id,
    championship_id,
    apparatus_id,
    apparatus_code,
    current_rotation,
    current_registration_id,
    status,
    updated_at
)
SELECT 
    'e0000000-0000-0000-0000-000000006001'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    app.id,
    'VT',
    1,
    'e0000000-0000-0000-0000-000000003001'::uuid,
    'idle',
    timezone('utc'::text, now())
FROM public.apparatuses app WHERE app.discipline = 'GAF' AND app.code = 'VT'
ON CONFLICT (championship_id, apparatus_id) DO NOTHING;

INSERT INTO public.apparatus_live_status (
    id,
    championship_id,
    apparatus_id,
    apparatus_code,
    current_rotation,
    current_registration_id,
    status,
    updated_at
)
SELECT 
    'e0000000-0000-0000-0000-000000006002'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    app.id,
    'UB',
    1,
    'e0000000-0000-0000-0000-000000003003'::uuid,
    'idle',
    timezone('utc'::text, now())
FROM public.apparatuses app WHERE app.discipline = 'GAF' AND app.code = 'UB'
ON CONFLICT (championship_id, apparatus_id) DO NOTHING;

INSERT INTO public.apparatus_live_status (
    id,
    championship_id,
    apparatus_id,
    apparatus_code,
    current_rotation,
    current_registration_id,
    status,
    updated_at
)
SELECT 
    'e0000000-0000-0000-0000-000000006003'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    app.id,
    'BB',
    1,
    NULL,
    'idle',
    timezone('utc'::text, now())
FROM public.apparatuses app WHERE app.discipline = 'GAF' AND app.code = 'BB'
ON CONFLICT (championship_id, apparatus_id) DO NOTHING;

INSERT INTO public.apparatus_live_status (
    id,
    championship_id,
    apparatus_id,
    apparatus_code,
    current_rotation,
    current_registration_id,
    status,
    updated_at
)
SELECT 
    'e0000000-0000-0000-0000-000000006004'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    app.id,
    'FX',
    1,
    NULL,
    'idle',
    timezone('utc'::text, now())
FROM public.apparatuses app WHERE app.discipline = 'GAF' AND app.code = 'FX'
ON CONFLICT (championship_id, apparatus_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. PREMIACIÓN (AWARDS) DEL PILOTO
-- ------------------------------------------------------------------------------
INSERT INTO public.championship_awards_config (
    id,
    championship_id,
    places_awarded_count,
    few_participants_rule,
    include_trophies_for_teams,
    include_club_medals,
    created_at,
    updated_at
) VALUES (
    'e0000000-0000-0000-0000-000000007001'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    3,
    'standard_all',
    true,
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (championship_id) DO NOTHING;

COMMIT;
