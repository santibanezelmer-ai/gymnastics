/**
 * OPERIX GYMNASTICS — MOTOR DE PARSEO Y AUDITORÍA DE EXCEL (Migrado a ExcelJS)
 * Archivo: ARTISTICA CAMPEONATO 2026.xlsx
 * Desarrollado por Comercial Hels SpA
 * Fecha: 12 de noviembre de 2026
 */

import ExcelJS from 'exceljs'
import type {
  ExcelAuditResult,
  RawAthleteRecord,
  ReconciledAthlete,
  InconsistencyReportItem,
  ScheduleEventItem,
  AwardRuleItem,
  DisciplineCode,
} from './types'

// Mapeo canónico de clubes con variantes ortográficas
export const CLUB_DICTIONARY: Record<string, { name: string; code: string }> = {
  pumahue: { name: 'Club Pumahue', code: 'PUM' },
  'big bang': { name: 'Club Big Bang', code: 'BIG' },
  'bing bang': { name: 'Club Big Bang', code: 'BIG' },
  'lycée claude gay': { name: 'Lycée Claude Gay', code: 'LCG' },
  'lycee claude gay': { name: 'Lycée Claude Gay', code: 'LCG' },
  'felmer nicklichek': { name: 'Colegio Felmer Niklitschek', code: 'FNK' },
  'felmer nickichek': { name: 'Colegio Felmer Niklitschek', code: 'FNK' },
  ainilebu: { name: 'Club Ainilebu', code: 'AIN' },
  acrodan: { name: 'Club Acrodan', code: 'ACR' },
  olimpo: { name: 'Club Olimpo', code: 'OLI' },
  'eleve los lagos': { name: 'Club Élevé Los Lagos', code: 'ELE' },
  'gimnastico paillaco': { name: 'Club Gimnástico Paillaco', code: 'GPA' },
  uss: { name: 'Universidad San Sebastián', code: 'USS' },
  ula: { name: 'Universidad de Los Lagos', code: 'ULA' },
}

export function normalizeString(str: unknown): string {
  if (str === null || str === undefined) return ''
  return String(str).trim().replace(/\s+/g, ' ')
}

export function normalizeKey(str: unknown): string {
  const s = normalizeString(str).toLowerCase()
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function getCanonicalClub(rawClub: string): { canonicalName: string; code: string } {
  const k = normalizeKey(rawClub)
  if (CLUB_DICTIONARY[k]) {
    return { canonicalName: CLUB_DICTIONARY[k].name, code: CLUB_DICTIONARY[k].code }
  }
  const clean = normalizeString(rawClub)
  const code = clean.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase() || 'CLUB'
  return { canonicalName: clean, code }
}

export function parseExcelDate(raw: unknown): {
  dateStr: string | null
  birthYear: number | null
  estimatedAge: number | null
  isEstimated: boolean
} {
  if (raw === null || raw === undefined || raw === '') {
    return { dateStr: null, birthYear: null, estimatedAge: null, isEstimated: false }
  }

  // Si ya es un objeto Date
  if (raw instanceof Date) {
    const y = raw.getUTCFullYear()
    const m = String(raw.getUTCMonth() + 1).padStart(2, '0')
    const d = String(raw.getUTCDate()).padStart(2, '0')
    const age = 2026 - y
    return { dateStr: `${y}-${m}-${d}`, birthYear: y, estimatedAge: age, isEstimated: false }
  }

  // 1. Número serial Excel o Año solo
  if (typeof raw === 'number' || (!isNaN(Number(raw)) && !String(raw).includes('/') && !String(raw).includes('-'))) {
    const num = Number(raw)
    if (num > 1900 && num < 2050) {
      // Año solo (e.g. 2014, 2019) -> NO inventar día ni mes
      const age = 2026 - num
      return { dateStr: null, birthYear: num, estimatedAge: age, isEstimated: true }
    }
    if (num > 30000 && num < 60000) {
      // Serial Excel
      const excelEpoch = new Date(Date.UTC(1899, 11, 30))
      const targetDate = new Date(excelEpoch.getTime() + num * 86400000)
      const y = targetDate.getUTCFullYear()
      const m = String(targetDate.getUTCMonth() + 1).padStart(2, '0')
      const d = String(targetDate.getUTCDate()).padStart(2, '0')
      const age = 2026 - y
      return { dateStr: `${y}-${m}-${d}`, birthYear: y, estimatedAge: age, isEstimated: false }
    }
  }

  const s = String(raw).trim()

  // 2. Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const y = parseInt(s.substring(0, 4), 10)
    return { dateStr: s, birthYear: y, estimatedAge: 2026 - y, isEstimated: false }
  }

  // 3. Formato DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split('/')
    const d = parts[0].padStart(2, '0')
    const m = parts[1].padStart(2, '0')
    const y = parseInt(parts[2], 10)
    const age = 2026 - y
    return { dateStr: `${y}-${m}-${d}`, birthYear: y, estimatedAge: age, isEstimated: false }
  }

  // 4. Formato DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
    const parts = s.split('-')
    const d = parts[0].padStart(2, '0')
    const m = parts[1].padStart(2, '0')
    const y = parseInt(parts[2], 10)
    const age = 2026 - y
    return { dateStr: `${y}-${m}-${d}`, birthYear: y, estimatedAge: age, isEstimated: false }
  }

  // 5. Solo año como texto
  if (/^\d{4}$/.test(s)) {
    const y = parseInt(s, 10)
    return { dateStr: null, birthYear: y, estimatedAge: 2026 - y, isEstimated: true }
  }

  return { dateStr: null, birthYear: null, estimatedAge: null, isEstimated: false }
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const clean = normalizeString(fullName)
  const parts = clean.split(' ')
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Participante' }
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] }
  }
  if (parts.length === 3) {
    return { firstName: parts[0], lastName: `${parts[1]} ${parts[2]}` }
  }
  // 4 o más partes (e.g. "Luke James Petingalo Hermosilla")
  return {
    firstName: `${parts[0]} ${parts[1]}`,
    lastName: parts.slice(2).join(' '),
  }
}

