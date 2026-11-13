-- ==============================================================================
-- FIX CANÓNICO DEFINITIVO: CUENTAS DE CLUBES PAILLACO 2026 (GoTrue Schema Compliant)
-- Desarrollado por Comercial Hels SpA
--
-- Resuelve: "Database error querying schema" en Supabase GoTrue Auth.
-- Inserta la totalidad de campos requeridos por el struct de GoTrue:
-- is_super_admin, is_sso_user, confirmation_token, phone_change, email_change, etc.
-- ==============================================================================

BEGIN;

-- 1. Limpieza de registros previos en cascada
DELETE FROM public.club_members WHERE user_id IN (
  'e0000000-0000-0000-0000-000000000010',
  'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030',
  'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050',
  'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070',
  'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

DELETE FROM public.organization_members WHERE user_id IN (
  'e0000000-0000-0000-0000-000000000010',
  'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030',
  'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050',
  'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070',
  'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

DELETE FROM public.profiles WHERE id IN (
  'e0000000-0000-0000-0000-000000000010',
  'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030',
  'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050',
  'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070',
  'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

DELETE FROM auth.identities WHERE user_id IN (
  'e0000000-0000-0000-0000-000000000010',
  'e0000000-0000-0000-0000-000000000020',
  'e0000000-0000-0000-0000-000000000030',
  'e0000000-0000-0000-0000-000000000040',
  'e0000000-0000-0000-0000-000000000050',
  'e0000000-0000-0000-0000-000000000060',
  'e0000000-0000-0000-0000-000000000070',
  'e0000000-0000-0000-0000-000000000080',
  'e0000000-0000-0000-0000-000000000090'
);

DELETE FROM auth.users WHERE email IN (
  'pumahue@operix.app',
  'bigbang@operix.app',
  'claudegay@operix.app',
  'felmer@operix.app',
  'ainilebu@operix.app',
  'acrodan@operix.app',
  'olimpo@operix.app',
  'eleve@operix.app',
  'paillaco@operix.app'
);

-- 2. Insertar en auth.users con la estructura canónica y completa de Supabase GoTrue
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES
(
  'e0000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'pumahue@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Pumahue"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'bigbang@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Big Bang"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'claudegay@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Lycée Claude Gay"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'felmer@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Felmer Niklitschek"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'ainilebu@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Ainilebu"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000060',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'acrodan@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Acrodan"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000070',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'olimpo@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Olimpo"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000080',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'eleve@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Club Élevé Los Lagos"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
),
(
  'e0000000-0000-0000-0000-000000000090',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'paillaco@operix.app',
  crypt('Operix2026!', gen_salt('bf')), now(), NULL, '', NULL, '', NULL, '', '', NULL, now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Delegado Gimnástico Paillaco"}',
  false, now(), now(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL
);

-- 3. Insertar identidades requeridas por GoTrue para el provider 'email'
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  ('e0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', '{"sub":"e0000000-0000-0000-0000-000000000010","email":"pumahue@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000010', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000020', '{"sub":"e0000000-0000-0000-0000-000000000020","email":"bigbang@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000020', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000030', '{"sub":"e0000000-0000-0000-0000-000000000030","email":"claudegay@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000030', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000040', 'e0000000-0000-0000-0000-000000000040', '{"sub":"e0000000-0000-0000-0000-000000000040","email":"felmer@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000040', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000050', '{"sub":"e0000000-0000-0000-0000-000000000050","email":"ainilebu@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000050', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000060', 'e0000000-0000-0000-0000-000000000060', '{"sub":"e0000000-0000-0000-0000-000000000060","email":"acrodan@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000060', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000070', '{"sub":"e0000000-0000-0000-0000-000000000070","email":"olimpo@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000070', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000080', 'e0000000-0000-0000-0000-000000000080', '{"sub":"e0000000-0000-0000-0000-000000000080","email":"eleve@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000080', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000090', 'e0000000-0000-0000-0000-000000000090', '{"sub":"e0000000-0000-0000-0000-000000000090","email":"paillaco@operix.app"}', 'email', 'e0000000-0000-0000-0000-000000000090', now(), now(), now());

-- 4. Insertar en public.profiles
INSERT INTO public.profiles (id, email, full_name, platform_role) VALUES
  ('e0000000-0000-0000-0000-000000000010', 'pumahue@operix.app', 'Delegado Club Pumahue', 'none'),
  ('e0000000-0000-0000-0000-000000000020', 'bigbang@operix.app', 'Delegado Club Big Bang', 'none'),
  ('e0000000-0000-0000-0000-000000000030', 'claudegay@operix.app', 'Delegado Lycée Claude Gay', 'none'),
  ('e0000000-0000-0000-0000-000000000040', 'felmer@operix.app', 'Delegado Felmer Niklitschek', 'none'),
  ('e0000000-0000-0000-0000-000000000050', 'ainilebu@operix.app', 'Delegado Club Ainilebu', 'none'),
  ('e0000000-0000-0000-0000-000000000060', 'acrodan@operix.app', 'Delegado Club Acrodan', 'none'),
  ('e0000000-0000-0000-0000-000000000070', 'olimpo@operix.app', 'Delegado Club Olimpo', 'none'),
  ('e0000000-0000-0000-0000-000000000080', 'eleve@operix.app', 'Delegado Club Élevé Los Lagos', 'none'),
  ('e0000000-0000-0000-0000-000000000090', 'paillaco@operix.app', 'Delegado Gimnástico Paillaco', 'none');

-- 5. Membresía en la organización como club_manager
INSERT INTO public.organization_members (organization_id, user_id, role, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000010', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000020', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000030', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000040', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000050', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000060', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000070', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000080', 'club_manager', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e0000000-0000-0000-0000-000000000090', 'club_manager', true);

-- 6. Vincular a su Club en public.club_members
INSERT INTO public.club_members (club_id, user_id, role) VALUES
  ('c2026000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 'manager'),
  ('c2026000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000020', 'manager'),
  ('c2026000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000030', 'manager'),
  ('c2026000-0000-0000-0000-000000000040', 'e0000000-0000-0000-0000-000000000040', 'manager'),
  ('c2026000-0000-0000-0000-000000000050', 'e0000000-0000-0000-0000-000000000050', 'manager'),
  ('c2026000-0000-0000-0000-000000000060', 'e0000000-0000-0000-0000-000000000060', 'manager'),
  ('c2026000-0000-0000-0000-000000000070', 'e0000000-0000-0000-0000-000000000070', 'manager'),
  ('c2026000-0000-0000-0000-000000000080', 'e0000000-0000-0000-0000-000000000080', 'manager'),
  ('c2026000-0000-0000-0000-000000000090', 'e0000000-0000-0000-0000-000000000090', 'manager');

COMMIT;
