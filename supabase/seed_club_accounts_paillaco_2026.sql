-- ==============================================================================
-- SEED DE CUENTAS GENÉRICAS PARA CLUBES PARTICIPANTES: PAILLACO 2026
-- Desarrollado por Comercial Hels SpA
--
-- Contraseña unificada para todos los clubes: Operix2026!
-- ==============================================================================

DO $$
DECLARE
  v_org_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_pw_hash TEXT := crypt('Operix2026!', gen_salt('bf'));
  
  -- Record para iterar
  r RECORD;
BEGIN
  -- Definir datos de cada club participante
  CREATE TEMP TABLE tmp_club_users (
    user_id UUID,
    club_id UUID,
    email TEXT,
    full_name TEXT
  ) ON COMMIT DROP;

  INSERT INTO tmp_club_users (user_id, club_id, email, full_name) VALUES
    ('e0000000-0000-0000-0000-000000000010', 'c2026000-0000-0000-0000-000000000010', 'pumahue@operix.app', 'Delegado Club Pumahue'),
    ('e0000000-0000-0000-0000-000000000020', 'c2026000-0000-0000-0000-000000000020', 'bigbang@operix.app', 'Delegado Club Big Bang'),
    ('e0000000-0000-0000-0000-000000000030', 'c2026000-0000-0000-0000-000000000030', 'claudegay@operix.app', 'Delegado Lycée Claude Gay'),
    ('e0000000-0000-0000-0000-000000000040', 'c2026000-0000-0000-0000-000000000040', 'felmer@operix.app', 'Delegado Felmer Niklitschek'),
    ('e0000000-0000-0000-0000-000000000050', 'c2026000-0000-0000-0000-000000000050', 'ainilebu@operix.app', 'Delegado Club Ainilebu'),
    ('e0000000-0000-0000-0000-000000000060', 'c2026000-0000-0000-0000-000000000060', 'acrodan@operix.app', 'Delegado Club Acrodan'),
    ('e0000000-0000-0000-0000-000000000070', 'c2026000-0000-0000-0000-000000000070', 'olimpo@operix.app', 'Delegado Club Olimpo'),
    ('e0000000-0000-0000-0000-000000000080', 'c2026000-0000-0000-0000-000000000080', 'eleve@operix.app', 'Delegado Club Élevé Los Lagos'),
    ('e0000000-0000-0000-0000-000000000090', 'c2026000-0000-0000-0000-000000000090', 'paillaco@operix.app', 'Delegado Gimnástico Paillaco');

  -- 1. Insertar / Actualizar en auth.users (email confirmado)
  FOR r IN SELECT * FROM tmp_club_users LOOP
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token
    ) VALUES (
      r.user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      r.email, v_pw_hash, now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', r.full_name),
      now(), now(), ''
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password,
      email_confirmed_at = now(),
      raw_user_meta_data = EXCLUDED.raw_user_meta_data,
      updated_at = now();

    -- 2. Insertar / Actualizar en auth.identities
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      r.user_id, r.user_id,
      jsonb_build_object('sub', r.user_id::text, 'email', r.email),
      'email', r.user_id::text,
      now(), now(), now()
    )
    ON CONFLICT (provider, provider_id) DO UPDATE SET
      identity_data = EXCLUDED.identity_data,
      updated_at = now();

    -- 3. Insertar / Actualizar en public.profiles
    INSERT INTO public.profiles (
      id, email, full_name, platform_role, created_at, updated_at
    ) VALUES (
      r.user_id, r.email, r.full_name, 'none', now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = now();

    -- 4. Membresía en la organización como club_manager
    INSERT INTO public.organization_members (
      organization_id, user_id, role, is_active
    ) VALUES (
      v_org_id, r.user_id, 'club_manager', true
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
      role = 'club_manager',
      is_active = true;

    -- 5. Vincular al Club en public.club_members
    INSERT INTO public.club_members (
      club_id, user_id, role
    ) VALUES (
      r.club_id, r.user_id, 'manager'
    )
    ON CONFLICT (club_id, user_id) DO UPDATE SET
      role = 'manager';

  END LOOP;

  RAISE NOTICE 'Se crearon y vincularon exitosamente las cuentas de los 9 clubes participantes de Paillaco 2026.';
END $$;
