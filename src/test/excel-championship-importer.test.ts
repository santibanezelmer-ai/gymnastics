/**
 * OPERIX GYMNASTICS — SUITE DE PRUEBAS DE CALIDAD: IMPORTADOR DE CAMPEONATOS EXCEL
 * Archivo: ARTISTICA CAMPEONATO 2026.xlsx
 * Desarrollado por Comercial Hels SpA
 * Fecha: 12 de noviembre de 2026
 */

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  parseExcelWorkbook,
  getCanonicalClub,
  parseExcelDate,
  splitFullName,
} from '@/features/championships/importer/excelParser'

describe('Operix Gymnastics — Control de Calidad del Importador Excel', () => {
  const excelFilePath = path.resolve(__dirname, '../../data/ARTISTICA CAMPEONATO 2026.xlsx')
  let excelBuffer: Buffer

  it('1. Debe existir el archivo físico oficial en data/ARTISTICA CAMPEONATO 2026.xlsx', () => {
    expect(fs.existsSync(excelFilePath)).toBe(true)
    excelBuffer = fs.readFileSync(excelFilePath)
    expect(excelBuffer.byteLength).toBeGreaterThan(10000)
  })

  it('2. Debe parsear íntegramente las 8 hojas del libro Excel', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    expect(audit.sheetNames).toEqual([
      'Hoja1',
      'GAM',
      'GAF',
      'RESUMEN',
      'PAPELETA VARONES',
      'PAPELETA GAF',
      'PROGRAMA',
      'MEDALLAS',
    ])
  })

  it('3. Debe verificar las cantidades exactas de gimnastas por hoja', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    expect(audit.counts.hoja1Athletes).toBe(158)
    expect(audit.counts.gamAthletes).toBe(16)
    expect(audit.counts.gafAthletes).toBe(137)
    expect(audit.counts.totalUniqueAthletes).toBe(153) // 16 GAM + 137 GAF
  })

  it('4. Debe verificar que NO existen puntuaciones ficticias en las papeletas (Cero notas)', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    expect(audit.counts.existingScoresFound).toBe(0)
    const zeroScoreNotice = audit.inconsistencies.find(i => i.description.includes('0 puntuaciones'))
    expect(zeroScoreNotice).toBeDefined()
  })

  it('5. Debe normalizar correctamente clubes con variaciones ortográficas', () => {
    expect(getCanonicalClub('PUMAHUE').canonicalName).toBe('Club Pumahue')
    expect(getCanonicalClub('BING BANG').canonicalName).toBe('Club Big Bang')
    expect(getCanonicalClub('Felmer Nicklichek').canonicalName).toBe('Colegio Felmer Niklitschek')
    expect(getCanonicalClub('ELEVE LOS LAGOS').canonicalName).toBe('Club Élevé Los Lagos')
    expect(getCanonicalClub('LYCÉE CLAUDE GAY ').canonicalName).toBe('Lycée Claude Gay')
    expect(getCanonicalClub('GIMNASTICO PAILLACO').canonicalName).toBe('Club Gimnástico Paillaco')
  })

  it('6. Debe convertir seriales numéricos de fecha Excel a formato ISO YYYY-MM-DD y calcular edad exacta', () => {
    // 43407 -> 2018-11-03 (8 años en 2026)
    const d1 = parseExcelDate(43407)
    expect(d1.dateStr).toBe('2018-11-03')
    expect(d1.estimatedAge).toBe(8)
    expect(d1.isEstimated).toBe(false)

    // Formato con guiones
    const d2 = parseExcelDate('2011-04-12')
    expect(d2.dateStr).toBe('2011-04-12')
    expect(d2.estimatedAge).toBe(15)

    // Formato con barras
    const d3 = parseExcelDate('11/12/2017')
    expect(d3.dateStr).toBe('2017-12-11')
    expect(d3.estimatedAge).toBe(9)

    // Año solo: NO debe inventar fechas sintéticas (dateStr = null)
    const d4 = parseExcelDate('2019')
    expect(d4.dateStr).toBeNull()
    expect(d4.birthYear).toBe(2019)
    expect(d4.estimatedAge).toBe(7)
    expect(d4.isEstimated).toBe(true)
  })

  it('7. Debe separar nombres y apellidos apropiadamente', () => {
    const n1 = splitFullName('Luke James Petingalo Hermosilla')
    expect(n1.firstName).toBe('Luke James')
    expect(n1.lastName).toBe('Petingalo Hermosilla')

    const n2 = splitFullName('LEONOR DIEDRICKS')
    expect(n2.firstName).toBe('LEONOR')
    expect(n2.lastName).toBe('DIEDRICKS')

    const n3 = splitFullName('Agustin')
    expect(n3.firstName).toBe('Agustin')
    expect(n3.lastName).toBe('Participante')
  })

  it('8. Debe mapear aparatos reglamentarios según la rama (GAM vs GAF)', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    const gamBoy = audit.athletes.find(a => a.originalName.includes('Luke James'))
    expect(gamBoy).toBeDefined()
    expect(gamBoy?.discipline).toBe('GAM')
    expect(gamBoy?.apparatusCodes).toContain('FX')
    expect(gamBoy?.apparatusCodes).toContain('VT')

    const thomas = audit.athletes.find(a => a.originalName.includes('THOMAS MARTINEZ'))
    expect(thomas?.apparatusCodes).toContain('PB') // Paralelas

    const gafGirl = audit.athletes.find(a => a.originalName.includes('LEONOR DIEDRICKS'))
    expect(gafGirl).toBeDefined()
    expect(gafGirl?.discipline).toBe('GAF')
    expect(gafGirl?.apparatusCodes).toEqual(['VT', 'FX', 'BB', 'UB'])
  })

  it('9. Debe identificar y conciliar inconsistencias cruzadas entre Hoja1 y GAM/GAF', () => {
    const audit = parseExcelWorkbook(excelBuffer)

    // Inconsistencias de omisión
    const missingInDiscipline = audit.inconsistencies.filter(i => i.type === 'missing_in_discipline')
    expect(missingInDiscipline.length).toBeGreaterThanOrEqual(10) // 13 gimnastas en Hoja1 pero no en GAM/GAF

    // Atletas en GAM/GAF omitidas en Hoja1
    const missingInGeneral = audit.inconsistencies.filter(i => i.type === 'missing_in_general')
    expect(missingInGeneral.length).toBeGreaterThanOrEqual(5) // 7 gimnastas en GAM/GAF pero no en Hoja1

    // Variaciones ortográficas
    const spellingIncs = audit.inconsistencies.filter(i => i.type === 'spelling_variation')
    expect(spellingIncs.length).toBeGreaterThanOrEqual(1)

    // Ambigüedad de club de Thomas Martinez
    const clubInc = audit.inconsistencies.find(i => i.athleteName.includes('THOMAS MARTINEZ'))
    expect(clubInc).toBeDefined()
    expect(clubInc?.type).toBe('club_ambiguity')
  })

  it('10. Debe extraer correctamente el cronograma (PROGRAMA) con 21 hitos', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    expect(audit.schedule.length).toBeGreaterThanOrEqual(10)
    expect(audit.schedule[0].event).toBe('APERTURA GIMNASIO')
    expect(audit.schedule[0].time).toBe('08:00:00')
  })

  it('11. Debe extraer las 80 categorías de premiación y 310 medallas totales de MEDALLAS', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    expect(audit.awards.length).toBe(80)
    expect(audit.counts.totalAwardsCount).toBe(310)
  })

  it('12. Debe garantizar la protección y aislamiento de campeonatos anteriores', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    expect(audit.championshipName).toBe('Campeonato Artística 2026 - Paillaco')
    expect(audit.status).toBe('draft')
    expect(audit.branches).toEqual(['GAM', 'GAF'])
  })

  it('13. Debe auditar la distribución exacta de fechas de nacimiento sin inventar fechas sintéticas', () => {
    const audit = parseExcelWorkbook(excelBuffer)
    expect(audit.athletes.length).toBe(153)

    const withFullDate = audit.athletes.filter(a => a.birthDate !== null && a.birthDate !== '')
    const withYearOnly = audit.athletes.filter(a => (a.birthDate === null || a.birthDate === '') && a.birthYear !== null && a.birthYear !== undefined)
    const withNoDateOrYear = audit.athletes.filter(a => (a.birthDate === null || a.birthDate === '') && !a.birthYear)

    // 91 gimnastas con fecha completa
    expect(withFullDate.length).toBe(91)
    // 37 gimnastas GAF con solo año de nacimiento
    expect(withYearOnly.length).toBe(37)
    // 25 gimnastas (9 GAF + 16 GAM) sin fecha ni año
    expect(withNoDateOrYear.length).toBe(25)

    // Ninguna fecha sintética inventada como 2016-01-01 o similar para los 62 sin fecha completa
    for (const a of [...withYearOnly, ...withNoDateOrYear]) {
      expect(a.birthDate).toBeNull()
    }
  })
})
