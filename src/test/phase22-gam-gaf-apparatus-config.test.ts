/**
 * OPERIX GYMNASTICS — FASE 22 TEST SUITE
 * CONFIGURACIÓN DE MODALIDADES, APARATOS Y COMPETENCIAS GAM/GAF
 *
 * Desarrollado por: Comercial Hels SpA
 *
 * Esta suite valida:
 * 1. Catálogo Oficial FIG GAM (6 aparatos) y GAF (4 aparatos).
 * 2. Estricta separación modal: prevención de contaminación cruzada entre GAM y GAF.
 * 3. Configuración dinámica por campeonato, categoría y subcategoría.
 * 4. All-Around configurable con detección de completitud (isComplete) y desempates.
 * 5. Clasificaciones individuales independientes por aparato y filtrado de notas no aprobadas.
 * 6. Competencias por equipos GAM y GAF con Top N notas y exclusión modal.
 * 7. Matriz de rotaciones dinámicas adaptada a 4 (GAF) y 6 (GAM) aparatos con orden personalizado.
 * 8. Validación de guardias (mínimo 1 aparato habilitado, obligatorios válidos).
 */

import { describe, it, expect } from 'vitest'
import {
  OFFICIAL_GAM_APPARATUS_LIST,
  OFFICIAL_GAF_APPARATUS_LIST,
  getOfficialApparatuses,
  getDefaultCompetitionOrder,
  isApparatusValidForDiscipline,
  validateCategoryApparatuses,
  inferModality,
  getApparatusLabel,
  getApparatusInternationalName,
  type ModalityCode,
  type OfficialApparatusDefinition,
} from '@/core/gymnastics/apparatusCatalog'
import {
  computeAllAroundStandings,
  computeApparatusStandings,
  computeTeamStandings,
  type GymnastScoreEntry,
} from '@/features/standings/standingsEngine'
import {
  generateModalityRotationMatrix,
  validateRotationAssignment,
  getAthletesAtApparatusForRotation,
  autoAssignRotationGroups,
  type MarshalingAthlete,
} from '@/features/schedule/rotationEngine'
import type {
  AllAroundRulesConfig,
  TeamRulesConfig,
} from '@/core/types/competitionRules'
import {
  PRESET_FIG_GAM,
  PRESET_FIG_GAF,
  PRESET_FIG_DUAL_GAM_GAF,
} from '@/core/types/competitionRules'

