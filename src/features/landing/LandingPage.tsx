/**
 * OPERIX GYMNASTICS — PÁGINA COMERCIAL & LANDING DE PRODUCTO (FASE 19)
 *
 * Rediseño visual integral de alto impacto inspirado en estándares SaaS modernos (Kluv.cl),
 * con identidad propia, paleta tecnológica de alto contraste, tipografía Inter + JetBrains Mono,
 * mockups HTML/CSS realistas y presentación multidisciplinar (GAM / GAF).
 *
 * Características principales:
 * - Navegación compacta sticky con efecto de vidrio (glassmorphism).
 * - Hero impactante: "Cada campeonato. Cada puntuación. Cada resultado. Bajo control."
 * - Mockup interactivo en vivo del Command Center de Operix.
 * - 3 Pilares de valor, Análisis del problema vs solución y 12 tarjetas de capacidades.
 * - Experiencia multidispositivo (Desktop, Tablet de Juez y Smartphone de Público).
 * - Simulador interactivo de scoring en vivo con descarte de extremos FIG.
 * - Presentación de portal público de evento (Paillaco 2026).
 * - Matriz comparativa vs planillas manuales y software genérico.
 * - 3 Pasos para comenzar y Acordeón interactivo de Preguntas Frecuentes (FAQ).
 * - Integración fluida con AuthForm, FastJudgeTerminal y LiveStandingsBoard.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import React, { useState, useMemo } from 'react'
import { AuthForm } from '@/features/auth/AuthForm'
import { FastJudgeTerminal } from '@/features/scoring/FastJudgeTerminal'
import { LiveStandingsBoard } from '@/features/standings/LiveStandingsBoard'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Award,
  Flame,
  KeyRound,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Radio,
  Calculator,
  Sparkles,
  Scale,
  Laptop,
  Tablet,
  Smartphone,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Users,
  Check,
  X,
  Sliders,
  ExternalLink,
  Lock,
  Menu,
} from 'lucide-react'

export interface LandingPageProps {
  initialMode?: 'landing' | 'login' | 'fast_judge' | 'live_standings'
  onOpenPublicPortal?: (slug?: string) => void
  onOpenClubRotations?: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({
  initialMode = 'landing',
  onOpenPublicPortal,
  onOpenClubRotations,
}) => {
  const [activeView, setActiveView] = useState<'landing' | 'login' | 'fast_judge' | 'live_standings'>(initialMode)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [deviceTab, setDeviceTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Simulador interactivo de puntuación FIG
  const [simDScore, setSimDScore] = useState<number>(4.8)
  const [simE1, setSimE1] = useState<number>(8.6)
  const [simE2, setSimE2] = useState<number>(8.4)
  const [simE3, setSimE3] = useState<number>(8.9) // Máximo (descartado)
  const [simE4, setSimE4] = useState<number>(8.2) // Mínimo (descartado)
  const [simND, setSimND] = useState<number>(0.0)

  // Cálculo de la nota simulada
  const simResult = useMemo(() => {
    const scores = [simE1, simE2, simE3, simE4]
    const sorted = [...scores].sort((a, b) => a - b)
    const minDiscarded = sorted[0]
    const maxDiscarded = sorted[sorted.length - 1]
    const middleScores = sorted.slice(1, sorted.length - 1)
    const avgE = middleScores.reduce((sum, n) => sum + n, 0) / middleScores.length
    const finalScore = simDScore + avgE - simND

    return {
      scores,
      minDiscarded,
      maxDiscarded,
      middleScores,
      avgE: Number(avgE.toFixed(3)),
      finalScore: Number(finalScore.toFixed(3)),
    }
  }, [simDScore, simE1, simE2, simE3, simE4, simND])

  // Acordeón FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  // Si se selecciona una vista interactiva de acción (Login, Juez con PIN, Resultados en Vivo)
  if (activeView !== 'landing') {
    return (
      <div className="space-y-6 min-h-screen py-4">
        {/* Barra de retorno rápido */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('landing')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors shadow-2xs"
            >
              ← Volver al Portal Comercial
            </button>
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Módulo Activo:</span>
              <Badge variant="default" className="text-[10px] font-bold bg-blue-600 text-white">
                {activeView === 'login' && 'Ingreso de Organizadores & Delegados'}
                {activeView === 'fast_judge' && 'Terminal Rápida de Juez en Pista'}
                {activeView === 'live_standings' && 'Tablero en Vivo de Resultados'}
              </Badge>
            </div>
          </div>

          <div className="inline-flex rounded-xl border border-slate-700 bg-slate-950 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveView('login')}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                activeView === 'login' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Acceso Cuenta
            </button>
            {onOpenClubRotations && (
              <button
                type="button"
                onClick={onOpenClubRotations}
                className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-xs"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Portal Club</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveView('fast_judge')}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                activeView === 'fast_judge' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Juez PIN
            </button>
            <button
              type="button"
              onClick={() => setActiveView('live_standings')}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                activeView === 'live_standings' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resultados en Vivo
            </button>
          </div>
        </div>

        {activeView === 'login' && <AuthForm />}
        {activeView === 'fast_judge' && <FastJudgeTerminal />}
        {activeView === 'live_standings' && <LiveStandingsBoard />}
      </div>
    )
  }

  return (
    <div className="space-y-24 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          A. NAVEGACIÓN STICKY COMPACTA CON EFECTO DE VIDRIO
         ========================================================================= */}
      <nav className="sticky top-0 z-50 -mx-4 sm:-mx-6 -mt-6 sm:-mt-8 px-4 sm:px-6 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo Operix Gymnastics */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-400/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">Operix Gymnastics</span>
                <span className="hidden sm:inline-block rounded-md bg-blue-950/80 border border-blue-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-400">
                  FIG 2025-2028
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                Plataforma Deportiva · Comercial Hels SpA
              </p>
            </div>
          </div>

          {/* Menú Desktop */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Funcionalidades</a>
            <a href="#devices" className="hover:text-blue-400 transition-colors">Multidispositivo</a>
            <a href="#scoring" className="hover:text-blue-400 transition-colors">Scoring en Vivo</a>
            <a href="#championships" className="hover:text-blue-400 transition-colors">Campeonatos</a>
            <a href="#comparison" className="hover:text-blue-400 transition-colors">Comparación</a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a>
          </div>

          {/* Acciones de Entrada Rápida */}
          <div className="flex items-center gap-2.5">
            {onOpenPublicPortal && (
              <button
                type="button"
                onClick={() => onOpenPublicPortal('artistica-paillaco-2026')}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-xs"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Paillaco 2026</span>
              </button>
            )}

            {onOpenClubRotations && (
              <button
                type="button"
                onClick={onOpenClubRotations}
                className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-xs"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Portal Club</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveView('fast_judge')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-indigo-700/60 bg-indigo-950/40 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 transition-all shadow-xs"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span>Juez PIN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('login')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-900/30 hover:from-blue-500 hover:to-indigo-500 transition-all ring-1 ring-blue-400/30"
            >
              <span>Acceder</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 px-2 pb-2 space-y-2 text-xs font-semibold text-slate-300">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-3 rounded-lg hover:bg-slate-900">Funcionalidades</a>
            <a href="#devices" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-3 rounded-lg hover:bg-slate-900">Multidispositivo</a>
            <a href="#scoring" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-3 rounded-lg hover:bg-slate-900">Scoring en Vivo</a>
            <a href="#championships" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-3 rounded-lg hover:bg-slate-900">Campeonatos</a>
            <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-3 rounded-lg hover:bg-slate-900">Comparación</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-3 rounded-lg hover:bg-slate-900">Preguntas Frecuentes</a>
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setActiveView('fast_judge'); }}
                className="w-full text-left py-2 px-3 rounded-lg bg-indigo-950/60 text-indigo-300 font-bold flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4" />
                <span>Acceso Juez con PIN de Pista</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* =========================================================================
          B. HERO PRINCIPAL & MOCKUP HTML/CSS INTERACTIVO
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-6 py-12 sm:px-10 sm:py-20 shadow-2xl">
        {/* Luces y texturas ambientales de fondo */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Lado Izquierdo: Mensaje Principal y CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-400/30 px-3.5 py-1.5 text-xs font-bold text-blue-300 shadow-md">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>SaaS Oficial de Gimnasia Artística · GAM & GAF</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Cada campeonato.<br />
              Cada puntuación.<br />
              Cada resultado.<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Bajo control.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              Gestiona campeonatos de gimnasia artística desde las inscripciones hasta la premiación,
              con puntuaciones, clasificaciones y resultados en tiempo real bajo normativa FIG oficial.
            </p>

            {/* Badges de Garantía Deportiva */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="rounded-lg bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Código FIG 2025-2028
              </span>
              <span className="rounded-lg bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-slate-300 font-semibold flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                Latencia WebSocket &lt; 150 ms
              </span>
              <span className="rounded-lg bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-slate-300 font-semibold flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                Desempates Deterministas
              </span>
            </div>

            {/* Botones de Acción Comercial */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <a
                href="#features"
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Conocer la Plataforma</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={() => setActiveView('live_standings')}
                className="flex items-center gap-2 rounded-2xl bg-orange-600/90 border border-orange-500/50 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500 transition-all"
              >
                <Flame className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>Ver Resultados en Vivo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('fast_judge')}
                className="flex items-center gap-2 rounded-2xl bg-slate-800/90 border border-slate-700 px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
              >
                <KeyRound className="h-4 w-4 text-indigo-400" />
                <span>Acceso Juez PIN</span>
              </button>
            </div>
          </div>

          {/* Lado Derecho: Representación HTML/CSS Realista del Panel Operix */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-700/80 bg-slate-950/90 shadow-2xl p-4 sm:p-5 space-y-4 ring-1 ring-slate-800">
              {/* Header simulado de ventana */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 pl-2">
                    operix://torneo-activo
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En Competencia
                </span>
              </div>

              {/* Título de evento y contadores */}
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Campeonato Activo Paillaco 2026
                </span>
                <h3 className="text-sm font-black text-white leading-tight mt-0.5">
                  Campeonato Artística 2026 — Polideportivo Central
                </h3>
              </div>

              {/* Tiras métricas del torneo */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                  <div className="font-mono text-xs font-black text-white">153</div>
                  <div className="text-[9px] text-slate-400">Atletas</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                  <div className="font-mono text-xs font-black text-blue-400">16</div>
                  <div className="text-[9px] text-blue-300">GAM</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                  <div className="font-mono text-xs font-black text-fuchsia-400">137</div>
                  <div className="text-[9px] text-fuchsia-300">GAF</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                  <div className="font-mono text-xs font-black text-emerald-400">10</div>
                  <div className="text-[9px] text-emerald-300">Clubes</div>
                </div>
              </div>

              {/* Selector interactivo de aparatos */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="text-[11px] font-bold text-slate-400">Aparato en Pista:</span>
                <div className="flex gap-1 text-[10px] font-mono font-bold">
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-white">VT</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-400">UB</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-400">BB</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-400">FX</span>
                </div>
              </div>

              {/* Mini tabla en vivo */}
              <div className="space-y-1.5 text-xs">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🥇</span>
                    <div>
                      <div className="font-bold text-white text-[11px]">#101 Luke Petingalo</div>
                      <div className="text-[9px] text-amber-300/80">Club Pumahue · GAM AC0</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-amber-300 text-xs">13.850</div>
                    <div className="text-[9px] text-slate-400 font-mono">D: 5.0 · E: 8.85</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🥈</span>
                    <div>
                      <div className="font-bold text-white text-[11px]">#117 Leonor Diedricks</div>
                      <div className="text-[9px] text-slate-400">Club Big Bang · GAF Nivel 1</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-slate-200 text-xs">13.400</div>
                    <div className="text-[9px] text-slate-400 font-mono">D: 4.8 · E: 8.60</div>
                  </div>
                </div>
              </div>

              {/* Toast de actualización WebSocket en vivo */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-2 flex items-center gap-2 text-[11px] text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Nota oficial validada por Juez Árbitro en tiempo real.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          C. PROPUESTA DE VALOR: TRES PILARES
         ========================================================================= */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Pilares de Excelencia
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            La tríada fundamental del software deportivo
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Operix Gymnastics sustituye la fragmentación de planillas manuales por un sistema unificado, robusto y verificable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 space-y-4 hover:border-blue-500/50 transition-all shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-400 border border-blue-500/30">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white">1. Gestión Integral</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Desde la publicación de las bases técnicas y el registro autónomo de delegaciones,
              hasta la asignación de dorsales, rotaciones olímpicas, actas y diplomas de premiación.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 space-y-4 hover:border-indigo-500/50 transition-all shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30">
              <Scale className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white">2. Precisión Deportiva FIG</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Motor de puntuación conforme al Código FIG 2025-2028: descarte automático de extremos en notas E,
              desempates deterministas, regímenes libres y rutinas obligatorias con Top N configurable.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 space-y-4 hover:border-emerald-500/50 transition-all shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/30">
              <Radio className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white">3. Resultados en Vivo</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transmisión instantánea por WebSocket con latencia inferior a 150 ms.
              Proyección simultánea en pantallas gigantes Arena TV y consulta móvil para familias y delegados.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          D. EL PROBLEMA TRADICIONAL VS LA SOLUCIÓN OPERIX
         ========================================================================= */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
            Realidad Operativa
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            ¿Por qué los métodos manuales fallan en pista?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Gestionar un campeonato con planillas dispersas y papeletas de papel genera retrasos críticos y desconfianza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: El Problema */}
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <X className="h-5 w-5" />
              <span>El Método Tradicional (Planillas y Papel)</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>Planillas Excel desincronizadas</strong> entre las mesas de control, los jueces y la secretaría técnica.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>Papeletas físicas con caligrafía ilegible</strong> que obligan a detener la rotación para verificar notas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>Horas de espera tras el último salto</strong> para conocer las clasificaciones finales y armar los podios.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>Errores humanos en cascadas de desempate</strong> y cálculo manual de notas computables de equipo.</span>
              </li>
            </ul>
          </div>

          {/* Columna Derecha: La Solución Operix */}
          <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Check className="h-5 w-5" />
              <span>La Solución Integral con Operix Gymnastics</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Base de datos centralizada</strong> con actualización en tiempo real en todas las pantallas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Terminal táctil express por PIN</strong> para que los jueces envíen la nota en 5 segundos desde su tablet.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Clasificaciones instantáneas</strong> disponibles para el público y jueces en el mismo segundo en que termina el aparato.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Reglamentos FIG y Formativos automatizados</strong> con descarte de extremos y reglas de desempate deterministas.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          E. LA SOLUCIÓN: TARJETAS DE FUNCIONALIDADES
         ========================================================================= */}
      <section id="features" className="space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Módulos Especializados
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Arquitectura pensada para gimnasia artística
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cada herramienta resuelve una necesidad real del jurado, de los clubes y de la organización.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Admin Campeonatos */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Administración de Campeonatos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configuración de recintos, fechas oficiales, convocatorias, bases técnicas descargables en PDF y estados de visibilidad pública o privada.
            </p>
          </div>

          {/* 2. Inscripciones */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Inscripciones & Nóminas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Importador automatizado de planillas Excel, correlatividad de dorsales #Bib y segmentación estricta por categorías deportivas.
            </p>
          </div>

          {/* 3. Delegaciones */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Portal Privado de Delegaciones</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acceso exclusivo para clubes y entrenadores acreditados para consultar sus órdenes de salida y rotaciones sin exponer datos a competidores.
            </p>
          </div>

          {/* 4. Flexibilidad Reglamentaria */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Flexibilidad Reglamentaria (Fase 18)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configura aparatos obligatorios, cantidad de notas computables, Top N de equipo y descarte de aparatos por torneo o categoría.
            </p>
          </div>

          {/* 5. GAM y GAF */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Gestión Integral GAM & GAF</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Soporte nativo para los 4 aparatos de Gimnasia Femenina (VT, UB, BB, FX) y los 6 aparatos de Gimnasia Masculina (FX, PH, SR, VT, PB, HB).
            </p>
          </div>

          {/* 6. Terminal de Jueces */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Terminal Táctil con PIN</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Los jueces ingresan con un código PIN del campeonato. Diseñado ergonómicamente para tablets con teclado numérico gigante y búsqueda por dorsal.
            </p>
          </div>

          {/* 7. Motor de Puntuación */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Motor de Puntuación Determinista</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cálculo de D-Score, Ejecución E con descarte automático de extremos en jurados de 4 o 6 jueces, deducciones neutras y regla de 2 saltos en VT.
            </p>
          </div>

          {/* 8. Clasificaciones en Vivo */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Tablero en Vivo & TV Arena</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              3 modos de visualización: Tabla Estándar para mesa técnica, Podio Olímpico con pedestales y Modo Arena TV de alto contraste para proyectores.
            </p>
          </div>

          {/* 9. Equipos */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Clasificación por Equipos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cómputo Top 2, Top 3 o Top 4 con reglas configurables para clubes completos e incompletos y desempate olímpico por nota más alta.
            </p>
          </div>

          {/* 10. Premiaciones & Podios */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Ceremonias & Medallero</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generador de ceremonias de premiación paso a paso con locución en vivo, revelación progresiva de podios y medallero acumulado por club.
            </p>
          </div>

          {/* 11. Diplomas y Result Book */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Result Book & Diplomas PDF</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Actas técnicas oficiales listas para firmar e imprimir, libros de resultados completos y certificados personalizados por gimnasta.
            </p>
          </div>

          {/* 12. Portal Público */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-blue-500/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ExternalLink className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Portal Público de Evento</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              URL pública propia (/evento/:slug) donde familias y público consultan el programa, los clubes y la nómina completa sin requerir cuenta.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          F. EXPERIENCIA MULTIDISPOSITIVO (3 MOCKUPS HTML/CSS REALISTAS)
         ========================================================================= */}
      <section id="devices" className="space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Ecosistema de Dispositivos
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            La herramienta precisa para cada función
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Interfaces ergonómicamente adaptadas según la distancia de uso y el rol de cada usuario en el gimnasio.
          </p>
        </div>

        {/* Selector de Dispositivo */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900 p-1.5 text-xs">
            <button
              type="button"
              onClick={() => setDeviceTab('desktop')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all ${
                deviceTab === 'desktop' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>1. Administrador (Desktop)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceTab('tablet')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all ${
                deviceTab === 'tablet' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="h-4 w-4" />
              <span>2. Juez en Pista (Tablet)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceTab('mobile')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all ${
                deviceTab === 'mobile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>3. Público (Smartphone)</span>
            </button>
          </div>
        </div>

        {/* Mockup Container */}
        <div className="mx-auto max-w-4xl">
          {/* 1. DESKTOP MOCKUP */}
          {deviceTab === 'desktop' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-400 font-mono pl-2">operix.app/panel-administracion</span>
                </div>
                <Badge variant="outline" className="border-blue-500 text-blue-400 text-[10px]">
                  Director Técnico Org
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Estado del Torneo</span>
                  <p className="font-bold text-white text-sm">Subdivisión 1 en Desarrollo</p>
                  <p className="text-[11px] text-emerald-400">Pista 1 (GAM) y Pista 2 (GAF)</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Jurados Conectados</span>
                  <p className="font-bold text-white text-sm">8 Jueces Activos</p>
                  <p className="text-[11px] text-blue-400">Sincronización WebSocket OK</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Actas Aprobadas</span>
                  <p className="font-bold text-white text-sm">34 Rutinas Oficiales</p>
                  <p className="text-[11px] text-amber-400">Cero apelaciones pendientes</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-300">
                <p className="font-bold text-white mb-2">Resumen de Control de Pista en Vivo:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Salto (VT)</span>
                    <div className="font-black text-white">Ronda 2</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Asimétricas (UB)</span>
                    <div className="font-black text-white">Ronda 2</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Viga (BB)</span>
                    <div className="font-black text-white">Ronda 2</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Suelo (FX)</span>
                    <div className="font-black text-white">Ronda 2</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TABLET MOCKUP */}
          {deviceTab === 'tablet' && (
            <div className="rounded-2xl border-2 border-indigo-600/60 bg-slate-950 shadow-2xl p-5 sm:p-7 space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Tablet className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Terminal Táctil · Juez Salto (VT)</span>
                </div>
                <span className="rounded bg-indigo-950 border border-indigo-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                  PIN: PAILLACO2026
                </span>
              </div>

              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Gimnasta en Pista</span>
                  <div className="text-sm font-black text-white">Dorsal #101 — Luke James Petingalo</div>
                  <div className="text-xs text-slate-400">Club Pumahue · GAM AC0</div>
                </div>
                <span className="rounded-lg bg-blue-600 px-3 py-1 font-mono text-xs font-black text-white">
                  Intento 1 de 2
                </span>
              </div>

              {/* Botonera simulada de jueces táctiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                  <span className="text-[10px] text-slate-400 font-bold">Nota D</span>
                  <div className="text-lg font-mono font-black text-blue-400">5.000</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                  <span className="text-[10px] text-slate-400 font-bold">Juez E1</span>
                  <div className="text-lg font-mono font-black text-white">8.800</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                  <span className="text-[10px] text-slate-400 font-bold">Juez E2</span>
                  <div className="text-lg font-mono font-black text-white">8.900</div>
                </div>
                <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30">
                  <span className="text-[10px] text-emerald-400 font-bold">Nota Final</span>
                  <div className="text-lg font-mono font-black text-emerald-400">13.850</div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Enviar Nota a Mesa de Control</span>
              </button>
            </div>
          )}

          {/* 3. SMARTPHONE MOCKUP */}
          {deviceTab === 'mobile' && (
            <div className="rounded-3xl border-4 border-slate-800 bg-slate-950 shadow-2xl p-4 sm:p-5 space-y-4 max-w-sm mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-slate-400">09:41</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">● 5G EN VIVO</span>
              </div>

              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono text-blue-400 font-bold">operix.app/evento/paillaco</span>
                <h4 className="text-xs font-black text-white">Nómina & Resultados Paillaco 2026</h4>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Buscar por #Bib:</span>
                <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">#117</span>
              </div>

              <div className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black text-fuchsia-300">#117 · GAF</span>
                  <span className="rounded bg-emerald-950 border border-emerald-800 px-1.5 text-[9px] font-bold text-emerald-300">2° Lugar</span>
                </div>
                <div className="text-xs font-bold text-white">Leonor Diedricks</div>
                <div className="text-[11px] text-slate-400">Club Big Bang · Nivel 1</div>
                <div className="font-mono text-xs font-black text-white pt-1 border-t border-slate-800/80 flex justify-between">
                  <span className="text-slate-400">Puntaje Salto:</span>
                  <span className="text-emerald-400">13.400 pts</span>
                </div>
              </div>

              <p className="text-[10px] text-center text-slate-500">
                Público y familias siguen la competencia sin instalar ninguna aplicación.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          G. SCORING EN VIVO & DEMOSTRACIÓN INTERACTIVA
         ========================================================================= */}
      <section id="scoring" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-12 space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-orange-950/80 text-orange-300 border border-orange-800">
            Simulador de Puntuación
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Cómo se calcula una nota FIG en tiempo real
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Prueba cómo interactúan los jueces de Dificultad (D) y Ejecución (E) con descarte automático de notas extremas.
          </p>
        </div>

        {/* Flujo Gráfico en 5 Pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
            <span className="font-mono text-blue-400 font-bold">PASO 1</span>
            <div className="font-bold text-white">Juez en Pista</div>
            <p className="text-[10px] text-slate-400">Ingresa notas en tablet</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
            <span className="font-mono text-indigo-400 font-bold">PASO 2</span>
            <div className="font-bold text-white">Motor FIG</div>
            <p className="text-[10px] text-slate-400">Descarta extremos</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
            <span className="font-mono text-amber-400 font-bold">PASO 3</span>
            <div className="font-bold text-white">Juez Árbitro</div>
            <p className="text-[10px] text-slate-400">Valida y aprueba</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
            <span className="font-mono text-emerald-400 font-bold">PASO 4</span>
            <div className="font-bold text-white">WebSocket</div>
            <p className="text-[10px] text-slate-400">Envío en &lt;150ms</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
            <span className="font-mono text-cyan-400 font-bold">PASO 5</span>
            <div className="font-bold text-white">Público y TV</div>
            <p className="text-[10px] text-slate-400">Podio y ranking al día</p>
          </div>
        </div>

        {/* Widget Interactivo */}
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 space-y-6 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-400" />
                Simulador Interactivo de Panel de 4 Jueces (VT)
              </h3>
              <p className="text-[11px] text-slate-400">
                Ajusta los controles deslizantes para ver cómo se descartan la nota más alta y la más baja.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Nota Final Oficial:</span>
              <div className="font-mono text-2xl font-black text-emerald-400">
                {simResult.finalScore.toFixed(3)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Control D-Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-blue-400">Nota D (Dificultad):</span>
                <span className="font-mono text-white">{simDScore.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="6.5"
                step="0.1"
                value={simDScore}
                onChange={(e) => setSimDScore(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Evaluada por el Jurado D en base a la tabla FIG.</p>
            </div>

            {/* Control Deducciones Neutras */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400">Deducción Neutra (ND):</span>
                <span className="font-mono text-white">{simND.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.1"
                value={simND}
                onChange={(e) => setSimND(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Salida de línea o exceso de tiempo.</p>
            </div>
          </div>

          {/* Panel de 4 Jueces de Ejecución */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Notas de Ejecución (E1 a E4) — Panel de 4 jueces:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* E1 */}
              <div className={`p-3 rounded-xl border text-center ${simE1 === simResult.minDiscarded || simE1 === simResult.maxDiscarded ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800 bg-slate-900'}`}>
                <div className="text-[10px] text-slate-400 font-bold">Juez E1</div>
                <div className="font-mono text-base font-black text-white">{simE1.toFixed(1)}</div>
                <input
                  type="range"
                  min="7.0"
                  max="9.5"
                  step="0.1"
                  value={simE1}
                  onChange={(e) => setSimE1(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 mt-2 cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-500 block mt-1">
                  {simE1 === simResult.minDiscarded ? 'Descartada (Mín)' : simE1 === simResult.maxDiscarded ? 'Descartada (Máx)' : 'Computada'}
                </span>
              </div>

              {/* E2 */}
              <div className={`p-3 rounded-xl border text-center ${simE2 === simResult.minDiscarded || simE2 === simResult.maxDiscarded ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800 bg-slate-900'}`}>
                <div className="text-[10px] text-slate-400 font-bold">Juez E2</div>
                <div className="font-mono text-base font-black text-white">{simE2.toFixed(1)}</div>
                <input
                  type="range"
                  min="7.0"
                  max="9.5"
                  step="0.1"
                  value={simE2}
                  onChange={(e) => setSimE2(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 mt-2 cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-500 block mt-1">
                  {simE2 === simResult.minDiscarded ? 'Descartada (Mín)' : simE2 === simResult.maxDiscarded ? 'Descartada (Máx)' : 'Computada'}
                </span>
              </div>

              {/* E3 */}
              <div className={`p-3 rounded-xl border text-center ${simE3 === simResult.minDiscarded || simE3 === simResult.maxDiscarded ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800 bg-slate-900'}`}>
                <div className="text-[10px] text-slate-400 font-bold">Juez E3</div>
                <div className="font-mono text-base font-black text-white">{simE3.toFixed(1)}</div>
                <input
                  type="range"
                  min="7.0"
                  max="9.5"
                  step="0.1"
                  value={simE3}
                  onChange={(e) => setSimE3(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 mt-2 cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-500 block mt-1">
                  {simE3 === simResult.minDiscarded ? 'Descartada (Mín)' : simE3 === simResult.maxDiscarded ? 'Descartada (Máx)' : 'Computada'}
                </span>
              </div>

              {/* E4 */}
              <div className={`p-3 rounded-xl border text-center ${simE4 === simResult.minDiscarded || simE4 === simResult.maxDiscarded ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800 bg-slate-900'}`}>
                <div className="text-[10px] text-slate-400 font-bold">Juez E4</div>
                <div className="font-mono text-base font-black text-white">{simE4.toFixed(1)}</div>
                <input
                  type="range"
                  min="7.0"
                  max="9.5"
                  step="0.1"
                  value={simE4}
                  onChange={(e) => setSimE4(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 mt-2 cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-500 block mt-1">
                  {simE4 === simResult.minDiscarded ? 'Descartada (Mín)' : simE4 === simResult.maxDiscarded ? 'Descartada (Máx)' : 'Computada'}
                </span>
              </div>
            </div>
          </div>

          {/* Fórmula desglosada */}
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-300">
            <span>Fórmula: Nota Final = D ({simDScore.toFixed(3)}) + Promedio E ({simResult.avgE.toFixed(3)}) - ND ({simND.toFixed(3)})</span>
            <span className="font-black text-emerald-400 text-sm mt-1 sm:mt-0">= {simResult.finalScore.toFixed(3)} pts</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          H. CAMPEONATOS: PRESENTACIÓN DE PORTAL PÚBLICO
         ========================================================================= */}
      <section id="championships" className="space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Experiencia de Evento
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Un portal web oficial para cada campeonato
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cada torneo publicado dispone de su propia página con bases técnicas, clubes, nóminas de deportistas y medallero.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Evento Demostrativo en Vivo
                </span>
                <span className="text-xs font-mono text-slate-400">/evento/artistica-paillaco-2026</span>
              </div>
              <h3 className="text-xl font-black text-white">Campeonato Artística 2026 — Paillaco</h3>
              <p className="text-xs text-slate-400">Polideportivo Municipal de Paillaco · Los Ríos, Chile</p>
            </div>

            {onOpenPublicPortal && (
              <button
                type="button"
                onClick={() => onOpenPublicPortal('artistica-paillaco-2026')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all self-start sm:self-auto"
              >
                <span>Visitar Portal Público Oficial</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Gimnastas Acreditados</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">153</span>
              <span className="text-[10px] text-slate-500">16 GAM · 137 GAF</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Clubes Representados</span>
              <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">10</span>
              <span className="text-[10px] text-slate-500">Delegaciones oficiales</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Categorías en Pista</span>
              <span className="text-2xl font-black font-mono text-blue-400 mt-1 block">9</span>
              <span className="text-[10px] text-slate-500">Formativo hasta Libre</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Puntuación en Vivo</span>
              <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">WebSocket</span>
              <span className="text-[10px] text-slate-500">Actualización en directo</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          I. IMPACTO Y VENTAJAS VERIFICABLES
         ========================================================================= */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Beneficios Deportivos
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Impacto medible en la operación del gimnasio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Optimizaciones comprobadas durante la ejecución de campeonatos reales.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
            <div className="font-mono text-3xl font-black text-blue-400">0 min</div>
            <h3 className="text-sm font-bold text-white">Espera en Clasificaciones</h3>
            <p className="text-xs text-slate-400">
              El podio se computa en el mismo segundo en que el último juez confirma su nota.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
            <div className="font-mono text-3xl font-black text-emerald-400">100%</div>
            <h3 className="text-sm font-bold text-white">Apego a la Normativa FIG</h3>
            <p className="text-xs text-slate-400">
              Fórmulas y cascadas de desempate auditadas matemáticamente para evitar litigios.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
            <div className="font-mono text-3xl font-black text-indigo-400">Cero</div>
            <h3 className="text-sm font-bold text-white">Papelería en Mesas</h3>
            <p className="text-xs text-slate-400">
              Sustituye miles de papeletas por terminales táctiles sincronizadas en pista.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
            <div className="font-mono text-3xl font-black text-amber-400">Inmutable</div>
            <h3 className="text-sm font-bold text-white">Trazabilidad Total</h3>
            <p className="text-xs text-slate-400">
              Cada nota, corrección o apelación registra usuario, hora y justificación técnica.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          J. MATRIZ DE COMPARACIÓN RIGUROSA
         ========================================================================= */}
      <section id="comparison" className="space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Comparación Técnica
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Operix frente a métodos tradicionales
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Diferencias entre una plataforma construida específicamente para gimnasia y soluciones genéricas.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
              <tr>
                <th className="px-5 py-4">Capacidad Deportiva / Técnica</th>
                <th className="px-5 py-4 text-blue-400 font-black">Operix Gymnastics</th>
                <th className="px-5 py-4 text-slate-400">Planillas Excel / Papel</th>
                <th className="px-5 py-4 text-slate-400">Software Genérico de Torneos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/70 text-slate-300">
              <tr>
                <td className="px-5 py-3.5 font-bold text-white">Motor FIG (D + E con descarte de extremos)</td>
                <td className="px-5 py-3.5 text-emerald-400 font-bold flex items-center gap-1.5"><Check className="h-4 w-4" /> Nativo e Instantáneo</td>
                <td className="px-5 py-3.5 text-rose-400 flex items-center gap-1.5"><X className="h-4 w-4" /> Fórmulas manuales frágiles</td>
                <td className="px-5 py-3.5 text-slate-500">Incompatible con gimnasia</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-bold text-white">Terminal de Jueces sin cuenta (PIN de Pista)</td>
                <td className="px-5 py-3.5 text-emerald-400 font-bold flex items-center gap-1.5"><Check className="h-4 w-4" /> Sí (Acceso en 5 segundos)</td>
                <td className="px-5 py-3.5 text-rose-400 flex items-center gap-1.5"><X className="h-4 w-4" /> No (Papeletas de papel)</td>
                <td className="px-5 py-3.5 text-slate-500">Requiere email y contraseñas</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-bold text-white">Modo TV Arena & Podio Olímpico</td>
                <td className="px-5 py-3.5 text-emerald-400 font-bold flex items-center gap-1.5"><Check className="h-4 w-4" /> 3 vistas de alto contraste</td>
                <td className="px-5 py-3.5 text-rose-400 flex items-center gap-1.5"><X className="h-4 w-4" /> No disponible</td>
                <td className="px-5 py-3.5 text-slate-500">Solo tablas genéricas</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-bold text-white">Desempates deterministas reglamentarios</td>
                <td className="px-5 py-3.5 text-emerald-400 font-bold flex items-center gap-1.5"><Check className="h-4 w-4" /> Automatizados FIG</td>
                <td className="px-5 py-3.5 text-rose-400 flex items-center gap-1.5"><X className="h-4 w-4" /> Cálculo manual complejo</td>
                <td className="px-5 py-3.5 text-slate-500">No soportado</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-bold text-white">Privacidad y protección de menores</td>
                <td className="px-5 py-3.5 text-emerald-400 font-bold flex items-center gap-1.5"><Check className="h-4 w-4" /> Estricto (Sin RUT ni teléfonos)</td>
                <td className="px-5 py-3.5 text-rose-400 flex items-center gap-1.5"><X className="h-4 w-4" /> Archivos expuestos</td>
                <td className="px-5 py-3.5 text-slate-500">Sin segmentación deportiva</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          K. CÓMO COMENZAR EN 3 PASOS
         ========================================================================= */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Puesta en Marcha
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Comienza a operar en tres pasos sencillos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Configuración rápida sin fricciones técnicas para clubes y federaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 space-y-3 relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-mono font-black text-white text-base">
              1
            </span>
            <h3 className="text-base font-bold text-white">Crea tu Campeonato</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define el nombre, recinto, fechas y sube las bases técnicas. Selecciona las categorías GAM y GAF participantes.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 space-y-3 relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-mono font-black text-white text-base">
              2
            </span>
            <h3 className="text-base font-bold text-white">Acredita Clubes y Nóminas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Invita a los delegados para que inscriban a sus gimnastas o importa las nóminas en lote desde planillas Excel oficiales.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 space-y-3 relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-mono font-black text-white text-base">
              3
            </span>
            <h3 className="text-base font-bold text-white">Genera PINs y Compite</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Entrega los códigos PIN a los jueces en pista y proyecta el tablero en directo. Todo el campeonato fluye en tiempo real.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          L. PREGUNTAS FRECUENTES (FAQ)
         ========================================================================= */}
      <section id="faq" className="space-y-10 scroll-mt-24 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <Badge variant="default" className="text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
            Resolución de Dudas
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Todo lo que necesitas saber antes de utilizar Operix Gymnastics en tu torneo.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: '¿Operix Gymnastics soporta tanto gimnasia masculina (GAM) como femenina (GAF)?',
              a: 'Sí. Operix cuenta con soporte nativo para los 4 aparatos de Gimnasia Artística Femenina (Salto, Barras Asimétricas, Viga de Equilibrio y Suelo) y los 6 aparatos de Gimnasia Artística Masculina (Suelo, Caballo con Arzones, Anillas, Salto, Barras Paralelas y Barra Fija).'
            },
            {
              q: '¿Cómo funciona el acceso de los jueces sin necesidad de crear contraseñas?',
              a: 'Los jueces de aparato ingresan mediante la Terminal Rápida utilizando el código PIN exclusivo del campeonato (por ejemplo, PAILLACO2026). Al ingresar su nombre y el PIN, acceden de inmediato a la lista de gimnastas y aparatos asignados, sin demoras de registro.'
            },
            {
              q: '¿Cómo se evalúan las categorías con rutina establecida u obligatoria?',
              a: 'Para niveles formativos o reglamentos con nota de partida fija (por ejemplo, Nota D predeterminada en 10.000 pts), el sistema bloquea el ingreso de dificultad y permite que el panel de jueces califique exclusivamente la Ejecución (E1 a E4), calculando la nota final automáticamente.'
            },
            {
              q: '¿Qué sucede si hay empate en el All-Around o en la clasificación por Equipos?',
              a: 'Operix implementa de manera automatizada las cascadas de desempate oficiales FIG (Art. 5.3) y configuraciones flexibles (Fase 18), evaluando la nota más alta de aparato o el total sumado, y marcando empate compartido únicamente cuando se agotan todos los criterios técnicos.'
            },
            {
              q: '¿Se pueden proyectar los resultados en pantallas gigantes del gimnasio?',
              a: 'Sí. Operix incluye el Modo Arena TV y el Podio Olímpico, diseñados con tipografía de alto contraste (JetBrains Mono) y fondos oscuros (`bg-slate-950`) para una legibilidad óptima a más de 25 metros de distancia en proyectores o televisores.'
            },
            {
              q: '¿Los clubes pueden ver las notas o rotaciones de otras delegaciones?',
              a: 'Las rotaciones y órdenes de paso internos están protegidos en el Portal Privado de Delegaciones bajo políticas de Row Level Security (RLS) en PostgreSQL. Cada club autenticado visualiza únicamente la información operativa de sus propios deportistas.'
            },
            {
              q: '¿Están protegidos los datos personales de las gimnastas menores de edad?',
              a: 'Absolutamente. En todos los portales públicos y tableros en vivo se exhiben exclusivamente datos deportivos esenciales (Dorsal #Bib, Nombre, Club y Categoría). Cero exposición de RUT, fecha de nacimiento, teléfonos o correos electrónicos.'
            },
            {
              q: '¿Qué equipamiento técnico se requiere para utilizar la plataforma?',
              a: 'Únicamente dispositivos con navegador web moderno y conexión a internet (Wi-Fi o datos móviles 4G/5G). Los jueces pueden calificar desde cualquier tablet o smartphone, la mesa técnica opera desde computadores portátiles y el público accede desde sus teléfonos personales.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-xs sm:text-sm hover:text-blue-400 transition-colors"
              >
                <span>{item.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="h-4 w-4 text-blue-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          M. CTA FINAL Y FOOTER COMERCIAL
         ========================================================================= */}
      <section className="rounded-3xl border border-blue-900/60 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-14 text-white text-center shadow-2xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-400/30 px-3.5 py-1 text-xs font-bold text-blue-300">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>Lidera la Transformación Digital de la Gimnasia</span>
        </div>

        <h3 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
          Lleva tus campeonatos al estándar tecnológico que tus atletas merecen
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Comienza hoy mismo a organizar tu torneo con puntuación FIG en tiempo real, terminales táctiles de juez y tableros en vivo.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveView('login')}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.02]"
          >
            Ingresar al Sistema
          </button>
          <button
            type="button"
            onClick={() => setActiveView('fast_judge')}
            className="rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Terminal Juez con PIN
          </button>
          {onOpenPublicPortal && (
            <button
              type="button"
              onClick={() => onOpenPublicPortal('artistica-paillaco-2026')}
              className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-6 py-3.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-900/30 transition-colors"
            >
              Ver Portal Paillaco 2026
            </button>
          )}
        </div>
      </section>

      {/* Footer Comercial Institucional */}
      <footer className="border-t border-slate-800/80 pt-10 pb-16 text-center text-xs text-slate-500 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
              OX
            </div>
            <span className="font-black text-white text-sm">Operix Gymnastics</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Software Deportivo Oficial FIG 2025-2028</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#scoring" className="hover:text-white transition-colors">Scoring FIG</a>
            <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>
            Desarrollado y operado por <strong className="text-slate-300 font-bold">Comercial Hels SpA</strong>. Todos los derechos reservados.
          </p>
          <p className="font-mono text-slate-500">
            Conforme a las Regulaciones Técnicas FIG (GAM / GAF) · Versión 2026.19
          </p>
        </div>
      </footer>
    </div>
  )
}
