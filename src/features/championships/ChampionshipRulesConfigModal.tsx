import React, { useState } from 'react'
import type { Championship } from '@/core/types/championship'
import type {
  ChampionshipCompetitionRules,
  AllAroundCalculationMode,
  AllAroundTieBreakRule,
  TeamTieBreakRule,
} from '@/core/types/competitionRules'
import {
  PRESET_FIG_GAF,
  PRESET_FIG_GAM,
  PRESET_FORMATIVO_3APP,
  PRESET_ESCOLAR_2APP,
} from '@/core/types/competitionRules'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sliders,
  ShieldCheck,
  Lock,
  Trophy,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react'

interface ChampionshipRulesConfigModalProps {
  championship: Championship
  onClose: () => void
  onSave?: (rules: ChampionshipCompetitionRules) => void
}

const STORAGE_KEY_PREFIX = 'operix_competition_rules_'

export const ChampionshipRulesConfigModal: React.FC<ChampionshipRulesConfigModalProps> = ({
  championship,
  onClose,
  onSave,
}) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${championship.id}`

  // 1. Cargar reglas almacenadas o preset por defecto según disciplina
  const [rules, setRules] = useState<ChampionshipCompetitionRules>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(storageKey)
        if (saved) {
          return JSON.parse(saved) as ChampionshipCompetitionRules
        }
      } catch {
        // Ignorar fallo de parseo
      }
    }
    // Preset por defecto
    const preset = championship.name.toLowerCase().includes('gam') ? PRESET_FIG_GAM : PRESET_FIG_GAF
    return {
      ...preset,
      championshipId: championship.id,
      updatedAt: new Date().toISOString(),
    }
  })

  const [activeTab, setActiveTab] = useState<'allaround' | 'teams' | 'presets'>('allaround')
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Aplicar un preset predefinido
  const handleApplyPreset = (preset: ChampionshipCompetitionRules) => {
    if (rules.isLocked) return
    const updated: ChampionshipCompetitionRules = {
      ...preset,
      championshipId: championship.id,
      updatedAt: new Date().toISOString(),
    }
    setRules(updated)
    setSaveSuccessMsg(`¡Plantilla "${preset.rulesetName}" aplicada exitosamente!`)
    setTimeout(() => setSaveSuccessMsg(null), 3000)
  }

  const handleToggleApparatus = (code: string) => {
    if (rules.isLocked) return
    const current = rules.allAroundRules.enabledApparatuses
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
    setRules({
      ...rules,
      allAroundRules: {
        ...rules.allAroundRules,
        enabledApparatuses: next,
      },
    })
  }

  const handleToggleMandatoryApparatus = (code: string) => {
    if (rules.isLocked) return
    const current = rules.allAroundRules.mandatoryApparatuses
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
    setRules({
      ...rules,
      allAroundRules: {
        ...rules.allAroundRules,
        mandatoryApparatuses: next,
      },
    })
  }

  const handleSave = () => {
    const updated = {
      ...rules,
      championshipId: championship.id,
      updatedAt: new Date().toISOString(),
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(storageKey, JSON.stringify(updated))
    }
    if (onSave) onSave(updated)
    setSaveSuccessMsg('Configuración reglamentaria guardada correctamente.')
    setTimeout(() => {
      setSaveSuccessMsg(null)
      onClose()
    }, 1200)
  }

  const handleToggleLock = () => {
    const nextLocked = !rules.isLocked
    const updated = {
      ...rules,
      isLocked: nextLocked,
      lockedAt: nextLocked ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    }
    setRules(updated)
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(storageKey, JSON.stringify(updated))
    }
    if (onSave) onSave(updated)
  }

  const ALL_GAF_APPS = [
    { code: 'VT', name: 'Salto' },
    { code: 'UB', name: 'Barras Asimétricas' },
    { code: 'BB', name: 'Viga de Equilibrio' },
    { code: 'FX', name: 'Suelo' },
  ]

  const ALL_GAM_APPS = [
    { code: 'FX', name: 'Suelo' },
    { code: 'PH', name: 'Arzones' },
    { code: 'SR', name: 'Anillas' },
    { code: 'VT', name: 'Salto' },
    { code: 'PB', name: 'Paralelas' },
    { code: 'HB', name: 'Barra Fija' },
  ]

  const availableAppList = rules.discipline === 'GAM' ? ALL_GAM_APPS : ALL_GAF_APPS

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs font-sans overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[92vh] flex flex-col border-slate-700 bg-slate-900 text-slate-100 shadow-2xl p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Configuración Reglamentaria de Competición</h3>
                {rules.isLocked ? (
                  <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-600 bg-amber-950/40 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Reglas Congeladas
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px] flex items-center gap-1">
                    <FileCheck className="h-3 w-3" /> Configuración Editable
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {championship.name} • {rules.rulesetName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('allaround')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'allaround'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>All-Around Individual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'teams'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Clasificación por Equipos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Plantillas y Presets</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 p-3 text-xs text-emerald-300 border border-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {rules.isLocked && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-950/60 p-3 text-xs text-amber-300 border border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Este campeonato ha oficializado sus actas y sus reglas de competición se encuentran congeladas para proteger la inmutabilidad histórica.
              </span>
            </div>
          )}

          {/* TAB 1: ALL-AROUND */}
          {activeTab === 'allaround' && (
            <div className="space-y-6">
              {/* Aparatos Habilitados */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  1. Aparatos Habilitados para la Competición
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableAppList.map((app) => {
                    const isEnabled = rules.allAroundRules.enabledApparatuses.includes(app.code)
                    return (
                      <button
                        key={app.code}
                        type="button"
                        disabled={rules.isLocked}
                        onClick={() => handleToggleApparatus(app.code)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isEnabled
                            ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono text-sm block">{app.code}</span>
                        <span className="text-[11px] block text-slate-300 truncate">{app.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Aparatos Obligatorios */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  2. Aparatos de Ejecución Obligatoria
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Gimnastas que no ejecuten estos aparatos no clasificarán al ranking All-Around.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {rules.allAroundRules.enabledApparatuses.map((code) => {
                    const isMandatory = rules.allAroundRules.mandatoryApparatuses.includes(code)
                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={rules.isLocked}
                        onClick={() => handleToggleMandatoryApparatus(code)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isMandatory
                            ? 'border-emerald-500 bg-emerald-950/30 text-white font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono text-xs block">{code}</span>
                        <span className="text-[10px] block text-slate-400">
                          {isMandatory ? '✓ Obligatorio' : 'Opcional / Libre'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Modo de Cálculo y Notas Computables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Modo de Cálculo All-Around
                  </label>
                  <select
                    disabled={rules.isLocked}
                    value={rules.allAroundRules.calculationMode}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        allAroundRules: {
                          ...rules.allAroundRules,
                          calculationMode: e.target.value as AllAroundCalculationMode,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="sum_all_enabled">Suma de todos los aparatos habilitados (FIG Estándar)</option>
                    <option value="best_n">Mejores N notas del atleta</option>
                    <option value="mandatory_plus_best_n">Aparatos obligatorios + Mejores N del resto</option>
                    <option value="sum_completed">Suma simple de lo completado</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Mínimo de Aparatos para Clasificar
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    disabled={rules.isLocked}
                    value={rules.allAroundRules.minApparatusesRequired}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        allAroundRules: {
                          ...rules.allAroundRules,
                          minApparatusesRequired: parseInt(e.target.value, 10) || 1,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Atletas con menos aparatos realizados quedan no clasificados.
                  </p>
                </div>
              </div>

              {/* Regla de Desempate All-Around */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Criterio de Desempate (Tie-Break Cascade)
                </label>
                <select
                  disabled={rules.isLocked}
                  value={rules.allAroundRules.tieBreakRule}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      allAroundRules: {
                        ...rules.allAroundRules,
                        tieBreakRule: e.target.value as AllAroundTieBreakRule,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="fig_olympic">Cascada Olímpica FIG (Suma N-1, N-2, Mejor nota, Suma E, Mejor E)</option>
                  <option value="total_e_score">Mayor Nota Acumulada de Ejecución (E-Score)</option>
                  <option value="highest_single_apparatus">Mayor Nota en un Solo Aparato</option>
                  <option value="shared_ex_aequo">Empate Oficial Compartido (Ex-Aequo sin desempate secundario)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: TEAMS */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Cantidad de Notas por Aparato (Top N)
                  </label>
                  <select
                    disabled={rules.isLocked}
                    value={rules.teamRules.topNScoresPerApparatus}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        teamRules: {
                          ...rules.teamRules,
                          topNScoresPerApparatus: parseInt(e.target.value, 10) || 3,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value={1}>Top 1 (Mejor gimnasta por aparato)</option>
                    <option value={2}>Top 2 (Formato 4-3-2 escolar/promocional)</option>
                    <option value={3}>Top 3 (Formato 5-4-3 oficial FIG)</option>
                    <option value={4}>Top 4 (Competencias masivas por clubes)</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Mínimo de Gimnastas por Club
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    disabled={rules.isLocked}
                    value={rules.teamRules.minGymnastsPerTeam}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        teamRules: {
                          ...rules.teamRules,
                          minGymnastsPerTeam: parseInt(e.target.value, 10) || 1,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Clubes con menos deportistas no constituyen equipo oficial.
                  </p>
                </div>
              </div>

              {/* Tratamiento de Equipos Incompletos */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Permitir Equipos Incompletos</h4>
                  <p className="text-xs text-slate-400">
                    Si se activa, clubes que no alcancen el mínimo o falten notas puntúan con lo que tengan (con nota de observación).
                  </p>
                </div>
                <input
                  type="checkbox"
                  disabled={rules.isLocked}
                  checked={rules.teamRules.allowIncompleteTeams}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      teamRules: {
                        ...rules.teamRules,
                        allowIncompleteTeams: e.target.checked,
                      },
                    })
                  }
                  className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {/* Desempate por Equipos */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Desempate por Equipos
                </label>
                <select
                  disabled={rules.isLocked}
                  value={rules.teamRules.tieBreakRule}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      teamRules: {
                        ...rules.teamRules,
                        tieBreakRule: e.target.value as TeamTieBreakRule,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="fig_team">FIG Oficial: Suma mejores aparatos de equipo y mejor nota de aparato</option>
                  <option value="total_team_e">Mayor Nota Total E (Ejecución del Equipo)</option>
                  <option value="shared_ex_aequo">Trofeo y Posición Compartida Ex-Aequo</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Selecciona una plantilla reglamentaria predeterminada para autocompletar todas las reglas deportivas de esta competición:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={rules.isLocked}
                  onClick={() => handleApplyPreset(PRESET_FIG_GAF)}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950 hover:border-indigo-500 text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">FIG GAF 2025-2028</span>
                    <Badge variant="outline" className="text-[10px]">4 Aparatos</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Reglamento olímpico oficial: Salto, Asimétricas, Viga, Suelo. Top 3 por aparato para equipos.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={rules.isLocked}
                  onClick={() => handleApplyPreset(PRESET_FIG_GAM)}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950 hover:border-indigo-500 text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">FIG GAM 2025-2028</span>
                    <Badge variant="outline" className="text-[10px]">6 Aparatos</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Reglamento olímpico masculino: Suelo, Arzones, Anillas, Salto, Paralelas, Barra Fija.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={rules.isLocked}
                  onClick={() => handleApplyPreset(PRESET_FORMATIVO_3APP)}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950 hover:border-indigo-500 text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">Formativo GAF (3 Aparatos)</span>
                    <Badge variant="outline" className="text-[10px]">Salto, Viga, Suelo</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Niveles formativos federados y copas de escuelas (omite Barras Asimétricas).
                  </p>
                </button>

                <button
                  type="button"
                  disabled={rules.isLocked}
                  onClick={() => handleApplyPreset(PRESET_ESCOLAR_2APP)}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950 hover:border-indigo-500 text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">Escolar / Promocional (2 Aparatos)</span>
                    <Badge variant="outline" className="text-[10px]">Salto y Suelo</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Festivales intercolegiales y torneos masivos: 2 aparatos, Top 2 equipos.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggleLock}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
              rules.isLocked
                ? 'border-amber-600 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{rules.isLocked ? 'Desbloquear Reglamento' : 'Congelar e Inmutabilizar'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={rules.isLocked}
              onClick={handleSave}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors shadow-xs"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
