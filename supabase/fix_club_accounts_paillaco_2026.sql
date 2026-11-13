-- ==============================================================================
-- FIX DEFINITIVO: CUENTAS DE CLUBES PARTICIPANTES (PAILLACO 2026)
-- Desarrollado por Comercial Hels SpA
--
-- PRINCIPIOS DE AISLAMIENTO:
-- 1. Los clubes participantes NO son la organización del campeonato.
--    No tienen membresía en public.organization_members de la organización organizadora.
-- 2. Pertenecen exclusivamente a public.club_members vinculados a su club.
-- 3. Resuelve 'ERROR 23505: duplicate key' mediante ON CONFLICT en public.profiles y handle_new_user.
-- 4. Resuelve 'Database error querying schema' en GoTrue inicializando tokens con '' en vez de NULL.
-- ==============================================================================

BEGIN;

-- 1. Actualizar la función trigger handle_new_user para que sea idempotente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, platform_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'none'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Limpieza exhaustiva de los 9 clubes para evitar duplicados o estados inconsistentes
DELETE FROM public.club_members WHERE user_id IN (
  'e0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

-- IMPORTANTE: Eliminar de organization_members para NO mezclar clubes con la organización del campeonato
DELETE FROM public.organization_members WHERE user_id IN (
  'e0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

DELETE FROM public.profiles WHERE id IN (
  'e0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

DELETE FROM auth.identities WHERE user_id IN (
  'e0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

DELETE FROM auth.users WHERE id IN (
  'e0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
) OR email IN (
  'pumahue@operix.app', 'bigbang@operix.app', 'claudegay@operix.app',
  'felmer@operix.app', 'ainilebu@operix.app', 'acrodan@operix.app',
  'olimpo@operix.app', 'eleve@operix.app', 'paillaco@operix.app'
);

-- 3. Insertar usuarios de delegaciones con campos canónicos compatibles con GoTrue
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  invited_at, confirmation_token, confirmation_sent_at, recovery_token,
  recovery_sent_at, email_change_token_new, email_change, email_change_sent_at,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, phone, phone_confirmed_at, phone_change,
  phone_change_token, phone_change_sent_at, email_change_token_current,
  email_change_confirm_status, banned_until, reauthentication_token,
  reauthentication_sent_at, is_sso_user, deleted_at
) VALUES
  ('e0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pumahue@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Pumahue"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bigbang@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Big Bang"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'claudegay@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Lycée Claude Gay"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'felmer@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Felmer Niklitschek"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ainilebu@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Ainilebu"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'acrodan@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Acrodan"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'olimpo@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Olimpo"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000080', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'eleve@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Élevé Los Lagos"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
  ('e0000000-0000-0000-0000-000000000090', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'paillaco@operix.app', crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Gimnástico Paillaco"}', false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);

-- 4. Identidades requeridas por el proveedor email
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES
  ('e0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', '{"sub":"e0000000-0000-0000-0000-000000000010","email":"pumahue@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000010', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000020', '{"sub":"e0000000-0000-0000-0000-000000000020","email":"bigbang@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000020', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000030', '{"sub":"e0000000-0000-0000-0000-000000000030","email":"claudegay@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000030', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000040', 'e0000000-0000-0000-0000-000000000040', '{"sub":"e0000000-0000-0000-0000-000000000040","email":"felmer@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000040', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000050', '{"sub":"e0000000-0000-0000-0000-000000000050","email":"ainilebu@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000050', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000060', 'e0000000-0000-0000-0000-000000000060', '{"sub":"e0000000-0000-0000-0000-000000000060","email":"acrodan@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000060', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000070', '{"sub":"e0000000-0000-0000-0000-000000000070","email":"olimpo@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000070', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000080', 'e0000000-0000-0000-0000-000000000080', '{"sub":"e0000000-0000-0000-0000-000000000080","email":"eleve@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000080', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000090', 'e0000000-0000-0000-0000-000000000090', '{"sub":"e0000000-0000-0000-0000-000000000090","email":"paillaco@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000090', now(), now(), now())
ON CONFLICT (provider, provider_id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = now();

-- 5. Perfiles públicos (rol de plataforma 'none' para evitar accesos administrativos)
INSERT INTO public.profiles (id, email, full_name, platform_role) VALUES
  ('e0000000-0000-0000-0000-000000000010', 'pumahue@operix.app', 'Delegado Club Pumahue', 'none'),
  ('e0000000-0000-0000-0000-000000000020', 'bigbang@operix.app', 'Delegado Club Big Bang', 'none'),
  ('e0000000-0000-0000-0000-000000000030', 'claudegay@operix.app', 'Delegado Lycée Claude Gay', 'none'),
  ('e0000000-0000-0000-0000-000000000040', 'felmer@operix.app', 'Delegado Felmer Niklitschek', 'none'),
  ('e0000000-0000-0000-0000-000000000050', 'ainilebu@operix.app', 'Delegado Club Ainilebu', 'none'),
  ('e0000000-0000-0000-0000-000000000060', 'acrodan@operix.app', 'Delegado Club Acrodan', 'none'),
  ('e0000000-0000-0000-0000-000000000070', 'olimpo@operix.app', 'Delegado Club Olimpo', 'none'),
  ('e0000000-0000-0000-0000-000000000080', 'eleve@operix.app', 'Delegado Club Élevé Los Lagos', 'none'),
  ('e0000000-0000-0000-0000-000000000090', 'paillaco@operix.app', 'Delegado Gimnástico Paillaco', 'none')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- 6. ASOCIACIÓN ESTRICTA Y EXCLUSIVA A SUS CLUBES EN public.club_members
--    (Cero permisos de organización para garantizar que no vean la gestión del torneo)
INSERT INTO public.club_members (club_id, user_id, role) VALUES
  ('c2026000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 'manager'),
  ('c2026000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000020', 'manager'),
  ('c2026000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000030', 'manager'),
  ('c2026000-0000-0000-0000-000000000040', 'e0000000-0000-0000-0000-000000000040', 'manager'),
  ('c2026000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000050', 'manager'),
  ('c2026000-0000-0000-0000-000000000060', 'e0000000-0000-0000-0000-000000000060', 'manager'),
  ('c2026000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000070', 'manager'),
  ('c2026000-0000-0000-0000-000000000080', 'e0000000-0000-0000-0000-000000000080', 'manager'),
  ('c2026000-0000-0000-0000-000000000090', 'e0000000-0000-0000-0000-000000000090', 'manager')
ON CONFLICT (club_id, user_id) DO UPDATE SET
  role = 'manager';

COMMIT;
