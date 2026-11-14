/**
 * OPERIX GYMNASTICS — CATÁLOGO OFICIAL DE MODALIDADES Y APARATOS FIG (FASE 22)
 * 
 * Regula los aparatos oficiales de:
 * 1. GAM — Gimnasia Artística Masculina (6 Aparatos Oficiales FIG)
 * 2. GAF — Gimnasia Artística Femenina (4 Aparatos Oficiales FIG)
 * 
 * Desarrollado por Comercial Hels SpA.
 */

import type { GymnasticsDiscipline } from '@/core/types/championship'

export type ModalityCode = 'GAM' | 'GAF'

export interface OfficialApparatusDefinition {
  /** Código único identificador FIG (ej. 'FX', 'PH', 'SR', 'VT', 'PB', 'HB', 'UB', 'BB') */
  code: string
  /** Nombre oficial en español */
  name: string
  /** Nombre internacional / oficial en inglés */
  internationalName: string
  /** Nombre corto o abreviado para interfaces compactas */
  shortName: string
  /** Modalidad a la que pertenece exclusivamente */
  discipline: ModalityCode
  /** Orden olímpico estándar de competición (1..6 para GAM, 1..4 para GAF) */
  defaultSortOrder: number
  /** Configuración técnica de puntuación */
  scoringConfig: {
    hasTwoVaultAttempts?: boolean
    defaultMaxExecutionScore: number
    neutralDeductionsAllowed: boolean
  }
  /** Configuración técnica de rotaciones */
  rotationConfig: {
    standardWarmupMinutes: number
    maxGymnastsPerSquad: number
  }
  /** Configuración de premiación */
  awardsConfig: {
    podiumPlacesCount: number
    tieBreakAllowed: boolean
  }
}

// ============================================================================
// 1. APARATOS OFICIALES GAM (GIMNASIA ARTÍSTICA MASCULINA — 6 APARATOS FIG)
// ============================================================================

