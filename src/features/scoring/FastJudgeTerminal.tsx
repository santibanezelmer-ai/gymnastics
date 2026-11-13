import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { calculateFigScore } from './scoringEngine'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  Award,
  Send,
  User,
  Radio,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Hash,
  Delete,
  Smartphone,
  Check,
} from 'lucide-react'

const FAST_JUDGE_STORAGE_KEY = 'operix_fast_judge_session'
const FAST_JUDGE_SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 horas (jornada máxima de competición)

interface FastJudgeSession {
  judgeCode: string
  judgeName: string
  apparatusCode: string
  championshipId: string
  championshipName: string
  loginTimestamp: number
}

interface LoadedGymnastOption {
  id: string
  bib_number?: number
  rotation_group?: string
  gymnast_name: string
  club_name: string
  category_name: string
  scoring_regime: 'free' | 'obligatory'
  default_fixed_d_score?: number
}

interface LoadedApparatus {
  id: string
  code: string
  name: string
}

export const FastJudgeTerminal: React.FC = () => {
  const [session, setSession] = useState<FastJudgeSession | null>(() => {
    // 1. Limpieza defensiva de localStorage histórico
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(FAST_JUDGE_STORAGE_KEY)
    }

    // 2. Recuperación efímera y segura exclusivamente desde sessionStorage
    if (typeof window === 'undefined' || !window.sessionStorage) return null
    try {
      const saved = window.sessionStorage.getItem(FAST_JUDGE_STORAGE_KEY)
      if (!saved) return null
      const parsed = JSON.parse(saved) as FastJudgeSession

      // Validación de expiración de sesión (TTL)
      if (
        !parsed.loginTimestamp ||
        Date.now() - parsed.loginTimestamp > FAST_JUDGE_SESSION_TTL_MS
      ) {
        window.sessionStorage.removeItem(FAST_JUDGE_STORAGE_KEY)
        return null
      }
      return parsed
    } catch {
      window.sessionStorage.removeItem(FAST_JUDGE_STORAGE_KEY)
      return null
    }
  })

  // Fast Login form fields
  const [inputCode, setInputCode] = useState('')
  const [inputName, setInputName] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Loaded Championship Data
  const [gymnasts, setGymnasts] = useState<LoadedGymnastOption[]>([])
  const [apparatuses, setApparatuses] = useState<LoadedApparatus[]>([])
  const [selectedRegId, setSelectedRegId] = useState<string>('')
  const [selectedAppId, setSelectedAppId] = useState<string>('')

  // Scoring Fields
  const [vaultAttempt, setVaultAttempt] = useState<1 | 2>(1)
  const [isObligatory, setIsObligatory] = useState<boolean>(false)
  const [fixedD, setFixedD] = useState<string>('10.0')
  const [dScore, setDScore] = useState<string>('4.8')
  const [e1, setE1] = useState<string>('8.5')
  const [e2, setE2] = useState<string>('8.6')
  const [e3, setE3] = useState<string>('8.4')
  const [e4, setE4] = useState<string>('8.5')
  const [neutralDeduction, setNeutralDeduction] = useState<string>('0.0')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showScoreConfirm, setShowScoreConfirm] = useState<boolean>(false)

  // Búsqueda Rápida por Dorsal (Bib) y Atajos Táctiles
  const [bibSearch, setBibSearch] = useState<string>('')
  const [searchFeedback, setSearchFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)
  const [duplicateMatches, setDuplicateMatches] = useState<LoadedGymnastOption[]>([])
  const [showTouchpad, setShowTouchpad] = useState<boolean>(false)

  // Load championship data using judge_code
  const loadChampionshipData = async (code: string) => {
    setIsVerifying(true)
    setLoginError(null)

    try {
      const { data, error } = await supabase.rpc('get_championship_by_code', {
        p_code: code.trim(),
      })

      if (error) throw error
      if (!data || !data.championship) {
        throw new Error('Código de juez o campeonato no válido o no encontrado.')
      }

      const champ = data.championship
      const loadedGyms = (data.registrations || []) as unknown as LoadedGymnastOption[]
      const loadedApps = (data.apparatuses || []) as unknown as LoadedApparatus[]

      setGymnasts(loadedGyms)
      setApparatuses(loadedApps)

      if (loadedGyms.length > 0) {
        setSelectedRegId(loadedGyms[0].id)
        setIsObligatory(loadedGyms[0].scoring_regime === 'obligatory')
        setFixedD(loadedGyms[0].default_fixed_d_score?.toString() || '10.0')
      }

      if (loadedApps.length > 0) {
        setSelectedAppId(loadedApps[0].id)
      }

      return champ
    } catch (err: unknown) {
      const errMsg = (err as Error).message || ''
      const safeErrorMsg =
        errMsg.includes('violat') || errMsg.includes('Token') || errMsg.includes('no encontrado')
          ? 'Código o token de juez no válido o expirado.'
          : errMsg
      setLoginError(safeErrorMsg)
      return null
    } finally {
      setIsVerifying(false)
    }
  }

  // Restore session on mount con verificación de vigencia en backend
  useEffect(() => {
    let isMounted = true
    if (session) {
      loadChampionshipData(session.judgeCode).then((champ) => {
        if (!champ && isMounted) {
          // Token revocado, expirado en backend o inválido: limpieza inmediata
          setSession(null)
          sessionStorage.removeItem(FAST_JUDGE_STORAGE_KEY)
          localStorage.removeItem(FAST_JUDGE_STORAGE_KEY)
          setLoginError('La sesión del jurado ha expirado o las credenciales fueron revocadas.')
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [])

  // Auto-sync scoring regime when selected gymnast changes
  useEffect(() => {
    if (!selectedRegId) return
    const gym = gymnasts.find((g) => g.id === selectedRegId)
    if (gym) {
      const isOblig = gym.scoring_regime === 'obligatory'
      setIsObligatory(isOblig)
      setFixedD(gym.default_fixed_d_score?.toString() || '10.0')
    }
  }, [selectedRegId, gymnasts])

  // Búsqueda inmediata por Dorsal o Nombre
  const handleSearchBibOrName = useCallback(
    (queryStr: string) => {
      const q = queryStr.trim()
      if (!q) {
        setSearchFeedback(null)
        setDuplicateMatches([])
        return
      }

      // 1. Búsqueda por dorsal numérico exacto
      const isNumeric = /^\d+$/.test(q)
      if (isNumeric) {
        const bibNum = parseInt(q, 10)
        const matches = gymnasts.filter((g) => g.bib_number === bibNum)

        if (matches.length === 1) {
          const match = matches[0]
          setSelectedRegId(match.id)
          setDuplicateMatches([])
          setSearchFeedback({
            type: 'success',
            message: `Dorsal #${match.bib_number || bibNum}: ${match.gymnast_name} (${match.club_name}) seleccionada.`,
          })
        } else if (matches.length > 1) {
          setDuplicateMatches(matches)
          setSearchFeedback({
            type: 'warning',
            message: `Se encontraron ${matches.length} deportistas con el dorsal #${bibNum}. Seleccione una:`,
          })
        } else {
          // Dorsal inexistente: NO modificar la atleta seleccionada actualmente
          setDuplicateMatches([])
          setSearchFeedback({
            type: 'error',
            message: `Dorsal #${bibNum} no encontrado en este campeonato.`,
          })
        }
        return
      }

      // 2. Búsqueda por texto (Nombre de gimnasta o Club)
      const lower = q.toLowerCase()
      const matches = gymnasts.filter(
        (g) =>
          g.gymnast_name.toLowerCase().includes(lower) ||
          g.club_name.toLowerCase().includes(lower) ||
          g.category_name.toLowerCase().includes(lower)
      )

      if (matches.length === 1) {
        const match = matches[0]
        setSelectedRegId(match.id)
        setDuplicateMatches([])
        setSearchFeedback({
          type: 'success',
          message: `${match.gymnast_name} (${match.club_name}) seleccionada.`,
        })
      } else if (matches.length > 1) {
        setDuplicateMatches(matches)
        setSearchFeedback({
          type: 'warning',
          message: `${matches.length} gimnastas coinciden con "${q}". Seleccione una:`,
        })
      } else {
        setDuplicateMatches([])
        setSearchFeedback({
          type: 'error',
          message: `No se encontraron gimnastas con "${q}".`,
        })
      }
    },
    [gymnasts]
  )

  // Atajos para Teclado Táctil de Tablet
  const handleTouchpadDigit = (digit: string) => {
    const nextBib = bibSearch + digit
    setBibSearch(nextBib)
    handleSearchBibOrName(nextBib)
  }

  const handleTouchpadBackspace = () => {
    const nextBib = bibSearch.slice(0, -1)
    setBibSearch(nextBib)
    if (nextBib) {
      handleSearchBibOrName(nextBib)
    } else {
      setSearchFeedback(null)
      setDuplicateMatches([])
    }
  }

  const handleTouchpadClear = () => {
    setBibSearch('')
    setSearchFeedback(null)
    setDuplicateMatches([])
  }

  // Navegación en Pista (Anterior / Siguiente Atleta en Orden de Salida)
  const currentGymnastIndex = gymnasts.findIndex((g) => g.id === selectedRegId)
  const canGoPrevious = currentGymnastIndex > 0
  const canGoNext = currentGymnastIndex >= 0 && currentGymnastIndex < gymnasts.length - 1

  const handleGoPreviousGymnast = () => {
    if (!canGoPrevious) return
    const prev = gymnasts[currentGymnastIndex - 1]
    setSelectedRegId(prev.id)
    setBibSearch(prev.bib_number ? prev.bib_number.toString() : '')
    setSearchFeedback({
      type: 'success',
      message: `Atleta anterior: Dorsal #${prev.bib_number || 'S/N'} ${prev.gymnast_name}`,
    })
    setDuplicateMatches([])
  }

  const handleGoNextGymnast = () => {
    if (!canGoNext) return
    const next = gymnasts[currentGymnastIndex + 1]
    setSelectedRegId(next.id)
    setBibSearch(next.bib_number ? next.bib_number.toString() : '')
    setSearchFeedback({
      type: 'success',
      message: `Siguiente atleta: Dorsal #${next.bib_number || 'S/N'} ${next.gymnast_name}`,
    })
    setDuplicateMatches([])
  }

  const handleStartJudging = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim() || !inputName.trim()) {
      setLoginError('Ingresa el código del torneo y tu nombre.')
      return
    }

    const champ = await loadChampionshipData(inputCode.trim())
    if (champ) {
      const newSession: FastJudgeSession = {
        judgeCode: inputCode.trim(),
        judgeName: inputName.trim(),
        apparatusCode: 'VT',
        championshipId: champ.id,
        championshipName: champ.name,
        loginTimestamp: Date.now(),
      }
      setSession(newSession)
      sessionStorage.setItem(FAST_JUDGE_STORAGE_KEY, JSON.stringify(newSession))
      localStorage.removeItem(FAST_JUDGE_STORAGE_KEY) // Asegurar ausencia en localStorage
    }
  }

  const handleLogout = () => {
    setSession(null)
    sessionStorage.removeItem(FAST_JUDGE_STORAGE_KEY)
    localStorage.removeItem(FAST_JUDGE_STORAGE_KEY)
    setInputCode('')
    setInputName('')
    setSubmitSuccess(null)
    setSubmitError(null)
    setLoginError(null)
  }

  // Pure FIG calculation
  let result = null
  let calculationError = null

  try {
    const rawE = [parseFloat(e1), parseFloat(e2), parseFloat(e3), parseFloat(e4)].filter((n) => !isNaN(n))
    if (rawE.length > 0) {
      result = calculateFigScore({
        dScore: isObligatory ? parseFloat(fixedD) || 10.0 : parseFloat(dScore) || 0,
        isObligatory,
        fixedDScore: parseFloat(fixedD) || 10.0,
        eScores: rawE,
        neutralDeductions: parseFloat(neutralDeduction) || 0,
      })
    }
  } catch (err: unknown) {
    calculationError = (err as Error).message
  }

  const handleSubmitScore = async () => {
    if (!result || !session || !selectedRegId || !selectedAppId) {
      setSubmitError('Verifica la selección de gimnasta y aparato.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    const currentApp = apparatuses.find((a) => a.id === selectedAppId)
    const isVaultApp = currentApp?.code === 'VT'

    try {
      const { error } = await supabase.rpc('submit_fast_judge_score', {
        p_championship_id: session.championshipId,
        p_judge_code: session.judgeCode,
        p_registration_id: selectedRegId,
        p_apparatus_id: selectedAppId,
        p_judge_name: session.judgeName,
        p_d_score: result.dScore,
        p_e_scores: result.eScoresRaw,
        p_e_score_avg: result.eScoreAverage,
        p_neutral_deductions: result.neutralDeductions,
        p_final_score: result.finalScore,
        p_attempt_number: isVaultApp ? vaultAttempt : 1,
      })

      if (error) throw error

      setSubmitSuccess(
        isVaultApp
          ? `¡Salto ${vaultAttempt} (${result.finalScore.toFixed(3)}) enviado con éxito!`
          : `¡Puntuación ${result.finalScore.toFixed(3)} enviada con éxito a Mesa de Control!`
      )

      if (isVaultApp && vaultAttempt === 1) {
        setVaultAttempt(2)
      }
    } catch (err: unknown) {
      const rawError = (err as Error).message || ''
      if (
        rawError.includes('Token de juez no válido') ||
        rawError.includes('Token de juez') ||
        rawError.includes('no autorizado')
      ) {
        handleLogout()
        setLoginError('Su sesión ha expirado o las credenciales del jurado fueron revocadas.')
      } else {
        setSubmitError(rawError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // IF NOT LOGGED IN: Fast PIN/Code Login Screen
  if (!session) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-6">
        <Card className="border-indigo-200 bg-white shadow-md p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Acceso Rápido para Jurados</h3>
              <p className="text-xs text-slate-500">
                Ingresa con el código entregado por el club organizador. Sin necesidad de registrar correo ni contraseña.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleStartJudging} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código de Juez del Torneo
              </label>
              <input
                type="text"
                required
                placeholder="Ej. JUEZ-2026"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-bold tracking-wider uppercase text-blue-900 focus:border-indigo-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Demo activo: <strong className="font-mono text-slate-700">JUEZ-2026</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre y Apellido del Juez
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Claudia Muñoz"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full rounded-lg bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4" />
              {isVerifying ? 'Verificando Código...' : 'Entrar a Pista como Juez'}
            </button>
          </form>
        </Card>
      </div>
    )
  }

  // LOGGED IN: Fast Judge Scoring Pad
  const selectedGymnast = gymnasts.find((g) => g.id === selectedRegId)

  return (
    <div className="space-y-6">
      {/* Judge Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/30 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100/80 border border-indigo-200 text-indigo-700 shadow-2xs">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-indigo-700 text-[10px] text-white font-bold">
                Jurado de Pista
              </Badge>
              <span className="text-xs font-mono font-bold text-slate-800">
                {session.championshipName}
              </span>
            </div>
            <h3 className="text-base font-black tracking-tight text-slate-900 mt-0.5">
              Juez Oficial: {session.judgeName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="success" className="text-[10px] flex items-center gap-1 font-bold">
            <Radio className="h-3 w-3 animate-pulse text-emerald-600" /> Transmisión Directa
          </Badge>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión de juez"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{submitSuccess}</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <Card className="border-slate-200 bg-white shadow-sm p-4 sm:p-5">
        {/* Fast Athlete Search & Quick Navigation Bar */}
        <div className="mb-5 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Hash className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-black tracking-tight text-slate-900 uppercase">
                  Búsqueda Rápida por Dorsal o Nombre
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {gymnasts.length} gimnastas oficiales en competencia
                </p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <button
                type="button"
                onClick={handleGoPreviousGymnast}
                disabled={!canGoPrevious}
                title="Atleta anterior en orden de salida"
                className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <span className="px-2 py-1 text-[11px] font-mono font-bold text-slate-600 bg-slate-100 rounded-lg">
                {currentGymnastIndex >= 0 ? `${currentGymnastIndex + 1}/${gymnasts.length}` : '-'}
              </span>

              <button
                type="button"
                onClick={handleGoNextGymnast}
                disabled={!canGoNext}
                title="Siguiente atleta en orden de salida"
                className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowTouchpad(!showTouchpad)}
                className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all shadow-2xs ml-1 ${
                  showTouchpad
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
                title="Teclado numérico táctil para tablets en pista"
              >
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Teclado Tablet</span>
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={bibSearch}
                onChange={(e) => {
                  setBibSearch(e.target.value)
                  handleSearchBibOrName(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearchBibOrName(bibSearch)
                  }
                }}
                placeholder="Ingresa número de dorsal (ej. 104) o apellido/nombre..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none shadow-2xs"
              />
            </div>
            {bibSearch && (
              <button
                type="button"
                onClick={handleTouchpadClear}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Tablet Touchpad Keyboard (Collapsible) */}
          {showTouchpad && (
            <div className="mt-3 p-3 rounded-xl bg-white border border-indigo-200 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-indigo-900">
                  Teclado Numérico de Pista (iPad / Tablet)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Dorsal: #{bibSearch || '—'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleTouchpadDigit(digit)}
                    className="h-11 rounded-lg border border-slate-200 bg-slate-50 text-base font-black font-mono text-slate-800 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all shadow-2xs"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleTouchpadClear}
                  className="h-11 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white active:scale-95 transition-all shadow-2xs"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleTouchpadDigit('0')}
                  className="h-11 rounded-lg border border-slate-200 bg-slate-50 text-base font-black font-mono text-slate-800 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all shadow-2xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleTouchpadBackspace}
                  className="h-11 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shadow-2xs"
                  title="Borrar último dígito"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Search Feedback Notifications */}
          {searchFeedback && (
            <div
              className={`mt-2.5 flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium border ${
                searchFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : searchFeedback.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {searchFeedback.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              )}
              <span>{searchFeedback.message}</span>
            </div>
          )}

          {/* Multiple Matches Resolution Cards */}
          {duplicateMatches.length > 0 && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {duplicateMatches.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => {
                    setSelectedRegId(match.id)
                    setDuplicateMatches([])
                    setSearchFeedback({
                      type: 'success',
                      message: `Gimnasta seleccionada: Dorsal #${match.bib_number || 'S/N'} ${match.gymnast_name}`,
                    })
                  }}
                  className={`flex items-start gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    selectedRegId === match.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-mono text-xs font-black text-indigo-700">
                    {match.bib_number ? `#${match.bib_number}` : '•'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {match.gymnast_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {match.club_name} • {match.category_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Gymnast Spotlight Card & Apparatus Picker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Gymnast Spotlight Card */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-indigo-50/30 to-purple-50/30 p-4 border border-indigo-200/80 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-mono text-base font-black shadow-md border-2 border-indigo-400">
                  {selectedGymnast?.bib_number ? `#${selectedGymnast.bib_number}` : '#—'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
                      Gimnasta en Pista
                    </span>
                    {selectedGymnast?.rotation_group && (
                      <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {selectedGymnast.rotation_group}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 truncate mt-1">
                    {selectedGymnast ? selectedGymnast.gymnast_name : 'Ninguna gimnasta seleccionada'}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 truncate">
                    {selectedGymnast ? selectedGymnast.club_name : 'Selecciona una gimnasta'}
                  </p>
                </div>
              </div>

              {selectedGymnast && (
                <div className="text-right shrink-0">
                  <Badge variant={isObligatory ? 'default' : 'outline'} className="text-[10px] font-bold">
                    {isObligatory ? 'D Fija USAG/Fed' : 'FIG D+E'}
                  </Badge>
                  <p className="text-[11px] font-bold text-indigo-950 mt-1">
                    {selectedGymnast.category_name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isObligatory ? `D = ${fixedD}` : 'D libre en vivo'}
                  </p>
                </div>
              )}
            </div>

            {/* Fallback Manual Dropdown (Collapsible or subtle) */}
            <div className="mt-3 pt-3 border-t border-indigo-100/80">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" /> Selección manual alternativa:
              </label>
              {gymnasts.length === 0 ? (
                <p className="text-xs text-amber-700 font-medium">
                  No hay gimnastas registradas aún en el campeonato.
                </p>
              ) : (
                <select
                  value={selectedRegId}
                  onChange={(e) => {
                    setSelectedRegId(e.target.value)
                    const g = gymnasts.find((item) => item.id === e.target.value)
                    if (g) {
                      setBibSearch(g.bib_number ? g.bib_number.toString() : '')
                      setSearchFeedback({
                        type: 'success',
                        message: `Gimnasta seleccionada: Dorsal #${g.bib_number || 'S/N'} ${g.gymnast_name}`,
                      })
                      setDuplicateMatches([])
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none"
                >
                  {gymnasts.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.bib_number ? `#${g.bib_number} — ` : ''}{g.gymnast_name} • {g.club_name} ({g.category_name})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Apparatus & Vault Attempt Selector */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2">
                Aparato Asignado
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {apparatuses.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedAppId(app.id)}
                    className={`flex-1 min-w-[48px] rounded-xl py-2 text-xs font-black font-mono transition-all shadow-2xs ${
                      selectedAppId === app.id
                        ? 'bg-indigo-700 text-white shadow-xs scale-102'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {app.code}
                  </button>
                ))}
              </div>
            </div>

            {apparatuses.find((a) => a.id === selectedAppId)?.code === 'VT' && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-indigo-100/70 p-2.5 text-xs border border-indigo-200">
                <span className="font-bold text-indigo-950 text-[11px]">Intento de Salto:</span>
                <div className="inline-flex rounded-lg border border-indigo-300 bg-white p-0.5 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setVaultAttempt(1)}
                    className={`rounded-md px-2.5 py-1 font-bold transition-colors ${
                      vaultAttempt === 1 ? 'bg-indigo-700 text-white' : 'text-indigo-900 hover:bg-indigo-50'
                    }`}
                  >
                    Salto 1 (VT1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultAttempt(2)}
                    className={`rounded-md px-2.5 py-1 font-bold transition-colors ${
                      vaultAttempt === 2 ? 'bg-indigo-700 text-white' : 'text-indigo-900 hover:bg-indigo-50'
                    }`}
                  >
                    Salto 2 (VT2)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {calculationError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{calculationError}</span>
          </div>
        )}

          {/* Athlete Hero Header for Tablet Judges */}
          {(() => {
            const activeGymnast = gymnasts.find((g) => g.id === selectedRegId)
            const activeApp = apparatuses.find((a) => a.id === selectedAppId)
            if (!activeGymnast) return null

            return (
              <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white border border-indigo-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black font-mono text-2xl sm:text-3xl shadow-lg ring-2 ring-amber-300/40">
                    {activeGymnast.bib_number ? `#${activeGymnast.bib_number}` : 'S/N'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-indigo-700/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                        {activeGymnast.category_name}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold">
                        {activeGymnast.club_name}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                      {activeGymnast.gymnast_name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="rounded-2xl border border-indigo-700/60 bg-indigo-900/60 px-4 py-2 text-center">
                    <span className="block text-[10px] uppercase font-bold text-indigo-300">Aparato</span>
                    <span className="text-base font-black font-mono text-amber-400">
                      {activeApp?.code || 'VT'}
                    </span>
                  </div>
                  {activeApp?.code === 'VT' && (
                    <div className="rounded-2xl border border-amber-500/60 bg-amber-950/40 px-4 py-2 text-center">
                      <span className="block text-[10px] uppercase font-bold text-amber-300">Intento</span>
                      <span className="text-base font-black font-mono text-amber-300">
                        Salto {vaultAttempt}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Scoring Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-4">
            {!isObligatory ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota D (Dificultad evaluada por Jurado D)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={dScore}
                  onChange={(e) => setDScore(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota D Preestablecida por Reglamento
                </label>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-2.5 text-sm font-mono font-bold text-indigo-950">
                  {fixedD} puntos base (Automática)
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Notas de Ejecución (Jueces E1 a E4)
                </label>
                <span className="text-[10px] text-slate-400">Descarte FIG de mayor y menor</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: e1, setter: setE1, label: 'E1' },
                  { val: e2, setter: setE2, label: 'E2' },
                  { val: e3, setter: setE3, label: 'E3' },
                  { val: e4, setter: setE4, label: 'E4' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <span className="block text-[10px] font-bold text-slate-500 mb-0.5">{item.label}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={item.val}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-center text-sm font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deducciones Neutrales (Línea, Tiempo, etc.)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={neutralDeduction}
                onChange={(e) => setNeutralDeduction(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-mono text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Puntuación Final Resultante
              </span>
              <div className="mt-2 text-3xl font-black font-mono text-indigo-950">
                {result ? result.finalScore.toFixed(3) : '0.000'}
              </div>

              {result && (
                <div className="mt-3 space-y-1 text-[11px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
                  <div className="flex justify-between">
                    <span>Nota D:</span>
                    <strong className="text-slate-800">{result.dScore.toFixed(3)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Promedio E:</span>
                    <strong className="text-emerald-700">+{result.eScoreAverage.toFixed(3)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Deducción ND:</span>
                    <strong className="text-rose-600">-{result.neutralDeductions.toFixed(3)}</strong>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isSubmitting || !result || gymnasts.length === 0}
              onClick={() => setShowScoreConfirm(true)}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 ring-1 ring-indigo-400/30 active:scale-[0.99]"
            >
              <Send className="h-4 w-4" />
              <span>Verificar y Enviar Puntuación</span>
            </button>
          </div>
        </div>
      </Card>

      {/* MODAL DE CONFIRMACIÓN OBLIGATORIO ANTES DE TRANSMITIR OFICIALMENTE */}
      <Modal
        isOpen={showScoreConfirm}
        onClose={() => setShowScoreConfirm(false)}
        size="md"
        title="Confirmación de Puntuación Oficial"
        description="Revisa con atención los datos antes de transmitirlos a la Mesa de Control. Esta acción registra tu firma oficial de juez."
      >
        {result && (() => {
          const activeGymnast = gymnasts.find((g) => g.id === selectedRegId)
          const activeApp = apparatuses.find((a) => a.id === selectedAppId)

          return (
            <div className="space-y-5">
              {/* Atleta Identificado */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-900 p-4 text-white border border-slate-800">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-400 font-mono font-black text-2xl text-slate-950">
                  {activeGymnast?.bib_number ? `#${activeGymnast.bib_number}` : 'S/N'}
                </div>
                <div>
                  <h4 className="text-base font-black text-white">
                    {activeGymnast?.gymnast_name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {activeGymnast?.club_name} · {activeGymnast?.category_name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
                    <span>Aparato: {activeApp?.code || 'VT'}</span>
                    {activeApp?.code === 'VT' && <span>(Salto {vaultAttempt})</span>}
                  </div>
                </div>
              </div>

              {/* Desglose Matemático FIG */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Dificultad (Nota D):</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">
                    {result.dScore.toFixed(3)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Papeletas de Ejecución (E1..E4):</span>
                  <strong className="text-slate-900 dark:text-white">
                    {result.eScoresRaw.map((n) => n.toFixed(1)).join(' | ')}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Promedio de Ejecución (E):</span>
                  <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    +{result.eScoreAverage.toFixed(3)}
                  </strong>
                </div>
                {result.neutralDeductions > 0 && (
                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                    <span>Penalizaciones Neutrales (ND):</span>
                    <strong className="text-sm font-black">
                      -{result.neutralDeductions.toFixed(3)}
                    </strong>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
                  <span className="text-sm font-black uppercase text-slate-900 dark:text-white">
                    PUNTUACIÓN FINAL OFICIAL:
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-amber-400 tabular-nums">
                    {result.finalScore.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Botones de Acción Táctiles Grandes */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => setShowScoreConfirm(false)}
                >
                  Revisar y Corregir
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  isLoading={isSubmitting}
                  onClick={async () => {
                    setShowScoreConfirm(false)
                    await handleSubmitScore()
                  }}
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  <span>Confirmar y Transmitir Oficial</span>
                </Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
