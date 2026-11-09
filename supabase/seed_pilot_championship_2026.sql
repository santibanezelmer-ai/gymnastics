-- ==============================================================================
-- OPERIX GYMNASTICS — SEED SCRIPT DEFINITIVO: CAMPEONATO PILOTO EN PRODUCCIÓN (2026)
-- Versión Auditada: Preflight Total de UUIDs, Cero "DO UPDATE", Plan Gratuito/Trial,
-- PIN Criptográfico Dinámico y Visibilidad Privada Inicial
-- Desarrollado por Comercial Hels SpA
-- Fecha: 8 de noviembre de 2026
--
-- GARANTÍAS DE SEGURIDAD Y AISLAMIENTO:
-- 1. Preflight Total: Valida previamente cada uno de los UUIDs, slugs y códigos únicos.
--    Si cualquiera ya existe y no pertenece inequívocamente al piloto, la transacción se aborta.
-- 2. "ON CONFLICT DO NOTHING" estrictamente protegido contra ocultamiento de colisiones.
-- 3. Organización en "free" / "trial" sin ningún privilegio comercial ni plan Enterprise.
-- 4. Campeonato creado como PRIVADO y en BORRADOR (visibility='private', status='draft').
-- 5. PIN de juez de alta entropía generado criptográficamente en tiempo de ejecución.
-- 6. Conformidad estricta FIG Junior GAF (Reg. Técnico FIG Art. 5.2: 14 y 15 años en 2026).
-- 7. Resolución dinámica de IDs oficiales de aparatos GAF en la base de datos real.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PRE-FLIGHT CHECKS: VALIDACIÓN EXHAUSTIVA DE UUIDs, SLUGS Y REGLAS DE INTEGRIDAD
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    -- Identificadores canónicos sintéticos del piloto
    v_org_id      UUID := 'e0000000-0000-0000-0000-000000000001'::uuid;
    v_club_a      UUID := 'e0000000-0000-0000-0000-000000000010'::uuid;
    v_club_b      UUID := 'e0000000-0000-0000-0000-000000000020'::uuid;
    v_gym_1       UUID := 'e0000000-0000-0000-0000-000000000101'::uuid;
    v_gym_2       UUID := 'e0000000-0000-0000-0000-000000000102'::uuid;
    v_gym_3       UUID := 'e0000000-0000-0000-0000-000000000201'::uuid;
    v_gym_4       UUID := 'e0000000-0000-0000-0000-000000000202'::uuid;
    v_champ_id    UUID := 'e0000000-0000-0000-0000-000000001000'::uuid;
    v_cat_id      UUID := 'e0000000-0000-0000-0000-000000002001'::uuid;
    v_reg_1       UUID := 'e0000000-0000-0000-0000-000000003001'::uuid;
    v_reg_2       UUID := 'e0000000-0000-0000-0000-000000003002'::uuid;
    v_reg_3       UUID := 'e0000000-0000-0000-0000-000000003003'::uuid;
    v_reg_4       UUID := 'e0000000-0000-0000-0000-000000003004'::uuid;
    v_sched_1     UUID := 'e0000000-0000-0000-0000-000000004001'::uuid;
    v_rot_1       UUID := 'e0000000-0000-0000-0000-000000005001'::uuid;
    v_rot_2       UUID := 'e0000000-0000-0000-0000-000000005002'::uuid;
    v_live_vt     UUID := 'e0000000-0000-0000-0000-000000006001'::uuid;
    v_live_ub     UUID := 'e0000000-0000-0000-0000-000000006002'::uuid;
    v_live_bb     UUID := 'e0000000-0000-0000-0000-000000006003'::uuid;
    v_live_fx     UUID := 'e0000000-0000-0000-0000-000000006004'::uuid;
    v_awards_cfg  UUID := 'e0000000-0000-0000-0000-000000007001'::uuid;

    v_temp_id     UUID;
    v_temp_text   TEXT;
