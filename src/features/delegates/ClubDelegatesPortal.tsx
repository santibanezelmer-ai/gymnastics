/**
 * OPERIX GYMNASTICS — PORTAL PRIVADO PARA CLUBES Y DELEGADOS ACREDITADOS
 *
 * Entorno restringido y seguro para representantes de clubes, delegados y entrenadores.
 *
 * Características:
 * - Autenticación obligatoria y verificación de pertenencia a un club inscrito.
 * - Acceso exclusivo a la información operativa del PROPIO club:
 *   * Gimnastas inscritos por el club y sus dorsales.
 *   * Categorías, niveles y subdivisiones.
 *   * Grupos de competición y rotaciones olímpicas (VT, UB, BB, FX).
 *   * Orden de salida y horarios estimados por aparato.
 *   * Trazabilidad de cambios y avisos del comité técnico.
 * - AISLAMIENTO MULTI-TENANT ESTRICTO:
 *   * Ningún club puede ver gimnastas, rotaciones ni órdenes de paso de otros clubes.
 *   * Las rotaciones NO son visibles para usuarios anónimos ni usuarios no acreditados.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/AuthContext'
import { useOrganization } from '@/features/organizations/OrganizationContext'
import { AuthForm } from '@/features/auth/AuthForm'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  Users,
  Clock,
  Printer,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import type { Championship } from '@/core/types/championship'
import {
  inferModality,
  isApparatusValidForDiscipline,
  type ModalityCode,
} from '@/core/gymnastics/apparatusCatalog'

export interface ClubDelegatesPortalProps {
  onNavigateToPublic?: (slug: string) => void
  onNavigateHome?: () => void
}

export interface ClubGymnastRotation {
  registrationId: string
  gymnastId: string
  fullName: string
  bibNumber: number
  categoryName: string
  discipline: string
  subdivision: string
  rotationGroup: string
  startingApparatus: string
  startOrder: number
}

export interface ApparatusStep {
  rotationNumber: number
  apparatusCode: string
  apparatusName: string
  estimatedTime: string
  athletesOrder: { bibNumber: number; fullName: string; startOrder: number }[]
}

export const ClubDelegatesPortal: React.FC<ClubDelegatesPortalProps> = ({
  onNavigateToPublic,
  onNavigateHome,
}) => {
  const { user, profile } = useAuth()
  const { activeRole } = useOrganization()

  const [championships, setChampionships] = useState<Championship[]>([])
  const [selectedChampId, setSelectedChampId] = useState<string>('')
  const [selectedClubId, setSelectedClubId] = useState<string>('')
  const [userClubs, setUserClubs] = useState<{ id: string; name: string; code: string }[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
  const [authChecked, setAuthChecked] = useState<boolean>(false)

  // Datos específicos del club
  const [clubName, setClubName] = useState<string>('')
  const [clubCode, setClubCode] = useState<string>('')
  const [gymnasts, setGymnasts] = useState<ClubGymnastRotation[]>([])
  const [selectedBranch, setSelectedBranch] = useState<ModalityCode>('GAF')
  const [gafScheduleSteps, setGafScheduleSteps] = useState<ApparatusStep[]>([])
  const [gamScheduleSteps, setGamScheduleSteps] = useState<ApparatusStep[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('15/11/2026, 08:00 hrs')
  const notices = [
    '08:00 - 08:15 hrs: Apertura Gimnasio Municipal y acreditación de delegaciones.',
    '08:15 - 09:00 hrs: Calentamiento General y Prueba de Aparatos (Grupo A Femenina).',
    '09:00 - 09:30 hrs: Desfile Oficial de Delegaciones, Himno Nacional y Juramento Gimnasta (Presencia obligatoria de todos los clubes).',
    '09:30 - 11:15 hrs: Competición Grupo A Femenina (GAF) en 4 cuadrantes olímpicos.',
    '12:00 - 13:00 hrs: Competición Oficial Rama Masculina (GAM) — Suelo (FX) y Salto (VT).',
    '13:00 - 14:00 hrs: Ceremonia de Premiación Grupo A Femenina y Rama Masculina GAM.',
    '14:00 - 15:00 hrs: Calentamiento General y Prueba de Aparatos (Grupo B Femenina).',
    '15:00 - 16:45 hrs: Competición Grupo B Femenina (GAF) en 4 cuadrantes olímpicos.',
    '17:30 - 18:30 hrs: Ceremonia de Premiación Grupo B Femenina y Gran Copa por Equipos.',
  ]

  // 1. Cargar lista de campeonatos disponibles
  useEffect(() => {
    async function loadChampionships() {
      try {
        const { data } = await supabase
          .from('championships')
          .select('id, name, slug, status, venue_name, start_date, end_date')
          .order('start_date', { ascending: false })

        if (data && data.length > 0) {
          const mapped: Championship[] = data.map((d) => ({
            id: d.id,
            organizationId: '',
            name: d.name,
            slug: d.slug,
            startDate: d.start_date,
            endDate: d.end_date,
            venueName: d.venue_name || undefined,
            visibility: 'public',
            status: d.status,
            rulesetVersion: 'FIG 2025-2028',
            scoringSchemaVersion: '',
            createdAt: '',
            updatedAt: '',
          }))
          setChampionships(mapped)
          setSelectedChampId(mapped[0].id)
        } else {
          setChampionships([])
          setSelectedChampId('')
        }
      } catch (err) {
        console.error('Error cargando campeonatos:', err)
        setChampionships([])
        setSelectedChampId('')
      }
    }
    loadChampionships()
  }, [])

  // 2. Verificar membresía del usuario en clubes y acreditación en el campeonato
  useEffect(() => {
    async function verifyClubAccreditation() {
      if (!user) {
        setIsAuthorized(false)
        setAuthChecked(true)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Si el usuario es platform_admin u org_admin, tiene acceso de auditoría y gestión
        const isPlatformAdmin = profile?.platformRole === 'platform_admin'
        const isOrgAdmin = activeRole === 'org_admin' || activeRole === 'competition_manager'

        // Consultar a qué clubes pertenece el usuario en club_members
        const { data: memberClubs } = await (supabase as any)
          .from('club_members')
          .select('club_id, role, clubs ( id, name, code )')
          .eq('user_id', user.id)

        let resolvedClubs: { id: string; name: string; code: string }[] = []

        if (memberClubs && memberClubs.length > 0) {
          resolvedClubs = memberClubs
            .map((mc: any) => mc.clubs)
            .filter(Boolean)
            .map((cl: any) => ({
              id: cl.id,
              name: cl.name,
              code: cl.code,
            }))
        } else if (isPlatformAdmin || isOrgAdmin) {
          // Administradores pueden supervisar o seleccionar cualquier club acreditado
          const { data: allClubs } = await supabase
            .from('clubs')
            .select('id, name, code')
            .limit(5)

          if (allClubs && allClubs.length > 0) {
            resolvedClubs = allClubs
          }
        }

        // Si no se encontraron membresías de club autorizadas para este usuario
        if (resolvedClubs.length === 0) {
          setUserClubs([])
          setSelectedClubId('')
          setClubName('')
          setClubCode('')
          setIsAuthorized(false)
          setGymnasts([])
          return
        }

        setUserClubs(resolvedClubs)
        setSelectedClubId(resolvedClubs[0]?.id || '')
        setClubName(resolvedClubs[0]?.name || '')
        setClubCode(resolvedClubs[0]?.code || '')
        setIsAuthorized(true)
      } catch (err) {
        console.error('Error verificando acreditación:', err)
        setIsAuthorized(false)
      } finally {
        setAuthChecked(true)
        setIsLoading(false)
      }
    }

    verifyClubAccreditation()
  }, [user, profile, activeRole])

  // 3. Cargar la programación y rotaciones EXCLUSIVAS del club seleccionado
  const loadClubRotations = useCallback(
    async (champId: string, clubId: string) => {
      if (!champId || !clubId) return

      // Validación estricta en el cliente para no consultar clubes ajenos
      const isPlatformAdmin = profile?.platformRole === 'platform_admin'
      const isOrgAdmin = activeRole === 'org_admin' || activeRole === 'competition_manager'
      const isPermitted = isPlatformAdmin || isOrgAdmin || userClubs.some((c) => c.id === clubId)

      if (!isPermitted) {
        console.warn('Acceso denegado a rotaciones de otro club:', clubId)
        setGymnasts([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Invocar la RPC segura get_my_club_rotations en Supabase pasando p_club_id
        const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
          'get_my_club_rotations',
          { p_championship_id: champId, p_club_id: clubId }
        )

        let athleteList: ClubGymnastRotation[] = []

        if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
          // Filtrar rigurosamente solo por el clubId del usuario
          athleteList = rpcData
            .filter((r: any) => r.club_id === clubId || userClubs.some((uc) => uc.id === r.club_id))
            .map((r: any) => {
              const gymMod = inferModality({
                discipline: r.discipline,
                name: r.category_name,
                gender: r.gender,
              })
              let startingApp = r.starting_apparatus
              if (!startingApp || !isApparatusValidForDiscipline(gymMod, startingApp)) {
                startingApp = gymMod === 'GAM' ? 'FX' : 'VT'
              }
              return {
                registrationId: r.registration_id,
                gymnastId: r.gymnast_id,
                fullName: `${r.first_name} ${r.last_name}`,
                bibNumber: r.bib_number || 101,
                categoryName: r.category_name || (gymMod === 'GAM' ? 'GAM Senior' : 'FIG Senior'),
                discipline: gymMod,
                subdivision: r.subdivision || (gymMod === 'GAM' ? 'Varones' : 'Subdivisión 1'),
                rotationGroup: r.rotation_group || (gymMod === 'GAM' ? 'Grupo GAM' : 'Grupo A'),
                startingApparatus: startingApp,
                startOrder: r.start_order || 1,
              }
            })
        } else {
          // Consulta directa filtrada estrictamente por club_id
          const { data: directData } = await supabase
            .from('registrations')
            .select(`
              id,
              bib_number,
              rotation_group,
              subdivision,
              starting_apparatus,
              start_order,
              gymnasts ( id, first_name, last_name, gender ),
              categories ( name, discipline )
            `)
            .eq('championship_id', champId)
            .eq('club_id', clubId)
            .eq('status', 'approved')

          if (directData && directData.length > 0) {
            athleteList = directData.map((d: any, idx: number) => {
              const gym = d.gymnasts
              const cat = d.categories
              const gymMod = inferModality({
                discipline: cat?.discipline,
                name: cat?.name,
                gender: gym?.gender,
              })
              let startingApp = d.starting_apparatus
              if (!startingApp || !isApparatusValidForDiscipline(gymMod, startingApp)) {
                startingApp = gymMod === 'GAM' ? 'FX' : 'VT'
              }
              return {
                registrationId: d.id,
                gymnastId: gym?.id || d.id,
                fullName: gym ? `${gym.first_name} ${gym.last_name}` : `Gimnasta ${idx + 1}`,
                bibNumber: d.bib_number || 101 + idx,
                categoryName: cat?.name || (gymMod === 'GAM' ? 'GAM Senior' : 'FIG Senior'),
                discipline: gymMod,
                subdivision: d.subdivision || (gymMod === 'GAM' ? 'Varones' : 'Subdivisión 1'),
                rotationGroup: d.rotation_group || (gymMod === 'GAM' ? 'Grupo GAM' : 'Grupo A'),
                startingApparatus: startingApp,
                startOrder: d.start_order || idx + 1,
              }
            })
          } else {
            athleteList = []
          }
        }

        setGymnasts(athleteList)

        // Segregación estricta GAM vs GAF para la hoja de ruta olímpica
        const gafAthletes = athleteList.filter((a) => a.discipline === 'GAF')
        const gamAthletes = athleteList.filter((a) => a.discipline === 'GAM')

        // Auto-seleccionar rama según gimnastas presentes en el club
        if (gafAthletes.length === 0 && gamAthletes.length > 0) {
          setSelectedBranch('GAM')
        } else {
          setSelectedBranch('GAF')
        }

        // Obtener el nombre del club actual para determinar su cuadrante oficial
        const currentClub = userClubs.find((c) => c.id === clubId)
        const activeClubName = currentClub?.name || clubName || ''
        const normClub = activeClubName.toLowerCase()

        // Secuencia oficial de 4 aparatos GAF según el cuadrante del club
        let gafAppSequence = [
          { code: 'VT', name: 'Salto de Caballo' },
          { code: 'UB', name: 'Barras Asimétricas' },
          { code: 'BB', name: 'Viga de Equilibrio' },
          { code: 'FX', name: 'Suelo (Manos Libres)' },
        ]

        if (normClub.includes('big bang') || normClub.includes('paillaco')) {
          // Cuadrante Suelo (FX -> VT -> BB -> UB)
          gafAppSequence = [
            { code: 'FX', name: 'Suelo (Manos Libres)' },
            { code: 'VT', name: 'Salto de Caballo' },
            { code: 'BB', name: 'Viga de Equilibrio' },
            { code: 'UB', name: 'Barras Asimétricas' },
          ]
        } else if (normClub.includes('acrodan') || normClub.includes('ainilebu')) {
          // Cuadrante Salto (VT -> BB -> UB -> FX)
          gafAppSequence = [
            { code: 'VT', name: 'Salto de Caballo' },
            { code: 'BB', name: 'Viga de Equilibrio' },
            { code: 'UB', name: 'Barras Asimétricas' },
            { code: 'FX', name: 'Suelo (Manos Libres)' },
          ]
        } else if (normClub.includes('claude') || normClub.includes('felmer') || normClub.includes('lyc')) {
          // Cuadrante Viga (BB -> UB -> FX -> VT)
          gafAppSequence = [
            { code: 'BB', name: 'Viga de Equilibrio' },
            { code: 'UB', name: 'Barras Asimétricas' },
            { code: 'FX', name: 'Suelo (Manos Libres)' },
            { code: 'VT', name: 'Salto de Caballo' },
          ]
        } else if (normClub.includes('olimpo') || normClub.includes('eleve') || normClub.includes('élevé')) {
          // Cuadrante Asimétricas (UB -> FX -> VT -> BB)
          gafAppSequence = [
            { code: 'UB', name: 'Barras Asimétricas' },
            { code: 'FX', name: 'Suelo (Manos Libres)' },
            { code: 'VT', name: 'Salto de Caballo' },
            { code: 'BB', name: 'Viga de Equilibrio' },
          ]
        }

        // Horarios estándar para los 4 pasos del circuito GAF (Grupo A: 09:30-11:15 o Grupo B: 15:00-16:45)
        const isExclusivelyPM = normClub.includes('paillaco')
        const gafTimeSlots = isExclusivelyPM
          ? ['15:00 - 15:25', '15:25 - 15:50', '15:50 - 16:15', '16:15 - 16:45']
          : ['09:30 - 09:55', '09:55 - 10:20', '10:20 - 10:45', '10:45 - 11:15']

        const computedGafSteps: ApparatusStep[] = gafAppSequence.map((app, rotIdx) => ({
          rotationNumber: rotIdx + 1,
          apparatusCode: app.code,
          apparatusName: app.name,
          estimatedTime: gafTimeSlots[rotIdx] || '09:30 - 10:15',
          athletesOrder: gafAthletes.map((ath, aIdx) => ({
            bibNumber: ath.bibNumber,
            fullName: ath.fullName,
            startOrder: aIdx + 1,
          })),
        }))
        setGafScheduleSteps(computedGafSteps)

        // Hoja de ruta GAM oficial Paillaco 2026:
        // Horario único: 12:00 a 13:00 hrs.
        // Aparatos oficiales habilitados: Suelo (FX) y Salto (VT).
        // (Paralelas PB sólo si compite gimnasta Nivel Libre como Thomas Martínez).
        const hasNivelLibreGAM = gamAthletes.some((a) =>
          a.categoryName.toLowerCase().includes('libre') || a.fullName.toLowerCase().includes('thomas')
        )

        const gamApps = [
          { code: 'FX', name: 'Suelo (Manos Libres)', time: '12:00 - 12:30' },
          { code: 'VT', name: 'Salto', time: '12:30 - 13:00' },
        ]
        if (hasNivelLibreGAM) {
          gamApps.push({ code: 'PB', name: 'Barras Paralelas (Nivel Libre)', time: '13:00 - 13:10' })
        }

        const computedGamSteps: ApparatusStep[] = gamApps.map((app, rotIdx) => ({
          rotationNumber: rotIdx + 1,
          apparatusCode: app.code,
          apparatusName: app.name,
          estimatedTime: app.time,
          athletesOrder: gamAthletes.map((ath, aIdx) => ({
            bibNumber: ath.bibNumber,
            fullName: ath.fullName,
            startOrder: aIdx + 1,
          })),
        }))
        setGamScheduleSteps(computedGamSteps)
      } catch (err) {
        console.error('Error cargando rotaciones del club:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [userClubs, clubCode]
  )

  useEffect(() => {
    if (selectedChampId && selectedClubId) {
      loadClubRotations(selectedChampId, selectedClubId)
    }
  }, [selectedChampId, selectedClubId, loadClubRotations])

  // 4. Suscripción Realtime para avisos de cambios de rotación del campeonato
  useEffect(() => {
    if (!selectedChampId) return

    const channel = supabase
      .channel(`champ-schedule-updates-${selectedChampId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'championships',
          filter: `id=eq.${selectedChampId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.schedule_updated_at) {
            setLastUpdated(new Date(payload.new.schedule_updated_at).toLocaleString('es-CL'))
            if (selectedClubId) {
              loadClubRotations(selectedChampId, selectedClubId)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChampId, selectedClubId, loadClubRotations])

  // Manejar cambio de club si el usuario pertenece a más de uno
  const handleClubChange = (clubId: string) => {
    setSelectedClubId(clubId)
    const found = userClubs.find((c) => c.id === clubId)
    if (found) {
      setClubName(found.name)
      setClubCode(found.code)
    }
  }

  const selectedChampionship = championships.find((c) => c.id === selectedChampId)

  // -------------------------------------------------------------------------
  // VISTA 1: USUARIO NO AUTENTICADO
  // -------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 font-sans">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Portal Privado de Delegaciones</h1>
            <p className="text-xs text-slate-400">
              Ingresa con tus credenciales de delegado o entrenador oficial para acceder a las rotaciones de tu club.
            </p>
          </div>

          <AuthForm />

          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a la Página Principal</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // VISTA 2: CARGANDO
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-20 flex flex-col items-center justify-center font-sans">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
        <p className="mt-3 text-xs font-bold text-slate-400">Verificando credenciales de delegación...</p>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // VISTA 3: ACCESO DENEGADO / NO ACREDITADO
  // -------------------------------------------------------------------------
  if (authChecked && !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-4 sm:px-6 font-sans">
        <div className="max-w-lg mx-auto rounded-3xl border border-rose-900/60 bg-slate-950 p-8 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-white">Acceso Restringido a Rotaciones</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tu cuenta ({user.email}) no registra una membresía acreditada como delegado o entrenador de un club
            inscrito en este campeonato.
          </p>
          <p className="text-xs text-slate-500">
            Por estrictas normas de seguridad FIG y confidencialidad multi-tenant, las rotaciones, horarios y
            órdenes de salida solo son visibles para las delegaciones autorizadas.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Ir al Panel General
              </button>
            )}
            {onNavigateToPublic && selectedChampionship && (
              <button
                type="button"
                onClick={() => onNavigateToPublic(selectedChampionship.slug)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
              >
                Ver Resultados Públicos
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // VISTA 3: PORTAL PRIVADO AUTORIZADO
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Barra Superior de Control Privado */}
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Panel</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black tracking-tight text-white">
                Operix Gymnastics · Portal de Delegados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToPublic && selectedChampionship && (
              <button
                type="button"
                onClick={() => onNavigateToPublic(selectedChampionship.slug)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Ver Portal Público</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-slate-300" />
              <span className="hidden sm:inline">Imprimir Hoja de Pista</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Banner de Identificación del Club Acreditado */}
        <div className="rounded-3xl border border-blue-900/60 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/30 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="outline" className="text-[11px] font-bold text-emerald-400 border-emerald-500/40">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Delegación Oficial Acreditada
                </Badge>
                <span className="rounded-md bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-300">
                  Código: {clubCode}
                </span>
                <span className="rounded-md bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  Aislamiento Multi-Tenant Activo
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  {clubName || 'Mi Club'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <span>Delegado Responsable:</span>
                  <strong className="text-slate-200">{profile?.fullName || user.email}</strong>
                  <span>· Rol: Delegado Técnico</span>
                </p>
              </div>
            </div>

            {/* Selectores de Campeonato y Club */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {userClubs.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Cambiar Mi Club
                  </label>
                  <select
                    value={selectedClubId}
                    onChange={(e) => handleClubChange(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
                  >
                    {userClubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Campeonato
                </label>
                <select
                  value={selectedChampId}
                  onChange={(e) => setSelectedChampId(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none min-w-[200px]"
                >
                  {championships.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Barra de Última Actualización */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>Última actualización de programación por Comité Técnico:</span>
              <strong className="text-white font-mono">{lastUpdated}</strong>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Rotaciones confirmadas para competencia
            </span>
          </div>
        </div>

        {/* Notificaciones y Avisos de la Organización */}
        {notices.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Bell className="h-4 w-4" />
              Avisos Importantes de la Mesa de Control y Cronograma
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-amber-200/90 pl-6 list-disc">
              {notices.map((notice, idx) => (
                <li key={idx}>{notice}</li>
              ))}
            </ul>
          </div>
        )}

        {gymnasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-950 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Aún no hay rotaciones oficiales asignadas para {clubName || 'este club'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                El comité técnico y la mesa de control están configurando el orden de paso y las subdivisiones del torneo. La programación de rotaciones aparecerá aquí tan pronto como sea publicada oficialmente.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Métricas Resumen del Club y Segregación GAM / GAF */}
            {(() => {
              const gafAthletes = gymnasts.filter((a) => a.discipline === 'GAF')
              const gamAthletes = gymnasts.filter((a) => a.discipline === 'GAM')
              const currentSteps = selectedBranch === 'GAM' ? gamScheduleSteps : gafScheduleSteps
              const currentBranchAthletes = selectedBranch === 'GAM' ? gamAthletes : gafAthletes

              return (
                <>
                  {/* Selector de Rama GAM / GAF si el club tiene ambas ramas */}
                  {gafAthletes.length > 0 && gamAthletes.length > 0 && (
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedBranch('GAF')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedBranch === 'GAF'
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <span>Rama Femenina (GAF)</span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold">
                          {gafAthletes.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBranch('GAM')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedBranch === 'GAM'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <span>Rama Masculina (GAM)</span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold">
                          {gamAthletes.length}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Gimnastas Inscritos
                      </span>
                      <p className="text-2xl font-black text-white">{gymnasts.length}</p>
                      <p className="text-[11px] text-slate-400">
                        {gafAthletes.length} GAF · {gamAthletes.length} GAM
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Subdivisión ({selectedBranch})
                      </span>
                      <p className="text-2xl font-black text-blue-400">
                        {selectedBranch === 'GAM' ? 'Bloque Varones' : (currentBranchAthletes[0]?.subdivision || 'Subdivisión 1')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {selectedBranch === 'GAM' ? 'Jornada 12:00 a 13:00 hrs' : 'Jornada Oficial GAF'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Grupo de Rotación
                      </span>
                      <p className="text-2xl font-black text-indigo-400">
                        {selectedBranch === 'GAM' ? 'Grupo GAM' : (currentBranchAthletes[0]?.rotationGroup || 'Grupo A')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Aparato Inicio: {selectedBranch === 'GAM' ? 'Suelo (FX)' : (gafScheduleSteps[0]?.apparatusName ? `${gafScheduleSteps[0].apparatusName} (${gafScheduleSteps[0].apparatusCode})` : 'Salto (VT)')}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Hora de Presentación
                      </span>
                      <p className="text-2xl font-black text-emerald-400">
                        {selectedBranch === 'GAM' ? '12:00 hrs' : '09:00 hrs'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {selectedBranch === 'GAM' ? 'Desfile 09:00 hrs · Premiación 13:00 hrs' : 'Desfile de Delegaciones'}
                      </p>
                    </div>
                  </div>

                  {/* SECCIÓN 1: HOJA DE RUTA OLÍMPICA Y HORARIOS POR APARATO */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2">
                          <RotateCw className="h-5 w-5 text-blue-400" />
                          Hoja de Ruta de Competición & Horarios Estimados por Aparato
                        </h2>
                        <p className="text-xs text-slate-400">
                          Secuencia oficial de rotaciones del club para {selectedBranch === 'GAM' ? 'Varones (GAM)' : 'Damas (GAF)'} ·{' '}
                          {selectedBranch === 'GAM' ? 'Bloque Varones (12:00 a 13:00 hrs)' : `Grupo ${currentBranchAthletes[0]?.rotationGroup || 'A'}`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                        selectedBranch === 'GAM'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800'
                      }`}>
                        <Sparkles className="h-3.5 w-3.5" />
                        {selectedBranch === 'GAM' ? 'Aparatos Oficiales GAM: Suelo y Salto (12:00 a 13:00 hrs)' : '4 Aparatos Oficiales GAF: Salto, Asimétricas, Viga y Suelo'}
                      </span>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedBranch === 'GAM' ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                      {currentSteps.map((step) => (
                        <div
                          key={step.rotationNumber}
                          className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-sm relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="rounded-md bg-blue-950 border border-blue-800 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                              Rotación {step.rotationNumber}
                            </span>
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {step.estimatedTime}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Aparato Asignado
                            </span>
                            <h3 className="text-base font-black text-white mt-0.5">
                              {step.apparatusName} ({step.apparatusCode})
                            </h3>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Orden de Salida del Club ({step.athletesOrder.length} atletas)
                            </span>
                            {step.athletesOrder.length === 0 ? (
                              <p className="text-xs text-slate-500 italic py-1">Sin atletas asignados a este turno.</p>
                            ) : (
                              <ul className="space-y-1.5">
                                {step.athletesOrder.map((ath) => (
                                  <li
                                    key={ath.bibNumber}
                                    className="flex items-center justify-between text-xs rounded-lg bg-slate-900/80 px-2.5 py-1.5 border border-slate-800/60"
                                  >
                                    <span className="font-bold text-white flex items-center gap-1.5">
                                      <span className="text-[10px] text-slate-400">#{ath.startOrder}</span>
                                      {ath.fullName}
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-blue-400">
                                      Dorsal {ath.bibNumber}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )
            })()}

        {/* SECCIÓN 2: NÓMINA DE GIMNASTAS INSCRITOS Y ASIGNACIONES */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Nómina Oficial de Deportistas de {clubName}
              </h2>
              <p className="text-xs text-slate-400">
                Gimnastas aprobados por el comité organizador con sus dorsales asignados
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-slate-300 border-slate-700 self-start sm:self-auto">
              {gymnasts.length} Gimnastas
            </Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-4 py-3">Dorsal (Bib)</th>
                  <th className="px-4 py-3">Gimnasta</th>
                  <th className="px-4 py-3">Categoría / Nivel</th>
                  <th className="px-4 py-3 text-center">Subdivisión</th>
                  <th className="px-4 py-3 text-center">Grupo Rotación</th>
                  <th className="px-4 py-3 text-center">Aparato Inicial</th>
                  <th className="px-4 py-3 text-center">Orden Salida</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 text-slate-200">
                {gymnasts.map((gym) => (
                  <tr key={gym.registrationId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-400">
                      #{gym.bibNumber}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{gym.fullName}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{gym.categoryName}</span>
                        {gym.discipline === 'GAM' ? (
                          <span className="rounded bg-blue-950 border border-blue-700/80 px-1.5 py-0.2 text-[9px] font-black text-blue-300">
                            GAM (Varones)
                          </span>
                        ) : (
                          <span className="rounded bg-rose-950 border border-rose-700/80 px-1.5 py-0.2 text-[9px] font-black text-rose-300">
                            GAF (Damas)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {gym.subdivision}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-400">
                      {gym.rotationGroup}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                        gym.discipline === 'GAM'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800'
                      }`}>
                        {gym.startingApparatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-300">
                      #{gym.startOrder}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                        Aprobado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </main>

      {/* Pie de Página */}
      <footer className="mt-20 border-t border-slate-800 bg-slate-950 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="h-3.5 w-3.5 text-blue-500" />
            <span>Zona Restringida · Aislamiento Multi-Tenant Oficial Operix Gymnastics</span>
          </div>
          <div>
            Desarrollado por <strong className="text-slate-300 font-bold">Comercial Hels SpA</strong>
          </div>
        </div>
      </footer>
    </div>
  )
}
