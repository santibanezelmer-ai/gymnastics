-- ==============================================================================
-- OPERIX GYMNASTICS — SEED SCRIPT: CAMPEONATO PILOTO EN PRODUCCIÓN (2026)
-- Desarrollado por Comercial Hels SpA
-- Fecha: 8 de noviembre de 2026
--
-- PROPÓSITO:
-- Siembra controlada, idempotente y aislada de un campeonato experimental
-- de pruebas en la base de datos real de Supabase.
--
-- GARANTÍAS DE SEGURIDAD Y AISLAMIENTO:
-- 1. Transaccionalidad atómica (BEGIN ... COMMIT).
-- 2. Rango de UUIDs sintéticos deterministas: e0000000-0000-0000-0000-00000000xxxx.
-- 3. CERO alteración de organizaciones, torneos o notas preexistentes.
-- 4. Bandera explícita 'is_testing_event: true' en public_portal_settings.
-- 5. PIN de juez exclusivo y de alta entropía (OPX-8492-PILOT).
-- 6. Totalmente compatible con políticas RLS y triggers de auditoría WORM.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PRE-FLIGHT CHECKS: VALIDACIÓN PREVIA DE COLISIONES
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Validar que el slug del torneo piloto no colisione con otro campeonato real
    IF EXISTS (
        SELECT 1 FROM public.championships 
        WHERE slug = 'piloto-operix-2026' 
          AND id <> 'e0000000-0000-0000-0000-000000001000'::uuid
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ERROR: El slug "piloto-operix-2026" ya existe con otro ID en producción.';
    END IF;

    -- Validar que la organización piloto no colisione con otra organización real
    IF EXISTS (
        SELECT 1 FROM public.organizations 
        WHERE slug = 'fed-piloto-operix' 
          AND id <> 'e0000000-0000-0000-0000-000000000001'::uuid
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ERROR: El slug de organización "fed-piloto-operix" ya existe con otro ID.';
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
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    billing_plan = EXCLUDED.billing_plan,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 3. CLUBES FICTICIOS PARTICIPANTES
-- ------------------------------------------------------------------------------
-- 3.1 Club A: Andino
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
) VALUES (
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
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    updated_at = timezone('utc'::text, now());

-- 3.2 Club B: Olimpo
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
) VALUES (
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
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 4. GIMNASTAS FICTICIAS (SIN DATOS PERSONALES REALES)
-- ------------------------------------------------------------------------------
-- 4.1 Club A: Gimnasta 1
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
) VALUES (
    'e0000000-0000-0000-0000-000000000101'::uuid,
    'e0000000-0000-0000-0000-000000000010'::uuid,
    'e0000000-0000-0000-0000-000000000001'::uuid,
    'Atleta Ficticia',
    'Uno Andino',
    'TEST-AND-01',
    'LIC-PILOT-01',
    '2011-05-14'::date,
    'female',
    'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = timezone('utc'::text, now());

-- 4.2 Club A: Gimnasta 2
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
) VALUES (
    'e0000000-0000-0000-0000-000000000102'::uuid,
    'e0000000-0000-0000-0000-000000000010'::uuid,
    'e0000000-0000-0000-0000-000000000001'::uuid,
    'Atleta Ficticia',
    'Dos Andino',
    'TEST-AND-02',
    'LIC-PILOT-02',
    '2012-08-20'::date,
    'female',
    'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = timezone('utc'::text, now());

-- 4.3 Club B: Gimnasta 3
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
) VALUES (
    'e0000000-0000-0000-0000-000000000201'::uuid,
    'e0000000-0000-0000-0000-000000000020'::uuid,
    'e0000000-0000-0000-0000-000000000001'::uuid,
    'Atleta Ficticia',
    'Tres Olimpo',
    'TEST-OLI-03',
    'LIC-PILOT-03',
    '2011-11-03'::date,
    'female',
    'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = timezone('utc'::text, now());

-- 4.4 Club B: Gimnasta 4
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
) VALUES (
    'e0000000-0000-0000-0000-000000000202'::uuid,
    'e0000000-0000-0000-0000-000000000020'::uuid,
    'e0000000-0000-0000-0000-000000000001'::uuid,
    'Atleta Ficticia',
    'Cuatro Olimpo',
    'TEST-OLI-04',
    'LIC-PILOT-04',
    '2010-02-18'::date,
    'female',
    'Gimnasta sintética para pruebas de control de rotaciones y juzgamiento.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 5. CAMPEONATO PILOTO CON BANDERA PREVENTIVA
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
    banner_url,
    judge_code,
    invite_code,
    public_portal_settings,
    schedule_updated_at,
    schedule_change_notices,
    created_at,
    updated_at
) VALUES (
    'e0000000-0000-0000-0000-000000001000'::uuid,
    'e0000000-0000-0000-0000-000000000001'::uuid,
    'OPERIX GYMNASTICS — CAMPEONATO PILOTO 2026',
    'piloto-operix-2026',
    '[CAMPEONATO DE PRUEBA — AMBIENTE PILOTO OFICIAL] Torneo experimental de homologación y validación de sistemas. Todas las gimnastas, notas, actas y podios son ficticios y carecen de validez oficial deportiva.',
    '2026-11-15'::date,
    '2026-11-16'::date,
    'Santiago, Región Metropolitana',
    'Gimnasio Polideportivo Central (Pabellón Experimental A)',
    'public',
    'in_progress',
    'FIG_2025_2028_V1',
    'FIG_STANDARD_V1',
    'https://images.unsplash.com/photo-1547955922-0545fcf80838?auto=format&fit=crop&w=1200&q=80',
    'OPX-8492-PILOT', -- PIN aleatorio y exclusivo de jueces para el piloto
    'INV-PILOT-2026',
    jsonb_build_object(
        'show_participating_clubs', true,
        'show_categories', true,
        'show_published_results', true,
        'show_medal_tally', true,
        'show_venue_details', true,
        'is_testing_event', true,
        'environment_disclaimer', 'CAMPEONATO DE PRUEBA PILOTO — DATOS Y PUNTUACIONES FICTICIAS',
        'allow_official_export', false
    ),
    timezone('utc'::text, now()),
    jsonb_build_array(
        jsonb_build_object(
            'timestamp', timezone('utc'::text, now()),
            'message', 'Horarios de prueba cargados correctamente para la Subdivisión 1.'
        )
    ),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    judge_code = EXCLUDED.judge_code,
    status = EXCLUDED.status,
    public_portal_settings = EXCLUDED.public_portal_settings,
    schedule_updated_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 6. CATEGORÍA OFICIAL FIG JUNIOR GAF
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
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    scoring_regime = EXCLUDED.scoring_regime,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 7. INSCRIPCIONES Y ROTACIONES INICIALES
-- ------------------------------------------------------------------------------
-- 7.1 Atleta 1 (Club Andino) -> Subdivisión 1, Rotación 1, VT (Salto), Orden 1
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
) VALUES (
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
)
ON CONFLICT (id) DO UPDATE SET
    subdivision = EXCLUDED.subdivision,
    rotation_group = EXCLUDED.rotation_group,
    starting_apparatus = EXCLUDED.starting_apparatus,
    start_order = EXCLUDED.start_order,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- 7.2 Atleta 2 (Club Andino) -> Subdivisión 1, Rotación 1, VT (Salto), Orden 2
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
) VALUES (
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
)
ON CONFLICT (id) DO UPDATE SET
    subdivision = EXCLUDED.subdivision,
    rotation_group = EXCLUDED.rotation_group,
    starting_apparatus = EXCLUDED.starting_apparatus,
    start_order = EXCLUDED.start_order,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- 7.3 Atleta 3 (Club Olimpo) -> Subdivisión 1, Rotación 1, UB (Barras), Orden 1
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
) VALUES (
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
)
ON CONFLICT (id) DO UPDATE SET
    subdivision = EXCLUDED.subdivision,
    rotation_group = EXCLUDED.rotation_group,
    starting_apparatus = EXCLUDED.starting_apparatus,
    start_order = EXCLUDED.start_order,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- 7.4 Atleta 4 (Club Olimpo) -> Subdivisión 1, Rotación 1, UB (Barras), Orden 2
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
) VALUES (
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
ON CONFLICT (id) DO UPDATE SET
    subdivision = EXCLUDED.subdivision,
    rotation_group = EXCLUDED.rotation_group,
    starting_apparatus = EXCLUDED.starting_apparatus,
    start_order = EXCLUDED.start_order,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 8. PROGRAMACIÓN Y GRUPOS DE ROTACIÓN
-- ------------------------------------------------------------------------------
-- 8.1 Cronograma de la sesión
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
    'running',
    'Sesión piloto de prueba para cronometraje y marshaling en vivo.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- 8.2 Grupos de Rotación
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
ON CONFLICT (id) DO UPDATE SET
    starting_apparatus = EXCLUDED.starting_apparatus,
    sort_order = EXCLUDED.sort_order,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 9. ESTADO EN VIVO DE APARATOS GAF (MARSHALING)
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
) VALUES
    (
        'e0000000-0000-0000-0000-000000006001'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        '9d8f6582-9eca-4a60-8811-e84981b3a27b'::uuid, -- VT
        'VT',
        1,
        'e0000000-0000-0000-0000-000000003001'::uuid, -- Atleta 1 en pista
        'competing',
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000006002'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        'df035860-a9bf-48ea-9e39-fc28648da73f'::uuid, -- UB
        'UB',
        1,
        'e0000000-0000-0000-0000-000000003003'::uuid, -- Atleta 3 en pista
        'competing',
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000006003'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        '346418d5-30d3-4cd7-9558-d2321e647c2c'::uuid, -- BB
        'BB',
        1,
        NULL,
        'idle',
        timezone('utc'::text, now())
    ),
    (
        'e0000000-0000-0000-0000-000000006004'::uuid,
        'e0000000-0000-0000-0000-000000001000'::uuid,
        '636d3cf5-8c62-4741-8a85-f21ce4e2bf94'::uuid, -- FX
        'FX',
        1,
        NULL,
        'idle',
        timezone('utc'::text, now())
    )
ON CONFLICT (championship_id, apparatus_id) DO UPDATE SET
    status = EXCLUDED.status,
    current_registration_id = EXCLUDED.current_registration_id,
    current_rotation = EXCLUDED.current_rotation,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 10. CONFIGURACIÓN DE PREMIACIÓN (AWARDS) PARA EL PILOTO
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
    'e0000000-0000-0000-0000-000000007001'::uuid,
    'e0000000-0000-0000-0000-000000001000'::uuid,
    3,
    'standard_all',
    true,
    true,
    jsonb_build_array(
        jsonb_build_object('id', 'award_elegance', 'name', 'Premio a la Elegancia Piloto', 'criteria', 'Votación Jurado Superior')
    ),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (championship_id) DO UPDATE SET
    places_awarded_count = EXCLUDED.places_awarded_count,
    updated_at = timezone('utc'::text, now());

COMMIT;
