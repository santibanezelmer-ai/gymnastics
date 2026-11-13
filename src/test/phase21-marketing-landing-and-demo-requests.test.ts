import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { submitDemoRequest, type DemoRequest } from '@/features/marketing/demoRequests'
import {
  DISCIPLINES,
  ROLES,
  PLANS,
  EXAMPLE_RANKING,
  PILOT_EVENT_SLUG,
} from '@/features/marketing/content'

describe('FASE 21: Marketing Landing, Rutas y Solicitudes de Demo', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Solicitudes de Demo (demoRequests)', () => {
    it('debe enviar la solicitud al endpoint de Supabase con los headers correctos y clave anónima', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
      })
      global.fetch = mockFetch

      const payload: DemoRequest = {
        full_name: 'Camila Valenzuela',
        organization: 'Club Deportivo Gimnasia Austral',
        role: 'organizador',
        email: 'camila@gimnasiaaustral.cl',
        phone: '+56987654321',
        discipline: 'GAF',
        message: 'Queremos organizar nuestro torneo regional de nivel 1 a 4 con 120 gimnastas.',
      }

      await submitDemoRequest(payload)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toContain('/rest/v1/demo_requests')
      expect(options.method).toBe('POST')
      expect(options.headers['Content-Type']).toBe('application/json')
      expect(options.headers['Prefer']).toBe('return=minimal')

      const body = JSON.parse(options.body)
      expect(body.full_name).toBe(payload.full_name)
      expect(body.organization).toBe(payload.organization)
      expect(body.role).toBe(payload.role)
      expect(body.email).toBe(payload.email)
      expect(body.phone).toBe(payload.phone)
      expect(body.discipline).toBe(payload.discipline)
      expect(body.source).toBe('landing')
    })

    it('debe rechazar la promesa si el endpoint devuelve error HTTP', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      })
      global.fetch = mockFetch

      const payload: DemoRequest = {
        full_name: 'Test',
        organization: 'Club Test',
        role: 'otro',
        email: 'invalid-email',
        phone: null,
        discipline: null,
        message: null,
      }

      await expect(submitDemoRequest(payload)).rejects.toThrow('Error 400')
    })
  })

  describe('2. Integridad de Contenidos y Veracidad Comercial', () => {
    it('todas las disciplinas FIG oficiales deben estar correctamente codificadas', () => {
      const codes = DISCIPLINES.map((d) => d.code)
      expect(codes).toContain('GAF')
      expect(codes).toContain('GAM')
      expect(codes).toContain('GR')
      expect(codes).toContain('TRA')
      expect(codes).toContain('AER')
      expect(codes).toContain('ACRO')
      expect(codes).toContain('PK')
      expect(DISCIPLINES.length).toBe(7)
    })

    it('los roles del selector deben cubrir organizador, club, federación y juez', () => {
      const roleValues = ROLES.map((r) => r.value)
      expect(roleValues).toContain('organizador')
      expect(roleValues).toContain('club')
      expect(roleValues).toContain('federacion')
      expect(roleValues).toContain('juez')
      expect(roleValues).toContain('otro')
    })

    it('los datos de ejemplo en marketing ranking no deben corresponder a gimnastas reales de Paillaco 2026', () => {
      expect(EXAMPLE_RANKING.length).toBeGreaterThan(0)
      for (const item of EXAMPLE_RANKING) {
        expect(item.name).toMatch(/^[A-Z][a-z]+ [A-Z]\.$/) // Formato sintético "Nombre I."
        expect(item.club).toMatch(/^Club /)
        expect(parseFloat(item.score)).toBeGreaterThan(0)
      }
    })

    it('el slug del evento piloto debe apuntar a Paillaco 2026', () => {
      expect(PILOT_EVENT_SLUG).toBe('artistica-paillaco-2026')
    })

    it('los planes de suscripción deben tener precios transparentes y sin letras chicas', () => {
      expect(PLANS.length).toBe(3)
      const clubPlan = PLANS.find((p) => p.id === 'club')
      const orgPlan = PLANS.find((p) => p.id === 'organizador')
      const fedPlan = PLANS.find((p) => p.id === 'federacion')

      expect(clubPlan?.price).toBe('$0')
      expect(orgPlan?.price).toBe('$49.990')
      expect(fedPlan?.price).toBe('$120.000')
    })
  })

  describe('3. Auditoría de Seguridad de la Migración SQL demo_requests', () => {
    it('el archivo de migración debe tener RLS habilitado y permisos restringidos', () => {
      const migrationPath = path.resolve(
        __dirname,
        '../../supabase/migrations/20261113000001_demo_requests.sql'
      )
      expect(fs.existsSync(migrationPath)).toBe(true)

      const sql = fs.readFileSync(migrationPath, 'utf-8')

      // Verificar tabla y claves
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.demo_requests')
      expect(sql).toContain('ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY')

      // Verificar RLS
      expect(sql).toContain('CREATE POLICY demo_requests_public_insert')
      expect(sql).toContain('FOR INSERT')
      expect(sql).toContain("WITH CHECK (status = 'nuevo')")

      // Verificar REVOKE y GRANT selectivo (INSERT ONLY)
      expect(sql).toContain('REVOKE ALL ON public.demo_requests FROM anon, authenticated')
      expect(sql).toContain('GRANT INSERT (full_name, organization, role, email, phone, discipline, message, source)')
      expect(sql).not.toContain('GRANT SELECT')
      expect(sql).not.toContain('GRANT UPDATE')
      expect(sql).not.toContain('GRANT DELETE')

      // Verificar autoría
      expect(sql).toContain('Comercial Hels SpA')
    })
  })

  describe('4. Cartelera Pública de Eventos y Ruteo (/evento y /eventos)', () => {
    it('el archivo del router debe resolver correctamente /eventos y /evento hacia la cartelera pública', () => {
      const routerFilePath = path.resolve(__dirname, '../lib/router.ts')
      const routerCode = fs.readFileSync(routerFilePath, 'utf-8')

      expect(routerCode).toContain("cleanPath === '/eventos' || cleanPath === '/evento'")
      expect(routerCode).toContain("path: '/evento'")
    })

    it('el componente PublicEventsDirectory debe existir y exportar la cartelera', () => {
      const directoryFilePath = path.resolve(
        __dirname,
        '../features/public-portal/PublicEventsDirectory.tsx'
      )
      expect(fs.existsSync(directoryFilePath)).toBe(true)

      const directoryCode = fs.readFileSync(directoryFilePath, 'utf-8')
      expect(directoryCode).toContain('PublicEventsDirectory')
      expect(directoryCode).toContain('Cartelera Oficial de Campeonatos')
      expect(directoryCode).toContain('artistica-paillaco-2026')
    })
  })
})
