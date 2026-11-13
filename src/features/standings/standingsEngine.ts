/**
 * Gymnastics Standings Engine (Official Deterministic Calculations).
 * 
 * Computes:
 * 1. All-Around Individual Standings (Total score across all apparatuses).
 * 2. Apparatus Finals Standings (Single apparatus rankings with E-score tiebreak).
 * 3. Team Standings (Configurable e.g. 5-4-3 format: top N scores per apparatus).
 * 4. Medal / Awards allocation (Gold, Silver, Bronze, Diplomas).
 */

import type {
  AllAroundRulesConfig,
  TeamRulesConfig,
  AthleteParticipationProfile,
} from '@/core/types/competitionRules'

export interface GymnastScoreEntry {
  gymnastId: string
  gymnastName: string
  clubId: string
  clubName: string
  categoryId?: string
  categoryName?: string
  discipline?: string
  scoringRegime?: 'free' | 'obligatory'
  apparatusCode: string
  attemptNumber?: number
  dScore: number
  eScoreAvg: number
  aScore?: number
  tofScore?: number
  hdScore?: number
  timeSeconds?: number
  penaltySeconds?: number
  finalScore: number
  status: 'draft' | 'submitted' | 'provisional' | 'official_approved'
}

export interface AllAroundStanding {
  rank: number
  gymnastId: string
  gymnastName: string
  clubId: string
  clubName: string
  categoryId?: string
  categoryName?: string
  apparatusScores: Record<string, number>
  totalScore: number
  totalEScore: number
  tieBreakInfo?: string
  medal?: 'gold' | 'silver' | 'bronze'
  statusNote?: string
  isEligible?: boolean
}

export interface ApparatusStanding {
  rank: number
  apparatusCode: string
  gymnastId: string
  gymnastName: string
  clubId: string
  clubName: string
  categoryId?: string
  categoryName?: string
  dScore: number
  eScoreAvg: number
  aScore?: number
  timeSeconds?: number
  penaltySeconds?: number
  finalScore: number
  isTimeBased?: boolean
  unit?: string
  tieBreakInfo?: string
  vaultAttempts?: {
    attempt1?: { dScore: number; eScoreAvg: number; finalScore: number }
    attempt2?: { dScore: number; eScoreAvg: number; finalScore: number }
  }
  medal?: 'gold' | 'silver' | 'bronze'
}

export interface TeamStanding {
  rank: number
  clubId: string
  clubName: string
  totalScore: number
  apparatusTotals: Record<string, number>
  participatingGymnastsCount: number
  tieBreakInfo?: string
  trophy?: '1st' | '2nd' | '3rd'
  isComplete?: boolean
  statusNote?: string
}

export interface AllAroundComputeOptions {
  categoryId?: string
  requiredApparatusCount?: number
  rules?: AllAroundRulesConfig
  participationProfiles?:
    | Map<string, AthleteParticipationProfile>
    | Record<string, AthleteParticipationProfile>
}

/**
 * Computes All-Around Individual Standings from approved/provisional scores.
 * Fully configurable by championship and category rules (FIG, Formativo, Escolar).
 *
 * Supports:
 * - 2, 3, 4, 6 or arbitrary apparatus counts.
 * - Mandatory apparatuses and minimum required apparatus count.
 * - Computable scores (all, top N, mandatory + top N).
 * - Multi-rule tie-breaking (FIG Olympic cascade, Total E-score, Single best score, Ex-aequo).
 * - Treatment of absent (DNS), withdrawn (DNF), and disqualified (DSQ) athletes.
 * - Total backward compatibility with legacy calls.
 */
