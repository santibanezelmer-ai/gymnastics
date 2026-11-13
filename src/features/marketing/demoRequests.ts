import { env } from '@/core/config/env'

export interface DemoRequest {
  full_name: string
  organization: string
  role: string
  email: string
  phone: string | null
  discipline: string | null
  message: string | null
}

/**
 * Guarda la solicitud en la tabla public.demo_requests (ver migración 20261113000001).
 * Usa la API REST de Supabase con la clave anónima; la política RLS solo permite INSERT.
 */
export async function submitDemoRequest(payload: DemoRequest): Promise<void> {
  if (!env.isConfigured) {
    throw new Error('Supabase no está configurado')
  }
  const res = await fetch(`${env.supabaseUrl}/rest/v1/demo_requests`, {
    method: 'POST',
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${env.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...payload, source: 'landing' }),
  })
  if (!res.ok) {
    throw new Error(`Error ${res.status}`)
  }
}