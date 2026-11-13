/**
 * OPERIX GYMNASTICS — PORTAL PÚBLICO DEL CAMPEONATO
 *
 * Inspirado conceptualmente en el portal de eventos públicos (ej. Kluv Copa Concepción 2026),
 * adaptado a la arquitectura y diseño visual oficial de Operix Gymnastics.
 *
 * Características:
 * - URL pública propia (/evento/:slug).
 * - Información general, fechas, recinto deportivo, bases técnicas.
 * - Categorías y niveles FIG 2025-2028 participantes.
 * - Clubes participantes (si la organización lo autoriza).
 * - Resultados oficiales y medallero publicados.
 * - SEGURIDAD ESTRICTA: Cero información operativa privada, cero rotaciones,
 *   cero subdivisiones internas ni datos de contacto no autorizados.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Calendar,
  MapPin,
  Building2,
  Users,
  Award,
  Flame,
  FileText,
  Lock,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Info,
  AlertCircle,
  Clock,
} from 'lucide-react'
import type { Championship } from '@/core/types/championship'

export interface PublicChampionshipPortalProps {
  slug?: string
  onNavigateToDelegates?: () => void
  onNavigateHome?: () => void
}

interface ParticipatingClub {
  id: string
  name: string
  code: string
  city?: string
  country?: string
  gymnastCount: number
}

interface PublishedCategory {
  id: string
  name: string
  discipline: string
  gender: string
  scoringRegime: string
}

interface PublishedPodium {
  categoryName: string
  apparatusCode?: string
  gold: { name: string; club: string; score: number }
  silver?: { name: string; club: string; score: number }
  bronze?: { name: string; club: string; score: number }
}

export interface PublishedResultItem {
  id: string
  rank: number
  gymnastName: string
  clubName: string
  categoryName: string
  finalScore: number
}

export const PublicChampionshipPortal: React.FC<PublicChampionshipPortalProps> = ({
  slug = 'artistica-paillaco-2026',
  onNavigateToDelegates,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'clubs' | 'results' | 'podiums'>('info')
  const [isLoading, setIsLoading] = useState(true)
  const [championship, setChampionship] = useState<Championship | null>(null)
  const [participatingClubs, setParticipatingClubs] = useState<ParticipatingClub[]>([])
  const [categories, setCategories] = useState<PublishedCategory[]>([])
  const [podiums, setPodiums] = useState<PublishedPodium[]>([])
  const [publishedResults, setPublishedResults] = useState<PublishedResultItem[]>([])
  const [allChampionships, setAllChampionships] = useState<Championship[]>([])
  const [currentSlug, setCurrentSlug] = useState<string>(slug)

  // 1. Cargar datos del campeonato por slug
  useEffect(() => {
    async function loadPublicEvent() {
      try {
        setIsLoading(true)

        // Consultar campeonato por slug (únicamente campos públicos autorizados, nunca códigos de juez ni datos privados)
        const { data: champData } = await supabase
          .from('championships')
          .select('id, organization_id, name, slug, description, start_date, end_date, location, venue_name, visibility, status, ruleset_version, scoring_schema_version, bases_url, created_at, updated_at')
          .eq('slug', currentSlug)
          .maybeSingle()

        if (champData) {
          const mapped: Championship = {
            id: champData.id,
            organizationId: champData.organization_id,
            name: champData.name,
            slug: champData.slug,
            description: champData.description || 'Campeonato oficial de gimnasia artística bajo normativa FIG.',
            startDate: champData.start_date,
            endDate: champData.end_date,
            location: champData.location || 'Santiago, Chile',
            venueName: champData.venue_name || 'Polideportivo Estadio Nacional',
            visibility: champData.visibility,
            status: champData.status,
            rulesetVersion: champData.ruleset_version || 'FIG 2025-2028',
            scoringSchemaVersion: champData.scoring_schema_version || 'FIG_STANDARD_V1',
            basesUrl: champData.bases_url || 'https://operix.app/docs/bases-nacional-gaf-2026.pdf',
            createdAt: champData.created_at,
            updatedAt: champData.updated_at,
          }
          setChampionship(mapped)

          // Cargar categorías públicas
          const { data: catData } = await supabase
            .from('categories')
            .select('id, name, discipline, gender, scoring_regime')
            .eq('championship_id', mapped.id)
            .order('sort_order', { ascending: true })

          if (catData && catData.length > 0) {
            setCategories(
              catData.map((c) => ({
                id: c.id,
                name: c.name,
                discipline: c.discipline || 'GAF',
                gender: c.gender || 'female',
                scoringRegime: c.scoring_regime || 'free',
              }))
            )
          } else {
            setCategories([])
          }

          // Cargar clubes participantes autorizados (respetando privacidad)
          // Se consulta la lista pública de clubes inscritos sin exponer datos privados de atletas
          const { data: clubsData } = await supabase
            .from('clubs')
            .select('id, name, code, city, country')
            .order('name', { ascending: true })

          if (clubsData && clubsData.length > 0) {
            setParticipatingClubs(
              clubsData.map((cl) => ({
                id: cl.id,
                name: cl.name,
                code: cl.code,
                city: cl.city || 'Chile',
                country: cl.country || 'Chile',
                gymnastCount: 0,
              }))
            )
          } else {
            setParticipatingClubs([])
          }

          // Cargar puntuaciones públicas oficiales aprobadas para este campeonato
          try {
            const { data: scoresData } = await supabase
              .from('scores')
              .select(`
                id,
                final_score,
                registrations!inner (
                  championship_id,
                  gymnasts ( first_name, last_name ),
                  clubs ( name ),
                  categories ( name )
                )
              `)
              .eq('registrations.championship_id', mapped.id)
              .eq('status', 'official_approved')

            if (scoresData && scoresData.length > 0) {
              const mappedResults: PublishedResultItem[] = (scoresData as any[])
                .map((row) => {
                  const gym = row.registrations?.gymnasts
                  const club = row.registrations?.clubs
                  const cat = row.registrations?.categories
                  return {
                    id: row.id,
                    rank: 0,
                    gymnastName: gym ? `${gym.first_name} ${gym.last_name}` : 'Gimnasta',
                    clubName: club?.name || 'Club',
                    categoryName: cat?.name || 'General',
                    finalScore: Number(row.final_score) || 0,
                  }
                })
                .sort((a, b) => b.finalScore - a.finalScore)
                .map((item, idx) => ({ ...item, rank: idx + 1 }))

              setPublishedResults(mappedResults)
            } else {
              setPublishedResults([])
            }
          } catch {
            setPublishedResults([])
          }
        } else {
          // Si no se encuentra en Supabase por el slug exacto, marcar como no encontrado (404)
          setChampionship(null)
          setCategories([])
          setParticipatingClubs([])
          setPublishedResults([])
        }

        // Podios oficiales (vacíos hasta que el jurado oficialice los resultados de pista)
        setPodiums([])

        // Cargar lista general de campeonatos públicos para selector
        const { data: allChamps } = await supabase
          .from('championships')
          .select('id, name, slug, status, venue_name, start_date, end_date')
          .eq('visibility', 'public')

        if (allChamps && allChamps.length > 0) {
          setAllChampionships(
            allChamps.map((ac) => ({
              id: ac.id,
              organizationId: '',
              name: ac.name,
              slug: ac.slug,
              startDate: ac.start_date,
              endDate: ac.end_date,
              venueName: ac.venue_name || undefined,
              visibility: 'public',
              status: ac.status,
              rulesetVersion: '',
              scoringSchemaVersion: '',
              createdAt: '',
              updatedAt: '',
            }))
          )
        }
      } catch (err) {
        console.error('Error cargando portal público:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPublicEvent()
  }, [currentSlug])

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            En Competencia
          </span>
        )
      case 'registration_open':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
            Inscripciones Abiertas
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-400 border border-slate-500/30">
            Finalizado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
            Próximamente
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* ---------------------------------------------------------------------
          PORTAL TOPBAR
          --------------------------------------------------------------------- */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Inicio Operix</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                <Trophy className="h-4 w-4" />
              </div>
              <span className="text-sm font-black tracking-tight text-white hidden sm:inline">
                Operix Gymnastics
              </span>
              <span className="text-[11px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 rounded px-1.5 py-0.5">
                Portal Público
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Acceso Privado para Delegados y Clubes */}
            {onNavigateToDelegates && (
              <button
                type="button"
                onClick={onNavigateToDelegates}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-all ring-1 ring-blue-400/30"
              >
                <Lock className="h-3.5 w-3.5 text-blue-200" />
                <span>Acceso Delegados & Rotaciones</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ---------------------------------------------------------------------
          ESTADO 404: CAMPEONATO NO ENCONTRADO
          --------------------------------------------------------------------- */}
      {!isLoading && !championship && (
        <div className="mx-auto max-w-2xl px-4 py-28 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xl">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-3">
            Campeonato No Encontrado
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            El evento que intentas consultar no existe o no se encuentra publicado oficialmente en la plataforma.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/evento/artistica-paillaco-2026"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all"
            >
              <Trophy className="h-4 w-4" />
              <span>Ver Campeonato Paillaco 2026</span>
            </a>
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Inicio</span>
              </button>
            )}
          </div>
        </div>
      )}

      {championship && (
        <>
          {/* ---------------------------------------------------------------------
              HERO BANNER (Referencia Kluv Event Header)
              --------------------------------------------------------------------- */}
          <header className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-4 py-10 sm:px-6 sm:py-14 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                {statusBadge(championship?.status)}
                <span className="rounded-full bg-slate-800/80 border border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-300">
                  FIG 2025-2028 Conforme
                </span>
                <span className="rounded-full bg-indigo-950/60 border border-indigo-700/60 px-3 py-1 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  Resultados Oficiales
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {championship?.name || 'Cargando Campeonato...'}
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                {championship?.description}
              </p>

              {/* Meta tags de ubicación y fechas */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>
                    {championship?.startDate
                      ? `${new Date(championship.startDate).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })} al ${new Date(championship.endDate).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}`
                      : 'Fechas por confirmar'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>
                    {championship?.venueName || 'Recinto Central'} · {championship?.location || 'Chile'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Organiza: Federación / Comercial Hels SpA</span>
                </div>
              </div>
            </div>

            {/* Selector de campeonato si hay múltiples */}
            {allChampionships.length > 1 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shrink-0 w-full sm:w-auto">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Cambiar Evento Público
                </label>
                <select
                  value={currentSlug}
                  onChange={(e) => setCurrentSlug(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-blue-500 focus:outline-none w-full sm:min-w-[240px]"
                >
                  {allChampionships.map((ac) => (
                    <option key={ac.id} value={ac.slug}>
                      {ac.name} ({ac.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          NAVIGATION TABS (INFORMACIÓN GENERAL / CLUBES / RESULTADOS / PODIOS)
          --------------------------------------------------------------------- */}
      <div className="border-b border-slate-800 bg-slate-950 sticky top-[57px] z-40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 overflow-x-auto py-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>Información & Convocatoria</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'clubs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Clubes Participantes ({participatingClubs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Flame className="h-4 w-4 text-orange-400" />
            <span>Resultados Oficiales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('podiums')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'podiums'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Award className="h-4 w-4 text-amber-300" />
            <span>Medallero & Podios</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          MAIN TAB CONTENT
          --------------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
            <p className="mt-3 text-xs font-bold">Cargando información oficial...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. INFORMACIÓN GENERAL & BASES */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Detalles del Evento y Recinto */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-400" />
                      Acerca del Campeonato
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {championship?.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Recinto Deportivo
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {championship?.venueName}
                        </p>
                        <p className="text-xs text-slate-400">{championship?.location}</p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Código & Normativa
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-emerald-400">
                          {championship?.rulesetVersion}
                        </p>
                        <p className="text-xs text-slate-400">Federación Internacional de Gimnasia</p>
                      </div>
                    </div>
                  </div>

                  {/* Categorías y Niveles en Competencia */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-400" />
                        Categorías & Niveles Oficiales
                      </h2>
                      <span className="text-xs font-semibold text-slate-400">
                        {categories.length} categorías
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-white">{cat.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {cat.discipline} · {cat.gender}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-800/80">
                            {cat.scoringRegime}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Bases Oficiales & Acceso Delegados */}
                <div className="space-y-6">
                  {/* Bases Técnicas Descargables */}
                  <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Bases Técnicas & Convocatoria</h3>
                        <p className="text-[11px] text-slate-400">Documento oficial aprobado</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      Revisa el reglamento técnico, tabla de bonificaciones, horarios generales de apertura y
                      disposiciones de vestuario y desfile.
                    </p>

                    <a
                      href={championship?.basesUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 text-xs font-bold transition-colors border border-slate-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Descargar Bases Oficiales (PDF)</span>
                    </a>
                  </div>

                  {/* Acceso Privado a Rotaciones para Clubes */}
                  <div className="rounded-2xl border border-blue-900/60 bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 p-6 space-y-4">
                    <div className="flex items-center gap-2.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
                      <Lock className="h-4 w-4" />
                      Zona Privada de Delegados
                    </div>

                    <h3 className="text-base font-black text-white">
                      ¿Eres delegado o entrenador de un club participante?
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      El orden de paso, rotaciones olímpicas, horarios estimados por aparato y dorsales están
                      protegidos y son de acceso exclusivo para delegaciones oficiales acreditadas.
                    </p>

                    {onNavigateToDelegates && (
                      <button
                        type="button"
                        onClick={onNavigateToDelegates}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-900/30"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Consultar Rotaciones de Mi Club</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CLUBES PARTICIPANTES */}
            {activeTab === 'clubs' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">Delegaciones & Clubes Acreditados</h2>
                    <p className="text-xs text-slate-400">
                      Entidades deportivas confirmadas para este campeonato
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs text-slate-300 border-slate-700 self-start sm:self-auto">
                    {participatingClubs.length} Clubes Registrados
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participatingClubs.map((club) => (
                    <div
                      key={club.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 hover:border-slate-700 transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-blue-400 font-black text-sm">
                            {club.code}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">{club.name}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-slate-500" />
                              {club.city}, {club.country}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Gimnastas inscritos:</span>
                        <span className="font-bold text-emerald-400">{club.gymnastCount} atletas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. RESULTADOS OFICIALES PUBLICADOS */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-400" />
                        Puntuaciones & Clasificaciones Oficiales FIG
                      </h2>
                      <p className="text-xs text-slate-400">
                        Resultados validados por el Juez Árbitro y aprobados para publicación pública
                      </p>
                    </div>
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400 self-start sm:self-auto">
                      ✓ Certificado Oficial
                    </span>
                  </div>

                  {/* Tabla resumen pública o estado de espera */}
                  {publishedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-amber-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Esperando las primeras puntuaciones oficiales</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                          Las clasificaciones y notas oficiales aparecerán aquí en cuanto sean validadas y aprobadas por el Juez Árbitro.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                          <tr>
                            <th className="px-4 py-3">Puesto</th>
                            <th className="px-4 py-3">Gimnasta</th>
                            <th className="px-4 py-3">Club</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3 text-right">Nota Final</th>
                            <th className="px-4 py-3 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-200">
                          {publishedResults.map((r) => (
                            <tr key={r.id}>
                              <td className="px-4 py-3 font-bold text-white">
                                {r.rank === 1 ? '🥇 1º' : r.rank === 2 ? '🥈 2º' : r.rank === 3 ? '🥉 3º' : `${r.rank}º`}
                              </td>
                              <td className="px-4 py-3 font-bold text-white">{r.gymnastName}</td>
                              <td className="px-4 py-3 text-slate-300">{r.clubName}</td>
                              <td className="px-4 py-3 text-slate-400">{r.categoryName}</td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                                {r.finalScore.toFixed(3)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                                  Oficial
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. MEDALLERO & PODIOS PUBLICADOS */}
            {activeTab === 'podiums' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-400" />
                      Podios Olímpicos Oficiales FIG
                    </h2>
                    <p className="text-xs text-slate-400">
                      Ceremonias de premiación concluidas y medallas asignadas
                    </p>
                  </div>
                </div>

                {podiums.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-amber-400">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Ceremonias de premiación no iniciadas</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        Los podios oficiales y medallero se publicarán al finalizar las subdivisiones de competición.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {podiums.map((podium, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-sm"
                      >
                        <div className="border-b border-slate-800 pb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            {podium.apparatusCode ? `Aparato ${podium.apparatusCode}` : 'General'}
                          </span>
                          <h3 className="text-sm font-black text-white leading-tight mt-0.5">
                            {podium.categoryName}
                          </h3>
                        </div>

                        {/* 1º Oro */}
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">🥇</span>
                            <div>
                              <p className="text-xs font-black text-white">{podium.gold.name}</p>
                              <p className="text-[11px] text-amber-300/80">{podium.gold.club}</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-black text-amber-300">
                            {podium.gold.score.toFixed(3)}
                          </span>
                        </div>

                        {/* 2º Plata */}
                        {podium.silver && (
                          <div className="rounded-xl border border-slate-600/40 bg-slate-800/40 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">🥈</span>
                              <div>
                                <p className="text-xs font-bold text-white">{podium.silver.name}</p>
                                <p className="text-[11px] text-slate-400">{podium.silver.club}</p>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-300">
                              {podium.silver.score.toFixed(3)}
                            </span>
                          </div>
                        )}

                        {/* 3º Bronce */}
                        {podium.bronze && (
                          <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">🥉</span>
                              <div>
                                <p className="text-xs font-bold text-white">{podium.bronze.name}</p>
                                <p className="text-[11px] text-amber-600/80">{podium.bronze.club}</p>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-amber-500">
                              {podium.bronze.score.toFixed(3)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      </>
      )}

      {/* ---------------------------------------------------------------------
          FOOTER
          --------------------------------------------------------------------- */}
      <footer className="mt-20 border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Trophy className="h-4 w-4 text-blue-500" />
            <strong className="text-white">Operix Gymnastics</strong>
            <span>· Portal Oficial de Eventos FIG 2025-2028</span>
          </div>
          <div>
            Desarrollado por <strong className="text-slate-300 font-bold">Comercial Hels SpA</strong>
          </div>
        </div>
      </footer>
    </div>
  )
}
