/**
 * OPERIX GYMNASTICS — TIPOS DEL IMPORTADOR DE CAMPEONATOS DESDE EXCEL
 * Archivo: ARTISTICA CAMPEONATO 2026.xlsx
 * Desarrollado por Comercial Hels SpA
 * Fecha: 12 de noviembre de 2026
 */

export type DisciplineCode = 'GAF' | 'GAM'

export interface RawAthleteRecord {
  sheet: 'Hoja1' | 'GAM' | 'GAF'
  row: number
  nameRaw: string
  name: string
  levelRaw: string
  level: string
  franjaRaw: string
  franja: string
  clubRaw: string
  club: string
  salto: boolean
  suelo: boolean
  viga: boolean
  barra: boolean
  paralela: boolean
  birthDateRaw?: string
  birthDate?: string | null
  age?: number | null
}

export interface ReconciledAthlete {
  id?: string
  sourceSheet: 'GAM' | 'GAF' | 'Hoja1'
  sourceRow: number
  originalName: string
  normalizedFirstName: string
  normalizedLastName: string
  discipline: DisciplineCode
  rawLevel: string
  normalizedLevel: string
  rawFranja: string
  normalizedFranja: string
  rawClub: string
  canonicalClub: string
  clubCode: string
  birthDate: string | null
  birthYear?: number | null
  age: number | null
  isAgeEstimated: boolean
  apparatusCodes: string[]
  assignedSubdivision?: string
  assignedRotationGroup?: string
  startingApparatus?: string
  inconsistencies: string[]
}

export interface InconsistencyReportItem {
  type: 'spelling_variation' | 'missing_in_discipline' | 'missing_in_general' | 'club_ambiguity' | 'age_missing' | 'apparatus_special'
  severity: 'info' | 'warning' | 'error'
  athleteName: string
  club: string
  description: string
  proposedResolution: string
}

export interface ScheduleEventItem {
  row: number
  time: string
  event: string
}

export interface AwardRuleItem {
  row: number
  categoryRule: string
  placesAwarded: number[]
  totalAwards: number
}

export interface ExcelAuditResult {
  fileName: string
  championshipName: string
  modality: string
  branches: DisciplineCode[]
  status: 'draft'
  sheetNames: string[]
  counts: {
    hoja1Athletes: number
    gamAthletes: number
    gafAthletes: number
    resumenGam: number
    resumenGaf: number
    resumenTotal: number
    papeletaVaronesEntries: number
    papeletaGafEntries: number
    existingScoresFound: number
    scheduleEventsCount: number
    awardCategoriesCount: number
    totalAwardsCount: number
    totalUniqueAthletes: number
    totalUniqueClubs: number
  }
  clubsDetected: {
    canonicalName: string
    code: string
    sourceVariations: string[]
    athleteCount: number
  }[]
  categoriesDetected: {
    discipline: DisciplineCode
    code: string
    name: string
    levels: string[]
    franjas: string[]
    athleteCount: number
  }[]
  inconsistencies: InconsistencyReportItem[]
  athletes: ReconciledAthlete[]
  schedule: ScheduleEventItem[]
  awards: AwardRuleItem[]
}

export interface ImportExecutionResult {
  success: boolean
  championshipId: string
  championshipSlug: string
  organizationId: string
  importedCounts: {
    clubsCreatedOrLinked: number
    categoriesCreated: number
    subcategoriesCreated: number
    gymnastsCreatedOrLinked: number
    registrationsCreated: number
    schedulesCreated: number
    rotationGroupsCreated: number
    awardsConfigured: number
  }
  logs: string[]
  error?: string
}