export const OFFICIAL_GAM_APPARATUSES: Record<string, OfficialApparatusDefinition> = {
  FX: {
    code: 'FX',
    name: 'Suelo',
    internationalName: 'Floor Exercise',
    shortName: 'Suelo',
    discipline: 'GAM',
    defaultSortOrder: 1,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  PH: {
    code: 'PH',
    name: 'Caballo con Arzones',
    internationalName: 'Pommel Horse',
    shortName: 'Arzones',
    discipline: 'GAM',
    defaultSortOrder: 2,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  SR: {
    code: 'SR',
    name: 'Anillas',
    internationalName: 'Still Rings',
    shortName: 'Anillas',
    discipline: 'GAM',
    defaultSortOrder: 3,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  VT: {
    code: 'VT',
    name: 'Salto',
    internationalName: 'Vault',
    shortName: 'Salto',
    discipline: 'GAM',
    defaultSortOrder: 4,
    scoringConfig: {
      hasTwoVaultAttempts: true,
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  PB: {
    code: 'PB',
    name: 'Barras Paralelas',
    internationalName: 'Parallel Bars',
    shortName: 'Paralelas',
    discipline: 'GAM',
    defaultSortOrder: 5,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  HB: {
    code: 'HB',
    name: 'Barra Fija',
    internationalName: 'Horizontal Bar',
    shortName: 'Barra Fija',
    discipline: 'GAM',
    defaultSortOrder: 6,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
}

// ============================================================================
// 2. APARATOS OFICIALES GAF (GIMNASIA ARTÍSTICA FEMENINA — 4 APARATOS FIG)
// ============================================================================

export const OFFICIAL_GAF_APPARATUSES: Record<string, OfficialApparatusDefinition> = {
  VT: {
    code: 'VT',
    name: 'Salto',
    internationalName: 'Vault',
    shortName: 'Salto',
    discipline: 'GAF',
    defaultSortOrder: 1,
    scoringConfig: {
      hasTwoVaultAttempts: true,
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  UB: {
    code: 'UB',
    name: 'Barras Asimétricas',
    internationalName: 'Uneven Bars',
    shortName: 'Asimétricas',
    discipline: 'GAF',
    defaultSortOrder: 2,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  BB: {
    code: 'BB',
    name: 'Viga de Equilibrio',
    internationalName: 'Balance Beam',
    shortName: 'Viga',
    discipline: 'GAF',
    defaultSortOrder: 3,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
  FX: {
    code: 'FX',
    name: 'Suelo',
    internationalName: 'Floor Exercise',
    shortName: 'Suelo',
    discipline: 'GAF',
    defaultSortOrder: 4,
    scoringConfig: {
      defaultMaxExecutionScore: 10.0,
      neutralDeductionsAllowed: true,
    },
    rotationConfig: {
      standardWarmupMinutes: 4,
      maxGymnastsPerSquad: 8,
    },
    awardsConfig: {
      podiumPlacesCount: 3,
      tieBreakAllowed: true,
    },
  },
}

// ============================================================================
// 3. CATÁLOGO COMPLETO COMBINADO
// ============================================================================

export const OFFICIAL_APPARATUS_CATALOG: Record<ModalityCode, Record<string, OfficialApparatusDefinition>> = {
  GAM: OFFICIAL_GAM_APPARATUSES,
  GAF: OFFICIAL_GAF_APPARATUSES,
}

export const OFFICIAL_GAM_APPARATUS_LIST = Object.values(OFFICIAL_GAM_APPARATUSES).sort(
  (a, b) => a.defaultSortOrder - b.defaultSortOrder
)

export const OFFICIAL_GAF_APPARATUS_LIST = Object.values(OFFICIAL_GAF_APPARATUSES).sort(
  (a, b) => a.defaultSortOrder - b.defaultSortOrder
)

// ============================================================================
// 4. FUNCIONES AUXILIARES DE VALIDACIÓN Y DOMINIO
// ============================================================================

/**
 * Obtiene la lista ordenada de aparatos oficiales para una modalidad.
 */
export function getOfficialApparatuses(discipline: GymnasticsDiscipline | ModalityCode): OfficialApparatusDefinition[] {
  const mod: ModalityCode = discipline === 'GAM' ? 'GAM' : 'GAF'
  const catalog = OFFICIAL_APPARATUS_CATALOG[mod]
  return Object.values(catalog).sort((a, b) => a.defaultSortOrder - b.defaultSortOrder)
}

/**
 * Obtiene el orden estándar de códigos de aparatos para una modalidad.
 */
export function getDefaultCompetitionOrder(discipline: GymnasticsDiscipline | ModalityCode): string[] {
  return getOfficialApparatuses(discipline).map((app) => app.code)
}

/**
 * Valida si un código de aparato es legítimo y pertenece a la modalidad indicada.
 * GAM: FX, PH, SR, VT, PB, HB
 * GAF: VT, UB, BB, FX
 */
export function isApparatusValidForDiscipline(
  discipline: GymnasticsDiscipline | ModalityCode,
  code: string
): boolean {
  const mod: ModalityCode = discipline === 'GAM' ? 'GAM' : 'GAF'
  return Object.prototype.hasOwnProperty.call(OFFICIAL_APPARATUS_CATALOG[mod], code)
}

/**
 * Valida un conjunto de códigos de aparatos contra una modalidad y sus aparatos obligatorios.
 * Detecta aparatos incompatibles (ej. UB en GAM o PH en GAF), falta de aparatos habilitados,
 * o aparatos obligatorios no habilitados.
 */
export function validateCategoryApparatuses(
  discipline: GymnasticsDiscipline | ModalityCode,
  apparatusCodes: string[],
  mandatoryCodes?: string[]
): {
  isValid: boolean
  validCodes: string[]
  invalidCodes: string[]
  error?: string
  errors: string[]
} {
  const mod: ModalityCode = discipline === 'GAM' ? 'GAM' : 'GAF'
  const validCodes: string[] = []
  const invalidCodes: string[] = []
  const errors: string[] = []

  if (!apparatusCodes || apparatusCodes.length === 0) {
    errors.push('Debe haber al menos un aparato habilitado para la modalidad.')
  }

  for (const code of apparatusCodes || []) {
    if (isApparatusValidForDiscipline(mod, code)) {
      validCodes.push(code)
    } else {
      invalidCodes.push(code)
      errors.push(`Aparato "${code}" no pertenece a la modalidad ${mod}.`)
    }
  }

  if (mandatoryCodes && mandatoryCodes.length > 0) {
    for (const mCode of mandatoryCodes) {
      if (!apparatusCodes || !apparatusCodes.includes(mCode)) {
        errors.push(`Aparato "${mCode}" está marcado como obligatorio pero no está habilitado.`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    validCodes,
    invalidCodes,
    errors,
    error: errors[0],
  }
}

/**
 * Determina la modalidad a partir de una categoría, nombre o código.
 */
export function inferModality(
  categoryOrDiscipline?: { discipline?: string; name?: string; gender?: string } | string
): ModalityCode {
  if (!categoryOrDiscipline) return 'GAF'

  if (typeof categoryOrDiscipline === 'string') {
    const upper = categoryOrDiscipline.toUpperCase()
    if (
      upper.includes('WOMEN') ||
      upper.includes('FEMENIN') ||
      upper.includes('DAMA') ||
      upper.includes('GIRL') ||
      upper.startsWith('GAF') ||
      upper === 'GAF'
    ) {
      return 'GAF'
    }
    if (
      upper === 'GAM' ||
      upper.includes('MASCULIN') ||
      upper.includes('VARON') ||
      upper.includes('MEN') ||
      upper.includes('BOY') ||
      upper.startsWith('GAM')
    ) {
      return 'GAM'
    }
    return 'GAF'
  }

  if (categoryOrDiscipline.gender) {
    const gen = categoryOrDiscipline.gender.toLowerCase()
    if (gen === 'male' || gen === 'm' || gen === 'varon' || gen === 'masculino') {
      return 'GAM'
    }
    if (gen === 'female' || gen === 'f' || gen === 'dama' || gen === 'femenino') {
      return 'GAF'
    }
  }

  if (categoryOrDiscipline.discipline === 'GAM') return 'GAM'
  if (categoryOrDiscipline.discipline === 'GAF') return 'GAF'

  if (categoryOrDiscipline.name) {
    const nameUpper = categoryOrDiscipline.name.toUpperCase()
    if (
      nameUpper.includes('WOMEN') ||
      nameUpper.includes('FEMENIN') ||
      nameUpper.includes('DAMA') ||
      nameUpper.includes('GIRL') ||
      nameUpper.startsWith('GAF') ||
      nameUpper === 'GAF'
    ) {
      return 'GAF'
    }
    if (
      nameUpper.startsWith('GAM') ||
      nameUpper.includes('MASCULIN') ||
      nameUpper.includes('VARON') ||
      nameUpper.includes('MEN') ||
      nameUpper.includes('BOY')
    ) {
      return 'GAM'
    }
  }

  return 'GAF'
}

/**
 * Normaliza los argumentos (código y disciplina) aceptando indistintamente (code, discipline) o (discipline, code).
 */
function resolveCodeAndDiscipline(
  arg1: string,
  arg2?: GymnasticsDiscipline | ModalityCode | string
): { code: string; mod?: ModalityCode } {
  if (arg1 === 'GAM' || arg1 === 'GAF') {
    return {
      code: typeof arg2 === 'string' ? arg2 : '',
      mod: arg1,
    }
  }
  const mod = arg2 === 'GAM' ? 'GAM' : arg2 === 'GAF' ? 'GAF' : undefined
  return { code: arg1, mod }
}

/**
 * Obtiene el nombre en español del aparato según código y modalidad opcional.
 */
export function getApparatusLabel(
  arg1: string,
  arg2?: GymnasticsDiscipline | ModalityCode | string
): string {
  const { code, mod } = resolveCodeAndDiscipline(arg1, arg2)
  if (mod && OFFICIAL_APPARATUS_CATALOG[mod][code]) {
    return OFFICIAL_APPARATUS_CATALOG[mod][code].name
  }
  if (OFFICIAL_GAF_APPARATUSES[code]) return OFFICIAL_GAF_APPARATUSES[code].name
  if (OFFICIAL_GAM_APPARATUSES[code]) return OFFICIAL_GAM_APPARATUSES[code].name
  return code
}

/**
 * Obtiene el nombre internacional en inglés del aparato.
 */
export function getApparatusInternationalName(
  arg1: string,
  arg2?: GymnasticsDiscipline | ModalityCode | string
): string {
  const { code, mod } = resolveCodeAndDiscipline(arg1, arg2)
  if (mod && OFFICIAL_APPARATUS_CATALOG[mod][code]) {
    return OFFICIAL_APPARATUS_CATALOG[mod][code].internationalName
  }
  if (OFFICIAL_GAF_APPARATUSES[code]) return OFFICIAL_GAF_APPARATUSES[code].internationalName
  if (OFFICIAL_GAM_APPARATUSES[code]) return OFFICIAL_GAM_APPARATUSES[code].internationalName
  return code
}