BEGIN
    -- 1.1 Organización: ID y Slug
    SELECT id, slug INTO v_temp_id, v_temp_text FROM public.organizations WHERE id = v_org_id OR slug = 'fed-piloto-operix' LIMIT 1;
    IF v_temp_id IS NOT NULL AND (v_temp_id <> v_org_id OR v_temp_text <> 'fed-piloto-operix') THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en organizaciones. ID % o Slug % no pertenece al piloto.', v_temp_id, v_temp_text;
    END IF;

    -- 1.2 Campeonato: ID y Slug
    SELECT id, slug INTO v_temp_id, v_temp_text FROM public.championships WHERE id = v_champ_id OR slug = 'piloto-operix-2026' LIMIT 1;
    IF v_temp_id IS NOT NULL AND (v_temp_id <> v_champ_id OR v_temp_text <> 'piloto-operix-2026') THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en campeonatos. ID % o Slug % no pertenece al piloto.', v_temp_id, v_temp_text;
    END IF;

    -- 1.3 Clubes: IDs y Códigos únicos
    IF EXISTS (
        SELECT 1 FROM public.clubs
        WHERE (id = v_club_a AND code <> 'AND-PILOT')
           OR (id = v_club_b AND code <> 'OLI-PILOT')
           OR (code = 'AND-PILOT' AND id <> v_club_a)
           OR (code = 'OLI-PILOT' AND id <> v_club_b)
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en clubes ficticios (AND-PILOT / OLI-PILOT).';
    END IF;

    -- 1.4 Gimnastas: IDs y Documentos de prueba
    IF EXISTS (
        SELECT 1 FROM public.gymnasts
        WHERE (id = v_gym_1 AND rut_or_id <> 'TEST-AND-01')
           OR (id = v_gym_2 AND rut_or_id <> 'TEST-AND-02')
           OR (id = v_gym_3 AND rut_or_id <> 'TEST-OLI-03')
           OR (id = v_gym_4 AND rut_or_id <> 'TEST-OLI-04')
           OR (rut_or_id = 'TEST-AND-01' AND id <> v_gym_1)
           OR (rut_or_id = 'TEST-AND-02' AND id <> v_gym_2)
           OR (rut_or_id = 'TEST-OLI-03' AND id <> v_gym_3)
           OR (rut_or_id = 'TEST-OLI-04' AND id <> v_gym_4)
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en registros de gimnastas ficticias.';
    END IF;

    -- 1.5 Categoría: ID y Código
    SELECT id, code INTO v_temp_id, v_temp_text FROM public.categories WHERE id = v_cat_id OR (championship_id = v_champ_id AND code = 'FIG-JR-PILOT') LIMIT 1;
    IF v_temp_id IS NOT NULL AND (v_temp_id <> v_cat_id OR v_temp_text <> 'FIG-JR-PILOT') THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en categoría FIG-JR-PILOT.';
    END IF;

    -- 1.6 Inscripciones: IDs y Atletas asociados
    IF EXISTS (
        SELECT 1 FROM public.registrations
        WHERE (id = v_reg_1 AND gymnast_id <> v_gym_1)
           OR (id = v_reg_2 AND gymnast_id <> v_gym_2)
           OR (id = v_reg_3 AND gymnast_id <> v_gym_3)
           OR (id = v_reg_4 AND gymnast_id <> v_gym_4)
           OR (id NOT IN (v_reg_1, v_reg_2, v_reg_3, v_reg_4) AND championship_id = v_champ_id AND gymnast_id IN (v_gym_1, v_gym_2, v_gym_3, v_gym_4))
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en inscripciones de gimnastas del piloto.';
    END IF;

    -- 1.7 Cronograma y Grupos de Rotación: IDs y Nombres
    IF EXISTS (
        SELECT 1 FROM public.competition_schedules
        WHERE (id = v_sched_1 AND championship_id <> v_champ_id)
           OR (id <> v_sched_1 AND championship_id = v_champ_id AND session_number = 1)
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en cronograma de competencia.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.rotation_groups
        WHERE (id = v_rot_1 AND name <> 'Grupo 1 - Subdivisión 1')
           OR (id = v_rot_2 AND name <> 'Grupo 2 - Subdivisión 1')
           OR (id NOT IN (v_rot_1, v_rot_2) AND championship_id = v_champ_id AND name IN ('Grupo 1 - Subdivisión 1', 'Grupo 2 - Subdivisión 1'))
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en grupos de rotación del piloto.';
    END IF;

    -- 1.8 Estados de Aparatos y Configuración de Premios
    IF EXISTS (
        SELECT 1 FROM public.apparatus_live_status
        WHERE (id = v_live_vt AND apparatus_code <> 'VT')
           OR (id = v_live_ub AND apparatus_code <> 'UB')
           OR (id = v_live_bb AND apparatus_code <> 'BB')
           OR (id = v_live_fx AND apparatus_code <> 'FX')
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en estados de aparatos en vivo.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.championship_awards_config
        WHERE (id = v_awards_cfg AND championship_id <> v_champ_id)
           OR (id <> v_awards_cfg AND championship_id = v_champ_id)
    ) THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Conflicto en configuración de premios del campeonato.';
    END IF;

    -- 1.9 Validar presencia de los 4 aparatos oficiales GAF en el catálogo real
    IF (SELECT count(*) FROM public.apparatuses WHERE discipline = 'GAF' AND code IN ('VT', 'UB', 'BB', 'FX')) < 4 THEN
        RAISE EXCEPTION 'PRE-FLIGHT ABORT: Faltan aparatos oficiales GAF en la tabla base apparatuses.';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. ORGANIZACIÓN EXPERIMENTAL AISLADA (PLAN FREE / ESTADO TRIAL)
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
    'free',    -- Sin privilegios comerciales
    'trial',   -- Estado de evaluación/prueba, sin suscripción comercial activa
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
-- 4. GIMNASTAS FICTICIAS (CONFORMIDAD FIG JUNIOR GAF: 14 Y 15 AÑOS EN 2026)
-- Fuente Oficial: Reglamento Técnico FIG 2025-2028, Sección 1, Art. 5.2 (Límites de Edad Junior)
-- Para el año 2026, la edad junior oficial FIG GAF corresponde a nacidas en 2011 y 2012.
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
        '2011-04-12'::date, -- 15 años en 2026 (FIG Junior Reglamentaria)
        'female',
        'Gimnasta sintética de pruebas (FIG Junior GAF, Art. 5.2).',
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
        '2012-07-25'::date, -- 14 años en 2026 (FIG Junior Reglamentaria)
        'female',
        'Gimnasta sintética de pruebas (FIG Junior GAF, Art. 5.2).',
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
        '2011-10-18'::date, -- 15 años en 2026 (FIG Junior Reglamentaria)
        'female',
        'Gimnasta sintética de pruebas (FIG Junior GAF, Art. 5.2).',
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
        '2012-11-30'::date, -- 14 años en 2026 (FIG Junior Reglamentaria)
        'female',
        'Gimnasta sintética de pruebas (FIG Junior GAF, Art. 5.2).',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. CAMPEONATO PILOTO PRIVADO Y BORRADOR (PIN Y CÓDIGOS CRIPTOGRÁFICOS)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_champ_id UUID := 'e0000000-0000-0000-0000-000000001000'::uuid;
    v_random_pin TEXT;
    v_random_inv TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.championships WHERE id = v_champ_id) THEN
        -- Generación de PIN e Invite Code criptográficos aleatorios en tiempo de ejecución
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
            '[CAMPEONATO DE PRUEBA — PRIVADO / BORRADOR] Torneo experimental de homologación y validación de sistemas. Acceso público restringido.',
            '2026-11-15'::date,
            '2026-11-16'::date,
            'Santiago, Región Metropolitana',
            'Gimnasio Polideportivo Central (Pabellón Experimental A)',
            'private',  -- Privado: NO aparece en el portal público
            'draft',    -- Borrador: en preparación técnica, no iniciado
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
-- 6. CATEGORÍA FIG JUNIOR GAF EXPERIMENTAL (14-15 AÑOS, FIG ART. 5.2)
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
    'FIG Junior GAF (Experimental Piloto)',
    'FIG-JR-PILOT',
    'female',
    14,
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
    'scheduled',
    'Sesión piloto de prueba técnica.',
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
-- 9. ESTADO EN VIVO DE APARATOS GAF (RESOLUCIÓN DINÁMICA DE APARATOS REALES)
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