export function computeAllAroundStandings(
  scores: GymnastScoreEntry[],
  optionsOrRequiredCount?: number | AllAroundComputeOptions
): AllAroundStanding[] {
  const options: AllAroundComputeOptions =
    typeof optionsOrRequiredCount === 'number'
      ? { requiredApparatusCount: optionsOrRequiredCount }
      : optionsOrRequiredCount || {}

  const categoryIdFilter = options.categoryId

  // Resolve rules: use provided rules or build default FIG-compatible rules
  const minRequired =
    options.rules?.minApparatusesRequired ??
    options.requiredApparatusCount ??
    0

  const rules: AllAroundRulesConfig = options.rules || {
    enabledApparatuses: [],
    mandatoryApparatuses: [],
    minApparatusesRequired: minRequired,
    computableScoresCount: 'all',
    calculationMode: 'sum_all_enabled',
    tieBreakRule: 'fig_olympic',
    treatmentOfWithdrawn: 'exclude_from_all_around',
    treatmentOfDisqualified: 'strip_all_scores',
    treatmentOfAbsent: 'exclude',
  }

  // Participation profile resolver
  const getParticipation = (gymnastId: string): AthleteParticipationProfile | undefined => {
    if (!options.participationProfiles) return undefined
    if (options.participationProfiles instanceof Map) {
      return options.participationProfiles.get(gymnastId)
    }
    return (options.participationProfiles as Record<string, AthleteParticipationProfile>)[gymnastId]
  }

  // 1. Filter valid scores
  const validScores = scores.filter((s) => {
    if (s.status !== 'official_approved' && s.status !== 'provisional') return false
    if (categoryIdFilter && s.categoryId !== categoryIdFilter) return false

    // Filter by enabled apparatuses if configured
    if (
      rules.enabledApparatuses &&
      rules.enabledApparatuses.length > 0 &&
      !rules.enabledApparatuses.includes(s.apparatusCode)
    ) {
      return false
    }

    // Check participation status
    const part = getParticipation(s.gymnastId)
    if (part) {
      if (part.registrationStatus === 'rejected') return false
      if (part.attendanceStatus === 'absent' && rules.treatmentOfAbsent === 'exclude') return false
      if (part.sportsParticipationStatus === 'disqualified' && rules.treatmentOfDisqualified === 'strip_all_scores') {
        return false
      }
    }

    return true
  })

  // 2. Group by gymnast
  const gymnastMap = new Map<
    string,
    {
      gymnastName: string
      clubId: string
      clubName: string
      categoryId?: string
      categoryName?: string
      apparatusScores: Record<string, number>
      apparatusEScores: Record<string, number>
      statusNote?: string
    }
  >()

  for (const s of validScores) {
    const attempt = s.attemptNumber ?? 1
    // FIG Rule: Only attempt 1 counts for All-Around
    if (attempt !== 1) continue

    if (!gymnastMap.has(s.gymnastId)) {
      const part = getParticipation(s.gymnastId)
      let statusNote: string | undefined
      if (part?.sportsParticipationStatus === 'withdrawn') {
        statusNote = 'DNF'
      } else if (part?.sportsParticipationStatus === 'disqualified') {
        statusNote = 'DSQ'
      }

      gymnastMap.set(s.gymnastId, {
        gymnastName: s.gymnastName,
        clubId: s.clubId,
        clubName: s.clubName,
        categoryId: s.categoryId,
        categoryName: s.categoryName,
        apparatusScores: {},
        apparatusEScores: {},
        statusNote,
      })
    }

    const current = gymnastMap.get(s.gymnastId)!
    if (current.apparatusScores[s.apparatusCode] === undefined) {
      current.apparatusScores[s.apparatusCode] = s.finalScore
      current.apparatusEScores[s.apparatusCode] = s.eScoreAvg
    }
  }

  // 3. Evaluate eligibility and compute total scores according to calculationMode
  const eligibleEntries: {
    gymnastId: string
    gymnastName: string
    clubId: string
    clubName: string
    categoryId?: string
    categoryName?: string
    apparatusScores: Record<string, number>
    apparatusEScores: Record<string, number>
    totalScore: number
    totalEScore: number
    statusNote?: string
  }[] = []

  for (const [gymnastId, data] of gymnastMap.entries()) {
    const part = getParticipation(gymnastId)
    const isWithdrawn = part?.sportsParticipationStatus === 'withdrawn'
    const isDisqualified = part?.sportsParticipationStatus === 'disqualified'

    // Handle withdrawn treatment
    if (isWithdrawn && rules.treatmentOfWithdrawn === 'exclude_from_all_around') {
      continue
    }

    // Handle disqualified treatment
    if (isDisqualified && rules.treatmentOfDisqualified === 'strip_all_scores') {
      continue
    }

    // Check mandatory apparatuses (must have performed all mandatory ones)
    if (rules.mandatoryApparatuses && rules.mandatoryApparatuses.length > 0) {
      const missingMandatory = rules.mandatoryApparatuses.some(
        (app) => data.apparatusScores[app] === undefined
      )
      if (missingMandatory) {
        continue // Ineligible for All-Around
      }
    }

    // Check minimum required apparatuses count
    const completedCount = Object.keys(data.apparatusScores).length
    if (rules.minApparatusesRequired > 0 && completedCount < rules.minApparatusesRequired) {
      continue // Ineligible for All-Around
    }

    // Calculate total score based on calculation mode
    let totalScore = 0
    let totalEScore = 0

    if (rules.calculationMode === 'best_n' && typeof rules.computableScoresCount === 'number') {
      const n = rules.computableScoresCount
      const sortedScores = Object.entries(data.apparatusScores).sort((a, b) => b[1] - a[1])
      const topN = sortedScores.slice(0, n)
      totalScore = Math.round(topN.reduce((acc, curr) => acc + curr[1], 0) * 1000) / 1000
      totalEScore = Math.round(
        topN.reduce((acc, curr) => acc + (data.apparatusEScores[curr[0]] || 0), 0) * 1000
      ) / 1000
    } else if (
      rules.calculationMode === 'mandatory_plus_best_n' &&
      typeof rules.computableScoresCount === 'number'
    ) {
      // Sum mandatory
      const mandApps = rules.mandatoryApparatuses || []
      let mandSum = 0
      let mandESum = 0
      for (const m of mandApps) {
        if (data.apparatusScores[m] !== undefined) {
          mandSum += data.apparatusScores[m]
          mandESum += data.apparatusEScores[m] || 0
        }
      }
      // Pick best remaining
      const remainingScores = Object.entries(data.apparatusScores)
        .filter(([app]) => !mandApps.includes(app))
        .sort((a, b) => b[1] - a[1])

      const remainingN = Math.max(0, rules.computableScoresCount - mandApps.length)
      const topRemaining = remainingScores.slice(0, remainingN)
      const remSum = topRemaining.reduce((acc, curr) => acc + curr[1], 0)
      const remESum = topRemaining.reduce(
        (acc, curr) => acc + (data.apparatusEScores[curr[0]] || 0),
        0
      )

      totalScore = Math.round((mandSum + remSum) * 1000) / 1000
      totalEScore = Math.round((mandESum + remESum) * 1000) / 1000
    } else {
      // 'sum_all_enabled' or 'sum_completed'
      totalScore =
        Math.round(
          Object.values(data.apparatusScores).reduce((acc, curr) => acc + curr, 0) * 1000
        ) / 1000
      totalEScore =
        Math.round(
          Object.values(data.apparatusEScores).reduce((acc, curr) => acc + curr, 0) * 1000
        ) / 1000
    }

    eligibleEntries.push({
      gymnastId,
      ...data,
      totalScore,
      totalEScore,
    })
  }

  // 4. Comparator with configurable tie-break rules
  const compareAllAround = (
    a: (typeof eligibleEntries)[0],
    b: (typeof eligibleEntries)[0]
  ): { diff: number; reason?: string } => {
    // 0. Primary: Total Score
    if (Math.abs(b.totalScore - a.totalScore) > 0.0001) {
      return { diff: b.totalScore - a.totalScore }
    }

    // Direct ex-aequo if rule is shared_ex_aequo
    if (rules.tieBreakRule === 'shared_ex_aequo') {
      return { diff: 0, reason: 'Empate oficial compartido (Sin desempate secundario)' }
    }

    // Total Execution score rule
    if (rules.tieBreakRule === 'total_e_score') {
      if (Math.abs(b.totalEScore - a.totalEScore) > 0.0001) {
        return {
          diff: b.totalEScore - a.totalEScore,
          reason: `Desempate por Ejecución: Mayor nota total E (${Math.max(a.totalEScore, b.totalEScore).toFixed(3)} vs ${Math.min(a.totalEScore, b.totalEScore).toFixed(3)})`,
        }
      }
      return { diff: 0, reason: 'Empate oficial compartido (Puntajes y notas E idénticas)' }
    }

    // Highest single apparatus score rule
    if (rules.tieBreakRule === 'highest_single_apparatus') {
      const aMax = Math.max(...Object.values(a.apparatusScores), 0)
      const bMax = Math.max(...Object.values(b.apparatusScores), 0)
      if (Math.abs(bMax - aMax) > 0.0001) {
        return {
          diff: bMax - aMax,
          reason: `Desempate por Aparato: Mayor nota en un aparato (${Math.max(aMax, bMax).toFixed(3)} vs ${Math.min(aMax, bMax).toFixed(3)})`,
        }
      }
      return { diff: 0, reason: 'Empate oficial compartido' }
    }

    // Default: FIG Olympic Cascade adapted dynamically to the number of apparatuses
    const aVals = Object.values(a.apparatusScores).sort((x, y) => y - x)
    const bVals = Object.values(b.apparatusScores).sort((x, y) => y - x)
    const maxK = Math.max(aVals.length, bVals.length)

    // Dynamic cascade: compare sum of best (maxK - 1) down to best 2
    for (let k = maxK - 1; k >= 2; k--) {
      const aSumK =
        Math.round(aVals.slice(0, k).reduce((acc, curr) => acc + curr, 0) * 1000) / 1000
      const bSumK =
        Math.round(bVals.slice(0, k).reduce((acc, curr) => acc + curr, 0) * 1000) / 1000
      if (Math.abs(bSumK - aSumK) > 0.0001) {
        return {
          diff: bSumK - aSumK,
          reason: `Desempate FIG: Suma ${k} mejores aparatos (${Math.max(aSumK, bSumK).toFixed(3)} vs ${Math.min(aSumK, bSumK).toFixed(3)})`,
        }
      }
    }

    // Highest single apparatus score
    const aTop1 = aVals[0] ?? 0
    const bTop1 = bVals[0] ?? 0
    if (Math.abs(bTop1 - aTop1) > 0.0001) {
      return {
        diff: bTop1 - aTop1,
        reason: `Desempate FIG: Mayor nota en un solo aparato (${Math.max(aTop1, bTop1).toFixed(3)} vs ${Math.min(aTop1, bTop1).toFixed(3)})`,
      }
    }

    // Highest total Execution score
    if (Math.abs(b.totalEScore - a.totalEScore) > 0.0001) {
      return {
        diff: b.totalEScore - a.totalEScore,
        reason: `Desempate FIG: Mayor nota total de Ejecución E (${Math.max(a.totalEScore, b.totalEScore).toFixed(3)} vs ${Math.min(a.totalEScore, b.totalEScore).toFixed(3)})`,
      }
    }

    // Highest single apparatus Execution score
    const aEVals = Object.values(a.apparatusEScores).sort((x, y) => y - x)
    const bEVals = Object.values(b.apparatusEScores).sort((x, y) => y - x)
    const aTopE = aEVals[0] ?? 0
    const bTopE = bEVals[0] ?? 0
    if (Math.abs(bTopE - aTopE) > 0.0001) {
      return {
        diff: bTopE - aTopE,
        reason: `Desempate FIG: Mayor nota individual de Ejecución E (${Math.max(aTopE, bTopE).toFixed(3)} vs ${Math.min(aTopE, bTopE).toFixed(3)})`,
      }
    }

    return { diff: 0, reason: 'Empate compartido (Reglamento FIG Art. 5.3)' }
  }

  // 5. Sort entries
  eligibleEntries.sort((a, b) => compareAllAround(a, b).diff)

  // 6. Assign official ranks and medals
  const results: AllAroundStanding[] = []
  let previousRank = 1

  for (let i = 0; i < eligibleEntries.length; i++) {
    const entry = eligibleEntries[i]
    let rank = i + 1
    let tieBreakInfo: string | undefined

    if (i > 0) {
      const prev = eligibleEntries[i - 1]
      const comparison = compareAllAround(entry, prev)

      if (comparison.diff === 0) {
        rank = previousRank
        tieBreakInfo = 'Empate compartido (Reglamento FIG Art. 5.3)'
      } else {
        if (Math.abs(entry.totalScore - prev.totalScore) < 0.0001) {
          tieBreakInfo = comparison.reason
        }
        previousRank = rank
      }
    } else {
      previousRank = 1
    }

    let medal: AllAroundStanding['medal']
    if (rank === 1) medal = 'gold'
    else if (rank === 2) medal = 'silver'
    else if (rank === 3) medal = 'bronze'

    results.push({
      rank,
      gymnastId: entry.gymnastId,
      gymnastName: entry.gymnastName,
      clubId: entry.clubId,
      clubName: entry.clubName,
      categoryId: entry.categoryId,
      categoryName: entry.categoryName,
      apparatusScores: entry.apparatusScores,
      totalScore: entry.totalScore,
      totalEScore: entry.totalEScore,
      tieBreakInfo,
      medal,
      statusNote: entry.statusNote,
      isEligible: true,
    })
  }

  return results
}

