-- ==============================================================================
-- OPERIX GYMNASTICS — SEMILLA DE DATOS 100% SINTÉTICOS PARA STAGING
-- Desarrollado por: Comercial Hels SpA
--
-- ADVERTENCIA: Este script contiene ÚNICAMENTE datos ficticios y sintéticos.
-- NINGÚN dato personal real, ni de Paillaco ni de deportistas reales es utilizado.
-- Diseñado para inicializar un proyecto Supabase de Staging completamente aislado.
-- ==============================================================================

BEGIN;

-- 1. ORGANIZACIÓN SINTÉTICA DE PRUEBAS
INSERT INTO public.organizations (
  id,
  name,
  slug,
  contact_email
)
VALUES (
  '90000000-0000-0000-0000-000000000001',
  'Organización de Pruebas Staging',
  'staging-org',
  'staging@operixgymnastics.test'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- 2. CAMPEONATO SINTÉTICO EN STAGING
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
  scoring_schema_version
)
VALUES (
  'c9000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000001',
  'Campeonato Nacional de Control Staging 2026',
  'staging-championship-2026',
  'Torneo de validación técnica y operativa en entorno Staging',
  '2026-11-20',
  '2026-11-21',
  'Complejo Deportivo Staging',
  'Gimnasio Polideportivo Central',
  'public',
  'in_progress',
  'FIG 2025-2028',
  '2.0'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility;

-- 3. CLUBES SINTÉTICOS
INSERT INTO public.clubs (id, organization_id, name, code, contact_email)
VALUES 
  ('b1000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'Club Staging Norte', 'STG-NORTE', 'norte@staging.test'),
  ('b2000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', 'Club Staging Sur', 'STG-SUR', 'sur@staging.test')
ON CONFLICT (id) DO NOTHING;

-- 4. CATEGORÍAS SINTÉTICAS (GAM Y GAF)
INSERT INTO public.categories (
  id,
  championship_id,
  name,
  code,
  discipline,
  gender,
  scoring_regime,
  default_fixed_d_score,
  sort_order
)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'c9000000-0000-0000-0000-000000000001', 'Nivel 1 GAF Staging', 'N1-GAF', 'GAF', 'female', 'obligatory', 10.000, 1),
  ('a2000000-0000-0000-0000-000000000002', 'c9000000-0000-0000-0000-000000000001', 'Nivel 1 GAM Staging', 'N1-GAM', 'GAM', 'male', 'obligatory', 10.000, 2)
ON CONFLICT (id) DO NOTHING;

-- 5. HABILITACIÓN DE APARATOS EN CATEGORÍAS SINTÉTICAS
-- Vincula Salto (VT) y Suelo (FX) a las categorías
INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
SELECT 'a1000000-0000-0000-0000-000000000001', a.id, 1
FROM public.apparatuses a WHERE a.code = 'VT' AND a.discipline = 'GAF'
ON CONFLICT DO NOTHING;

INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
SELECT 'a2000000-0000-0000-0000-000000000002', a.id, 1
FROM public.apparatuses a WHERE a.code = 'FX' AND a.discipline = 'GAM'
ON CONFLICT DO NOTHING;

-- 6. GIMNASTAS SINTÉTICOS (Nombres completamente ficticios)
INSERT INTO public.gymnasts (id, organization_id, club_id, first_name, last_name, gender, birth_year)
VALUES
  ('g1000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Gimnasta', 'Sintética Alfa', 'female', 2014),
  ('g2000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'Gimnasta', 'Sintético Beta', 'male', 2013)
ON CONFLICT (id) DO NOTHING;

-- 7. INSCRIPCIONES APROBADAS
INSERT INTO public.registrations (
  id,
  championship_id,
  club_id,
  gymnast_id,
  category_id,
  bib_number,
  subdivision,
  rotation_group,
  start_order,
  status
)
VALUES
  ('r1000000-0000-0000-0000-000000000001', 'c9000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 501, 'Subdivisión 1', 'Grupo 1', 1, 'approved'),
  ('r2000000-0000-0000-0000-000000000002', 'c9000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'g2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 502, 'Subdivisión 1', 'Grupo 1', 2, 'approved')
ON CONFLICT (id) DO NOTHING;

-- 8. TOKEN CRIPTOGRÁFICO DE PRUEBA PARA JUECES EN STAGING
-- Token Secreto Sintético: staging_judge_test_token_2026_ok
-- Hash SHA-256: encode(digest('staging_judge_test_token_2026_ok', 'sha256'), 'hex')
-- = e59489a27bf79ea653457aeb8ec2c6b4122d4f20ec65ea9bfaea412ff3e4ff16
INSERT INTO public.championship_access_tokens (
  championship_id,
  token_hash,
  access_type,
  is_active
)
VALUES (
  'c9000000-0000-0000-0000-000000000001',
  'e59489a27bf79ea653457aeb8ec2c6b4122d4f20ec65ea9bfaea412ff3e4ff16',
  'judge',
  true
)
ON CONFLICT (token_hash) DO NOTHING;

COMMIT;
