/**
 * OPERIX GYMNASTICS — MOTOR DE REGLAS DE COMPETICIÓN Y CONFIGURACIÓN FLEXIBLE
 * 
 * Modos reglamentarios soportados:
 * - Competiciones Oficiales Federadas FIG (Ciclo Olímpico 2025-2028).
 * - Competiciones Formativas / Niveles USAG / Escuelas Deportivas (2 o 3 aparatos).
 * - Campeonatos Escolares e Intercolegiales.
 * - Copas de Clubes y Torneos Abiertos con regulaciones específicas.
 * 
 * Desarrollado por Comercial Hels SpA.
 */

import type { GymnasticsDiscipline } from './championship'

// ============================================================================
// 1. REGLAS DE ALL-AROUND (CLASIFICACIÓN GENERAL INDIVIDUAL)
// ============================================================================

export type AllAroundCalculationMode =
  | 'sum_all_enabled'          // Suman todos los aparatos habilitados para la categoría (estándar FIG)
  | 'mandatory_plus_best_n'    // Aparatos obligatorios específicos + mejores N notas del resto
  | 'best_n'                   // Se eligen las mejores N notas entre todos los aparatos realizados
  | 'sum_completed'            // Suma simple de notas completadas (siempre que cumpla minApparatusesRequired)

export type AllAroundTieBreakRule =
  | 'fig_olympic'              // Cascada oficial FIG: N-1, N-2... mejor nota aparato, suma E, mejor E, compartido
  | 'total_e_score'            // Mayor nota acumulada de Ejecución (E-Score total)
  | 'highest_single_apparatus' // Mayor nota individual obtenida en un solo aparato
  | 'shared_ex_aequo'          // Sin desempate secundario; empate directo compartido (ex-aequo)

export type WithdrawnTreatment =
  | 'exclude_from_all_around'  // No aparece en el ranking All-Around (queda clasificado solo en sus aparatos)
  | 'rank_with_completed_notes'// Clasifica con la suma de las notas que logró completar
  | 'mark_dnf'                 // Aparece al final del ranking marcado como DNF (Did Not Finish)

export type DisqualifiedTreatment =
  | 'strip_all_scores'         // Se anulan todas sus puntuaciones para todas las tablas
  | 'mark_dsq'                 // Aparece marcado como DSQ (Descalificado) sin derecho a podio ni premios

export interface AllAroundRulesConfig {
  /** Códigos de aparatos autorizados para disputar el All-Around (ej. ['VT', 'UB', 'BB', 'FX']) */
  enabledApparatuses: string[]

  /** Aparatos que el gimnasta DEBE haber ejecutado obligatoriamente para calificar */
  mandatoryApparatuses: string[]

  /** Cantidad mínima de aparatos con nota válida requeridos para aparecer en el ranking */
  minApparatusesRequired: number

  /** Cantidad de notas computables hacia el puntaje total: 'all' o número exacto N */
  computableScoresCount: number | 'all'

  /** Modo de cálculo del total All-Around */
  calculationMode: AllAroundCalculationMode

  /** Regla de desempate aplicada en caso de puntajes idénticos */
  tieBreakRule: AllAroundTieBreakRule

  /** Tratamiento reglamentario para atletas retirados por lesión u orden médica/técnica (DNF) */
  treatmentOfWithdrawn: WithdrawnTreatment

  /** Tratamiento reglamentario para atletas descalificados por conducta o falta reglamentaria (DSQ) */
  treatmentOfDisqualified: DisqualifiedTreatment

  /** Tratamiento reglamentario para ausencias no justificadas (DNS) */
  treatmentOfAbsent: 'exclude' | 'zero_score'
}

// ============================================================================
// 2. REGLAS DE CLASIFICACIÓN POR EQUIPOS (TEAM STANDINGS)
// ============================================================================

export type TeamScoringMode =
  | 'top_n_per_apparatus'       // Formato tradicional FIG: Mejores N notas de cada aparato (ej. 5-4-3 o 4-3-2)
  | 'top_n_all_around_gymnasts'// Suma de los mejores N puntajes All-Around completos de gimnastas del club

export type TeamTieBreakRule =
  | 'fig_team'                  // Cascada FIG Equipos: Suma de mejores N-1 aparatos, mejor aparato individual, compartido
  | 'total_team_e'              // Mayor suma de notas de ejecución E del equipo
  | 'shared_ex_aequo'           // Empate compartido (trofeo o posición ex-aequo)

export interface TeamRulesConfig {
  /** Modo de puntuación colectiva */
  teamScoringMode: TeamScoringMode