/**
 * Computes Apparatus Standings for a single apparatus.
 * Can be filtered by categoryId.
 * 
 * FIG Rule for Vault (VT) Event Finals:
 * If a gymnast performs two vaults (attempt 1 and attempt 2), the final score
 * is the arithmetic average of both vaults: (V1 + V2) / 2.
 * Other apparatuses (UB, BB, FX) only use attempt 1.
 * 
 * FIG Official Tiebreaker Cascade for Apparatus:
 * 1. Higher E-score average (Ejecución).
 * 2. Higher D-score (Dificultad).
 * 3. In Vault (VT): Highest single vault final score.
 * 4. Unbroken tie: Shared rank and medal.
 */
export function computeApparatusStandings(
  scores: GymnastScoreEntry[],
  apparatusCode: string,
  categoryId?: string
): ApparatusStanding[] {
  const filtered = scores.filter(
    (s) =>
      s.apparatusCode === apparatusCode &&
      (s.status === 'official_approved' || s.status === 'provisional') &&
      (!categoryId || s.categoryId === categoryId)
  )

  let gymnastEntries: {
    gymnastId: string
    gymnastName: string
    clubId: string
    clubName: string
    categoryId?: string
    categoryName?: string
    dScore: number
    eScoreAvg: number
    aScore?: number
    timeSeconds?: number
    penaltySeconds?: number
    finalScore: number
    vaultAttempts?: {
      attempt1?: { dScore: number; eScoreAvg: number; finalScore: number }
      attempt2?: { dScore: number; eScoreAvg: number; finalScore: number }
    }
  }[] = []

  if (apparatusCode === 'VT') {
    // Group by gymnastId to handle 2 vault attempts for event finals
    const gymnastVaultMap = new Map<
      string,
      {
        gymnastName: string
        clubId: string
        clubName: string
        categoryId?: string
        categoryName?: string
        attempt1?: GymnastScoreEntry
        attempt2?: GymnastScoreEntry
      }
    >()

    for (const s of filtered) {
      if (!gymnastVaultMap.has(s.gymnastId)) {
        gymnastVaultMap.set(s.gymnastId, {
          gymnastName: s.gymnastName,
          clubId: s.clubId,
          clubName: s.clubName,
          categoryId: s.categoryId,
          categoryName: s.categoryName,
        })
      }
      const g = gymnastVaultMap.get(s.gymnastId)!
      const att = s.attemptNumber ?? 1
      if (att === 2) {
        g.attempt2 = s
      } else {
        g.attempt1 = s
      }
    }

    gymnastEntries = Array.from(gymnastVaultMap.entries()).map(([gymnastId, g]) => {
      let finalScore = 0
      let dScore = 0
      let eScoreAvg = 0

      if (g.attempt1 && g.attempt2) {
        // FIG Rule: Event Finals Vault score = arithmetic mean of Vault 1 and Vault 2
        finalScore = Math.round(((g.attempt1.finalScore + g.attempt2.finalScore) / 2) * 1000) / 1000
        dScore = Math.round(((g.attempt1.dScore + g.attempt2.dScore) / 2) * 1000) / 1000
        eScoreAvg = Math.round(((g.attempt1.eScoreAvg + g.attempt2.eScoreAvg) / 2) * 1000) / 1000
      } else if (g.attempt1) {
        finalScore = g.attempt1.finalScore
        dScore = g.attempt1.dScore
        eScoreAvg = g.attempt1.eScoreAvg
      } else if (g.attempt2) {
        finalScore = g.attempt2.finalScore
        dScore = g.attempt2.dScore
        eScoreAvg = g.attempt2.eScoreAvg
      }

      return {
        gymnastId,
        gymnastName: g.gymnastName,
        clubId: g.clubId,
        clubName: g.clubName,
        categoryId: g.categoryId,
        categoryName: g.categoryName,
        dScore,
        eScoreAvg,
        aScore: undefined as number | undefined,
        timeSeconds: undefined as number | undefined,
        penaltySeconds: undefined as number | undefined,
        finalScore,
        vaultAttempts: {
          attempt1: g.attempt1 ? { dScore: g.attempt1.dScore, eScoreAvg: g.attempt1.eScoreAvg, finalScore: g.attempt1.finalScore } : undefined,
          attempt2: g.attempt2 ? { dScore: g.attempt2.dScore, eScoreAvg: g.attempt2.eScoreAvg, finalScore: g.attempt2.finalScore } : undefined,
        },
      }
    })
  } else {
    // For other apparatuses (UB, BB, FX, GR, TRA, AER, ACRO, PK), attempt 1 is used
    gymnastEntries = filtered
      .filter((s) => (s.attemptNumber ?? 1) === 1)
      .map((entry) => ({
        gymnastId: entry.gymnastId,
        gymnastName: entry.gymnastName,
        clubId: entry.clubId,
        clubName: entry.clubName,
        categoryId: entry.categoryId,
        categoryName: entry.categoryName,
        dScore: entry.dScore,
        eScoreAvg: entry.eScoreAvg,
        aScore: entry.aScore,
        timeSeconds: entry.timeSeconds,
        penaltySeconds: entry.penaltySeconds,
        finalScore: entry.finalScore,
      }))
  }

  const isTimeBased = apparatusCode === 'SPD' || filtered.some((s) => s.timeSeconds !== undefined)

  // Apparatus FIG Comparator
  const compareApparatus = (
    a: (typeof gymnastEntries)[0],
    b: (typeof gymnastEntries)[0]
  ): { diff: number; reason?: string } => {
    // Specialized Parkour Speed Logic (Least Time Wins)
    if (isTimeBased) {
      if (Math.abs(a.finalScore - b.finalScore) > 0.0001) {
        return { diff: a.finalScore - b.finalScore }
      }
      // Tiebreak 1: Fewer penalty seconds
      const aPen = a.penaltySeconds ?? 0
      const bPen = b.penaltySeconds ?? 0
      if (Math.abs(aPen - bPen) > 0.0001) {
        return {
          diff: aPen - bPen,
          reason: `Desempate Parkour: Menos segundos de penalización (${Math.min(aPen, bPen).toFixed(3)}s vs ${Math.max(aPen, bPen).toFixed(3)}s)`,
        }
      }
      return { diff: 0, reason: 'Empate oficial compartido (Tiempos y penalizaciones idénticos)' }
    }

    // 0. Primary: Final Score (Highest Wins)
    if (Math.abs(b.finalScore - a.finalScore) > 0.0001) {
      return { diff: b.finalScore - a.finalScore }
    }

    // Step 1: Higher E-score average
    if (Math.abs(b.eScoreAvg - a.eScoreAvg) > 0.0001) {
      return {
        diff: b.eScoreAvg - a.eScoreAvg,
        reason: `Desempate FIG: Mayor nota de Ejecución E (${Math.max(a.eScoreAvg, b.eScoreAvg).toFixed(3)} vs ${Math.min(a.eScoreAvg, b.eScoreAvg).toFixed(3)})`,
      }
    }

    // Step 2: Higher D-score
    if (Math.abs(b.dScore - a.dScore) > 0.0001) {
      return {
        diff: b.dScore - a.dScore,
        reason: `Desempate FIG: Mayor nota de Dificultad D (${Math.max(a.dScore, b.dScore).toFixed(3)} vs ${Math.min(a.dScore, b.dScore).toFixed(3)})`,
      }
    }

    // Step 3 (Vault VT only): Highest single vault score
    if (apparatusCode === 'VT' && a.vaultAttempts && b.vaultAttempts) {
      const aBest = Math.max(a.vaultAttempts.attempt1?.finalScore ?? 0, a.vaultAttempts.attempt2?.finalScore ?? 0)
      const bBest = Math.max(b.vaultAttempts.attempt1?.finalScore ?? 0, b.vaultAttempts.attempt2?.finalScore ?? 0)
      if (Math.abs(bBest - aBest) > 0.0001) {
        return {
          diff: bBest - aBest,
          reason: `Desempate FIG Salto: Mejor salto individual (${Math.max(aBest, bBest).toFixed(3)} vs ${Math.min(aBest, bBest).toFixed(3)})`,
        }
      }
    }

    return { diff: 0, reason: 'Empate oficial compartido (Criterios FIG idénticos)' }
  }

  gymnastEntries.sort((a, b) => compareApparatus(a, b).diff)

  const results: ApparatusStanding[] = []
  let previousRank = 1

  for (let i = 0; i < gymnastEntries.length; i++) {
    const entry = gymnastEntries[i]
    let rank = i + 1
    let tieBreakInfo: string | undefined

    if (i > 0) {
      const prev = gymnastEntries[i - 1]
      const comparison = compareApparatus(entry, prev)

      if (comparison.diff === 0) {
        rank = previousRank
        tieBreakInfo = isTimeBased ? 'Empate en tiempo compartido (Reglamento FIG Parkour)' : 'Empate compartido (Reglamento FIG)'
      } else {
        if (Math.abs(entry.finalScore - prev.finalScore) < 0.0001) {
          tieBreakInfo = comparison.reason
        }
        previousRank = rank
      }
    } else {
      previousRank = 1
    }

    let medal: ApparatusStanding['medal']
    if (rank === 1) medal = 'gold'
    else if (rank === 2) medal = 'silver'
    else if (rank === 3) medal = 'bronze'

    results.push({
      rank,
      apparatusCode,
      ...entry,
      isTimeBased,
      unit: isTimeBased ? 's' : 'pts',
      tieBreakInfo,
      medal,
    })
  }

  return results
}

