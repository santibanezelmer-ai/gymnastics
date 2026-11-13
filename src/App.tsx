import React, { useState } from 'react'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import { OrganizationProvider, useOrganization } from '@/features/organizations/OrganizationContext'
import { TenantSwitcher } from '@/features/organizations/TenantSwitcher'
import { ChampionshipsManager } from '@/features/championships/ChampionshipsManager'
import { DelegationsManager } from '@/features/delegations/DelegationsManager'
import { ScoringPad } from '@/features/scoring/ScoringPad'
import { LiveStandingsBoard } from '@/features/standings/LiveStandingsBoard'
import { HeadJudgeView } from '@/features/views/HeadJudgeView'
import { ClubManagerView } from '@/features/views/ClubManagerView'
import { SubscriptionPlansView } from '@/features/billing/SubscriptionPlansView'
import { CompetitionScheduleView } from '@/features/schedule/CompetitionScheduleView'
import { ReportsManager } from '@/features/reports/ReportsManager'
import { AwardsManager } from '@/features/awards/AwardsManager'
import { LandingPage, type LandingPageProps } from '@/features/landing/LandingPage'
import { MarketingLanding } from '@/features/marketing/MarketingLanding'
import { PublicChampionshipPortal } from '@/features/public-portal/PublicChampionshipPortal'
import { PublicEventsDirectory } from '@/features/public-portal/PublicEventsDirectory'
import { PublicAthletesRoster } from '@/features/public-portal/PublicAthletesRoster'
import { ClubDelegatesPortal } from '@/features/delegates/ClubDelegatesPortal'
import { AdminDashboardOverview } from '@/features/dashboard/AdminDashboardOverview'
import { ArenaTVDisplay } from '@/features/standings/ArenaTVDisplay'
import { useRouter } from '@/lib/router'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  LogOut,
  Building2,
  Users,
  Award,
  Flame,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Calendar,
  BookOpen,
  Lock,
  Tv,
} from 'lucide-react'

interface DashboardContentProps {
  navigate: (to: string) => void
  initialTab?:
    | 'overview'
    | 'championships'
    | 'delegations'
    | 'judging'
    | 'schedule'
    | 'standings'
    | 'awards'
    | 'reports'
    | 'billing'
    | 'club_rotations'
    | 'arena_tv'
  /** Vista inicial de la puerta de acceso cuando no hay sesión (login, juez con PIN, en vivo). */
  landingMode?: LandingPageProps['initialMode']
}