  /** Cantidad máxima de notas computables por aparato (ej. 2 para Top 2, 3 para Top 3) */
  topNScoresPerApparatus: number

  /** Cantidad mínima de integrantes que debe presentar el club para constituir equipo */
  minGymnastsPerTeam: number

  /** Si se permite rankear equipos incompletos (con menos gimnastas o notas de las requeridas) */
  allowIncompleteTeams: boolean

  /** Aparatos obligatorios en los que el equipo debe puntuar al menos una vez */
  mandatoryTeamApparatuses: string[]

  /** Regla de desempate entre equipos con puntajes idénticos */
  tieBreakRule: TeamTieBreakRule
}

// ============================================================================
// 3. CONTROL DE PARTICIPACIÓN Y ESTADOS OPERATIVOS
// ============================================================================

export type RegistrationStatus =
  | 'pending'                  // Inscripción en revisión
  | 'confirmed'                // Inscripción confirmada y aceptada oficialmente
  | 'rejected'                 // Rechazada por comité organizador

export type AttendanceStatus =
  | 'present'                  // Presente y acreditado en sala / calentamiento
  | 'absent'                   // Ausente / No presentado (DNS - Did Not Start)

export type SportsParticipationStatus =
  | 'active'                   // En competencia activa
  | 'withdrawn'                // Retirado por lesión u orden técnica (DNF - Did Not Finish)
  | 'disqualified'             // Descalificado por jurado superior / comité (DSQ)
  | 'completed'                // Participación deportiva finalizada normalmente

export type ScoringOperationalStatus =
  | 'no_scores'                // Sin puntuaciones emitidas
  | 'in_progress'              // Puntuando aparatos en curso
  | 'completed'                // Todos sus aparatos programados han sido calificados

export interface ParticipationStatusLog {
  id: string
  registrationId: string
  timestamp: string
  changedByUserId: string
  changedByName: string
  fieldChanged: 'registrationStatus' | 'attendanceStatus' | 'sportsParticipationStatus'
  previousValue: string
  newValue: string
  reason: string
}

export interface AthleteParticipationProfile {
  registrationId: string
  gymnastId: string
  gymnastName: string
  clubId: string
  clubName: string
  registrationStatus: RegistrationStatus
  attendanceStatus: AttendanceStatus
  sportsParticipationStatus: SportsParticipationStatus
  scoringStatus: ScoringOperationalStatus
  lastUpdated: string
  statusLogs: ParticipationStatusLog[]
}

// ============================================================================
// 4. CONFIGURACIÓN COMPLETA DEL CAMPEONATO
// ============================================================================

export interface ChampionshipCompetitionRules {
  championshipId: string
  rulesetCode: string
  rulesetName: string
  discipline: GymnasticsDiscipline
  allAroundRules: AllAroundRulesConfig
  teamRules: TeamRulesConfig
  /** Reglas específicas que sobreescriben a nivel de categoría (ej. Categoría Iniciación vs Nivel Libre) */
  categoryOverrides?: Record<
    string,
    {
      allAroundRules?: Partial<AllAroundRulesConfig>
      teamRules?: Partial<TeamRulesConfig>
    }
  >
  isLocked: boolean            // Verdadero una vez que el campeonato oficializa actas (inmutable)
  lockedAt?: string
  lockedByUserId?: string
  updatedAt: string
}

// ============================================================================
// 5. CONFIGURACIONES PREESTABLECIDAS (PRESETS ESTÁNDAR)
// ============================================================================

/**
 * FIG GAF Estándar (Ciclo Olímpico 2025-2028):
 * 4 aparatos, todos habilitados y obligatorios, suma de 4 notas, Top 3 por aparato para equipos.
 */
export const PRESET_FIG_GAF: ChampionshipCompetitionRules = {
  championshipId: '',
  rulesetCode: 'FIG_GAF_2025_2028',
  rulesetName: 'FIG Oficial GAF (4 Aparatos • VT, UB, BB, FX)',
  discipline: 'GAF',
  allAroundRules: {
    enabledApparatuses: ['VT', 'UB', 'BB', 'FX'],
    mandatoryApparatuses: ['VT', 'UB', 'BB', 'FX'],
    minApparatusesRequired: 4,
    computableScoresCount: 'all',
    calculationMode: 'sum_all_enabled',
    tieBreakRule: 'fig_olympic',
    treatmentOfWithdrawn: 'exclude_from_all_around',
    treatmentOfDisqualified: 'strip_all_scores',
    treatmentOfAbsent: 'exclude',
  },
  teamRules: {
    teamScoringMode: 'top_n_per_apparatus',
    topNScoresPerApparatus: 3,
    minGymnastsPerTeam: 3,
    allowIncompleteTeams: true,
    mandatoryTeamApparatuses: [],
    tieBreakRule: 'fig_team',
  },
  isLocked: false,
  updatedAt: new Date().toISOString(),
}