describe('OPERIX GYMNASTICS — Fase 22: Modalidades, Aparatos y Competencias GAM/GAF', () => {

  // ==========================================================================
  // SECCIÓN 1: MODALIDADES Y APARATOS OFICIALES FIG
  // ==========================================================================
  describe('1. Catálogo Oficial FIG GAM y GAF', () => {
    it('GAM reconoce exactamente sus seis aparatos oficiales con código y orden FIG', () => {
      expect(OFFICIAL_GAM_APPARATUS_LIST).toHaveLength(6)
      const codes = OFFICIAL_GAM_APPARATUS_LIST.map((a: OfficialApparatusDefinition) => a.code)
      expect(codes).toEqual(['FX', 'PH', 'SR', 'VT', 'PB', 'HB'])

      // Verificar orden consecutivo 1..6 y metadatos completos
      OFFICIAL_GAM_APPARATUS_LIST.forEach((app, idx) => {
        expect(app.discipline).toBe('GAM')
        expect(app.defaultSortOrder).toBe(idx + 1)
        expect(app.name).toBeTruthy()
        expect(app.internationalName).toBeTruthy()
        expect(app.scoringConfig).toBeDefined()
        expect(app.rotationConfig).toBeDefined()
        expect(app.awardsConfig).toBeDefined()
      })
    })

    it('GAF reconoce exactamente sus cuatro aparatos oficiales con código y orden FIG', () => {
      expect(OFFICIAL_GAF_APPARATUS_LIST).toHaveLength(4)
      const codes = OFFICIAL_GAF_APPARATUS_LIST.map((a: OfficialApparatusDefinition) => a.code)
      expect(codes).toEqual(['VT', 'UB', 'BB', 'FX'])

      // Verificar orden consecutivo 1..4 y metadatos completos
      OFFICIAL_GAF_APPARATUS_LIST.forEach((app, idx) => {
        expect(app.discipline).toBe('GAF')
        expect(app.defaultSortOrder).toBe(idx + 1)
        expect(app.name).toBeTruthy()
        expect(app.internationalName).toBeTruthy()
        expect(app.scoringConfig).toBeDefined()
        expect(app.rotationConfig).toBeDefined()
        expect(app.awardsConfig).toBeDefined()
      })
    })

    it('Previene estrictamente la mezcla cruzada de aparatos entre GAM y GAF', () => {
      // Aparatos exclusivos de GAM no deben ser válidos en GAF
      expect(isApparatusValidForDiscipline('GAF', 'PH')).toBe(false)
      expect(isApparatusValidForDiscipline('GAF', 'SR')).toBe(false)
      expect(isApparatusValidForDiscipline('GAF', 'PB')).toBe(false)
      expect(isApparatusValidForDiscipline('GAF', 'HB')).toBe(false)

      // Aparatos exclusivos de GAF no deben ser válidos en GAM
      expect(isApparatusValidForDiscipline('GAM', 'UB')).toBe(false)
      expect(isApparatusValidForDiscipline('GAM', 'BB')).toBe(false)

      // Salto (VT) y Suelo (FX) existen en ambas modalidades pero con identidad modal propia
      expect(isApparatusValidForDiscipline('GAM', 'VT')).toBe(true)
      expect(isApparatusValidForDiscipline('GAF', 'VT')).toBe(true)
      expect(isApparatusValidForDiscipline('GAM', 'FX')).toBe(true)
      expect(isApparatusValidForDiscipline('GAF', 'FX')).toBe(true)

      // Aparato inventado o inválido
      expect(isApparatusValidForDiscipline('GAM', 'TRAMPOLINE_RANDOM')).toBe(false)
      expect(isApparatusValidForDiscipline('GAF', 'RING_RANDOM')).toBe(false)
    })

    it('getOfficialApparatuses retorna el catálogo correspondiente o combinado', () => {
      const gamList = getOfficialApparatuses('GAM')
      expect(gamList).toHaveLength(6)

      const gafList = getOfficialApparatuses('GAF')
      expect(gafList).toHaveLength(4)

      const defaultOrderGAM = getDefaultCompetitionOrder('GAM')
      expect(defaultOrderGAM).toEqual(['FX', 'PH', 'SR', 'VT', 'PB', 'HB'])

      const defaultOrderGAF = getDefaultCompetitionOrder('GAF')
      expect(defaultOrderGAF).toEqual(['VT', 'UB', 'BB', 'FX'])
    })

    it('inferModality detecta correctamente la modalidad a partir de nombres o códigos', () => {
      expect(inferModality('GAM — Nivel 1')).toBe('GAM')
      expect(inferModality('Varones Infantil')).toBe('GAM')
      expect(inferModality('Men Artistic')).toBe('GAM')
      expect(inferModality('GAF — Franja 2')).toBe('GAF')
      expect(inferModality('Damas Nivel 3')).toBe('GAF')
      expect(inferModality('Women Artistic Junior')).toBe('GAF')
    })

    it('getApparatusLabel y getApparatusInternationalName entregan descripciones correctas', () => {
      expect(getApparatusLabel('PH', 'GAM')).toBe('Caballo con Arzones')
      expect(getApparatusInternationalName('PH', 'GAM')).toBe('Pommel Horse')
      expect(getApparatusLabel('UB', 'GAF')).toBe('Barras Asimétricas')
      expect(getApparatusInternationalName('UB', 'GAF')).toBe('Uneven Bars')
      expect(getApparatusLabel('BB', 'GAF')).toBe('Viga de Equilibrio')
      expect(getApparatusInternationalName('BB', 'GAF')).toBe('Balance Beam')
    })
  })

  // ==========================================================================
  // SECCIÓN 2: CONFIGURACIÓN DINÁMICA POR CAMPEONATO Y CATEGORÍA
  // ==========================================================================
  describe('2. Validación y Configuración Dinámica de Aparatos', () => {
    it('Valida correctamente una categoría GAM completa con seis aparatos', () => {
      const validation = validateCategoryApparatuses('GAM', ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'], ['FX'])
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('Valida correctamente una categoría GAF completa con cuatro aparatos', () => {
      const validation = validateCategoryApparatuses('GAF', ['VT', 'UB', 'BB', 'FX'], ['VT', 'FX'])
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('Valida una categoría formativa GAF con 3 aparatos (VT, BB, FX)', () => {
      const validation = validateCategoryApparatuses('GAF', ['VT', 'BB', 'FX'])
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('Valida una categoría formativa GAM con 3 aparatos (FX, VT, PB)', () => {
      const validation = validateCategoryApparatuses('GAM', ['FX', 'VT', 'PB'])
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('Rechaza configuración si una categoría tiene 0 aparatos habilitados', () => {
      const validation = validateCategoryApparatuses('GAM', [])
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Debe haber al menos un aparato habilitado para la modalidad.')
    })

    it('Rechaza aparatos incompatibles asignados a una modalidad', () => {
      // Intentar meter UB (Asimétricas) en GAM
      const validationGAM = validateCategoryApparatuses('GAM', ['FX', 'VT', 'UB'])
      expect(validationGAM.isValid).toBe(false)
      expect(validationGAM.errors.some(e => e.includes('no pertenece a la modalidad GAM'))).toBe(true)

      // Intentar meter PH (Arzones) en GAF
      const validationGAF = validateCategoryApparatuses('GAF', ['VT', 'BB', 'PH'])
      expect(validationGAF.isValid).toBe(false)
      expect(validationGAF.errors.some(e => e.includes('no pertenece a la modalidad GAF'))).toBe(true)
    })

    it('Rechaza si un aparato obligatorio no está en la lista de habilitados', () => {
      const validation = validateCategoryApparatuses('GAF', ['VT', 'BB'], ['FX'])
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('está marcado como obligatorio pero no está habilitado'))).toBe(true)
    })
  })

  // ==========================================================================
  // SECCIÓN 3: ALL-AROUND DINÁMICO GAM Y GAF
  // ==========================================================================
  describe('3. Motor All-Around Dinámico para GAM y GAF', () => {
    it('Calcula All-Around GAM completo de seis aparatos y marca isComplete: true', () => {
      const gamRules: AllAroundRulesConfig = {
        enabledApparatuses: ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'],
        mandatoryApparatuses: ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'],
        minApparatusesRequired: 6,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'gym-gam-1', gymnastName: 'Tomás González', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Senior', discipline: 'GAM', apparatusCode: 'FX', dScore: 5.8, eScoreAvg: 8.4, finalScore: 14.200, status: 'official_approved' },
        { gymnastId: 'gym-gam-1', gymnastName: 'Tomás González', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Senior', discipline: 'GAM', apparatusCode: 'PH', dScore: 5.2, eScoreAvg: 7.9, finalScore: 13.100, status: 'official_approved' },
        { gymnastId: 'gym-gam-1', gymnastName: 'Tomás González', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Senior', discipline: 'GAM', apparatusCode: 'SR', dScore: 5.5, eScoreAvg: 8.0, finalScore: 13.500, status: 'official_approved' },
        { gymnastId: 'gym-gam-1', gymnastName: 'Tomás González', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Senior', discipline: 'GAM', apparatusCode: 'VT', dScore: 5.6, eScoreAvg: 8.9, finalScore: 14.500, status: 'official_approved' },
        { gymnastId: 'gym-gam-1', gymnastName: 'Tomás González', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Senior', discipline: 'GAM', apparatusCode: 'PB', dScore: 5.4, eScoreAvg: 8.4, finalScore: 13.800, status: 'official_approved' },
        { gymnastId: 'gym-gam-1', gymnastName: 'Tomás González', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Senior', discipline: 'GAM', apparatusCode: 'HB', dScore: 5.3, eScoreAvg: 8.1, finalScore: 13.400, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: gamRules, discipline: 'GAM' })
      expect(standings).toHaveLength(1)
      expect(standings[0].rank).toBe(1)
      expect(standings[0].isComplete).toBe(true)
      expect(standings[0].totalScore).toBeCloseTo(82.500, 3)
      expect(standings[0].discipline).toBe('GAM')
    })

    it('Identifica All-Around parcial (isComplete: false) cuando faltan aparatos en GAM', () => {
      const gamRules: AllAroundRulesConfig = {
        enabledApparatuses: ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'],
        mandatoryApparatuses: ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'],
        minApparatusesRequired: 6,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'fig_olympic',
        allowPartialResults: true,
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'gym-gam-partial', gymnastName: 'Atleta GAM En Progreso', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Junior', discipline: 'GAM', apparatusCode: 'FX', dScore: 4.5, eScoreAvg: 8.0, finalScore: 12.500, status: 'official_approved' },
        { gymnastId: 'gym-gam-partial', gymnastName: 'Atleta GAM En Progreso', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Junior', discipline: 'GAM', apparatusCode: 'PH', dScore: 4.2, eScoreAvg: 7.6, finalScore: 11.800, status: 'official_approved' },
        { gymnastId: 'gym-gam-partial', gymnastName: 'Atleta GAM En Progreso', clubId: 'club-1', clubName: 'Club Manquehue', categoryName: 'GAM Junior', discipline: 'GAM', apparatusCode: 'SR', dScore: 4.4, eScoreAvg: 7.7, finalScore: 12.100, status: 'official_approved' },
        // Faltan VT, PB, HB
      ]

      const standings = computeAllAroundStandings(scores, { rules: gamRules, discipline: 'GAM' })
      expect(standings).toHaveLength(1)
      expect(standings[0].isComplete).toBe(false)
      expect(standings[0].statusNote).toContain('Faltan 3 aparatos')
    })

    it('Calcula All-Around GAF completo de cuatro aparatos (VT, UB, BB, FX)', () => {
      const gafRules: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'UB', 'BB', 'FX'],
        mandatoryApparatuses: ['VT', 'UB', 'BB', 'FX'],
        minApparatusesRequired: 4,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'gym-gaf-1', gymnastName: 'Simona Castro', clubId: 'club-2', clubName: 'Club El Olimpo', categoryName: 'GAF Senior', discipline: 'GAF', apparatusCode: 'VT', dScore: 5.0, eScoreAvg: 8.8, finalScore: 13.800, status: 'official_approved' },
        { gymnastId: 'gym-gaf-1', gymnastName: 'Simona Castro', clubId: 'club-2', clubName: 'Club El Olimpo', categoryName: 'GAF Senior', discipline: 'GAF', apparatusCode: 'UB', dScore: 5.2, eScoreAvg: 8.0, finalScore: 13.200, status: 'official_approved' },
        { gymnastId: 'gym-gaf-1', gymnastName: 'Simona Castro', clubId: 'club-2', clubName: 'Club El Olimpo', categoryName: 'GAF Senior', discipline: 'GAF', apparatusCode: 'BB', dScore: 5.1, eScoreAvg: 8.3, finalScore: 13.400, status: 'official_approved' },
        { gymnastId: 'gym-gaf-1', gymnastName: 'Simona Castro', clubId: 'club-2', clubName: 'Club El Olimpo', categoryName: 'GAF Senior', discipline: 'GAF', apparatusCode: 'FX', dScore: 5.3, eScoreAvg: 8.3, finalScore: 13.600, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: gafRules, discipline: 'GAF' })
      expect(standings).toHaveLength(1)
      expect(standings[0].rank).toBe(1)
      expect(standings[0].isComplete).toBe(true)
      expect(standings[0].totalScore).toBeCloseTo(54.000, 3)
      expect(standings[0].discipline).toBe('GAF')
    })

    it('Ignora notas registradas en aparatos incompatibles con la modalidad', () => {
      const gafRules: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'UB', 'BB', 'FX'],
        mandatoryApparatuses: [],
        minApparatusesRequired: 2,
        computableScoresCount: 'all',
        calculationMode: 'sum_all_enabled',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'gym-gaf-contam', gymnastName: 'Gimnasta GAF con Nota GAM', clubId: 'club-2', clubName: 'Club El Olimpo', categoryName: 'GAF Nivel 2', discipline: 'GAF', apparatusCode: 'VT', dScore: 2.0, eScoreAvg: 8.0, finalScore: 10.000, status: 'official_approved' },
        { gymnastId: 'gym-gaf-contam', gymnastName: 'Gimnasta GAF con Nota GAM', clubId: 'club-2', clubName: 'Club El Olimpo', categoryName: 'GAF Nivel 2', discipline: 'GAF', apparatusCode: 'BB', dScore: 2.0, eScoreAvg: 8.0, finalScore: 10.000, status: 'official_approved' },
        // PH (Caballo con arzones) NO pertenece a GAF
        { gymnastId: 'gym-gaf-contam', gymnastName: 'Gimnasta GAF con Nota GAM', clubId: 'club-2', clubName: 'Club El Olimpo', categoryName: 'GAF Nivel 2', discipline: 'GAF', apparatusCode: 'PH', dScore: 6.0, eScoreAvg: 9.0, finalScore: 15.000, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: gafRules, discipline: 'GAF' })
      expect(standings).toHaveLength(1)
      // PH no debe ser sumado (10.0 + 10.0 = 20.0, no 35.0)
      expect(standings[0].totalScore).toBeCloseTo(20.000, 3)
      expect(standings[0].apparatusScores['PH']).toBeUndefined()
    })

    it('Ejecuta reglas best_n (Mejores 3 de 4 aparatos en GAF)', () => {
      const best3Rules: AllAroundRulesConfig = {
        enabledApparatuses: ['VT', 'UB', 'BB', 'FX'],
        mandatoryApparatuses: [],
        minApparatusesRequired: 3,
        computableScoresCount: 3,
        calculationMode: 'best_n',
        tieBreakRule: 'fig_olympic',
        treatmentOfWithdrawn: 'exclude_from_all_around',
        treatmentOfDisqualified: 'strip_all_scores',
        treatmentOfAbsent: 'exclude',
      }

      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'gym-best-3', gymnastName: 'Gimnasta Best 3', clubId: 'club-3', clubName: 'Club Élevé', categoryName: 'GAF Franja 1', discipline: 'GAF', apparatusCode: 'VT', dScore: 2.0, eScoreAvg: 7.0, finalScore: 9.000, status: 'official_approved' },
        { gymnastId: 'gym-best-3', gymnastName: 'Gimnasta Best 3', clubId: 'club-3', clubName: 'Club Élevé', categoryName: 'GAF Franja 1', discipline: 'GAF', apparatusCode: 'UB', dScore: 1.5, eScoreAvg: 5.0, finalScore: 6.500, status: 'official_approved' }, // Descarte
        { gymnastId: 'gym-best-3', gymnastName: 'Gimnasta Best 3', clubId: 'club-3', clubName: 'Club Élevé', categoryName: 'GAF Franja 1', discipline: 'GAF', apparatusCode: 'BB', dScore: 2.0, eScoreAvg: 6.8, finalScore: 8.800, status: 'official_approved' },
        { gymnastId: 'gym-best-3', gymnastName: 'Gimnasta Best 3', clubId: 'club-3', clubName: 'Club Élevé', categoryName: 'GAF Franja 1', discipline: 'GAF', apparatusCode: 'FX', dScore: 2.2, eScoreAvg: 7.0, finalScore: 9.200, status: 'official_approved' },
      ]

      const standings = computeAllAroundStandings(scores, { rules: best3Rules, discipline: 'GAF' })
      expect(standings).toHaveLength(1)
      // Debe sumar las 3 mejores: 9.200 (FX) + 9.000 (VT) + 8.800 (BB) = 27.000
      expect(standings[0].totalScore).toBeCloseTo(27.000, 3)
      expect(standings[0].isComplete).toBe(true)
    })
  })

  // ==========================================================================
  // SECCIÓN 4: RESULTADOS INDIVIDUALES POR APARATO
  // ==========================================================================
  describe('4. Resultados y Clasificación Independiente por Aparato', () => {
    it('Genera clasificación individual por aparato para GAM (PH - Caballo con arzones)', () => {
      const scores: GymnastScoreEntry[] = [
        {
          gymnastId: 'g1',
          gymnastName: 'Gimnasta A',
          clubId: 'c1',
          clubName: 'Club 1',
          categoryName: 'GAM Nivel 3',
          discipline: 'GAM',
          apparatusCode: 'PH',
          dScore: 5.0,
          eScoreAvg: 8.500,
          finalScore: 13.500,
          status: 'official_approved',
        },
        {
          gymnastId: 'g2',
          gymnastName: 'Gimnasta B',
          clubId: 'c2',
          clubName: 'Club 2',
          categoryName: 'GAM Nivel 3',
          discipline: 'GAM',
          apparatusCode: 'PH',
          dScore: 5.5,
          eScoreAvg: 8.600,
          finalScore: 14.100,
          status: 'official_approved',
        },
      ]

      const phStandings = computeApparatusStandings(scores, 'PH', { discipline: 'GAM' })
      expect(phStandings).toHaveLength(2)
      expect(phStandings[0].gymnastName).toBe('Gimnasta B')
      expect(phStandings[0].rank).toBe(1)
      expect(phStandings[0].finalScore).toBe(14.100)
      expect(phStandings[0].discipline).toBe('GAM')
      expect(phStandings[1].gymnastName).toBe('Gimnasta A')
      expect(phStandings[1].rank).toBe(2)
      expect(phStandings[0].totalParticipants).toBe(2)
    })

    it('Filtra y excluye notas no aprobadas de los resultados oficiales de aparato', () => {
      const scores: GymnastScoreEntry[] = [
        {
          gymnastId: 'g1',
          gymnastName: 'Gimnasta Nota Aprobada',
          clubId: 'c1',
          clubName: 'Club 1',
          categoryName: 'GAF Nivel 1',
          discipline: 'GAF',
          apparatusCode: 'UB',
          dScore: 3.5,
          eScoreAvg: 8.500,
          finalScore: 12.000,
          status: 'official_approved',
        },
        {
          gymnastId: 'g2',
          gymnastName: 'Gimnasta Nota En Borrador',
          clubId: 'c2',
          clubName: 'Club 2',
          categoryName: 'GAF Nivel 1',
          discipline: 'GAF',
          apparatusCode: 'UB',
          dScore: 5.0,
          eScoreAvg: 9.500,
          finalScore: 14.500,
          status: 'provisional', // NO es official_approved
        },
      ]

      const ubStandings = computeApparatusStandings(scores, 'UB', {
        discipline: 'GAF',
        onlyOfficialApproved: true,
      })
      // Solo la nota oficial_approved debe clasificar
      expect(ubStandings).toHaveLength(1)
      expect(ubStandings[0].gymnastName).toBe('Gimnasta Nota Aprobada')
      expect(ubStandings[0].finalScore).toBe(12.000)
    })

    it('Aplica desempate independiente por aparato por Mayor Nota E', () => {
      const scores: GymnastScoreEntry[] = [
        {
          gymnastId: 'g1',
          gymnastName: 'Gimnasta D-Alta E-Baja',
          clubId: 'c1',
          clubName: 'Club 1',
          categoryName: 'GAF Nivel 2',
          discipline: 'GAF',
          apparatusCode: 'BB',
          dScore: 5.0,
          eScoreAvg: 8.000,
          finalScore: 13.000,
          status: 'official_approved',
        },
        {
          gymnastId: 'g2',
          gymnastName: 'Gimnasta D-Baja E-Alta',
          clubId: 'c2',
          clubName: 'Club 2',
          categoryName: 'GAF Nivel 2',
          discipline: 'GAF',
          apparatusCode: 'BB',
          dScore: 4.5,
          eScoreAvg: 8.500,
          finalScore: 13.000,
          status: 'official_approved',
        },
      ]

      const bbStandings = computeApparatusStandings(scores, 'BB', { discipline: 'GAF' })
      expect(bbStandings).toHaveLength(2)
      // Gimnasta con mayor nota E (8.500 vs 8.000) debe quedar 1ª
      expect(bbStandings[0].gymnastName).toBe('Gimnasta D-Baja E-Alta')
      expect(bbStandings[0].rank).toBe(1)
      expect(bbStandings[1].gymnastName).toBe('Gimnasta D-Alta E-Baja')
      expect(bbStandings[1].rank).toBe(2)
    })
  })

  // ==========================================================================
  // SECCIÓN 5: COMPETENCIAS POR EQUIPOS
  // ==========================================================================
  describe('5. Competencias por Equipos GAM y GAF', () => {
    it('Calcula clasificación por equipos GAM con Top 3 notas por aparato', () => {
      const teamRules: TeamRulesConfig = {
        teamScoringMode: 'top_n_per_apparatus',
        topNScoresPerApparatus: 3,
        minGymnastsPerTeam: 3,
        allowIncompleteTeams: true,
        mandatoryTeamApparatuses: [],
        tieBreakRule: 'fig_team',
      }

      const scores: GymnastScoreEntry[] = [
        // Club Manquehue (4 gimnastas en FX y VT)
        { gymnastId: 'm1', gymnastName: 'Manquehue 1', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'FX', dScore: 5.0, eScoreAvg: 9.000, finalScore: 14.000, status: 'official_approved' },
        { gymnastId: 'm1', gymnastName: 'Manquehue 1', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'VT', dScore: 4.8, eScoreAvg: 8.700, finalScore: 13.500, status: 'official_approved' },

        { gymnastId: 'm2', gymnastName: 'Manquehue 2', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'FX', dScore: 4.9, eScoreAvg: 8.900, finalScore: 13.800, status: 'official_approved' },
        { gymnastId: 'm2', gymnastName: 'Manquehue 2', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'VT', dScore: 4.5, eScoreAvg: 8.700, finalScore: 13.200, status: 'official_approved' },

        { gymnastId: 'm3', gymnastName: 'Manquehue 3', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'FX', dScore: 4.6, eScoreAvg: 8.600, finalScore: 13.200, status: 'official_approved' },
        { gymnastId: 'm3', gymnastName: 'Manquehue 3', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'VT', dScore: 4.4, eScoreAvg: 8.600, finalScore: 13.000, status: 'official_approved' },

        // Descarte 4º gimnasta
        { gymnastId: 'm4', gymnastName: 'Manquehue 4 (Descarte)', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'FX', dScore: 3.5, eScoreAvg: 7.500, finalScore: 11.000, status: 'official_approved' },
        { gymnastId: 'm4', gymnastName: 'Manquehue 4 (Descarte)', clubId: 'club-manquehue', clubName: 'Club Manquehue', categoryName: 'GAM Libre', discipline: 'GAM', apparatusCode: 'VT', dScore: 3.5, eScoreAvg: 7.500, finalScore: 11.000, status: 'official_approved' },
      ]

      const standings = computeTeamStandings(scores, teamRules, { discipline: 'GAM' })
      expect(standings).toHaveLength(1)
      expect(standings[0].clubName).toBe('Club Manquehue')
      expect(standings[0].rank).toBe(1)
      expect(standings[0].discipline).toBe('GAM')
      // FX Top 3: 14.0 + 13.8 + 13.2 = 41.0
      // VT Top 3: 13.5 + 13.2 + 13.0 = 39.7
      // Total: 80.7
      expect(standings[0].totalScore).toBeCloseTo(80.700, 3)
      expect(standings[0].memberCount).toBe(4)
      expect(standings[0].isIncomplete).toBe(false)
    })

    it('Excluye aparatos que no pertenecen a la modalidad del equipo', () => {
      const teamRules: TeamRulesConfig = {
        teamScoringMode: 'top_n_per_apparatus',
        topNScoresPerApparatus: 2,
        minGymnastsPerTeam: 1,
        allowIncompleteTeams: true,
        mandatoryTeamApparatuses: [],
        tieBreakRule: 'fig_team',
      }

      const scores: GymnastScoreEntry[] = [
        {
          gymnastId: 'g1',
          gymnastName: 'Atleta GAF',
          clubId: 'club-gaf',
          clubName: 'Club Paillaco',
          categoryName: 'GAF Franja 1',
          discipline: 'GAF',
          apparatusCode: 'VT',
          dScore: 2.0,
          eScoreAvg: 8.000,
          finalScore: 10.000,
          status: 'official_approved',
        },
        {
          gymnastId: 'g1',
          gymnastName: 'Atleta GAF',
          clubId: 'club-gaf',
          clubName: 'Club Paillaco',
          categoryName: 'GAF Franja 1',
          discipline: 'GAF',
          apparatusCode: 'PH', // PH es GAM, no GAF
          dScore: 5.0,
          eScoreAvg: 10.000,
          finalScore: 15.000,
          status: 'official_approved',
        },
      ]

      const standings = computeTeamStandings(scores, teamRules, { discipline: 'GAF' })
      expect(standings).toHaveLength(1)
      // PH no debe computar para el equipo GAF
      expect(standings[0].apparatusTotals['PH']).toBeUndefined()
      expect(standings[0].totalScore).toBeCloseTo(10.000, 3)
    })
  })

  // ==========================================================================
  // SECCIÓN 6: ROTACIONES Y ORDEN DE COMPETENCIA
  // ==========================================================================
  describe('6. Rotaciones y Orden de Competencia GAM y GAF', () => {
    it('Genera matriz de rotación para GAM con seis grupos y orden FIG oficial', () => {
      const groupNames = ['Grupo 1', 'Grupo 2', 'Grupo 3', 'Grupo 4', 'Grupo 5', 'Grupo 6']
      const matrix = generateModalityRotationMatrix('GAM', groupNames)

      expect(matrix).toHaveLength(6) // 6 grupos
      matrix.forEach((groupSchedule) => {
        expect(groupSchedule.rotations).toHaveLength(6) // 6 rotaciones
        // Cada grupo debe pasar por todos los 6 aparatos sin repetición
        const apparatuses = groupSchedule.rotations.map(r => r.apparatusCode)
        expect(new Set(apparatuses).size).toBe(6)
      })

      // Grupo 1 inicia en Suelo (FX)
      expect(matrix[0].rotations[0].apparatusCode).toBe('FX')
      // Grupo 4 inicia en Salto (VT)
      expect(matrix[3].rotations[0].apparatusCode).toBe('VT')
    })

    it('Genera matriz de rotación para GAF con cuatro grupos y orden FIG oficial', () => {
      const groupNames = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D']
      const matrix = generateModalityRotationMatrix('GAF', groupNames)

      expect(matrix).toHaveLength(4) // 4 grupos
      matrix.forEach((groupSchedule) => {
        expect(groupSchedule.rotations).toHaveLength(4)
        const apparatuses = groupSchedule.rotations.map(r => r.apparatusCode)
        expect(new Set(apparatuses).size).toBe(4)
      })

      // Orden FIG GAF para Grupo A: VT -> UB -> BB -> FX
      expect(matrix[0].rotations[0].apparatusCode).toBe('VT')
      expect(matrix[0].rotations[1].apparatusCode).toBe('UB')
      expect(matrix[0].rotations[2].apparatusCode).toBe('BB')
      expect(matrix[0].rotations[3].apparatusCode).toBe('FX')
    })

    it('Permite un orden de rotación personalizado (ej. Viga -> Suelo -> Salto -> Asimétricas)', () => {
      const customOrder = ['BB', 'FX', 'VT', 'UB']
      const groupNames = ['Grupo 1', 'Grupo 2', 'Grupo 3', 'Grupo 4']
      const matrix = generateModalityRotationMatrix('GAF', groupNames, customOrder)

      // Grupo 1 inicia en BB y continúa en FX
      expect(matrix[0].rotations[0].apparatusCode).toBe('BB')
      expect(matrix[0].rotations[1].apparatusCode).toBe('FX')
    })

    it('Valida asignación de atletas en rotación detectando gimnastas en aparatos incompatibles', () => {
      const athletes = [
        {
          registrationId: 'reg-1',
          gymnastId: 'g-1',
          gymnastName: 'Atleta GAM en Viga',
          clubId: 'c-1',
          clubName: 'Club 1',
          discipline: 'GAM' as ModalityCode,
          startingApparatus: 'BB', // Incompatible con GAM
          rotationGroup: 'Grupo 1',
          startOrder: 1,
        },
      ]

      const validation = validateRotationAssignment('GAM', athletes, ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'])
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('incompatible con GAM'))).toBe(true)
    })
  })

  // ==========================================================================
  // SECCIÓN 7: PRESETS FIG Y REGLAS INTEGRALES
  // ==========================================================================
  describe('7. Presets y Configuración Dual GAM/GAF', () => {
    it('PRESET_FIG_DUAL_GAM_GAF provee configuración completa e independiente para ambas modalidades', () => {
      expect(PRESET_FIG_DUAL_GAM_GAF.rulesetCode).toBe('FIG_DUAL_GAM_GAF_2026')
      expect(PRESET_FIG_DUAL_GAM_GAF.gamConfig).toBeDefined()
      expect(PRESET_FIG_DUAL_GAM_GAF.gafConfig).toBeDefined()

      // GAM
      expect(PRESET_FIG_DUAL_GAM_GAF.gamConfig?.discipline).toBe('GAM')
      expect(PRESET_FIG_DUAL_GAM_GAF.gamConfig?.enabledApparatuses).toEqual(['FX', 'PH', 'SR', 'VT', 'PB', 'HB'])
      expect(PRESET_FIG_DUAL_GAM_GAF.gamConfig?.competitionOrder).toEqual(['FX', 'PH', 'SR', 'VT', 'PB', 'HB'])
      expect(PRESET_FIG_DUAL_GAM_GAF.gamConfig?.computableScoresCount).toBe('all')

      // GAF
      expect(PRESET_FIG_DUAL_GAM_GAF.gafConfig?.discipline).toBe('GAF')
      expect(PRESET_FIG_DUAL_GAM_GAF.gafConfig?.enabledApparatuses).toEqual(['VT', 'UB', 'BB', 'FX'])
      expect(PRESET_FIG_DUAL_GAM_GAF.gafConfig?.competitionOrder).toEqual(['VT', 'UB', 'BB', 'FX'])
      expect(PRESET_FIG_DUAL_GAM_GAF.gafConfig?.computableScoresCount).toBe('all')
    })

    it('PRESET_FIG_GAM y PRESET_FIG_GAF mantienen compatibilidad regresiva 100%', () => {
      expect(PRESET_FIG_GAM.allAroundRules.enabledApparatuses).toEqual(['FX', 'PH', 'SR', 'VT', 'PB', 'HB'])
      expect(PRESET_FIG_GAM.allAroundRules.minApparatusesRequired).toBe(6)

      expect(PRESET_FIG_GAF.allAroundRules.enabledApparatuses).toEqual(['VT', 'UB', 'BB', 'FX'])
      expect(PRESET_FIG_GAF.allAroundRules.minApparatusesRequired).toBe(4)
    })
  })

  // ==========================================================================
  // SECCIÓN 8: SEGREGACIÓN ESTRICTA DE NIÑOS EN APARATOS GAM Y NIÑAS EN GAF
  // ==========================================================================
  describe('8. Segregación Estricta de Niños (GAM) y Niñas (GAF)', () => {
    const mixedAthletes: MarshalingAthlete[] = [
      {
        registrationId: 'reg-boy-1',
        gymnastId: 'gym-luke',
        gymnastName: 'Luke James Petingalo',
        clubId: 'c-pumahue',
        clubName: 'Club Deportivo Pumahue',
        categoryName: 'GAM — AC0',
        discipline: 'GAM',
        subdivision: 'Varones',
        rotationGroup: 'Grupo GAM',
        startingApparatus: 'FX',
        startOrder: 1,
      },
      {
        registrationId: 'reg-boy-2',
        gymnastId: 'gym-william',
        gymnastName: 'William James Petingalo',
        clubId: 'c-pumahue',
        clubName: 'Club Deportivo Pumahue',
        categoryName: 'GAM — Kinder',
        discipline: 'GAM',
        subdivision: 'Varones',
        rotationGroup: 'Grupo GAM',
        startingApparatus: 'FX',
        startOrder: 2,
      },
      {
        registrationId: 'reg-girl-1',
        gymnastId: 'gym-valen',
        gymnastName: 'Valentina Toro',
        clubId: 'c-pumahue',
        clubName: 'Club Deportivo Pumahue',
        categoryName: 'GAF Nivel 2',
        discipline: 'GAF',
        subdivision: 'Subdivisión 1',
        rotationGroup: 'Grupo A',
        startingApparatus: 'VT',
        startOrder: 1,
      },
      {
        registrationId: 'reg-girl-2',
        gymnastId: 'gym-martina',
        gymnastName: 'Martina Silva',
        clubId: 'c-pumahue',
        clubName: 'Club Deportivo Pumahue',
        categoryName: 'GAF Nivel 2',
        discipline: 'GAF',
        subdivision: 'Subdivisión 1',
        rotationGroup: 'Grupo A',
        startingApparatus: 'UB',
        startOrder: 2,
      },
    ]

    it('getAthletesAtApparatusForRotation JAMÁS devuelve niños en Barras Asimétricas (UB) o Viga (BB)', () => {
      const gafApparatuses = ['VT', 'UB', 'BB', 'FX']

      // Consultar Asimétricas (UB) en cualquier rotación
      const atUB = getAthletesAtApparatusForRotation(mixedAthletes, gafApparatuses, 'UB', 1)
      expect(atUB.every((a) => a.discipline === 'GAF')).toBe(true)
      expect(atUB.some((a) => a.gymnastName.includes('Luke') || a.gymnastName.includes('William'))).toBe(false)

      // Consultar Viga (BB) en cualquier rotación
      const atBB = getAthletesAtApparatusForRotation(mixedAthletes, gafApparatuses, 'BB', 1)
      expect(atBB.every((a) => a.discipline === 'GAF')).toBe(true)
      expect(atBB.some((a) => a.gymnastName.includes('Luke') || a.gymnastName.includes('William'))).toBe(false)
    })

    it('getAthletesAtApparatusForRotation JAMÁS devuelve niñas en Caballo con Arzones (PH), Anillas (SR), Paralelas (PB) o Barra Fija (HB)', () => {
      const gamApparatuses = ['FX', 'PH', 'SR', 'VT', 'PB', 'HB']

      for (const maleApp of ['PH', 'SR', 'PB', 'HB']) {
        const atMaleApp = getAthletesAtApparatusForRotation(mixedAthletes, gamApparatuses, maleApp, 1)
        expect(atMaleApp.every((a) => a.discipline === 'GAM')).toBe(true)
        expect(atMaleApp.some((a) => a.gymnastName.includes('Valentina') || a.gymnastName.includes('Martina'))).toBe(false)
      }
    })

    it('autoAssignRotationGroups asigna aparatos 100% compatibles a cada gimnasta según su modalidad', () => {
      const assigned = autoAssignRotationGroups(
        mixedAthletes.map((a) => ({
          registrationId: a.registrationId,
          gymnastId: a.gymnastId,
          gymnastName: a.gymnastName,
          clubId: a.clubId,
          clubName: a.clubName,
          categoryName: a.categoryName,
          discipline: a.discipline,
        })),
        ['VT', 'UB', 'BB', 'FX'] // Lista general de aparatos
      )

      for (const ath of assigned) {
        if (ath.discipline === 'GAM') {
          // El varón no puede tener UB ni BB como aparato inicial
          expect(['UB', 'BB']).not.toContain(ath.startingApparatus)
          expect(['FX', 'VT', 'PB', 'PH', 'SR', 'HB']).toContain(ath.startingApparatus)
        } else {
          // La dama no puede tener aparatos masculinos
          expect(['PH', 'SR', 'PB', 'HB']).not.toContain(ath.startingApparatus)
          expect(['VT', 'UB', 'BB', 'FX']).toContain(ath.startingApparatus)
        }
      }
    })
  })
})
