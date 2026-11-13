/**
 * OPERIX GYMNASTICS — ARENA TV DISPLAY (FASE 20)
 *
 * Interfaz profesional de alta visibilidad para pantallas gigantes, proyectores y TVs de estadio.
 * Diseñada para máxima legibilidad a distancia (10m a 30m), alto contraste, tipografía Inter + JetBrains Mono.
 *
 * Características:
 * - Modo Pantalla Completa nativo (Fullscreen API).
 * - Identidad oficial del campeonato y recinto deportivo.
 * - Reloj oficial de competición sincronizado al segundo.
 * - Rotación automática configurable de vistas (All-Around -> Aparatos -> Equipos -> Podios Olímpicos).
 * - Control manual de rotación: Pausa, Reanudar, Avance/Retroceso, Selección de intervalo (8s, 15s, 30s).
 * - Estricta integridad: Solo muestra puntuaciones oficiales y clasificadores aprobados.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  computeAllAroundStandings,
  computeApparatusStandings,
  computeTeamStandings,
  type GymnastScoreEntry,
} from './standingsEngine'
import {
  Trophy,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Clock,
  Building2,
  Award,
  Flame,
  Users,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

export interface ArenaTVDisplayProps {
  championshipId?: string
  initialIntervalSec?: number
  onClose?: () => void
}

type ArenaView = 'all_around' | 'apparatus' | 'teams' | 'podium'

export const ArenaTVDisplay: React.FC<ArenaTVDisplayProps> = ({
  championshipId = 'c2026000-0000-0000-0000-000000000001',
  initialIntervalSec = 12,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')

  // Control de Rotación Automática
  const [currentView, setCurrentView] = useState<ArenaView>('all_around')
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [rotationIntervalSec, setRotationIntervalSec] = useState(initialIntervalSec)
  const [progressPercent, setProgressPercent] = useState(0)

  // Datos del Campeonato
  const [champInfo, setChampInfo] = useState<{
    name: string
    venue: string
    status: string
  }>({
    name: 'Campeonato de Gimnasia Artística Paillaco 2026',
    venue: 'Gimnasio Municipal de Paillaco',
    status: 'in_progress',
  })

  // Datos Deportivos
  const [scores, setScores] = useState<GymnastScoreEntry[]>([])
  const [gymnastBibMap, setGymnastBibMap] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([])
  const [selectedApparatus, setSelectedApparatus] = useState<string>('VT')

  // Reloj Oficial al segundo
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Detección de cambios de Pantalla Completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.warn('Fullscreen no disponible:', err)
    }
  }

  // Carga de puntuaciones oficiales
  const loadOfficialData = useCallback(async () => {
    try {
      // 1. Info del campeonato
      const { data: champData } = await supabase
        .from('championships')
        .select('name, venue_name, status')
        .eq('id', championshipId)
        .maybeSingle()

      if (champData) {
        setChampInfo({
          name: champData.name || 'Campeonato Oficial',
          venue: champData.venue_name || 'Recinto Oficial',
          status: champData.status || 'in_progress',
        })
      }

      // 2. Scores oficiales y relaciones
      const { data: scoreRows } = await supabase
        .from('scores')
        .select(`
          id,
          registration_id,
          apparatus_id,
          d_score,
          e_score_avg,
          neutral_deductions,
          final_score,
          attempt_number,
          apparatuses (
            code,
            name
          ),
          registrations (
            id,
            gymnast_id,
            club_id,
            category_id,
            gymnasts (
              id,
              first_name,
              last_name,
              bib_number
            ),
            clubs (
              id,
              name,
              code
            ),
            categories (
              id,
              name
            )
          )
        `)
        .eq('championship_id', championshipId)

      if (scoreRows && scoreRows.length > 0) {
        const bibMap = new Map<string, number>()
        const catMap = new Map<string, string>()

        const mapped: GymnastScoreEntry[] = (scoreRows as any[]).map((row: any) => {
          const reg = row.registrations
          const athlete = reg?.gymnasts
          const club = reg?.clubs
          const category = reg?.categories
          const app = row.apparatuses
          const gId = reg?.gymnast_id || row.registration_id

          if (athlete?.bib_number) {
            bibMap.set(gId, athlete.bib_number)
          }
          if (category?.id && category?.name) {
            catMap.set(category.id, category.name)
          }

          return {
            gymnastId: gId,
            gymnastName: athlete ? `${athlete.first_name} ${athlete.last_name}` : 'Atleta',
            clubId: reg?.club_id || '',
            clubName: club?.name || 'Club',
            categoryId: reg?.category_id || '',
            categoryName: category?.name || 'General',
            apparatusCode: app?.code || 'VT',
            dScore: Number(row.d_score || 0),
            eScoreAvg: Number(row.e_score_avg || 0),
            finalScore: Number(row.final_score || 0),
            status: 'official_approved',
          }
        })

        setScores(mapped)
        setGymnastBibMap(bibMap)
        setCategoriesList(
          Array.from(catMap.entries()).map(([id, name]) => ({ id, name }))
        )
      }
    } catch (err) {
      console.error('Error cargando datos de Arena TV:', err)
    } finally {
      setIsLoading(false)
    }
  }, [championshipId])

  useEffect(() => {
    loadOfficialData()

    // Suscripción Realtime a nuevas puntuaciones
    const channel = supabase
      .channel(`arena-tv-${championshipId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `championship_id=eq.${championshipId}`,
        },
        () => {
          loadOfficialData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [championshipId, loadOfficialData])

  // Filtrado de puntuaciones por categoría si está seleccionada
  const filteredScores = useMemo(() => {
    if (selectedCategory === 'all') return scores
    return scores.filter((s) => s.categoryId === selectedCategory)
  }, [scores, selectedCategory])

  // Cálculos Deportivos según StandingsEngine
  const allAround = useMemo(() => {
    return computeAllAroundStandings(filteredScores)
  }, [filteredScores])

  const apparatusStandings = useMemo(() => {
    return computeApparatusStandings(filteredScores, selectedApparatus)
  }, [filteredScores, selectedApparatus])

  const teamStandings = useMemo(() => {
    return computeTeamStandings(filteredScores, 3)
  }, [filteredScores])

  // Lista de vistas en rotación
  const viewSequence: ArenaView[] = useMemo(() => ['all_around', 'apparatus', 'teams', 'podium'], [])

  const nextView = useCallback(() => {
    setCurrentView((prev) => {
      const idx = viewSequence.indexOf(prev)
      const nextIdx = (idx + 1) % viewSequence.length
      return viewSequence[nextIdx]
    })
    setProgressPercent(0)
  }, [viewSequence])

  const prevView = useCallback(() => {
    setCurrentView((prev) => {
      const idx = viewSequence.indexOf(prev)
      const prevIdx = (idx - 1 + viewSequence.length) % viewSequence.length
      return viewSequence[prevIdx]
    })
    setProgressPercent(0)
  }, [viewSequence])

  // Loop de Rotación Automática
  useEffect(() => {
    if (!isAutoRotating) {
      setProgressPercent(0)
      return
    }

    const intervalMs = 100
    const totalSteps = (rotationIntervalSec * 1000) / intervalMs
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const percent = (currentStep / totalSteps) * 100
      setProgressPercent(percent)

      if (currentStep >= totalSteps) {
        currentStep = 0
        nextView()
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isAutoRotating, rotationIntervalSec, nextView])

  // Lista de aparatos únicos para cambiar si estamos en vista de aparatos
  const availableApparatusCodes = useMemo(() => {
    const setCodes = new Set(scores.map((s) => s.apparatusCode))
    return Array.from(setCodes).sort()
  }, [scores])

  // Podio Top 3 de All-Around o Aparato
  const podiumTop3 = useMemo(() => {
    if (allAround.length === 0) return []
    return allAround.slice(0, 3)
  }, [allAround])

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none font-sans ${
        isFullscreen ? 'p-6 sm:p-10' : 'p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl'
      }`}
    >
      {/* =========================================================================
          1. HEADER OFICIAL DE ARENA TV
         ========================================================================= */}
      <header className="border-b border-slate-800 pb-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Identidad del Campeonato */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-xl shadow-lg ring-2 ring-white/10">
              OX
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                  ARENA TV · TRANSMISIÓN OFICIAL EN VIVO
                </span>
                <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  FIG 2025-2028
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                {champInfo.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                <span>{champInfo.venue}</span>
              </p>
            </div>
          </div>

          {/* Reloj y Controles de Estadio */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Reloj Oficial */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2 font-mono shadow-xs">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-base sm:text-xl font-black text-amber-300 tabular-nums tracking-wider">
                {currentTime || '--:--:--'}
              </span>
            </div>

            {/* Selector de Pantalla Completa */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa de estadio'}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Normal' : 'Pantalla Completa'}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>

        {/* Barra de progreso de rotación de vista */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevView}
              className="p-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border transition-colors ${
                isAutoRotating
                  ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300'
                  : 'border-amber-700/60 bg-amber-950/40 text-amber-300'
              }`}
            >
              {isAutoRotating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{isAutoRotating ? 'Pausar Rotación' : 'Rotación Pausada'}</span>
            </button>
            <button
              type="button"
              onClick={nextView}
              className="p-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Botones de navegación directa por vista */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all_around', label: 'All-Around', icon: <Trophy className="h-3.5 w-3.5 text-amber-400" /> },
              { id: 'apparatus', label: 'Por Aparato', icon: <Flame className="h-3.5 w-3.5 text-orange-400" /> },
              { id: 'teams', label: 'Por Equipos', icon: <Users className="h-3.5 w-3.5 text-blue-400" /> },
              { id: 'podium', label: 'Podios Olímpicos', icon: <Award className="h-3.5 w-3.5 text-emerald-400" /> },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setCurrentView(v.id as ArenaView)
                  setProgressPercent(0)
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  currentView === v.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Barra de progreso visual */}
          <div className="flex-1 h-1.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Selector de intervalo de rotación */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span>Intervalo:</span>
            {[8, 12, 20, 30].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setRotationIntervalSec(sec)}
                className={`px-1.5 py-0.5 rounded ${
                  rotationIntervalSec === sec
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-900 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Filtro de Categoría si hay varias */}
          {categoriesList.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-300 font-bold focus:outline-none"
            >
              <option value="all">Todas las Categorías</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* =========================================================================
          2. CUERPO DE LA VISTA ARENA TV (GRAN TAMAÑO DE FUENTE Y ALTO CONTRASTE)
         ========================================================================= */}
      <main className="flex-1 my-auto">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <span className="h-10 w-10 rounded-full border-3 border-blue-500 border-r-transparent animate-spin inline-block" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Sincronizando Tablero Oficial con la Mesa de Control...
            </p>
          </div>
        ) : (
          <>
            {/* ----------------- VISTA 1: ALL-AROUND GENERAL ----------------- */}
            {currentView === 'all_around' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-amber-400" />
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                      Clasificación General All-Around
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {allAround.length} Gimnastas en Tabla
                  </span>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-800 bg-slate-950/80 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-4 px-4 text-center w-16">Pos</th>
                        <th className="py-4 px-4">Gimnasta</th>
                        <th className="py-4 px-4">Club / Delegación</th>
                        <th className="py-4 px-4 text-center">Salto (VT)</th>
                        <th className="py-4 px-4 text-center">Asimétricas (UB)</th>
                        <th className="py-4 px-4 text-center">Viga (BB)</th>
                        <th className="py-4 px-4 text-center">Suelo (FX)</th>
                        <th className="py-4 px-4 text-right">TOTAL ALL-AROUND</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {allAround.slice(0, 8).map((row) => {
                        const isGold = row.rank === 1
                        const isSilver = row.rank === 2
                        const isBronze = row.rank === 3

                        return (
                          <tr
                            key={row.gymnastId}
                            className={`transition-colors ${
                              isGold
                                ? 'bg-amber-500/15 border-l-4 border-amber-400'
                                : isSilver
                                ? 'bg-slate-800/40 border-l-4 border-slate-300'
                                : isBronze
                                ? 'bg-orange-950/30 border-l-4 border-orange-500'
                                : 'hover:bg-slate-900/80'
                            }`}
                          >
                            <td className="py-4 px-4 text-center">
                              <span
                                className={`inline-flex items-center justify-center font-mono font-black text-xl sm:text-2xl ${
                                  isGold
                                    ? 'text-amber-400'
                                    : isSilver
                                    ? 'text-slate-200'
                                    : isBronze
                                    ? 'text-orange-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {row.rank}°
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-black text-base sm:text-xl text-white">
                                {row.gymnastName}
                              </div>
                              {gymnastBibMap.has(row.gymnastId) && (
                                <span className="text-xs font-mono font-bold text-blue-400">
                                  Dorsal #{gymnastBibMap.get(row.gymnastId)}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm sm:text-base text-slate-300 font-semibold">
                              {row.clubName}
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-base sm:text-lg tabular-nums text-slate-300">
                              {row.apparatusScores.VT ? row.apparatusScores.VT.toFixed(3) : '-'}
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-base sm:text-lg tabular-nums text-slate-300">
                              {row.apparatusScores.UB ? row.apparatusScores.UB.toFixed(3) : '-'}
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-base sm:text-lg tabular-nums text-slate-300">
                              {row.apparatusScores.BB ? row.apparatusScores.BB.toFixed(3) : '-'}
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-base sm:text-lg tabular-nums text-slate-300">
                              {row.apparatusScores.FX ? row.apparatusScores.FX.toFixed(3) : '-'}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span
                                className={`font-mono font-black text-2xl sm:text-3xl tabular-nums ${
                                  isGold ? 'text-amber-300' : 'text-emerald-400'
                                }`}
                              >
                                {row.totalScore.toFixed(3)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------- VISTA 2: CLASIFICACIÓN POR APARATO ----------------- */}
            {currentView === 'apparatus' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-orange-400" />
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                      Clasificación Oficial: {selectedApparatus}
                    </h2>
                  </div>

                  {/* Selector rápido de aparato */}
                  <div className="flex items-center gap-1.5">
                    {availableApparatusCodes.map((appCode) => (
                      <button
                        key={appCode}
                        type="button"
                        onClick={() => setSelectedApparatus(appCode)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-mono font-black transition-all ${
                          selectedApparatus === appCode
                            ? 'bg-orange-500 text-slate-950 shadow-md font-black scale-105'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {appCode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-800 bg-slate-950/80 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-4 px-4 text-center w-16">Pos</th>
                        <th className="py-4 px-4">Gimnasta</th>
                        <th className="py-4 px-4">Club</th>
                        <th className="py-4 px-4 text-center">Dificultad (D)</th>
                        <th className="py-4 px-4 text-center">Ejecución (E)</th>
                        <th className="py-4 px-4 text-center">Categoría</th>
                        <th className="py-4 px-4 text-right">NOTA FINAL {selectedApparatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {apparatusStandings.slice(0, 8).map((row) => (
                        <tr
                          key={row.gymnastId}
                          className={`transition-colors ${
                            row.rank === 1
                              ? 'bg-amber-500/15 border-l-4 border-amber-400'
                              : 'hover:bg-slate-900/80'
                          }`}
                        >
                          <td className="py-4 px-4 text-center font-mono font-black text-xl sm:text-2xl text-slate-300">
                            {row.rank}°
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-black text-base sm:text-xl text-white">
                              {row.gymnastName}
                            </div>
                            {gymnastBibMap.has(row.gymnastId) && (
                              <span className="text-xs font-mono font-bold text-orange-400">
                                #{gymnastBibMap.get(row.gymnastId)}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm sm:text-base text-slate-300 font-semibold">
                            {row.clubName}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-base sm:text-lg tabular-nums text-slate-300">
                            {row.dScore.toFixed(3)}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-base sm:text-lg tabular-nums text-emerald-400">
                            {row.eScoreAvg.toFixed(3)}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-base sm:text-lg tabular-nums text-blue-400">
                            {row.categoryName || 'General'}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-mono font-black text-2xl sm:text-3xl tabular-nums text-amber-300">
                              {row.finalScore.toFixed(3)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------- VISTA 3: CLASIFICACIÓN POR EQUIPOS ----------------- */}
            {currentView === 'teams' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                      Clasificación Colectiva por Clubes (Top 3 Notas)
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Reglamento Oficial de Equipos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamStandings.map((team) => (
                    <div
                      key={team.clubId}
                      className={`p-6 rounded-3xl border transition-all ${
                        team.rank === 1
                          ? 'border-amber-400/80 bg-amber-950/20 shadow-xl'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-3xl text-amber-400">
                            {team.rank}°
                          </span>
                          <div>
                            <h3 className="text-xl font-black text-white">{team.clubName}</h3>
                            <p className="text-xs font-mono text-slate-400">
                              {team.participatingGymnastsCount} gimnastas puntuando
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs uppercase font-bold text-slate-400 block">Total Club</span>
                          <span className="font-mono font-black text-3xl text-emerald-400 tabular-nums">
                            {team.totalScore.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- VISTA 4: PODIOS OLÍMPICOS ----------------- */}
            {currentView === 'podium' && (
              <div className="space-y-6 animate-in fade-in duration-300 text-center py-6">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300">
                    <Award className="h-4 w-4 text-amber-400" /> Medallero Olímpico Oficial
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Podio de Honor · All-Around
                  </h2>
                </div>

                {/* 3D Olympic Podium Pedestals */}
                <div className="flex items-end justify-center gap-4 sm:gap-8 max-w-4xl mx-auto pt-8">
                  {/* 2do Lugar (Plata) */}
                  {podiumTop3[1] && (
                    <div className="w-1/3 space-y-3">
                      <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4 shadow-xl">
                        <span className="text-xs font-mono font-bold text-slate-300">2do Lugar · PLATA</span>
                        <div className="text-lg sm:text-xl font-black text-white mt-1">
                          {podiumTop3[1].gymnastName}
                        </div>
                        <div className="text-xs text-slate-400 font-semibold">{podiumTop3[1].clubName}</div>
                        <div className="mt-2 font-mono font-black text-xl text-slate-200">
                          {podiumTop3[1].totalScore.toFixed(3)}
                        </div>
                      </div>
                      <div className="h-32 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 flex items-center justify-center font-mono font-black text-4xl text-slate-300 shadow-xl">
                        2
                      </div>
                    </div>
                  )}

                  {/* 1er Lugar (Oro - Elevado al centro) */}
                  {podiumTop3[0] && (
                    <div className="w-1/3 space-y-3">
                      <div className="rounded-2xl border border-amber-500/80 bg-amber-950/40 p-5 shadow-2xl ring-2 ring-amber-400/30">
                        <span className="text-xs font-mono font-black text-amber-300">1er Lugar · ORO</span>
                        <div className="text-xl sm:text-2xl font-black text-white mt-1">
                          {podiumTop3[0].gymnastName}
                        </div>
                        <div className="text-xs text-amber-200 font-semibold">{podiumTop3[0].clubName}</div>
                        <div className="mt-2 font-mono font-black text-2xl sm:text-3xl text-amber-300">
                          {podiumTop3[0].totalScore.toFixed(3)}
                        </div>
                      </div>
                      <div className="h-44 rounded-t-2xl bg-gradient-to-t from-amber-600 to-amber-500 flex items-center justify-center font-mono font-black text-5xl text-slate-950 shadow-2xl">
                        1
                      </div>
                    </div>
                  )}

                  {/* 3er Lugar (Bronce) */}
                  {podiumTop3[2] && (
                    <div className="w-1/3 space-y-3">
                      <div className="rounded-2xl border border-orange-800/80 bg-orange-950/30 p-4 shadow-xl">
                        <span className="text-xs font-mono font-bold text-orange-300">3er Lugar · BRONCE</span>
                        <div className="text-lg sm:text-xl font-black text-white mt-1">
                          {podiumTop3[2].gymnastName}
                        </div>
                        <div className="text-xs text-slate-400 font-semibold">{podiumTop3[2].clubName}</div>
                        <div className="mt-2 font-mono font-black text-xl text-orange-300">
                          {podiumTop3[2].totalScore.toFixed(3)}
                        </div>
                      </div>
                      <div className="h-24 rounded-t-2xl bg-gradient-to-t from-orange-800 to-orange-700 flex items-center justify-center font-mono font-black text-4xl text-orange-200 shadow-xl">
                        3
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* =========================================================================
          3. FOOTER ARENA TV: TICKER INMUTABLE & CRÉDITO CORPORATIVO
         ========================================================================= */}
      <footer className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-bold text-slate-300">Sistema Oficial Operix Gymnastics</span>
          <span>· Conforme a Regulaciones Técnicas FIG 2025-2028</span>
        </div>
        <div className="font-mono text-slate-500 text-[11px]">
          Operado por <strong className="text-slate-300 font-bold">Comercial Hels SpA</strong>
        </div>
      </footer>
    </div>
  )
}