/**
 * FIG GAM Estándar (Ciclo Olímpico 2025-2028):
 * 6 aparatos masculinos, todos habilitados y obligatorios, Top 3 por aparato para equipos.
 */
export const PRESET_FIG_GAM: ChampionshipCompetitionRules = {
  championshipId: '',
  rulesetCode: 'FIG_GAM_2025_2028',
  rulesetName: 'FIG Oficial GAM (6 Aparatos • FX, PH, SR, VT, PB, HB)',
  discipline: 'GAM',
  allAroundRules: {
    enabledApparatuses: ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'],
    mandatoryApparatuses: ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'],
    minApparatusesRequired: 6,
    computableScoresCount: 'all',
    calculationMode: 'sum_all_enabled',
    tieBreakRule: 'fig_olympic',
    treatmentOfWithdrawn: 'exclude_from_all_around',
    treatmentOfDisqualified: 'strip_all_scores',
    treatmentOfAbsent: 'exclude',
  },
  teamRules: {
    teamScoringMode: 'top_n_per_apparatus',
    topNScoresPerApparatus: 3,
    minGymnastsPerTeam: 3,
    allowIncompleteTeams: true,
    mandatoryTeamApparatuses: [],
    tieBreakRule: 'fig_team',
  },
  isLocked: false,
  updatedAt: new Date().toISOString(),
}

/**
 * Formativo / Niveles Usag (3 Aparatos GAF):
 * Común en categorías iniciales donde no se compite en barras asimétricas (ej. Salto, Viga, Suelo).
 */
export const PRESET_FORMATIVO_3APP: ChampionshipCompetitionRules = {
  championshipId: '',
  rulesetCode: 'FORMATIVO_3APP_GAF',
  rulesetName: 'Formativo GAF (3 Aparatos • Salto, Viga, Suelo)',
  discipline: 'GAF',
  allAroundRules: {
    enabledApparatuses: ['VT', 'BB', 'FX'],
    mandatoryApparatuses: ['VT', 'BB', 'FX'],
    minApparatusesRequired: 3,
    computableScoresCount: 'all',
    calculationMode: 'sum_all_enabled',
    tieBreakRule: 'fig_olympic',
    treatmentOfWithdrawn: 'exclude_from_all_around',
    treatmentOfDisqualified: 'strip_all_scores',
    treatmentOfAbsent: 'exclude',
  },
  teamRules: {
    teamScoringMode: 'top_n_per_apparatus',
    topNScoresPerApparatus: 3,
    minGymnastsPerTeam: 3,
    allowIncompleteTeams: true,
    mandatoryTeamApparatuses: [],
    tieBreakRule: 'fig_team',
  },
  isLocked: false,
  updatedAt: new Date().toISOString(),
}

/**
 * Escolar / Promocional (2 Aparatos GAF/GAM):
 * Festivales escolares y torneos masivos de desarrollo (ej. Salto y Suelo), Top 2 para equipos.
 */
export const PRESET_ESCOLAR_2APP: ChampionshipCompetitionRules = {
  championshipId: '',
  rulesetCode: 'ESCOLAR_2APP_PROMOCIONAL',
  rulesetName: 'Escolar / Promocional (2 Aparatos • Salto y Suelo)',
  discipline: 'GAF',
  allAroundRules: {
    enabledApparatuses: ['VT', 'FX'],
    mandatoryApparatuses: ['VT', 'FX'],
    minApparatusesRequired: 2,
    computableScoresCount: 'all',
    calculationMode: 'sum_all_enabled',
    tieBreakRule: 'total_e_score',
    treatmentOfWithdrawn: 'exclude_from_all_around',
    treatmentOfDisqualified: 'strip_all_scores',
    treatmentOfAbsent: 'exclude',
  },
  teamRules: {
    teamScoringMode: 'top_n_per_apparatus',
    topNScoresPerApparatus: 2,
    minGymnastsPerTeam: 2,
    allowIncompleteTeams: true,
    mandatoryTeamApparatuses: [],
    tieBreakRule: 'fig_team',
  },
  isLocked: false,
  updatedAt: new Date().toISOString(),
}