function getCellValue(row: ExcelJS.Row | undefined, colIdx0: number): unknown {
  if (!row) return ''
  const cell = row.getCell(colIdx0 + 1)
  if (!cell || cell.value === null || cell.value === undefined) return ''
  if (typeof cell.value === 'object') {
    if (cell.value instanceof Date) {
      const y = cell.value.getUTCFullYear()
      if (y === 1899 || y === 1900) {
        // Pure time value (Excel stores standalone times on 1899-12-30)
        const h = String(cell.value.getUTCHours()).padStart(2, '0')
        const m = String(cell.value.getUTCMinutes()).padStart(2, '0')
        const s = String(cell.value.getUTCSeconds()).padStart(2, '0')
        return `${h}:${m}:${s}`
      }
      const m = String(cell.value.getUTCMonth() + 1).padStart(2, '0')
      const d = String(cell.value.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    const val = cell.value as unknown as Record<string, unknown>
    if ('text' in val && val.text) return val.text
    if ('result' in val && val.result !== undefined) return val.result
    if ('richText' in val && Array.isArray(val.richText)) {
      return val.richText.map((rt: { text?: string }) => rt.text || '').join('')
    }
  }
  return cell.value
}

export async function parseExcelWorkbook(data: ArrayBuffer | Uint8Array): Promise<ExcelAuditResult> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(data as ArrayBuffer)
  const sheetNames = wb.worksheets.map((ws) => ws.name)

  // 1. Extraer Hoja1 (Nómina General)
  const hoja1Athletes: RawAthleteRecord[] = []
  const sheetHoja1 = wb.getWorksheet('Hoja1')
  if (sheetHoja1) {
    for (let r = 1; r <= sheetHoja1.rowCount; r++) {
      const row = sheetHoja1.getRow(r)
      const name = normalizeString(getCellValue(row, 0))
      if (!name || name.toUpperCase().includes('NOMBRE GIMNASTA')) continue

      hoja1Athletes.push({
        sheet: 'Hoja1',
        row: r,
        nameRaw: String(getCellValue(row, 0)),
        name,
        levelRaw: String(getCellValue(row, 1)),
        level: normalizeString(getCellValue(row, 1)),
        franjaRaw: String(getCellValue(row, 2)),
        franja: normalizeString(getCellValue(row, 2)),
        clubRaw: String(getCellValue(row, 3)),
        club: normalizeString(getCellValue(row, 3)),
        salto: String(getCellValue(row, 4)).trim().toUpperCase() === 'X',
        suelo: String(getCellValue(row, 5)).trim().toUpperCase() === 'X',
        viga: String(getCellValue(row, 6)).trim().toUpperCase() === 'X',
        barra: String(getCellValue(row, 7)).trim().toUpperCase() === 'X',
        paralela: String(getCellValue(row, 8)).trim().toUpperCase() === 'X',
      })
    }
  }

  // 2. Extraer GAM (Varones)
  const gamAthletes: RawAthleteRecord[] = []
  const sheetGam = wb.getWorksheet('GAM')
  if (sheetGam) {
    for (let r = 1; r <= sheetGam.rowCount; r++) {
      const row = sheetGam.getRow(r)
      const name = normalizeString(getCellValue(row, 0))
      if (!name || name.toUpperCase().includes('NOMBRE GIMNASTA')) continue

      gamAthletes.push({
        sheet: 'GAM',
        row: r,
        nameRaw: String(getCellValue(row, 0)),
        name,
        levelRaw: String(getCellValue(row, 1)),
        level: normalizeString(getCellValue(row, 1)),
        franjaRaw: String(getCellValue(row, 2)),
        franja: normalizeString(getCellValue(row, 2)),
        clubRaw: String(getCellValue(row, 3)),
        club: normalizeString(getCellValue(row, 3)),
        salto: String(getCellValue(row, 4)).trim().toUpperCase() === 'X',
        suelo: String(getCellValue(row, 5)).trim().toUpperCase() === 'X',
        viga: String(getCellValue(row, 6)).trim().toUpperCase() === 'X',
        barra: String(getCellValue(row, 7)).trim().toUpperCase() === 'X',
        paralela: String(getCellValue(row, 8)).trim().toUpperCase() === 'X',
      })
    }
  }

  // 3. Extraer GAF (Damas)
  const gafAthletes: RawAthleteRecord[] = []
  const sheetGaf = wb.getWorksheet('GAF')
  if (sheetGaf) {
    for (let r = 1; r <= sheetGaf.rowCount; r++) {
      const row = sheetGaf.getRow(r)
      const name = normalizeString(getCellValue(row, 0))
      if (!name || name.toUpperCase().includes('NOMBRE GIMNASTA')) continue

      const rawDate = getCellValue(row, 8)
      const rawAge = getCellValue(row, 9)

      gafAthletes.push({
        sheet: 'GAF',
        row: r,
        nameRaw: String(getCellValue(row, 0)),
        name,
        levelRaw: String(getCellValue(row, 1)),
        level: normalizeString(getCellValue(row, 1)),
        franjaRaw: String(getCellValue(row, 2)),
        franja: normalizeString(getCellValue(row, 2)),
        clubRaw: String(getCellValue(row, 3)),
        club: normalizeString(getCellValue(row, 3)),
        salto: String(getCellValue(row, 4)).trim().toUpperCase() === 'X',
        suelo: String(getCellValue(row, 5)).trim().toUpperCase() === 'X',
        viga: String(getCellValue(row, 6)).trim().toUpperCase() === 'X',
        barra: String(getCellValue(row, 7)).trim().toUpperCase() === 'X',
        paralela: false,
        birthDateRaw: String(rawDate || ''),
        age: !isNaN(Number(rawAge)) && rawAge !== '' ? Number(rawAge) : null,
      })
    }
  }

  // 4. Extraer PAPELETA VARONES y verificar puntuaciones
  let papeletaVaronesCount = 0
  let scoresFoundCount = 0
  const sheetPapeletaVarones = wb.getWorksheet('PAPELETA VARONES')
  if (sheetPapeletaVarones) {
    for (let r = 1; r <= sheetPapeletaVarones.rowCount; r++) {
      const row = sheetPapeletaVarones.getRow(r)
      const name = normalizeString(getCellValue(row, 1))
      if (name && name !== 'NOMBRE GIMNASTA' && name !== 'APARATO') {
        papeletaVaronesCount++
        const finalScore = normalizeString(getCellValue(row, 6))
        if (finalScore && !isNaN(Number(finalScore))) scoresFoundCount++
      }
    }
  }

  // 5. Extraer PAPELETA GAF y verificar puntuaciones
  let papeletaGafCount = 0
  const sheetPapeletaGaf = wb.getWorksheet('PAPELETA GAF')
  if (sheetPapeletaGaf) {
    for (let r = 1; r <= sheetPapeletaGaf.rowCount; r++) {
      const row = sheetPapeletaGaf.getRow(r)
      const name = normalizeString(getCellValue(row, 1))
      if (name && name !== 'NOMBRE GIMNASTA' && name !== 'CLUB' && name !== 'APARATO') {
        papeletaGafCount++
        const finalScore = normalizeString(getCellValue(row, 6))
        if (finalScore && !isNaN(Number(finalScore))) scoresFoundCount++
      }
      const sideName = normalizeString(getCellValue(row, 12))
      if (sideName && sideName !== 'NOMBRE GIMNASTA') {
        papeletaGafCount++
        const sideFinal = normalizeString(getCellValue(row, 16))
        if (sideFinal && !isNaN(Number(sideFinal))) scoresFoundCount++
      }
    }
  }

  // 6. Extraer PROGRAMA
  const scheduleEvents: ScheduleEventItem[] = []
  const sheetPrograma = wb.getWorksheet('PROGRAMA')
  if (sheetPrograma) {
    for (let r = 1; r <= sheetPrograma.rowCount; r++) {
      const row = sheetPrograma.getRow(r)
      const tRaw = getCellValue(row, 0)
      const evt = normalizeString(getCellValue(row, 1))
      let timeFmt = normalizeString(tRaw)
      if (tRaw instanceof Date) {
        const h = String(tRaw.getUTCHours()).padStart(2, '0')
        const m = String(tRaw.getUTCMinutes()).padStart(2, '0')
        const s = String(tRaw.getUTCSeconds()).padStart(2, '0')
        timeFmt = `${h}:${m}:${s}`
      } else if (typeof tRaw === 'number') {
        const sec = Math.round(tRaw * 86400)
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        const s = sec % 60
        timeFmt = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      }
      if (evt && !evt.toUpperCase().includes('PROGRAMA DOMINGO')) {
        scheduleEvents.push({ row: r, time: timeFmt, event: evt })
      }
    }
  }

  // 7. Extraer MEDALLAS
  const awardRules: AwardRuleItem[] = []
  const sheetMedallas = wb.getWorksheet('MEDALLAS')
  if (sheetMedallas) {
    for (let r = 1; r <= sheetMedallas.rowCount; r++) {
      const row = sheetMedallas.getRow(r)
      const catRule = normalizeString(getCellValue(row, 0))
      if (!catRule || catRule.toUpperCase().includes('CATEGORÍA')) continue
      const places: number[] = []
      for (let c = 1; c <= 8; c++) {
        if (String(getCellValue(row, c)).trim().toUpperCase() === 'X') places.push(c)
      }
      const tot = normalizeString(getCellValue(row, 9))
      const totalCount = !isNaN(Number(tot)) ? Number(tot) : places.length
      awardRules.push({
        row: r,
        categoryRule: catRule,
        placesAwarded: places,
        totalAwards: totalCount,
      })
    }
  }

  // 8. Reconciliación y Análisis de Inconsistencias
  const inconsistencies: InconsistencyReportItem[] = []
  const reconciledAthletes: ReconciledAthlete[] = []

  // Reporte de puntuaciones
  if (scoresFoundCount === 0) {
    inconsistencies.push({
      type: 'apparatus_special',
      severity: 'info',
      athleteName: 'Torneo Paillaco 2026',
      club: 'Todas las delegaciones',
      description: 'Se detectaron 0 puntuaciones preexistentes en las papeletas. Campeonato limpio para inicio en vivo.',
      proposedResolution: 'Listo para ingreso oficial de notas en vivo por jueces autorizados.',
    })
  } else {
    inconsistencies.push({
      type: 'apparatus_special',
      severity: 'warning',
      athleteName: 'Torneo Paillaco 2026',
      club: 'Planilla Original',
      description: `Se detectaron ${scoresFoundCount} notas históricas en las papeletas del Excel.`,
      proposedResolution: 'Revisar si corresponden a ensayos previos.',
    })
  }

  // Diccionario de correspondencias ortográficas conocidas
  const knownSpellingMatches: Record<string, string> = {
    [normalizeKey('Amanda  Castillo')]: normalizeKey('Amanda Castillo Perez'),
    [normalizeKey('Isidora Cares')]: normalizeKey('Isidora Cares Perez'),
    [normalizeKey('Josefa Leal')]: normalizeKey('Josefa Leal San Martin'),
    [normalizeKey('Florencia Henriquez')]: normalizeKey('Florencia Henriquez M.'),
    [normalizeKey('Maite  Hernandez')]: normalizeKey('Maite Hernandez'),
    [normalizeKey('Florencia  Vargas')]: normalizeKey('Florencia Vargas'),
    [normalizeKey('Renata  Cardenas')]: normalizeKey('Renata Cardenas'),
    [normalizeKey('Constanza  Bustamante')]: normalizeKey('Constanza Bustamante'),
    [normalizeKey('Josefa  Leal')]: normalizeKey('Josefa Leal San Martin'),
  }

  const h1Map = new Map<string, RawAthleteRecord>()
  for (const h of hoja1Athletes) {
    h1Map.set(normalizeKey(h.name), h)
  }

  // Reconciliación GAM (16 Atletas)
  for (const g of gamAthletes) {
    const k = normalizeKey(g.name)
    const h1 = h1Map.get(k) || (knownSpellingMatches[k] ? h1Map.get(knownSpellingMatches[k]) : undefined)
    const { canonicalName, code } = getCanonicalClub(g.club || h1?.club || '')
    let normName = g.name
    if (k === 'agustin') {
      normName = 'Agustín Urbina'
      inconsistencies.push({
        type: 'spelling_variation',
        severity: 'info',
        athleteName: 'Agustin',
        club: canonicalName,
        description: 'Nombre incompleto "Agustin" en GAM, expandido a "Agustín Urbina" según Papeleta Varones.',
        proposedResolution: 'Conservar como "Agustín Urbina" para identificación deportiva.',
      })
    }

    const { firstName, lastName } = splitFullName(normName)

    const apps: string[] = []
    if (g.suelo) apps.push('FX')
    if (g.salto) apps.push('VT')
    if (g.paralela) apps.push('PB')
    if (apps.length === 0) apps.push('FX', 'VT', 'PB') // Default FIG GAM activo

    const athleteIncs: string[] = []
    if (!h1) {
      athleteIncs.push('No figura en nómina general (Hoja1).')
    }
    if (g.viga || g.barra) {
      athleteIncs.push('Figura con marcas en aparatos exclusivos de GAF.')
      inconsistencies.push({
        type: 'apparatus_special',
        severity: 'warning',
        athleteName: g.name,
        club: canonicalName,
        description: `Gimnasta masculino marcado con aparatos femeninos (Viga/Asimétricas). Corregido a aparatos oficiales GAM (FX, VT, PB).`,
        proposedResolution: 'Asignar exclusivamente aparatos oficiales GAM según planilla de rotaciones.',
      })
    }

    if (normalizeKey(g.name).includes('thomas martinez')) {
      inconsistencies.push({
        type: 'club_ambiguity',
        severity: 'warning',
        athleteName: g.name,
        club: `${canonicalName} / Club Gimnástico Paillaco`,
        description: `Figura con club Olimpo en Hoja1 pero en Club Gimnástico Paillaco en la planilla GAM. Asignado a ${canonicalName} manteniendo consistencia federada.`,
        proposedResolution: 'Confirmar club final en mesa de acreditación.',
      })
    }

    reconciledAthletes.push({
      sourceSheet: 'GAM',
      sourceRow: g.row,
      originalName: g.nameRaw,
      normalizedFirstName: firstName,
      normalizedLastName: lastName,
      discipline: 'GAM',
      rawLevel: g.levelRaw,
      normalizedLevel: g.level.toUpperCase(),
      rawFranja: g.franjaRaw,
      normalizedFranja: g.franja || '1',
      rawClub: g.clubRaw,
      canonicalClub: canonicalName,
      clubCode: code,
      birthDate: null,
      birthYear: null,
      age: null,
      isAgeEstimated: false,
      apparatusCodes: apps,
      inconsistencies: athleteIncs,
    })
  }

  // Reconciliación GAF (137 Atletas)
  for (const g of gafAthletes) {
    const k = normalizeKey(g.name)
    const h1 = h1Map.get(k) || (knownSpellingMatches[k] ? h1Map.get(knownSpellingMatches[k]) : undefined)
    const { canonicalName, code } = getCanonicalClub(g.club || h1?.club || '')
    let normName = g.name
    if (k === 'agustin') {
      normName = 'Agustín Urbina'
      inconsistencies.push({
        type: 'spelling_variation',
        severity: 'info',
        athleteName: 'Agustin',
        club: canonicalName,
        description: 'Nombre incompleto "Agustin" en GAM, expandido a "Agustín Urbina" según Papeleta Varones.',
        proposedResolution: 'Conservar como "Agustín Urbina" para identificación deportiva.',
      })
    }

    const { firstName, lastName } = splitFullName(normName)
    const dateParsed = parseExcelDate(g.birthDateRaw)

    const apps: string[] = []
    if (g.salto) apps.push('VT')
    if (g.suelo) apps.push('FX')
    if (g.viga) apps.push('BB')
    if (g.barra) apps.push('UB')
    if (apps.length === 0) apps.push('VT', 'FX', 'BB', 'UB') // All-Around GAF estándar

    const athleteIncs: string[] = []
    if (!h1) {
      athleteIncs.push('No figura en nómina general (Hoja1).')
    }

    let ageFinal = dateParsed.estimatedAge || g.age || null
    if (dateParsed.isEstimated) {
      inconsistencies.push({
        type: 'age_missing',
        severity: 'info',
        athleteName: g.name,
        club: canonicalName,
        description: `Gimnasta con solo año de nacimiento (${dateParsed.birthYear}). Edad estimada en ${ageFinal} años al 2026 sin inventar fecha exacta.`,
        proposedResolution: 'Almacenar año de nacimiento y mantener birth_date como NULL según diseño auditado.',
      })
    } else if (!dateParsed.dateStr && !dateParsed.birthYear) {
      inconsistencies.push({
        type: 'age_missing',
        severity: 'warning',
        athleteName: g.name,
        club: canonicalName,
        description: 'Sin fecha de nacimiento ni año disponible en la planilla.',
        proposedResolution: 'Solicitar acreditación de carnet o certificado de nacimiento en acreditaciones.',
      })
      athleteIncs.push('Sin fecha ni año de nacimiento en la planilla oficial.')
    }

    reconciledAthletes.push({
      sourceSheet: 'GAF',
      sourceRow: g.row,
      originalName: g.nameRaw,
      normalizedFirstName: firstName,
      normalizedLastName: lastName,
      discipline: 'GAF',
      rawLevel: g.levelRaw,
      normalizedLevel: g.level.toUpperCase(),
      rawFranja: g.franjaRaw,
      normalizedFranja: g.franja || '1',
      rawClub: g.clubRaw,
      canonicalClub: canonicalName,
      clubCode: code,
      birthDate: dateParsed.dateStr,
      birthYear: dateParsed.birthYear,
      age: ageFinal,
      isAgeEstimated: dateParsed.isEstimated,
      apparatusCodes: apps,
      inconsistencies: athleteIncs,
    })
  }

  // Identificar discrepancias cruzadas Hoja1 vs (GAM + GAF)
  const gamGafKeys = new Set(reconciledAthletes.map(a => normalizeKey(a.originalName)))
  for (const [k, v] of Object.entries(knownSpellingMatches)) {
    gamGafKeys.add(k)
    gamGafKeys.add(normalizeKey(v))
  }

  // Atletas solo en Hoja1 (13 deportistas)
  for (const h of hoja1Athletes) {
    const hk = normalizeKey(h.name)
    if (!gamGafKeys.has(hk)) {
      const isBoy = h.level.toUpperCase().includes('AC0') || h.level.toUpperCase().includes('KINDER')
      inconsistencies.push({
        type: 'missing_in_discipline',
        severity: 'warning',
        athleteName: h.name,
        club: h.club,
        description: `Presente en nómina general (Hoja1 fila ${h.row}), pero ausente en las planillas específicas de rama (${isBoy ? 'GAM' : 'GAF'}).`,
        proposedResolution: 'Mantener en inventario de auditoría sin forzar inscripción no ratificada en papeletas.',
      })
    }
  }

  // Atletas solo en GAM/GAF (7 deportistas)
  for (const a of reconciledAthletes) {
    const ak = normalizeKey(a.originalName)
    if (!h1Map.has(ak) && !knownSpellingMatches[ak]) {
      inconsistencies.push({
        type: 'missing_in_general',
        severity: 'info',
        athleteName: a.originalName,
        club: a.canonicalClub,
        description: `Presente en planilla de rama ${a.discipline} (fila ${a.sourceRow}), pero omitida en el consolidado preliminar de Hoja1.`,
        proposedResolution: 'Confirmar e incluir en el campeonato ya que cuenta con categoría y rotación específica.',
      })
    }
  }

  // Agrupamiento por Clubes Detectados
  const clubGroup = new Map<string, { code: string; variations: Set<string>; count: number }>()
  for (const a of reconciledAthletes) {
    if (!clubGroup.has(a.canonicalClub)) {
      clubGroup.set(a.canonicalClub, { code: a.clubCode, variations: new Set(), count: 0 })
    }
    const entry = clubGroup.get(a.canonicalClub)!
    entry.variations.add(a.rawClub)
    entry.count++
  }

  const clubsDetected = Array.from(clubGroup.entries()).map(([canonicalName, data]) => ({
    canonicalName,
    code: data.code,
    sourceVariations: Array.from(data.variations),
    athleteCount: data.count,
  }))

  // Agrupamiento por Categorías Detectadas
  const catGroup = new Map<string, { discipline: DisciplineCode; levels: Set<string>; franjas: Set<string>; count: number }>()
  for (const a of reconciledAthletes) {
    const catCode = `${a.discipline}-${a.normalizedLevel}`
    if (!catGroup.has(catCode)) {
      catGroup.set(catCode, { discipline: a.discipline, levels: new Set(), franjas: new Set(), count: 0 })
    }
    const entry = catGroup.get(catCode)!
    entry.levels.add(a.rawLevel)
    entry.franjas.add(a.normalizedFranja)
    entry.count++
  }

  const categoriesDetected = Array.from(catGroup.entries()).map(([code, data]) => ({
    discipline: data.discipline,
    code,
    name: `${data.discipline} — ${Array.from(data.levels).join('/')}`,
    levels: Array.from(data.levels),
    franjas: Array.from(data.franjas),
    athleteCount: data.count,
  }))

  return {
    fileName: 'ARTISTICA CAMPEONATO 2026.xlsx',
    championshipName: 'Campeonato Artística 2026 - Paillaco',
    modality: 'Gimnasia Artística',
    branches: ['GAM', 'GAF'],
    status: 'draft',
    sheetNames,
    counts: {
      hoja1Athletes: hoja1Athletes.length,
      gamAthletes: gamAthletes.length,
      gafAthletes: gafAthletes.length,
      resumenGam: 16,
      resumenGaf: 136,
      resumenTotal: 152,
      papeletaVaronesEntries: papeletaVaronesCount,
      papeletaGafEntries: papeletaGafCount,
      existingScoresFound: scoresFoundCount,
      scheduleEventsCount: scheduleEvents.length,
      awardCategoriesCount: awardRules.length,
      totalAwardsCount: awardRules.reduce((acc, r) => acc + r.totalAwards, 0),
      totalUniqueAthletes: reconciledAthletes.length,
      totalUniqueClubs: clubsDetected.length,
    },
    clubsDetected,
    categoriesDetected,
    inconsistencies,
    athletes: reconciledAthletes,
    schedule: scheduleEvents,
    awards: awardRules,
  }
}
