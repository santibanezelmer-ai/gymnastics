/**
 * Lightweight SPA Router for Operix Gymnastics
 * Supports clean URLs:
 * - `/` -> Landing / Dashboard
 * - `/evento/:slug` -> Public Championship Portal
 * - `/club/rotaciones` -> Private Club Delegates Portal
 *
 * Desarrollado por Comercial Hels SpA.
 */

import { useState, useEffect, useCallback } from 'react'

export interface RouteState {
  path: string
  params: Record<string, string>
}

function parsePath(pathname: string): RouteState {
  const cleanPath = pathname.replace(/\/$/, '') || '/'

  // 1. Match /evento/:slug o /eventos/:slug (con slug especificado) -> Portal Público del Campeonato
  const eventMatch = cleanPath.match(/^\/(?:evento|eventos)\/([^/]+)/)
  if (eventMatch && eventMatch[1].trim()) {
    return {
      path: '/evento',
      params: { slug: decodeURIComponent(eventMatch[1]) },
    }
  }

  // 1.1 Match /eventos o /evento (sin slug) -> Cartelera pública unificada de eventos
  if (cleanPath === '/eventos' || cleanPath === '/evento') {
    return {
      path: '/evento',
      params: {},
    }
  }

  // 2. Match /club/rotaciones
  if (cleanPath === '/club/rotaciones' || cleanPath.startsWith('/club/rotaciones')) {
    return {
      path: '/club/rotaciones',
      params: {},
    }
  }

  // 3. Match /campeonatos
  if (cleanPath === '/campeonatos' || cleanPath.startsWith('/campeonatos')) {
    return {
      path: '/campeonatos',
      params: {},
    }
  }

  return {
    path: cleanPath,
    params: {},
  }
}

export function useRouter() {
  const [route, setRoute] = useState<RouteState>(() => parsePath(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to)
      setRoute(parsePath(to))
      window.scrollTo(0, 0)
    }
  }, [])

  return { route, navigate }
}
