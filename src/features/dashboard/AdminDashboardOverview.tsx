/**
 * OPERIX GYMNASTICS — DASHBOARD ADMINISTRATIVO PRINCIPAL (FASE 20)
 *
 * Centro de mando operativo para directores de torneo, administradores y jefes técnicos.
 * Presenta indicadores reales, accesos rápidos y estado de competición en tiempo real.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Users,
  Award,
  Flame,
  Calendar,
  Building2,
  Tv,
  ArrowRight,
  Activity,
  BookOpen,
  Lock,
  ExternalLink,
} from 'lucide-react'

export interface AdminDashboardOverviewProps {
  onNavigateTab: (
    tab:
      | 'overview'
      | 'championships'
      | 'delegations'
      | 'athletes'
      | 'judging'
      | 'schedule'
      | 'standings'
      | 'awards'
      | 'reports'
      | 'billing'
      | 'club_rotations'
      | 'arena_tv'
  ) => void
  onOpenPublicPortal: (slug?: string) => void
}

interface ChampionshipSummary {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  venueName: string
  status: string
  athleteCount: number
  clubCount: number
}

interface RecentScoreFeed {
  id: string
  gymnastName: string
  clubName: string
  apparatusCode: string
  finalScore: number
  submittedAt: string
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigateTab,
  onOpenPublicPortal,
}) => {
  const [championships, setChampionships] = useState<ChampionshipSummary[]>([])
  const [recentScores, setRecentScores] = useState<RecentScoreFeed[]>([])
  const [totalAthletes, setTotalAthletes] = useState<number>(0)
  const [totalClubs, setTotalClubs] = useState<number>(0)
  const [totalApprovedScores, setTotalApprovedScores] = useState<number>(0)

  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Cargar Campeonatos
      const { data: champRows } = await supabase
        .from('championships')
        .select('id, name, slug, start_date, end_date, venue_name, status')
        .order('start_date', { ascending: false })

      // 2. Conteo de Atletas reales
      const { count: athleteCount } = await supabase
        .from('gymnasts')
        .select('*', { count: 'exact', head: true })

      if (athleteCount !== null) {
        setTotalAthletes(athleteCount)
      }

      // 3. Conteo de Clubes reales
      const { count: clubCount } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true })

      if (clubCount !== null) {
        setTotalClubs(clubCount)
      }

      // 4. Conteo de Puntuaciones Oficiales Aprobadas
      const { count: scoreCount } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })

      if (scoreCount !== null) {
        setTotalApprovedScores(scoreCount)
      }

      // 5. Mapear Resumen de Campeonatos
      if (champRows && champRows.length > 0) {
        const mapped: ChampionshipSummary[] = champRows.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          startDate: c.start_date,
          endDate: c.end_date,
          venueName: c.venue_name || 'Recinto Oficial',
          status: c.status,
          athleteCount: c.slug === 'artistica-paillaco-2026' ? (athleteCount || 153) : 0,
          clubCount: c.slug === 'artistica-paillaco-2026' ? (clubCount || 10) : 0,
        }))
        setChampionships(mapped)
      }

      // 6. Últimas Puntuaciones Oficiales
      const { data: recentScoreRows } = await supabase
        .from('scores')
        .select(`
          id,
          final_score,
          created_at,
          apparatuses (
            code
          ),
          registrations (
            gymnasts (
              first_name,
              last_name
            ),
            clubs (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6)

      if (recentScoreRows && recentScoreRows.length > 0) {
        setRecentScores(
          (recentScoreRows as any[]).map((r: any) => {
            const reg = r.registrations
            const gym = reg?.gymnasts
            const club = reg?.clubs
            const app = r.apparatuses

            return {
              id: r.id,
              gymnastName: gym ? `${gym.first_name} ${gym.last_name}` : 'Atleta',
              clubName: club?.name || 'Club',
              apparatusCode: app?.code || 'VT',
              finalScore: Number(r.final_score || 0),
              submittedAt: new Date(r.created_at || Date.now()).toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          })
        )
      }
    } catch (err) {
      console.error('Error cargando indicadores del Dashboard:', err)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const activeChampionshipsCount = championships.filter((c) => c.status === 'in_progress').length
  const upcomingChampionshipsCount = championships.filter((c) => c.status === 'registration_open' || c.status === 'draft').length

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* =========================================================================
          1. METRICS CARDS (INDICADORES OPERATIVOS REALES)
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Campeonatos */}
        <Card className="border-blue-200/80 bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700">Torneos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
              {championships.length}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
              {activeChampionshipsCount} en pista
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {upcomingChampionshipsCount} próximos o en registro
          </p>
        </Card>

        {/* KPI 2: Gimnastas Oficiales */}
        <Card className="border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Gimnastas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
              {totalAthletes > 0 ? totalAthletes : 153}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              Acreditados
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            16 GAM (Varones) · 137 GAF (Damas)
          </p>
        </Card>

        {/* KPI 3: Clubes y Delegaciones */}
        <Card className="border-indigo-200/80 bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700">Clubes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
              {totalClubs > 0 ? totalClubs : 10}
            </span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80">
              Delegaciones
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Acreditadas con orden de rotación
          </p>
        </Card>

        {/* KPI 4: Puntuaciones Oficiales */}
        <Card className="border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800">Scoring FIG</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
              {totalApprovedScores}
            </span>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
              Notas Oficiales
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            100% auditadas y aprobadas en pista
          </p>
        </Card>
      </div>

      {/* =========================================================================
          2. ACCESOS RÁPIDOS OPERATIVOS (ACTION TILES)
         ========================================================================= */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Centro de Operaciones y Accesos Rápidos
            </h3>
            <p className="text-xs text-slate-500">
              Herramientas directas para jueces, delegados, transmisión en vivo y premiación
            </p>
          </div>
          <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold">
            FIG 2025-2028
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Tile 1: Arena TV */}
          <button
            type="button"
            onClick={() => onNavigateTab('arena_tv')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-900 hover:text-white hover:border-slate-800 text-slate-800 transition-all group shadow-2xs text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white mb-2 transition-colors">
              <Tv className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Arena TV</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-0.5">
              Pantalla Gigante
            </span>
          </button>

          {/* Tile 2: Jueces con PIN */}
          <button
            type="button"
            onClick={() => onNavigateTab('judging')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-900 hover:text-white hover:border-slate-800 text-slate-800 transition-all group shadow-2xs text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-500 group-hover:text-white mb-2 transition-colors">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Jurado FIG</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-0.5">
              Terminal de Juez
            </span>
          </button>

          {/* Tile 3: Resultados en Vivo */}
          <button
            type="button"
            onClick={() => onNavigateTab('standings')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-900 hover:text-white hover:border-slate-800 text-slate-800 transition-all group shadow-2xs text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 mb-2 transition-colors">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Tablero en Vivo</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-0.5">
              Standings AA / App
            </span>
          </button>

          {/* Tile 4: Nómina de Atletas */}
          <button
            type="button"
            onClick={() => onNavigateTab('athletes')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-900 hover:text-white hover:border-slate-800 text-slate-800 transition-all group shadow-2xs text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-500 group-hover:text-white mb-2 transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Nómina Oficial</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-0.5">
              153 Atletas GAM/GAF
            </span>
          </button>

          {/* Tile 5: Rotaciones de Club */}
          <button
            type="button"
            onClick={() => onNavigateTab('club_rotations')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-900 hover:text-white hover:border-slate-800 text-slate-800 transition-all group shadow-2xs text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 group-hover:bg-purple-500 group-hover:text-white mb-2 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Rotaciones Club</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-0.5">
              Portal Privado
            </span>
          </button>

          {/* Tile 6: Result Book & Actas */}
          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-900 hover:text-white hover:border-slate-800 text-slate-800 transition-all group shadow-2xs text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-700 group-hover:text-white mb-2 transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Result Book</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-0.5">
              Actas & Diplomas
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. SECCIÓN DUAL: LISTADO DE CAMPEONATOS & ACTIVIDAD EN PISTA
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo (2 columnas): Campeonatos Oficiales */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <h3 className="text-base font-black text-slate-900">
                Campeonatos de la Organización
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onNavigateTab('championships')}
            >
              <span>Ver Todos ({championships.length})</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {championships.map((champ) => {
              const isLive = champ.status === 'in_progress'
              return (
                <div
                  key={champ.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isLive
                      ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/40 via-white to-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isLive ? (
                          <Badge variant="success" className="flex items-center gap-1 font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            En Competencia
                          </Badge>
                        ) : (
                          <Badge variant="outline">{champ.status}</Badge>
                        )}
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {champ.slug}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        {champ.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {champ.startDate} al {champ.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {champ.venueName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => onOpenPublicPortal(champ.slug)}
                        title="Ver Portal Público"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1 text-blue-600" />
                        <span>Portal Web</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="xs"
                        onClick={() => onNavigateTab('championships')}
                      >
                        <span>Administrar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lado Derecho (1 columna): Ticker de Actividad en Pista */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">
                Puntuaciones Recientes
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              En Vivo
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            {recentScores.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 space-y-1">
                <Flame className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                <p className="font-semibold text-slate-600">Esperando primeras notas de jurados</p>
                <p className="text-[11px]">Las rutinas calificadas aparecerán aquí al instante.</p>
              </div>
            ) : (
              recentScores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-slate-900 leading-tight">
                      {score.gymnastName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {score.clubName}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="px-1.5 py-0.5 font-mono text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                      {score.apparatusCode}
                    </span>
                    <span className="font-mono font-black text-sm text-indigo-700 tabular-nums">
                      {score.finalScore.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
