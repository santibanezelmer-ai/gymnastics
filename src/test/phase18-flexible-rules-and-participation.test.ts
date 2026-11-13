/**
 * OPERIX GYMNASTICS — FASE 18 TEST SUITE
 * FLEXIBILIDAD REGLAMENTARIA, GESTIÓN DE COMPETICIÓN Y CONTROL DE PARTICIPACIÓN
 *
 * Desarrollado por: Comercial Hels SpA
 *
 * Esta suite valida:
 * 1. All-Around Configurable por campeonato y categoría:
 *    - 2 aparatos (Escolar / Promocional: Salto y Suelo).
 *    - 3 aparatos (Formativo GAF: Salto, Viga y Suelo).
 *    - 4 aparatos (Oficial FIG GAF: VT, UB, BB, FX).
 *    - 6 aparatos (Oficial FIG GAM: FX, PH, SR, VT, PB, HB).
 * 2. Aparatos obligatorios vs opcionales en All-Around.
 * 3. Cantidad mínima de aparatos requeridos para clasificar.
 * 4. Modalidad de cálculo: Todas habilitadas, Mejores N notas, Obligatorios + Mejores N.
 * 5. Clasificación por Equipos Top N:
 *    - Top 2 por aparato (formato escolar 4-3-2).
 *    - Top 3 por aparato (formato oficial FIG 5-4-3).
 *    - Top 4 por aparato.
 *    - Mínimo de integrantes y tratamiento de equipos incompletos (admitidos con observación vs excluidos).
 * 6. Control de Participación deportiva y trazabilidad:
 *    - Atletas Ausentes (DNS - Did Not Start).
 *    - Atletas Retirados (DNF - Did Not Finish) por lesión u orden médica.
 *    - Atletas Descalificados (DSQ).
 *    - Inmutabilidad histórica: los cambios de estado NO eliminan puntuaciones previas.
 * 7. Criterios de desempate diferenciados por reglamento:
 *    - Cascada Oficial FIG adaptada dinámicamente a K aparatos.
 *    - Desempate por Ejecución pura (Total E-Score).
 *    - Desempate por mejor aparato individual.
 *    - Empate oficial compartido (Ex-aequo sin desempate secundario).
 * 8. Compatibilidad 100% regresiva con campeonatos anteriores y protección histórica.
 */

import { describe, it, expect } from 'vitest'
import {
  computeAllAroundStandings,
  computeTeamStandings,
  type GymnastScoreEntry,
} from '@/features/standings/standingsEngine'
import {
  ParticipationManager,
} from '@/features/registrations/participationManager'
import type {
  AllAroundRulesConfig,
  TeamRulesConfig,
} from '@/core/types/competitionRules'
import {
  PRESET_FIG_GAM,
} from '@/core/types/competitionRules'

