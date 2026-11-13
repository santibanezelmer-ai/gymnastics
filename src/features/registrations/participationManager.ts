/**
 * OPERIX GYMNASTICS — MÓDULO DE CONTROL DE PARTICIPACIÓN Y TRAZABILIDAD
 *
 * Administra los estados operativos independientes de los deportistas:
 * 1. Estado de Inscripción (Pendiente, Confirmado, Rechazado).
 * 2. Estado de Asistencia (Presente, Ausente / DNS).
 * 3. Estado de Participación Deportiva (Activo, Retirado / DNF, Descalificado / DSQ, Finalizado).
 * 4. Estado de Puntuación (Sin notas, En progreso, Completado).
 *
 * Garantiza inmutabilidad histórica: los cambios de estado NO eliminan puntuaciones previas.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import type {
  AthleteParticipationProfile,
  AttendanceStatus,
  ParticipationStatusLog,
  RegistrationStatus,
  ScoringOperationalStatus,
  SportsParticipationStatus,
} from '@/core/types/competitionRules'

const PARTICIPATION_STORAGE_PREFIX = 'operix_athlete_participation_'

export class ParticipationManager {
  private championshipId: string
  private profiles: Map<string, AthleteParticipationProfile> = new Map()

  constructor(championshipId: string) {
    this.championshipId = championshipId
    this.loadFromStorage()
  }

  private getStorageKey(): string {
    return `${PARTICIPATION_STORAGE_PREFIX}${this.championshipId}`
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      const raw = window.localStorage.getItem(this.getStorageKey())
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, AthleteParticipationProfile>
        for (const [k, v] of Object.entries(parsed)) {
          this.profiles.set(k, v)
        }
      }
    } catch {
      // Ignorar fallos de parsing en entornos locales/tests
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      const obj: Record<string, AthleteParticipationProfile> = {}
      for (const [k, v] of this.profiles.entries()) {
        obj[k] = v
      }
      window.localStorage.setItem(this.getStorageKey(), JSON.stringify(obj))
    } catch {
      // Ignorar fallos de storage
    }
  }

  /**
   * Obtiene o inicializa el perfil de participación de un gimnasta inscrito.
   */
  public getOrCreateProfile(params: {
    registrationId: string
    gymnastId: string
    gymnastName: string
    clubId: string
    clubName: string
    initialRegistrationStatus?: RegistrationStatus
  }): AthleteParticipationProfile {
    const existing = this.profiles.get(params.registrationId)
    if (existing) return existing

    const newProfile: AthleteParticipationProfile = {
      registrationId: params.registrationId,
      gymnastId: params.gymnastId,
      gymnastName: params.gymnastName,
      clubId: params.clubId,
      clubName: params.clubName,
      registrationStatus: params.initialRegistrationStatus || 'confirmed',
      attendanceStatus: 'present',
      sportsParticipationStatus: 'active',
      scoringStatus: 'no_scores',
      lastUpdated: new Date().toISOString(),
      statusLogs: [],
    }

    this.profiles.set(params.registrationId, newProfile)
    this.saveToStorage()
    return newProfile
  }

  /**
   * Registra una transición de estado con auditoría inmutable de usuario, fecha y motivo.
   */
  public updateStatus(params: {
    registrationId: string
    field: 'registrationStatus' | 'attendanceStatus' | 'sportsParticipationStatus'
    newValue: RegistrationStatus | AttendanceStatus | SportsParticipationStatus
    reason: string
    userId: string
    userName: string
  }): AthleteParticipationProfile {
    const profile = this.profiles.get(params.registrationId)
    if (!profile) {
      throw new Error(`No se encontró registro con ID ${params.registrationId}`)
    }

    const previousValue = profile[params.field]
    if (previousValue === params.newValue) {
      return profile // Sin cambios necesarios
    }

    const logEntry: ParticipationStatusLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      registrationId: params.registrationId,
      timestamp: new Date().toISOString(),
      changedByUserId: params.userId,
      changedByName: params.userName,
      fieldChanged: params.field,
      previousValue,
      newValue: params.newValue,
      reason: params.reason || 'Actualización operativa por mesa de control',
    }

    if (params.field === 'registrationStatus') {
      profile.registrationStatus = params.newValue as RegistrationStatus
    } else if (params.field === 'attendanceStatus') {
      profile.attendanceStatus = params.newValue as AttendanceStatus
    } else if (params.field === 'sportsParticipationStatus') {
      profile.sportsParticipationStatus = params.newValue as SportsParticipationStatus
    }

    profile.lastUpdated = logEntry.timestamp
    profile.statusLogs.push(logEntry)

    this.profiles.set(params.registrationId, profile)
    this.saveToStorage()
    return profile
  }

  /**
   * Actualiza el estado operativo de puntuaciones sin alterar la participación deportiva.
   */
  public updateScoringStatus(registrationId: string, status: ScoringOperationalStatus): void {
    const profile = this.profiles.get(registrationId)
    if (profile) {
      profile.scoringStatus = status
      profile.lastUpdated = new Date().toISOString()
      this.profiles.set(registrationId, profile)
      this.saveToStorage()
    }
  }

  /**
   * Retorna todos los perfiles de participación registrados para el campeonato.
   */
  public getAllProfiles(): AthleteParticipationProfile[] {
    return Array.from(this.profiles.values())
  }

  /**
   * Determina si un gimnasta es elegible para participar en la competición All-Around.
   */
  public isEligibleForAllAround(registrationId: string): { eligible: boolean; reason?: string } {
    const profile = this.profiles.get(registrationId)
    if (!profile) return { eligible: true }

    if (profile.registrationStatus === 'rejected') {
      return { eligible: false, reason: 'Inscripción rechazada' }
    }
    if (profile.attendanceStatus === 'absent') {
      return { eligible: false, reason: 'Ausente (DNS - No presentado)' }
    }
    if (profile.sportsParticipationStatus === 'disqualified') {
      return { eligible: false, reason: 'Descalificado (DSQ)' }
    }
    return { eligible: true }
  }
}