const DashboardContent: React.FC<DashboardContentProps> = ({ navigate, initialTab = 'overview', landingMode }) => {
  const { user, profile, signOut, signInDevAdmin } = useAuth()
  const { activeOrganization, activeRole, organizations } = useOrganization()
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'championships'
    | 'delegations'
    | 'athletes'
    | 'judging'
    | 'schedule'
    | 'standings'
    | 'awards'
    | 'reports'
    | 'billing'
    | 'club_rotations'
    | 'arena_tv'
  >(initialTab)

  React.useEffect(() => {
    if (import.meta.env.DEV && initialTab === 'championships' && !user) {
      signInDevAdmin()
      setActiveTab('championships')
    }
  }, [initialTab, user, signInDevAdmin])

  type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'outline'

  const roleBadgeStyles: Record<string, { label: string; variant: BadgeVariant }> = {
    org_admin: { label: 'Administrador Org', variant: 'danger' },
    head_judge: { label: 'Juez Árbitro', variant: 'warning' },
    judge: { label: 'Juez de Aparato', variant: 'outline' },
    club_manager: { label: 'Delegado de Club', variant: 'success' },
    coach: { label: 'Entrenador', variant: 'default' },
    viewer: { label: 'Observador', variant: 'outline' },
  }

  const currentRoleInfo: { label: string; variant: BadgeVariant } = activeRole && roleBadgeStyles[activeRole]
    ? roleBadgeStyles[activeRole]
    : { label: activeRole || 'Sin Rol', variant: 'outline' }

  // Cuando no hay sesión de usuario, presentar directamente la Landing Page Comercial Rediseñada
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white px-4 sm:px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <LandingPage
            initialMode={landingMode}
            onBackHome={landingMode ? () => navigate('/') : undefined}
            onOpenPublicPortal={(slug) => navigate(`/evento/${slug || 'artistica-paillaco-2026'}`)}
            onOpenClubRotations={() => navigate('/club/rotaciones')}
          />
        </div>
      </div>
    )
  }

  // Si el usuario no pertenece a la organización organizadora del torneo (es un Delegado de Club),
  // se le presenta de forma exclusiva y aislada el Portal de Delegaciones de Club.
  // Evita mezclar información y funciones de la organización del campeonato con los clubes participantes.
  if (user && !activeOrganization && profile?.platformRole !== 'platform_admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
        <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">Operix Gymnastics</h1>
                <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">Portal Delegación</Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Acceso Oficial para Clubes & Entrenadores
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/evento/artistica-paillaco-2026')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Trophy className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">Portal Público</span>
            </button>
            <div className="text-right hidden sm:block border-l border-slate-800 pl-3">
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[150px]">
                {profile?.fullName || user.email}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Delegado de Club</span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              title="Cerrar Sesión"
              className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <ClubDelegatesPortal
            onNavigateToPublic={(slug) => navigate(`/evento/${slug}`)}
            onNavigateHome={() => navigate('/')}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900">Operix Gymnastics</h1>
                <span className="rounded-md bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 tracking-wide">
                  FIG 2025-2028
                </span>
                {profile?.platformRole === 'platform_admin' && (
                  <Badge variant="danger" className="text-[10px] py-0 px-1.5">SuperAdmin</Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Plataforma de Campeonatos & Puntuación Oficial de Gimnasia
              </p>
            </div>
          </div>

          {/* User Controls, Portals & Tenant Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Links: Portal Público, Nómina y Rotaciones de Club */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/evento/artistica-paillaco-2026')}
                title="Ver Portal Público del Campeonato"
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <Trophy className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">Portal Público</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('athletes')}
                title="Consultar Nómina Oficial de 153 Gimnastas (GAM y GAF)"
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Nómina (153)</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/club/rotaciones')}
                title="Acceso Privado a Rotaciones de Mi Club"
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                <Lock className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Rotaciones Club</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('arena_tv')}
                title="Transmisión Oficial Arena TV para Pantallas de Estadio"
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <Tv className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">Arena TV</span>
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                <TenantSwitcher />
                <div className="text-right hidden sm:block border-l border-slate-200 pl-3">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                    {profile?.fullName || user.email}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <Badge variant={currentRoleInfo.variant} className="text-[9px] py-0 px-1.5 font-bold">
                      {currentRoleInfo.label}
                    </Badge>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Cerrar Sesión"
                  className="rounded-xl border border-slate-200/90 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={() => {
                      signInDevAdmin()
                      setActiveTab('championships')
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                  >
                    <Trophy className="h-3.5 w-3.5 text-blue-600" />
                    <span>Módulo Campeonatos (Dev)</span>
                  </button>
                )}
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Acceso Público & Torneos
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scoped Navigation Tabs Bar */}
        {user && activeOrganization && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto py-2 text-xs scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel Principal</span>
              </button>

              {(activeRole === 'org_admin' || activeRole === 'club_manager' || profile?.platformRole === 'platform_admin') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('championships')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    activeTab === 'championships'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  <span>{activeRole === 'club_manager' ? 'Organizar Torneos' : 'Campeonatos'}</span>
                </button>
              )}

              {(activeRole === 'org_admin' || activeRole === 'club_manager' || profile?.platformRole === 'platform_admin') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('delegations')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    activeTab === 'delegations'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>{activeRole === 'club_manager' ? 'Mi Club & Inscripciones' : 'Clubes & Deportistas'}</span>
                </button>
              )}

              {(activeRole === 'club_manager' || activeRole === 'coach' || activeRole === 'org_admin' || profile?.platformRole === 'platform_admin') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('club_rotations')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    activeTab === 'club_rotations'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>Rotaciones de Mi Club</span>
                </button>
              )}

              {(activeRole === 'org_admin' || activeRole === 'head_judge' || activeRole === 'judge' || profile?.platformRole === 'platform_admin') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('judging')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    activeTab === 'judging'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>{activeRole === 'head_judge' ? 'Consola Juez Árbitro' : 'Mesa de Jurado FIG'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('athletes')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  activeTab === 'athletes'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Nómina Deportistas (153)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Cronograma & Pista</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('standings')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all relative ${
                  activeTab === 'standings'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Flame className={`h-4 w-4 ${activeTab === 'standings' ? 'text-amber-300' : 'text-orange-500'}`} />
                <span>Resultados en Vivo</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('awards')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  activeTab === 'awards'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Premiación & Podios</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Result Book & Documentos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('arena_tv')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  activeTab === 'arena_tv'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>Arena TV</span>
              </button>

              {(activeRole === 'org_admin' || profile?.platformRole === 'platform_admin') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('billing')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    activeTab === 'billing'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Zap className={`h-4 w-4 ${activeTab === 'billing' ? 'text-amber-300' : 'text-amber-500'}`} />
                  <span>Planes SaaS</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
            {/* Modern Organization Command Center Banner */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-slate-50/70 to-blue-50/20 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Organización Activa
                    </span>
                    <Badge variant={currentRoleInfo.variant} className="text-[10px] font-bold">
                      {currentRoleInfo.label}
                    </Badge>
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      Plan: {activeOrganization?.billingPlan?.toUpperCase() || 'FREE'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> Aislamiento RLS Activo
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {activeOrganization ? activeOrganization.name : 'No tienes una organización seleccionada'}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {activeOrganization ? activeOrganization.id : 'N/A'} · Slug: {activeOrganization?.slug || 'N/A'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-slate-200 text-xs shadow-2xs">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Membresías:</span>
                    <strong className="text-slate-900 font-bold">{organizations.length}</strong>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-slate-200 text-xs shadow-2xs">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span className="text-slate-600">Motor FIG:</span>
                    <strong className="text-emerald-700 font-bold">2025-2028 Conforme</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: Scoped by active view & user role */}
            {activeTab === 'overview' && (
              <AdminDashboardOverview
                onNavigateTab={(t) => setActiveTab(t)}
                onOpenPublicPortal={(slug) => navigate(`/evento/${slug || 'artistica-paillaco-2026'}`)}
              />
            )}

            {activeTab === 'arena_tv' && (
              <ArenaTVDisplay onClose={() => setActiveTab('overview')} />
            )}

            {activeTab === 'championships' && <ChampionshipsManager />}
            {activeTab === 'athletes' && (
              <div className="space-y-6">
                <PublicAthletesRoster
                  theme="light"
                  title="Nómina Oficial de Deportistas — Paillaco 2026"
                  subtitle="153 gimnastas inscritos y acreditados oficialmente: 16 GAM (Varones) y 137 GAF (Damas) de 10 clubes"
                  showHeroStats={true}
                />
              </div>
            )}
            {activeTab === 'delegations' && (
              activeRole === 'club_manager' ? (
                <ClubManagerView onCreateChampionship={() => setActiveTab('championships')} />
              ) : (
                <DelegationsManager />
              )
            )}
            {activeTab === 'club_rotations' && (
              <ClubDelegatesPortal
                onNavigateToPublic={(slug) => navigate(`/evento/${slug}`)}
                onNavigateHome={() => setActiveTab('overview')}
              />
            )}
            {activeTab === 'judging' && (
              <div className="space-y-8">
                {activeRole === 'head_judge' && <HeadJudgeView />}
                <ScoringPad />
              </div>
            )}
            {activeTab === 'schedule' && <CompetitionScheduleView />}
            {activeTab === 'standings' && <LiveStandingsBoard />}
            {activeTab === 'awards' && <AwardsManager />}
            {activeTab === 'reports' && <ReportsManager />}
            {activeTab === 'billing' && <SubscriptionPlansView />}
          </div>
      </main>

      {/* Platform Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-600">
            <Trophy className="h-4 w-4 text-blue-700" />
            <span className="font-bold text-slate-900">Operix Gymnastics</span>
            <span>· Sistema Oficial FIG 2025-2028</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Desarrollado por <strong className="text-slate-800 font-bold">Comercial Hels SpA</strong>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const App: React.FC = () => {
  const { route, navigate } = useRouter()

  // 1. RUTA CARTELERA PÚBLICA DE EVENTOS: /evento o /eventos (sin slug)
  if ((route.path === '/evento' || route.path === '/eventos') && !route.params.slug) {
    return (
      <AuthProvider>
        <OrganizationProvider>
          <PublicEventsDirectory
            navigate={navigate}
            onSelectEvent={(slug) => navigate(`/evento/${slug}`)}
          />
        </OrganizationProvider>
      </AuthProvider>
    )
  }

  // 2. RUTA PÚBLICA: /evento/:slug o /eventos/:slug (Portal Público del Campeonato)
  if ((route.path === '/evento' || route.path === '/eventos') && route.params.slug) {
    return (
      <AuthProvider>
        <OrganizationProvider>
          <PublicChampionshipPortal
            slug={route.params.slug}
            onNavigateToDelegates={() => navigate('/club/rotaciones')}
            onNavigateHome={() => navigate('/')}
            onNavigateToEvents={() => navigate('/evento')}
          />
        </OrganizationProvider>
      </AuthProvider>
    )
  }

  // 2. RUTA PRIVADA: /club/rotaciones (Portal Privado para Clubes y Delegados)
  if (route.path === '/club/rotaciones') {
    return (
      <AuthProvider>
        <OrganizationProvider>
          <ClubDelegatesPortal
            onNavigateToPublic={(slug) => navigate(`/evento/${slug}`)}
            onNavigateHome={() => navigate('/')}
          />
        </OrganizationProvider>
      </AuthProvider>
    )
  }

  // 3. RUTA CAMPEONATOS: /campeonatos (Módulo de Campeonatos)
  if (route.path === '/campeonatos') {
    return (
      <AuthProvider>
        <OrganizationProvider>
          <DashboardContent navigate={navigate} initialTab="championships" />
        </OrganizationProvider>
      </AuthProvider>
    )
  }

  // 4. RUTA ARENA TV: /arena o /tv (Transmisión para Pantallas Gigantes de Estadio)
  if (route.path === '/arena' || route.path === '/tv') {
    return (
      <AuthProvider>
        <OrganizationProvider>
          <ArenaTVDisplay onClose={() => navigate('/')} />
        </OrganizationProvider>
      </AuthProvider>
    )
  }

  // 5. ACCESOS DIRECTOS: /ingresar, /juez, /en-vivo (puerta de acceso sin sesión)
  const gateModes: Record<string, LandingPageProps['initialMode']> = {
    '/ingresar': 'login',
    '/juez': 'fast_judge',
    '/en-vivo': 'live_standings',
  }
  if (route.path in gateModes) {
    return (
      <AuthProvider>
        <OrganizationProvider>
          <DashboardContent navigate={navigate} landingMode={gateModes[route.path]} />
        </OrganizationProvider>
      </AuthProvider>
    )
  }

  // 6. RUTA GENERAL: landing de marketing sin sesión, panel con sesión
  return (
    <AuthProvider>
      <OrganizationProvider>
        <HomeRoute navigate={navigate} />
      </OrganizationProvider>
    </AuthProvider>
  )
}

/** En "/" muestra la landing de marketing a visitantes y el panel a usuarios con sesión. */
const HomeRoute: React.FC<{ navigate: (to: string) => void }> = ({ navigate }) => {
  const { user } = useAuth()
  if (user) {
    return <DashboardContent navigate={navigate} />
  }
  return <MarketingLanding navigate={navigate} />
}

export default App
