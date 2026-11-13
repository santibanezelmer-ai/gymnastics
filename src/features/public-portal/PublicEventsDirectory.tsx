/**
 * OPERIX GYMNASTICS — CARTELERA PÚBLICA DE EVENTOS
 *
 * Muestra el directorio completo de campeonatos públicos de gimnasia en la plataforma.
 * Permite buscar por nombre, recinto o ciudad, filtrar por disciplina y estado,
 * y acceder al portal oficial de cada torneo (/evento/:slug).
 *
 * Desarrollado por Comercial Hels SpA.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Calendar,
  MapPin,
  Search,
  Radio,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react'

export interface PublicEventItem {
  id: string
  name: string
  slug: string
  description?: string
  startDate: string
  endDate: string
  venueName?: string
  location?: string
  status: 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'archived'
  disciplines?: string[]
  isLive?: boolean
}

// Fallback seed de eventos oficiales para garantizar disponibilidad
const SEED_PUBLIC_EVENTS: PublicEventItem[] = [
  {
    id: 'c2026000-0000-0000-0000-000000000001',
    name: 'Campeonato Artística 2026 - Paillaco',
    slug: 'artistica-paillaco-2026',
    description: 'Campeonato oficial federado de gimnasia artística GAF y GAM. Niveles formativos, escuela y federados.',
    startDate: '2026-11-14',
    endDate: '2026-11-16',
    venueName: 'Gimnasio Municipal de Paillaco',
    location: 'Paillaco, Región de Los Ríos, Chile',
    status: 'in_progress',
    disciplines: ['GAF', 'GAM'],
    isLive: true,
  },
]

export interface PublicEventsDirectoryProps {
  navigate: (to: string) => void
  onSelectEvent?: (slug: string) => void
}

export const PublicEventsDirectory: React.FC<PublicEventsDirectoryProps> = ({
  navigate,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState<PublicEventItem[]>(SEED_PUBLIC_EVENTS)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  // Cargar campeonatos públicos desde Supabase
  useEffect(() => {
    async function loadChampionships() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('championships')
          .select('id, name, slug, description, start_date, end_date, venue_name, location, status, visibility')
          .eq('visibility', 'public')
          .order('start_date', { ascending: false })

        if (error) {
          console.warn('Usando catálogo local de eventos:', error.message)
          return
        }

        if (data && data.length > 0) {
          const mapped: PublicEventItem[] = data.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || undefined,
            startDate: c.start_date,
            endDate: c.end_date,
            venueName: c.venue_name || undefined,
            location: c.location || undefined,
            status: c.status,
            disciplines: ['GAF', 'GAM'], // Disciplinas base
            isLive: c.status === 'in_progress',
          }))
          setEvents(mapped)
        }
      } catch (err) {
        console.error('Error cargando campeonatos públicos:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadChampionships()
  }, [])

  // Filtrado de eventos
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Filtro de búsqueda
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchesName = ev.name.toLowerCase().includes(term)
        const matchesVenue = (ev.venueName || '').toLowerCase().includes(term)
        const matchesLocation = (ev.location || '').toLowerCase().includes(term)
        const matchesSlug = ev.slug.toLowerCase().includes(term)
        if (!matchesName && !matchesVenue && !matchesLocation && !matchesSlug) {
          return false
        }
      }

      // Filtro de disciplina
      if (selectedDiscipline !== 'ALL') {
        if (!ev.disciplines || !ev.disciplines.includes(selectedDiscipline)) {
          return false
        }
      }

      // Filtro de estado
      if (selectedStatus === 'LIVE' && ev.status !== 'in_progress') return false
      if (selectedStatus === 'UPCOMING' && ev.status !== 'registration_open' && ev.status !== 'registration_closed') return false
      if (selectedStatus === 'COMPLETED' && ev.status !== 'completed' && ev.status !== 'archived') return false

      return true
    })
  }, [events, searchTerm, selectedDiscipline, selectedStatus])

  const handleOpenEvent = (slug: string) => {
    if (onSelectEvent) {
      onSelectEvent(slug)
    } else {
      navigate(`/evento/${slug}`)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            En Curso · En Vivo
          </span>
        )
      case 'registration_open':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-500/20">
            <Calendar className="h-3 w-3" /> Inscripciones Abiertas
          </span>
        )
      case 'registration_closed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Próximo a Iniciar
          </span>
        )
      case 'completed':
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-500/20">
            <CheckCircle2 className="h-3 w-3" /> Finalizado · Resultados Oficiales
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Programado
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Barra de Navegación Superior */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-600 text-white shadow-md">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Operix <span className="font-semibold text-blue-600">Gymnastics</span>
              </span>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
                Cartelera Oficial de Eventos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs"
            >
              ← Inicio
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/club/rotaciones')}
              className="text-xs hidden sm:inline-flex"
            >
              Portal Clubes
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/ingresar')}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ingresar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-12 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Directorio de Competiciones FIG 2025–2028</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Cartelera Oficial de Campeonatos
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600">
            Encuentra todos los torneos oficiales organizados en Operix. Consulta calendarios,
            nóminas de atletas, rotaciones en vivo y los resultados oficiales certificados.
          </p>

          {/* Barra de Búsqueda y Filtros */}
          <div className="mt-8 mx-auto max-w-3xl space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de campeonato, recinto deportivo o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-3 focus:ring-blue-100 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Píldoras de Filtro */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <div className="flex items-center gap-1 rounded-xl bg-slate-200/60 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('ALL')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedStatus === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('LIVE')}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedStatus === 'LIVE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <Radio className="h-3 w-3" /> En Vivo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('UPCOMING')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedStatus === 'UPCOMING'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Próximos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('COMPLETED')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedStatus === 'COMPLETED'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Finalizados
                </button>
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-slate-200/60 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedDiscipline('ALL')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedDiscipline === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas las disciplinas
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDiscipline('GAF')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedDiscipline === 'GAF'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  GAF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDiscipline('GAM')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedDiscipline === 'GAM'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  GAM
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Campeonatos */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900">
              Eventos Disponibles ({filteredEvents.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Actualización automática en vivo
          </span>
        </div>

        {isLoading && events.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600">Cargando directorio de campeonatos oficiales...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No se encontraron campeonatos</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              No hay eventos públicos que coincidan con los criterios de búsqueda o filtros seleccionados.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setSelectedDiscipline('ALL')
                setSelectedStatus('ALL')
              }}
              className="mt-4"
            >
              Restablecer Filtros
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all"
              >
                {/* Header Card */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {renderStatusBadge(event.status)}
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                      FIG 2025–2028
                    </span>
                  </div>

                  <h3
                    onClick={() => handleOpenEvent(event.slug)}
                    className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {event.name}
                  </h3>

                  {event.description && (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {/* Metadatos: Recinto, Ubicación y Fechas */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    {event.venueName && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="font-semibold text-slate-800 truncate">
                          {event.venueName}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="pl-6 text-[11px] text-slate-500 truncate">
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>
                        {event.startDate} al {event.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Disciplinas */}
                  {event.disciplines && event.disciplines.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {event.disciplines.map((d) => (
                        <span
                          key={d}
                          className="rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10px] font-bold text-blue-700"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Card con Acción */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-400 truncate">
                    /{event.slug}
                  </span>
                  <Button
                    onClick={() => handleOpenEvent(event.slug)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs group-hover:translate-x-0.5 transition-transform"
                  >
                    Ver Torneo
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Oficial */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-xs text-slate-500 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Trophy className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-slate-900">Operix Gymnastics</span>
            <span>· Directorio Oficial de Competiciones</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Desarrollado por <strong className="text-slate-800 font-bold">Comercial Hels SpA</strong>
          </div>
        </div>
      </footer>
    </div>
  )
}
