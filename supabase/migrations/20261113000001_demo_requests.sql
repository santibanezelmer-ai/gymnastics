-- ============================================================================
-- MIGRATION: 20261113000001_demo_requests.sql
-- DESCRIPTION: Tabla de solicitudes de demo desde la landing de marketing.
--              El público (anon) solo puede INSERTAR; nadie puede leer con la
--              clave anónima. Lectura vía service_role / panel de Supabase.
-- AUTHOR: Comercial Hels SpA
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  organization TEXT NOT NULL CHECK (char_length(organization) BETWEEN 2 AND 160),
  role TEXT NOT NULL CHECK (role IN ('organizador', 'club', 'federacion', 'juez', 'otro')),
  email TEXT NOT NULL CHECK (char_length(email) <= 200 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
  discipline TEXT CHECK (discipline IS NULL OR discipline IN ('GAF', 'GAM', 'GR', 'TRA', 'AER', 'ACRO', 'PK')),
  message TEXT CHECK (message IS NULL OR char_length(message) <= 2000),
  source TEXT NOT NULL DEFAULT 'landing' CHECK (char_length(source) <= 40),
  status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'demo_agendada', 'descartado'))
);

COMMENT ON TABLE public.demo_requests IS 'Solicitudes de demo enviadas desde la landing pública.';

CREATE INDEX IF NOT EXISTS demo_requests_created_at_idx ON public.demo_requests (created_at DESC);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Solo INSERT para visitantes y usuarios; sin SELECT/UPDATE/DELETE desde el navegador.
DROP POLICY IF EXISTS demo_requests_public_insert ON public.demo_requests;
CREATE POLICY demo_requests_public_insert
  ON public.demo_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'nuevo');

REVOKE ALL ON public.demo_requests FROM anon, authenticated;
GRANT INSERT (full_name, organization, role, email, phone, discipline, message, source)
  ON public.demo_requests TO anon, authenticated;

COMMIT;