export interface TeamComputeOptions {
  categoryId?: string
  participationProfiles?:
    | Map<string, AthleteParticipationProfile>
    | Record<string, AthleteParticipationProfile>
}

/**
 * Computes Team Standings (Top N scores per apparatus for each club).
 * Fully configurable:
 * - Top N configurable (Top 2, Top 3, Top 4, etc.).
 * - Minimum gymnasts required to constitute a valid team.
 * - Incomplete teams handling (eligible with status note or excluded).
 * - Mandatory apparatuses for team totals.
 * - Multi-rule tie-breaking (FIG Team cascade, Total Team E-Score, Ex-Aequo).
 * - FIG Rule: Only attempt 1 of Vault counts for Team Total.
 * - Total backward compatibility with default topNScoresPerApparatus = 3.
 */
export function computeTeamStandings(
  scores: GymnastScoreEntry[],
  topNScoresOrConfig: number | TeamRulesConfig = 3,
  options?: TeamComputeOptions
): TeamStanding[] {
  const config: TeamRulesConfig =
    typeof topNScoresOrConfig === 'number'
      ? {
          teamScoringMode: 'top_n_per_apparatus',
          topNScoresPerApparatus: topNScoresOrConfig,
          minGymnastsPerTeam: 1,
          allowIncompleteTeams: true,
          mandatoryTeamApparatuses: [],
          tieBreakRule: 'fig_team',
        }
      : topNScoresOrConfig

  const categoryIdFilter = options?.categoryId

  const getParticipation = (gymnastId: string): AthleteParticipationProfile | undefined => {
    if (!options?.participationProfiles) return undefined
    if (options.participationProfiles instanceof Map) {
      return options.participationProfiles.get(gymnastId)
    }
    return (options.participationProfiles as Record<string, AthleteParticipationProfile>)[gymnastId]
  }

  const valid = scores.filter((s) => {
    if (s.status !== 'official_approved' && s.status !== 'provisional') return false
    if ((s.attemptNumber ?? 1) !== 1) return false
    if (categoryIdFilter && s.categoryId !== categoryIdFilter) return false

    // Participation checks
    const part = getParticipation(s.gymnastId)
    if (part) {
      if (part.registrationStatus === 'rejected') return false
      if (part.attendanceStatus === 'absent') return false
      if (part.sportsParticipationStatus === 'disqualified') return false
    }

    return true
  })

  // Group by club -> apparatus -> array of { finalScore, eScoreAvg }
  const clubMap = new Map<
    string,
    {
      clubName: string
      gymnastIds: Set<string>
      scoresByApparatus: Map<string, { finalScore: number; eScoreAvg: number }[]>
    }
  >()

  for (const s of valid) {
    if (!clubMap.has(s.clubId)) {
      clubMap.set(s.clubId, {
        clubName: s.clubName,
        gymnastIds: new Set(),
        scoresByApparatus: new Map(),
      })
    }

    const club = clubMap.get(s.clubId)!
    club.gymnastIds.add(s.gymnastId)

    if (!club.scoresByApparatus.has(s.apparatusCode)) {
      club.scoresByApparatus.set(s.apparatusCode, [])
    }
    club.scoresByApparatus.get(s.apparatusCode)!.push({
      finalScore: s.finalScore,
      eScoreAvg: s.eScoreAvg,
    })
  }

  // Calculate sum of top N scores for each apparatus
  const standings = Array.from(clubMap.entries())
    .map(([clubId, data]) => {
      let grandTotal = 0
      let grandTotalE = 0
      const apparatusTotals: Record<string, number> = {}

      const hasMinGymnasts = data.gymnastIds.size >= (config.minGymnastsPerTeam || 1)
      let hasMandatory = true

      if (config.mandatoryTeamApparatuses && config.mandatoryTeamApparatuses.length > 0) {
        for (const mApp of config.mandatoryTeamApparatuses) {
          if (!data.scoresByApparatus.has(mApp) || data.scoresByApparatus.get(mApp)!.length === 0) {
            hasMandatory = false
            break
          }
        }
      }

      const isComplete = hasMinGymnasts && hasMandatory
      let statusNote: string | undefined
      if (!hasMinGymnasts) {
        statusNote = `Equipo incompleto (${data.gymnastIds.size}/${config.minGymnastsPerTeam} gimnastas)`
      } else if (!hasMandatory) {
        statusNote = 'Equipo incompleto (Aparatos obligatorios faltantes)'
      }

      // If incomplete teams not allowed, exclude or flag
      if (!isComplete && !config.allowIncompleteTeams) {
        return null
      }

      for (const [appCode, appScores] of data.scoresByApparatus.entries()) {
        // Sort descending by finalScore and take top N
        const topScores = [...appScores]
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, config.topNScoresPerApparatus)

        const appSum = Math.round(topScores.reduce((acc, curr) => acc + curr.finalScore, 0) * 1000) / 1000
        const appESum = Math.round(topScores.reduce((acc, curr) => acc + curr.eScoreAvg, 0) * 1000) / 1000

        apparatusTotals[appCode] = appSum
        grandTotal = Math.round((grandTotal + appSum) * 1000) / 1000
        grandTotalE = Math.round((grandTotalE + appESum) * 1000) / 1000
      }

      return {
        clubId,
        clubName: data.clubName,
        totalScore: grandTotal,
        totalEScore: grandTotalE,
        apparatusTotals,
        participatingGymnastsCount: data.gymnastIds.size,
        isComplete,
        statusNote,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  // Team Comparator with configurable tie-break rules
  const compareTeams = (
    a: (typeof standings)[0],
    b: (typeof standings)[0]
  ): { diff: number; reason?: string } => {
    // 0. Primary: Total Score
    if (Math.abs(b.totalScore - a.totalScore) > 0.0001) {
      return { diff: b.totalScore - a.totalScore }
    }

    if (config.tieBreakRule === 'shared_ex_aequo') {
      return { diff: 0, reason: 'Empate de equipos compartido (Sin desempate secundario)' }
    }

    if (config.tieBreakRule === 'total_team_e') {
      if (Math.abs(b.totalEScore - a.totalEScore) > 0.0001) {
        return {
          diff: b.totalEScore - a.totalEScore,
          reason: `Desempate Equipos por Ejecución: Mayor nota E total (${Math.max(a.totalEScore, b.totalEScore).toFixed(3)} vs ${Math.min(a.totalEScore, b.totalEScore).toFixed(3)})`,
        }
      }
      return { diff: 0, reason: 'Empate de equipos compartido (Puntuaciones y notas E idénticas)' }
    }

    // Default: FIG Team Tie-Break (Official Section 2 Art. 5.3)
    const aVals = Object.values(a.apparatusTotals).sort((x, y) => y - x)
    const bVals = Object.values(b.apparatusTotals).sort((x, y) => y - x)
    const maxM = Math.max(aVals.length, bVals.length)

    // Step 1: If 4 or more apparatuses, sum of top 3 (in GAF) or top 5 (in GAM)
    if (maxM >= 4) {
      const bestCount = maxM >= 6 ? 5 : 3
      const aSumBest = Math.round(aVals.slice(0, bestCount).reduce((acc, curr) => acc + curr, 0) * 1000) / 1000
      const bSumBest = Math.round(bVals.slice(0, bestCount).reduce((acc, curr) => acc + curr, 0) * 1000) / 1000
      if (Math.abs(bSumBest - aSumBest) > 0.0001) {
        return {
          diff: bSumBest - aSumBest,
          reason: `Desempate FIG Equipos: Suma ${bestCount} mejores aparatos (${Math.max(aSumBest, bSumBest).toFixed(3)} vs ${Math.min(aSumBest, bSumBest).toFixed(3)})`,
        }
      }
    }

    // Highest single apparatus total
    const aTop1 = aVals[0] ?? 0
    const bTop1 = bVals[0] ?? 0
    if (Math.abs(bTop1 - aTop1) > 0.0001) {
      return {
        diff: bTop1 - aTop1,
        reason: `Desempate FIG Equipos: Mayor total en un solo aparato (${Math.max(aTop1, bTop1).toFixed(3)} vs ${Math.min(aTop1, bTop1).toFixed(3)})`,
      }
    }

    return { diff: 0, reason: 'Empate de equipos compartido (Criterios FIG idénticos)' }
  }

  standings.sort((a, b) => compareTeams(a, b).diff)

  const results: TeamStanding[] = []
  let previousRank = 1

  for (let i = 0; i < standings.length; i++) {
    const entry = standings[i]
    let rank = i + 1
    let tieBreakInfo: string | undefined

    if (i > 0) {
      const prev = standings[i - 1]
      const comparison = compareTeams(entry, prev)

      if (comparison.diff === 0) {
        rank = previousRank
        tieBreakInfo = comparison.reason || 'Empate de equipos compartido'
      } else {
        if (Math.abs(entry.totalScore - prev.totalScore) < 0.0001) {
          tieBreakInfo = comparison.reason
        }
        previousRank = rank
      }
    } else {
      previousRank = 1
    }

    let trophy: TeamStanding['trophy']
    if (rank === 1) trophy = '1st'
    else if (rank === 2) trophy = '2nd'
    else if (rank === 3) trophy = '3rd'

    results.push({
      rank,
      clubId: entry.clubId,
      clubName: entry.clubName,
      totalScore: entry.totalScore,
      apparatusTotals: entry.apparatusTotals,
      participatingGymnastsCount: entry.participatingGymnastsCount,
      tieBreakInfo,
      trophy,
      isComplete: entry.isComplete,
      statusNote: entry.statusNote,
    })
  }

  return results
}
