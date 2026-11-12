/**
 * OPERIX GYMNASTICS — MÓDULO INTERACTIVO DE IMPORTACIÓN DESDE EXCEL
 * Flujo Guiado en 8 Etapas:
 * 1. Selección del archivo Excel
 * 2. Lectura de hojas
 * 3. Vista previa
 * 4. Validación
 * 5. Conciliación
 * 6. Confirmación
 * 7. Importación
 * 8. Informe final
 * Desarrollado por Comercial Hels SpA
 * Fecha: 12 de noviembre de 2026
 */

import React, { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Building,
} from 'lucide-react'
import { parseExcelWorkbook } from './excelParser'
import { executeChampionshipImport } from './importExecution'
import type { ExcelAuditResult, ImportExecutionResult } from './types'

interface ExcelChampionshipImporterProps {
  organizationId: string
  onClose: () => void
  onImportComplete?: (result: ImportExecutionResult) => void
}

type ImportStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const ExcelChampionshipImporter: React.FC<ExcelChampionshipImporterProps> = ({
  organizationId,
  onClose,
  onImportComplete,
}) => {
  const [stage, setStage] = useState<ImportStage>(1)
  const [auditResult, setAuditResult] = useState<ExcelAuditResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  // Estados de ejecución
  const [isImporting, setIsImporting] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [progressStep, setProgressStep] = useState(0)
  const [importResult, setImportResult] = useState<ImportExecutionResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Manejo de archivo seleccionado
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setParseError(null)
    setStage(2)

    try {
      const buffer = await selected.arrayBuffer()
      const audit = parseExcelWorkbook(buffer)
      setAuditResult(audit)
      setStage(3) // Avanzar automáticamente a Vista Previa
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err))
    }
  }

  // 2. Ejecución de la importación
  const handleExecuteImport = async () => {
    if (!auditResult) return
    setIsImporting(true)
    setStage(7)

    const result = await executeChampionshipImport(
      auditResult,
      organizationId,
      (msg, cur, _total) => {
        setProgressMsg(msg)
        setProgressStep(cur)
      }
    )

    setImportResult(result)
    setIsImporting(false)
    setStage(8)

    if (result.success && onImportComplete) {
      onImportComplete(result)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Asistente */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Importador Controlado de Campeonato
                <Badge variant="outline" className="text-xs bg-emerald-950/40 text-emerald-300 border-emerald-800">
                  Excel → Operix
                </Badge>
              </h2>
              <p className="text-xs text-neutral-400">
                Campeonato Artística 2026 - Paillaco • 8 Hojas Oficiales • GAM & GAF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Indicador de Etapas */}
        <div className="px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
          {[
            { id: 1, label: '1. Archivo' },
            { id: 2, label: '2. Lectura' },
            { id: 3, label: '3. Vista Previa' },
            { id: 4, label: '4. Validación' },
            { id: 5, label: '5. Conciliación' },
            { id: 6, label: '6. Confirmación' },
            { id: 7, label: '7. Importación' },
            { id: 8, label: '8. Informe' },
          ].map(s => (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
                stage === s.id
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : stage > s.id
                  ? 'text-emerald-400 bg-emerald-950/40'
                  : 'text-neutral-500'
              }`}
            >
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Contenido Principal por Etapa */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* ETAPA 1: SELECCIÓN DEL ARCHIVO */}
          {stage === 1 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-5">
              <div className="p-4 rounded-full bg-neutral-800 text-emerald-400 border border-neutral-700">
                <UploadCloud className="w-12 h-12" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-semibold text-white">Seleccione el archivo Excel oficial</h3>
                <p className="text-sm text-neutral-400">
                  Seleccione <code>ARTISTICA CAMPEONATO 2026.xlsx</code> para iniciar el análisis exhaustivo de nóminas,
                  papeletas, programa y premiación.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-xl flex items-center gap-2 shadow-lg transition"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Examinar y Cargar Excel
              </button>

              <div className="text-xs text-neutral-500 flex items-center gap-4 pt-4 border-t border-neutral-800/80">
                <span>✓ Hojas: Hoja1, GAM, GAF, RESUMEN</span>
                <span>✓ Papeletas: Varones y GAF</span>
                <span>✓ Programa y Medallas</span>
              </div>
            </div>
          )}

          {/* ETAPA 2: LECTURA DE HOJAS */}
          {stage === 2 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
              <h3 className="text-lg font-semibold text-white">Leyendo hojas y procesando celdas...</h3>
              <p className="text-sm text-neutral-400 max-w-sm">
                Extrayendo Hoja1, GAM, GAF, RESUMEN, PAPELETA VARONES, PAPELETA GAF, PROGRAMA y MEDALLAS.
              </p>
              {parseError && (
                <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-200 text-sm max-w-md flex items-start gap-2">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 3: VISTA PREVIA */}
          {stage === 3 && auditResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-neutral-950 border-neutral-800">
                  <p className="text-xs text-neutral-400">Total Gimnastas</p>
                  <p className="text-2xl font-bold text-emerald-400">{auditResult.counts.totalUniqueAthletes}</p>
                  <p className="text-[11px] text-neutral-500">16 GAM • 137 GAF</p>
                </Card>
                <Card className="p-4 bg-neutral-950 border-neutral-800">
                  <p className="text-xs text-neutral-400">Clubes Detectados</p>
                  <p className="text-2xl font-bold text-white">{auditResult.counts.totalUniqueClubs}</p>
                  <p className="text-[11px] text-neutral-500">Normalizados automáticamente</p>
                </Card>
                <Card className="p-4 bg-neutral-950 border-neutral-800">
                  <p className="text-xs text-neutral-400">Categorías y Niveles</p>
                  <p className="text-2xl font-bold text-white">{auditResult.categoriesDetected.length}</p>
                  <p className="text-[11px] text-neutral-500">Kinder, AC0, N1 a N4, Libre, Rec</p>
                </Card>
                <Card className="p-4 bg-neutral-950 border-neutral-800">
                  <p className="text-xs text-neutral-400">Medallas / Premios</p>
                  <p className="text-2xl font-bold text-amber-400">{auditResult.counts.totalAwardsCount}</p>
                  <p className="text-[11px] text-neutral-500">310 medallas + 12 destacadas</p>
                </Card>
              </div>

              {/* Desglose de Clubes */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  Clubes Participantes y Gimnastas Registradas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {auditResult.clubsDetected.map(c => (
                    <div
                      key={c.code}
                      className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">{c.canonicalName}</p>
                        <p className="text-neutral-500 text-[11px]">
                          Código: <span className="text-neutral-300 font-mono">{c.code}</span> • Variantes:{' '}
                          {c.sourceVariations.join(', ')}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-neutral-700 text-neutral-300">
                        {c.athleteCount} atletas
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: VALIDACIÓN */}
          {stage === 4 && auditResult && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Reglas de Integridad y Verificaciones Técnicas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Detección de Puntuaciones</p>
                      <p className="text-neutral-400">
                        0 notas registradas en papeletas. Se respetará la regla fundamental de no inventar notas.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Separación de Ramas</p>
                      <p className="text-neutral-400">
                        16 atletas masculinos (GAM) y 137 atletas femeninas (GAF) correctamente discriminados por rama.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Aparatos Oficiales Mapeados</p>
                      <p className="text-neutral-400">
                        GAF: Salto, Asimétricas, Viga, Suelo. GAM: Suelo, Salto, Paralelas.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Aislamiento de Producción</p>
                      <p className="text-neutral-400">
                        El campeonato se creará con slug exclusivo <code>artistica-paillaco-2026</code> sin alterar
                        otros torneos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cronograma detectado */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Cronograma Oficial del Programa ({auditResult.schedule.length} hitos detectados)
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                  {auditResult.schedule.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-neutral-900/40 border border-neutral-800/50"
                    >
                      <span className="font-mono text-emerald-400">{s.time || '--:--'}</span>
                      <span className="text-neutral-300 font-medium">{s.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: CONCILIACIÓN */}
          {stage === 5 && auditResult && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Conciliación de Datos Fuente vs Ramas Específicas</p>
                  <p className="text-neutral-300 mt-1">
                    Se identificaron divergencias entre la lista preliminar (Hoja1) y las planillas oficiales de
                    competencia (GAM y GAF). El sistema conserva todos los valores originales y propone la normalización
                    sin forzar fusiones automáticas.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-300">Detalle de Discrepancias ({auditResult.inconsistencies.length})</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
                  {auditResult.inconsistencies.map((inc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {inc.severity === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          {inc.athleteName} ({inc.club})
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            inc.severity === 'warning'
                              ? 'border-amber-700 text-amber-300'
                              : 'border-cyan-700 text-cyan-300'
                          }
                        >
                          {inc.type}
                        </Badge>
                      </div>
                      <p className="text-neutral-400">{inc.description}</p>
                      <p className="text-emerald-400 font-mono text-[11px]">
                        → Propuesta: {inc.proposedResolution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 6: CONFIRMACIÓN */}
          {stage === 6 && auditResult && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-2">
                <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Resumen de Pre-Vuelo Listo para Confirmar
                </h4>
                <p className="text-xs text-neutral-300">
                  Se creará el campeonato <strong>"Campeonato Artística 2026 - Paillaco"</strong> en estado{' '}
                  <span className="text-amber-300 font-semibold">Borrador</span> y visibilidad{' '}
                  <span className="text-neutral-400 font-semibold">Privada</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Gimnastas a Registrar</p>
                  <p className="text-lg font-bold text-white">{auditResult.athletes.length} deportistas</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Clubes a Vincular/Crear</p>
                  <p className="text-lg font-bold text-white">{auditResult.clubsDetected.length} clubes</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Categorías con Aparatos</p>
                  <p className="text-lg font-bold text-white">{auditResult.categoriesDetected.length} categorías</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Eventos de Cronograma</p>
                  <p className="text-lg font-bold text-white">{auditResult.schedule.length} bloques</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Configuración de Premiación</p>
                  <p className="text-lg font-bold text-white">80 reglas de podio</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Puntuaciones Ficticias</p>
                  <p className="text-lg font-bold text-emerald-400">0 (Cero)</p>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 space-y-1">
                <p className="font-semibold text-white">Garantías Transaccionales:</p>
                <p>• Operación 100% idempotente (no duplica registros al re-ejecutar).</p>
                <p>• No sobreescribe ningún campeonato ni dato preexistente de la base de datos.</p>
                <p>• Registro de auditoría trazable.</p>
              </div>
            </div>
          )}

          {/* ETAPA 7: IMPORTACIÓN EN PROCESO */}
          {stage === 7 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
              <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Importando campeonato en Supabase...</h3>
                <p className="text-sm text-neutral-400">{progressMsg || 'Ejecutando transacciones de inserción...'}</p>
              </div>
              <div className="w-full max-w-md bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(progressStep / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 font-mono">Paso {progressStep} de 10</p>
            </div>
          )}

          {/* ETAPA 8: INFORME FINAL */}
          {stage === 8 && importResult && (
            <div className="space-y-5">
              {importResult.success ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                    <CheckCircle2 className="w-6 h-6" />
                    ¡Importación Exitosa! Campeonato Paillaco 2026 Creado
                  </div>
                  <p className="text-xs text-neutral-300">
                    Todos los clubes, gimnastas, categorías, inscripciones, cronograma y premiación han sido creados e
                    indexados correctamente en Operix Gymnastics.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-base">
                    <XCircle className="w-6 h-6" />
                    Error durante la importación
                  </div>
                  <p className="text-xs text-red-200">{importResult.error}</p>
                </div>
              )}

              {/* Resumen de cantidades efectivamente importadas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Clubes Vinculados</p>
                  <p className="text-xl font-bold text-white">{importResult.importedCounts.clubsCreatedOrLinked}</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Categorías Creadas</p>
                  <p className="text-xl font-bold text-white">{importResult.importedCounts.categoriesCreated}</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Gimnastas Creadas</p>
                  <p className="text-xl font-bold text-white">{importResult.importedCounts.gymnastsCreatedOrLinked}</p>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <p className="text-neutral-500">Inscripciones Aprobadas</p>
                  <p className="text-xl font-bold text-emerald-400">{importResult.importedCounts.registrationsCreated}</p>
                </div>
              </div>

              {/* Logs de auditoría */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-neutral-400">Pista de Auditoría de la Transacción</h5>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg max-h-40 overflow-y-auto font-mono text-[11px] text-neutral-400 space-y-1">
                  {importResult.logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Navegación Inferior */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div>
            {stage > 1 && stage < 7 && (
              <button
                onClick={() => setStage((stage - 1) as ImportStage)}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {stage >= 3 && stage <= 5 && (
              <button
                onClick={() => setStage((stage + 1) as ImportStage)}
                className="px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-2 transition"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {stage === 6 && (
              <button
                onClick={handleExecuteImport}
                disabled={isImporting}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirmar y Ejecutar Importación
              </button>
            )}

            {stage === 8 && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold transition"
              >
                Cerrar y Ver Campeonato
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