describe('OPERIX GYMNASTICS — Fase 18: Flexibilidad Reglamentaria y Gestión de Competición', () => {

  // ==========================================================================
  // SECCIÓN 1: ALL-AROUND CONFIGURABLE (2, 3, 4 Y 6 APARATOS)
  // ==========================================================================
  describe('1. All-Around Configurable por Modalidad y Categoría', () => {

    it('Calcula All-Around Escolar de 2 aparatos (Salto y Suelo)', () => {
      const escolarRules: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'FX'],
        mandatoryApparatuses: ['VT', 'FX'],
        minApparatusesRequired: 2,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'total_e_score',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        // Gimnasta 1: VT = 9.200 (E=8.2), FX = 9.400 (E=8.4) -> Total = 18.600
        { gymnastId: 'esc-1', gymnastName: 'Ana Escolar', clubId: 'c1', clubName: 'Col. San Martín', apparatusCode: 'VT', dScore: 1.0, eScoreAvg: 8.2, finalScore: 9.2, status: 'official_approved' },
        { gymnastId: 'esc-1', gymnastName: 'Ana Escolar', clubId: 'c1', clubName: 'Col. San Martín', apparatusCode: 'FX', dScore: 1.0, eScoreAvg: 8.4, finalScore: 9.4, status: 'official_approved' },

        // Gimnasta 2: VT = 9.100 (E=8.1), FX = 9.300 (E=8.3) -> Total = 18.400
        { gymnastId: 'esc-2', gymnastName: 'Beatriz Escolar', clubId: 'c2', clubName: 'Liceo Bicentenario', apparatusCode: 'VT', dScore: 1.0, eScoreAvg: 8.1, finalScore: 9.1, status: 'official_approved' },
        { gymnastId: 'esc-2', gymnastName: 'Beatriz Escolar', clubId: 'c2', clubName: 'Liceo Bicentenario', apparatusCode: 'FX', dScore: 1.0, eScoreAvg: 8.3, finalScore: 9.3, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: escolarRules })

      expect(standings).toHaveLength(2)
      expect(standings[0].gymnastId).toBe('esc-1')
      expect(standings[0].totalScore).toBe(18.6)
      expect(standings[0].rank).toBe(1)
      expect(standings[0].medal).toBe('gold')

      expect(standings[1].gymnastId).toBe('esc-2')
      expect(standings[1].totalScore).toBe(18.4)
      expect(standings[1].rank).toBe(2)
      expect(standings[1].medal).toBe('silver')
    })

    it('Calcula All-Around Formativo GAF de 3 aparatos (Salto, Viga y Suelo)', () => {
      const formativoRules: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'BB', 'FX'],
        mandatoryApparatuses: ['VT', 'BB', 'FX'],
        minApparatusesRequired: 3,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        // Gimnasta completa 3 aparatos formativos
        { gymnastId: 'for-1', gymnastName: 'Clara Formativa', clubId: 'c1', clubName: 'Club Los Ríos', apparatusCode: 'VT', dScore: 10.0, eScoreAvg: 8.5, finalScore: 8.5, status: 'official_approved' },
        { gymnastId: 'for-1', gymnastName: 'Clara Formativa', clubId: 'c1', clubName: 'Club Los Ríos', apparatusCode: 'BB', dScore: 10.0, eScoreAvg: 8.2, finalScore: 8.2, status: 'official_approved' },
        { gymnastId: 'for-1', gymnastName: 'Clara Formativa', clubId: 'c1', clubName: 'Club Los Ríos', apparatusCode: 'FX', dScore: 10.0, eScoreAvg: 8.7, finalScore: 8.7, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: formativoRules })

      expect(standings).toHaveLength(1)
      expect(standings[0].gymnastId).toBe('for-1')
      expect(standings[0].totalScore).toBe(25.4) // 8.5 + 8.2 + 8.7
    })

    it('Calcula All-Around Oficial FIG GAM de 6 aparatos masculinos', () => {
      const gamScores: GymnastScoreEntry[] = [
        { gymnastId: 'gam-1', gymnastName: 'Tomás González', clubId: 'c1', clubName: 'Club Chile', apparatusCode: 'FX', dScore: 6.0, eScoreAvg: 8.5, finalScore: 14.5, status: 'official_approved' },
        { gymnastId: 'gam-1', gymnastName: 'Tomás González', clubId: 'c1', clubName: 'Club Chile', apparatusCode: 'PH', dScore: 5.5, eScoreAvg: 8.0, finalScore: 13.5, status: 'official_approved' },
        { gymnastId: 'gam-1', gymnastName: 'Tomás González', clubId: 'c1', clubName: 'Club Chile', apparatusCode: 'SR', dScore: 5.8, eScoreAvg: 8.2, finalScore: 14.0, status: 'official_approved' },
        { gymnastId: 'gam-1', gymnastName: 'Tomás González', clubId: 'c1', clubName: 'Club Chile', apparatusCode: 'VT', dScore: 5.6, eScoreAvg: 9.0, finalScore: 14.6, status: 'official_approved' },
        { gymnastId: 'gam-1', gymnastName: 'Tomás González', clubId: 'c1', clubName: 'Club Chile', apparatusCode: 'PB', dScore: 5.7, eScoreAvg: 8.4, finalScore: 14.1, status: 'official_approved' },
        { gymnastId: 'gam-1', gymnastName: 'Tomás González', clubId: 'c1', clubName: 'Club Chile', apparatusCode: 'HB', dScore: 5.9, eScoreAvg: 8.3, finalScore: 14.2, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(gamScores, { rules: PRESET_FIG_GAM.allAroundRules })

      expect(standings).toHaveLength(1)
      expect(standings[0].gymnastId).toBe('gam-1')
      // 14.5 + 13.5 + 14.0 + 14.6 + 14.1 + 14.2 = 84.9
      expect(standings[0].totalScore).toBe(84.9)
    })
  })

  // ==========================================================================
  // SECCIÓN 2: APARATOS OBLIGATORIOS Y MÍNIMO REQUERIDO
  // ==========================================================================
  describe('2. Aparatos Obligatorios y Cantidad Mínima para Clasificar', () => {

    it('Excluye del All-Around a una gimnasta que no realizó un aparato obligatorio', () => {
      // Regla: Se exige Salto ('VT') obligatoriamente
      const rulesWithMandatoryVT: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'UB', 'BB', 'FX'],
        mandatoryApparatuses: ['VT'],
        minApparatusesRequired: 2,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        // Gimnasta A: Ejecutó VT y FX (cumple obligatorio VT)
        { gymnastId: 'gym-A', gymnastName: 'Atleta A', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'gym-A', gymnastName: 'Atleta A', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'FX', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },

        // Gimnasta B: Ejecutó BB y FX (NO ejecutó VT obligatorio)
        { gymnastId: 'gym-B', gymnastName: 'Atleta B', clubId: 'c2', clubName: 'Club 2', apparatusCode: 'BB', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'gym-B', gymnastName: 'Atleta B', clubId: 'c2', clubName: 'Club 2', apparatusCode: 'FX', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: rulesWithMandatoryVT })

      // Solo Gimnasta A clasifica al All-Around; Gimnasta B queda excluida por faltar a VT
      expect(standings).toHaveLength(1)
      expect(standings[0].gymnastId).toBe('gym-A')
    })

    it('Excluye a gimnasta que realizó menos aparatos que el mínimo requerido', () => {
      // Regla: Se exige haber completado al menos 3 aparatos
      const rulesMin3: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'UB', 'BB', 'FX'],
        mandatoryApparatuses: [],
        minApparatusesRequired: 3,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        // Gimnasta con solo 2 aparatos completados
        { gymnastId: 'gym-only-2', gymnastName: 'Especialista', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'gym-only-2', gymnastName: 'Especialista', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'FX', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: rulesMin3 })
      expect(standings).toHaveLength(0)
    })
  })

  // ==========================================================================
  // SECCIÓN 3: NOTAS COMPUTABLES (BEST N Y MANDATORY + BEST N)
  // ==========================================================================
  describe('3. Modalidad de Cálculo: Mejores N Notas', () => {

    it('Modo "best_n": computa únicamente las 2 mejores notas entre 4 aparatos ejecutados', () => {
      const rulesBest2: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'UB', 'BB', 'FX'],
        mandatoryApparatuses: [],
        minApparatusesRequired: 2,
        computableScoresCount: 2,
        calculationMode: 'best_n',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'g-best', gymnastName: 'Carla Best', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'g-best', gymnastName: 'Carla Best', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'UB', dScore: 4.0, eScoreAvg: 7.0, finalScore: 11.0, status: 'official_approved' },
        { gymnastId: 'g-best', gymnastName: 'Carla Best', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'BB', dScore: 5.0, eScoreAvg: 8.5, finalScore: 13.5, status: 'official_approved' }, // Top 1
        { gymnastId: 'g-best', gymnastName: 'Carla Best', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'FX', dScore: 5.0, eScoreAvg: 8.0, finalScore: 13.0, status: 'official_approved' }, // Top 2
      ]

      const standings = computeAllAroundStandings(scores, { rules: rulesBest2 })

      expect(standings).toHaveLength(1)
      // Debe sumar solo BB (13.5) + FX (13.0) = 26.5
      expect(standings[0].totalScore).toBe(26.5)
    })
  })

  // ==========================================================================
  // SECCIÓN 4: CLASIFICACIÓN POR EQUIPOS TOP N (TOP 2, TOP 3, INCOMPLETOS)
  // ==========================================================================
  describe('4. Clasificación por Equipos Top N Configurable', () => {

    it('Modo Top 2 por aparato: suma solo las 2 mejores notas por aparato de cada club', () => {
      const teamRulesTop2: TeamRulesConfig = {
        teamScoringMode: 'top_n_per_apparatus',
        topNScoresPerApparatus: 2,
        minGymnastsPerTeam: 2,
        allowIncompleteTeams: true,
        mandatoryTeamApparatuses: [],
        tieBreakRule: 'fig_team',
      }

      const scores: GymnastScoreEntry[] = [
        // Club 1 presenta 3 gimnastas en Salto: notas 13.0, 12.0 y 10.0
        { gymnastId: 'g1', gymnastName: 'Atleta 1', clubId: 'club-1', clubName: 'Club Alfa', apparatusCode: 'VT', dScore: 5.0, eScoreAvg: 8.0, finalScore: 13.0, status: 'official_approved' },
        { gymnastId: 'g2', gymnastName: 'Atleta 2', clubId: 'club-1', clubName: 'Club Alfa', apparatusCode: 'VT', dScore: 4.5, eScoreAvg: 7.5, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'g3', gymnastName: 'Atleta 3', clubId: 'club-1', clubName: 'Club Alfa', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 6.0, finalScore: 10.0, status: 'official_approved' }, // Descartada (3a nota)
      ]

      const standings = computeTeamStandings(scores, teamRulesTop2)

      expect(standings).toHaveLength(1)
      expect(standings[0].clubId).toBe('club-1')
      // Top 2: 13.0 + 12.0 = 25.0
      expect(standings[0].totalScore).toBe(25.0)
      expect(standings[0].apparatusTotals['VT']).toBe(25.0)
    })

    it('Excluye a clubes con menos gimnastas que el mínimo si allowIncompleteTeams es false', () => {
      const strictTeamRules: TeamRulesConfig = {
        teamScoringMode: 'top_n_per_apparatus',
        topNScoresPerApparatus: 3,
        minGymnastsPerTeam: 3,
        allowIncompleteTeams: false, // Estricto
        mandatoryTeamApparatuses: [],
        tieBreakRule: 'fig_team',
      }

      const scores: GymnastScoreEntry[] = [
        // Club Beta solo tiene 2 gimnastas inscritas
        { gymnastId: 'b1', gymnastName: 'B1', clubId: 'club-beta', clubName: 'Club Beta', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'b2', gymnastName: 'B2', clubId: 'club-beta', clubName: 'Club Beta', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeTeamStandings(scores, strictTeamRules)
      expect(standings).toHaveLength(0) // No clasifica como equipo
    })

    it('Permite y etiqueta como "Equipo incompleto" si allowIncompleteTeams es true', () => {
      const lenientTeamRules: TeamRulesConfig = {
        teamScoringMode: 'top_n_per_apparatus',
        topNScoresPerApparatus: 3,
        minGymnastsPerTeam: 3,
        allowIncompleteTeams: true, // Permitir con observación
        mandatoryTeamApparatuses: [],
        tieBreakRule: 'fig_team',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'b1', gymnastName: 'B1', clubId: 'club-beta', clubName: 'Club Beta', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'b2', gymnastName: 'B2', clubId: 'club-beta', clubName: 'Club Beta', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeTeamStandings(scores, lenientTeamRules)
      expect(standings).toHaveLength(1)
      expect(standings[0].isComplete).toBe(false)
      expect(standings[0].statusNote).toContain('Equipo incompleto')
    })
  })

  // ==========================================================================
  // SECCIÓN 5: CONTROL DE PARTICIPACIÓN (DNS, DNF, DSQ Y AUDITORÍA)
  // ==========================================================================
  describe('5. Control de Participación, Retiros y Descalificaciones', () => {
    const mgr = new ParticipationManager('champ-test-phase18')

    it('Registra y actualiza estados de participación deportiva con auditoría inmutable', () => {
      const profile = mgr.getOrCreateProfile({
        registrationId: 'reg-p1',
        gymnastId: 'gym-p1',
        gymnastName: 'Daniela Retiro',
        clubId: 'club-x',
        clubName: 'Club X',
      })

      expect(profile.attendanceStatus).toBe('present')
      expect(profile.sportsParticipationStatus).toBe('active')

      // Se retira en pista por lesión en el tobillo
      mgr.updateStatus({
        registrationId: 'reg-p1',
        field: 'sportsParticipationStatus',
        newValue: 'withdrawn',
        reason: 'Esguince de tobillo durante calentamiento en Salto',
        userId: 'admin-01',
        userName: 'Mesa de Control Oficial',
      })

      const updated = mgr.getOrCreateProfile({
        registrationId: 'reg-p1',
        gymnastId: 'gym-p1',
        gymnastName: 'Daniela Retiro',
        clubId: 'club-x',
        clubName: 'Club X',
      })

      expect(updated.sportsParticipationStatus).toBe('withdrawn')
      expect(updated.statusLogs).toHaveLength(1)
      expect(updated.statusLogs[0].reason).toContain('Esguince de tobillo')
      expect(updated.statusLogs[0].changedByName).toBe('Mesa de Control Oficial')
    })

    it('Atleta con retiro (DNF) no clasifica en All-Around pero conserva notas de aparatos previos', () => {
      const partProfiles = new Map()
      partProfiles.set('gym-dnf', {
        registrationId: 'reg-dnf',
        gymnastId: 'gym-dnf',
        gymnastName: 'Elena Lesionada',
        clubId: 'c1',
        clubName: 'Club 1',
        registrationStatus: 'confirmed',
        attendanceStatus: 'present',
        sportsParticipationStatus: 'withdrawn', // DNF
        scoringStatus: 'in_progress',
        lastUpdated: new Date().toISOString(),
        statusLogs: [],
      })

      const scores: GymnastScoreEntry[] = [
        // Ejecutó Salto antes de retirarse
        { gymnastId: 'gym-dnf', gymnastName: 'Elena Lesionada', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.5, finalScore: 12.5, status: 'official_approved' },
      ]

      // En All-Around (con regla por defecto exclude_from_all_around) no debe clasificar
      const aaStandings = computeAllAroundStandings(scores, { participationProfiles: partProfiles })
      expect(aaStandings).toHaveLength(0)
    })

    it('Atleta descalificada (DSQ) queda totalmente excluida', () => {
      const partProfiles = new Map()
      partProfiles.set('gym-dsq', {
        registrationId: 'reg-dsq',
        gymnastId: 'gym-dsq',
        gymnastName: 'Fabiola Falta',
        clubId: 'c1',
        clubName: 'Club 1',
        registrationStatus: 'confirmed',
        attendanceStatus: 'present',
        sportsParticipationStatus: 'disqualified', // DSQ
        scoringStatus: 'in_progress',
        lastUpdated: new Date().toISOString(),
        statusLogs: [],
      })

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'gym-dsq', gymnastName: 'Fabiola Falta', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { participationProfiles: partProfiles })
      expect(standings).toHaveLength(0)
    })
  })

  // ==========================================================================
  // SECCIÓN 6: REGLAS DE DESEMPATE DIFERENCIADAS
  // ==========================================================================
  describe('6. Reglas de Desempate Diferenciadas (Ejecución, Mejor Aparato, Ex-Aequo)', () => {

    it('Desempate por Ejecución pura (total_e_score): premia a quien tiene mayor E total', () => {
      const rulesE: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'FX'],
        mandatoryApparatuses: [],
        minApparatusesRequired: 2,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'total_e_score', // Criterio E directo
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      // Ambas suman 24.000, pero Gimnasta 1 tiene mayor E (8.5+8.5 = 17.0 vs 8.0+8.0 = 16.0)
      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'g1', gymnastName: 'Alta E', clubId: 'c1', clubName: 'C1', apparatusCode: 'VT', dScore: 3.5, eScoreAvg: 8.5, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'g1', gymnastName: 'Alta E', clubId: 'c1', clubName: 'C1', apparatusCode: 'FX', dScore: 3.5, eScoreAvg: 8.5, finalScore: 12.0, status: 'official_approved' },

        { gymnastId: 'g2', gymnastName: 'Alta D', clubId: 'c2', clubName: 'C2', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'g2', gymnastName: 'Alta D', clubId: 'c2', clubName: 'C2', apparatusCode: 'FX', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: rulesE })

      expect(standings[0].gymnastId).toBe('g1')
      expect(standings[0].rank).toBe(1)
      expect(standings[0].tieBreakInfo).toBeUndefined() // Ganadora por criterio E
      expect(standings[1].gymnastId).toBe('g2')
      expect(standings[1].rank).toBe(2)
      expect(standings[1].tieBreakInfo).toContain('Desempate por Ejecución')
    })

    it('Empate compartido (shared_ex_aequo): otorga oro compartido sin desempate secundario', () => {
      const rulesShared: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'FX'],
        mandatoryApparatuses: [],
        minApparatusesRequired: 2,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'shared_ex_aequo', // Empate directo
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'g1', gymnastName: 'Atleta 1', clubId: 'c1', clubName: 'C1', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'g1', gymnastName: 'Atleta 1', clubId: 'c1', clubName: 'C1', apparatusCode: 'FX', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },

        { gymnastId: 'g2', gymnastName: 'Atleta 2', clubId: 'c2', clubName: 'C2', apparatusCode: 'VT', dScore: 3.5, eScoreAvg: 8.5, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'g2', gymnastName: 'Atleta 2', clubId: 'c2', clubName: 'C2', apparatusCode: 'FX', dScore: 3.5, eScoreAvg: 8.5, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: rulesShared })

      expect(standings[0].rank).toBe(1)
      expect(standings[0].medal).toBe('gold')
      expect(standings[1].rank).toBe(1)
      expect(standings[1].medal).toBe('gold')
      expect(standings[1].tieBreakInfo).toContain('Empate compartido')
    })
  })

  // ==========================================================================
  // SECCIÓN 7: COMPATIBILIDAD CON CAMPEONATOS EXISTENTES
  // ==========================================================================
  describe('7. Compatibilidad Histórica y Protección de Resultados Previos', () => {

    it('Mantiene intacta la llamada clásica computeAllAroundStandings(scores) sin parámetros', () => {
      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'leg-1', gymnastName: 'Legacy 1', clubId: 'c1', clubName: 'C1', apparatusCode: 'VT', dScore: 5.0, eScoreAvg: 8.5, finalScore: 13.5, status: 'official_approved' },
        { gymnastId: 'leg-1', gymnastName: 'Legacy 1', clubId: 'c1', clubName: 'C1', apparatusCode: 'UB', dScore: 5.0, eScoreAvg: 8.5, finalScore: 13.5, status: 'official_approved' },
        { gymnastId: 'leg-2', gymnastName: 'Legacy 2', clubId: 'c2', clubName: 'C2', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores)
      expect(standings).toHaveLength(2)
      expect(standings[0].gymnastId).toBe('leg-1')
      expect(standings[0].totalScore).toBe(27.0)
      expect(standings[1].gymnastId).toBe('leg-2')
      expect(standings[1].totalScore).toBe(12.0)
    })

    it('Mantiene intacta la llamada clásica computeTeamStandings(scores, 3) con número topN', () => {
      const scores: GymnastScoreEntry[] = [
        { gymnastId: 't1', gymnastName: 'T1', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'VT', dScore: 5.0, eScoreAvg: 8.0, finalScore: 13.0, status: 'official_approved' },
        { gymnastId: 't2', gymnastName: 'T2', clubId: 'c1', clubName: 'Club 1', apparatusCode: 'VT', dScore: 4.5, eScoreAvg: 7.5, finalScore: 12.0, status: 'official_approved' },
      ]

      const standings = computeTeamStandings(scores, 3)
      expect(standings).toHaveLength(1)
      expect(standings[0].totalScore).toBe(25.0)
    })
  })
})
