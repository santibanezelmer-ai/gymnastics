/**
 * OPERIX GYMNASTICS — NÓMINA OFICIAL DE DEPORTISTAS (GAM Y GAF)
 *
 * Módulo público y de consulta oficial que presenta la nómina completa de gimnastas
 * inscritos y acreditados (153 deportistas: 16 GAM varones y 137 GAF damas).
 *
 * Cumplimiento estricto de privacidad y protección de menores:
 * - Se exhiben exclusivamente datos deportivos públicos: Dorsal (#Bib), Nombre, Club,
 *   Disciplina (GAM/GAF), Categoría deportiva y Subdivisión de pista.
 * - Cero exposición de RUT, fecha de nacimiento o información de contacto.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Users,
  Search,
  ShieldCheck,
  Building2,
  RotateCw,
  LayoutGrid,
  List,
  CheckCircle2,
} from 'lucide-react'

export interface PublishedAthlete {
  id: string
  bibNumber: number
  gymnastId: string
  firstName: string
  lastName: string
  fullName: string
  gender: 'male' | 'female'
  discipline: 'GAM' | 'GAF'
  clubId: string
  clubName: string
  clubCode: string
  clubCity?: string
  categoryId: string
  categoryName: string
  subdivision?: string
  status: string
}

export interface PublicAthletesRosterProps {
  championshipId?: string
  championshipSlug?: string
  theme?: 'dark' | 'light'
  title?: string
  subtitle?: string
  showHeroStats?: boolean
  initialDiscipline?: 'ALL' | 'GAM' | 'GAF'
  onSelectAthlete?: (athlete: PublishedAthlete) => void
}

export const PublicAthletesRoster: React.FC<PublicAthletesRosterProps> = ({
  championshipId,
  championshipSlug,
  theme = 'dark',
  title = 'Nómina Oficial de Deportistas',
  subtitle = 'Atletas inscritos y acreditados en Gimnasia Artística Masculina (GAM) y Femenina (GAF)',
  showHeroStats = true,
  initialDiscipline = 'ALL',
  onSelectAthlete,
}) => {
  const [athletes, setAthletes] = useState<PublishedAthlete[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filtros
  const [disciplineFilter, setDisciplineFilter] = useState<'ALL' | 'GAM' | 'GAF'>(initialDiscipline)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [clubFilter, setClubFilter] = useState<string>('ALL')
  const [subdivisionFilter, setSubdivisionFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Cargar registros desde Supabase
  const loadAthletes = async () => {
    try {
      setIsLoading(true)
      setErrorMsg(null)

      let champId = championshipId

      // Si no tenemos championshipId pero sí slug, buscar el id
      if (!champId && championshipSlug) {
        const { data: champData } = await supabase
          .from('championships')
          .select('id')
          .eq('slug', championshipSlug)
          .maybeSingle()
        if (champData) {
          champId = champData.id
        }
      }

      // Consulta de registros con relaciones
      let query = supabase
        .from('registrations')
        .select(`
          id,
          bib_number,
          rotation_group,
          subdivision,
          status,
          gymnasts (
            id,
            first_name,
            last_name,
            gender
          ),
          clubs (
            id,
            name,
            code,
            city
          ),
          categories (
            id,
            name,
            discipline,
            gender
          )
        `)
        .order('bib_number', { ascending: true })

      if (champId) {
        query = query.eq('championship_id', champId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error al consultar nómina de atletas:', error)
        setErrorMsg('No fue posible cargar la nómina de deportistas.')
        setAthletes([])
        return
      }

      if (data && data.length > 0) {
        const mapped: PublishedAthlete[] = (data as any[]).map((row) => {
          const gym = row.gymnasts
          const club = row.clubs
          const cat = row.categories

          const rawGender = (gym?.gender || cat?.gender || 'female').toLowerCase()
          const isMale = rawGender === 'male' || rawGender === 'm' || rawGender === 'varon' || rawGender === 'varones'
          const discipline: 'GAM' | 'GAF' =
            cat?.discipline === 'GAM' || isMale ? 'GAM' : 'GAF'

          const firstName = gym?.first_name || 'Gimnasta'
          const lastName = gym?.last_name || ''
          const fullName = `${firstName} ${lastName}`.trim()

          return {
            id: row.id,
            bibNumber: row.bib_number ? Number(row.bib_number) : 0,
            gymnastId: gym?.id || row.id,
            firstName,
            lastName,
            fullName,
            gender: isMale ? 'male' : 'female',
            discipline,
            clubId: club?.id || 'sin-club',
            clubName: club?.name || 'Club Deportivo',
            clubCode: club?.code || 'CLUB',
            clubCity: club?.city,
            categoryId: cat?.id || 'general',
            categoryName: cat?.name || 'Categoría General',
            subdivision: row.subdivision || 'General',
            status: row.status || 'approved',
          }
        })

        // Ordenar por dorsal #Bib ascendente
        mapped.sort((a, b) => a.bibNumber - b.bibNumber)
        setAthletes(mapped)
      } else {
        setAthletes([])
      }
    } catch (err: any) {
      console.error('Error inesperado cargando atletas:', err)
      setErrorMsg('Ocurrió un error al cargar la lista de deportistas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAthletes()
  }, [championshipId, championshipSlug])

  // Estadísticas generales de la nómina
  const stats = useMemo(() => {
    const total = athletes.length
    const gam = athletes.filter((a) => a.discipline === 'GAM').length
    const gaf = athletes.filter((a) => a.discipline === 'GAF').length

    const uniqueClubs = new Set(athletes.map((a) => a.clubName))
    const uniqueCategories = new Set(athletes.map((a) => a.categoryName))

    return {
      total,
      gam,
      gaf,
      clubsCount: uniqueClubs.size,
      categoriesCount: uniqueCategories.size,
    }
  }, [athletes])

  // Listas únicas para los dropdowns
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(athletes.map((a) => a.categoryName))).filter(Boolean)
    return cats.sort()
  }, [athletes])

  const availableClubs = useMemo(() => {
    const cls = Array.from(new Set(athletes.map((a) => a.clubName))).filter(Boolean)
    return cls.sort()
  }, [athletes])

  const availableSubdivisions = useMemo(() => {
    const subs = Array.from(new Set(athletes.map((a) => a.subdivision))).filter(Boolean) as string[]
    return subs.sort()
  }, [athletes])

  // Atletas filtrados
  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      // Filtro disciplina
      if (disciplineFilter !== 'ALL' && athlete.discipline !== disciplineFilter) {
        return false
      }

      // Filtro categoría
      if (categoryFilter !== 'ALL' && athlete.categoryName !== categoryFilter) {
        return false
      }

      // Filtro club
      if (clubFilter !== 'ALL' && athlete.clubName !== clubFilter) {
        return false
      }

      // Filtro subdivisión
      if (subdivisionFilter !== 'ALL' && athlete.subdivision !== subdivisionFilter) {
        return false
      }

      // Filtro búsqueda por texto (Dorsal, Nombre, Apellido, Club)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesBib = athlete.bibNumber.toString().includes(q)
        const matchesName = athlete.fullName.toLowerCase().includes(q)
        const matchesClub = athlete.clubName.toLowerCase().includes(q)
        const matchesCode = athlete.clubCode.toLowerCase().includes(q)
        const matchesCat = athlete.categoryName.toLowerCase().includes(q)

        if (!matchesBib && !matchesName && !matchesClub && !matchesCode && !matchesCat) {
          return false
        }
      }

      return true
    })
  }, [athletes, disciplineFilter, categoryFilter, clubFilter, subdivisionFilter, searchQuery])

  // Estilos condicionales según tema (dark vs light)
  const isDark = theme === 'dark'
  const containerBg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
  const cardBg = isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500'
  const borderPrimary = isDark ? 'border-slate-800' : 'border-slate-200'
  const tableHeaderBg = isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'
  const tableRowHover = isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-100/70'

  return (
    <div className={`space-y-6 ${containerBg}`}>
      {/* ---------------------------------------------------------------------
          HERO STATS & RESUMEN DE NÓMINA (153 ATLETAS: 16 GAM · 137 GAF)
          --------------------------------------------------------------------- */}
      {showHeroStats && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <Users className="h-4 w-4" />
                </span>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${textPrimary}`}>
                  {title}
                </h2>
              </div>
              <p className={`text-xs sm:text-sm ${textSecondary} mt-1`}>
                {subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Acreditación Oficial FIG
              </span>
              <button
                type="button"
                onClick={loadAthletes}
                title="Actualizar nómina"
                className={`p-2 rounded-xl border ${borderPrimary} ${cardBg} ${textSecondary} hover:${textPrimary} transition-colors`}
              >
                <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tarjetas de Resumen Numérico */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Atletas */}
            <div className={`rounded-2xl border ${borderPrimary} ${cardBg} p-4 space-y-1`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Total Inscritos</span>
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${textPrimary}`}>
                {stats.total}
              </p>
              <p className="text-[11px] text-slate-400">100% en lista oficial</p>
            </div>

            {/* GAM - Gimnasia Masculina */}
            <div
              onClick={() => setDisciplineFilter('GAM')}
              className={`rounded-2xl border p-4 space-y-1 cursor-pointer transition-all ${
                disciplineFilter === 'GAM'
                  ? 'border-blue-500 bg-blue-950/40 shadow-sm ring-1 ring-blue-500/50'
                  : `${borderPrimary} ${cardBg} hover:border-blue-500/50`
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span>GAM (Varones)</span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                  #101 - #116
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-400">
                {stats.gam}
              </p>
              <p className="text-[11px] text-slate-400">Gimnastas masculinos</p>
            </div>

            {/* GAF - Gimnasia Femenina */}
            <div
              onClick={() => setDisciplineFilter('GAF')}
              className={`rounded-2xl border p-4 space-y-1 cursor-pointer transition-all ${
                disciplineFilter === 'GAF'
                  ? 'border-fuchsia-500 bg-fuchsia-950/40 shadow-sm ring-1 ring-fuchsia-500/50'
                  : `${borderPrimary} ${cardBg} hover:border-fuchsia-500/50`
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-fuchsia-400">
                <span>GAF (Damas)</span>
                <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                  #117 - #253
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-fuchsia-400">
                {stats.gaf}
              </p>
              <p className="text-[11px] text-slate-400">Gimnastas femeninas</p>
            </div>

            {/* Clubes & Categorías */}
            <div className={`rounded-2xl border ${borderPrimary} ${cardBg} p-4 space-y-1`}>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Clubes & Niveles</span>
                <Building2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${textPrimary}`}>
                {stats.clubsCount} <span className="text-sm font-semibold text-slate-400">clubes</span>
              </p>
              <p className="text-[11px] text-slate-400">{stats.categoriesCount} categorías deportivas</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          FILTROS INTERACTIVOS Y BÚSQUEDA
          --------------------------------------------------------------------- */}
      <div className={`rounded-2xl border ${borderPrimary} ${cardBg} p-4 space-y-4`}>
        {/* Selector de Disciplina GAM / GAF / TODOS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start">
            <button
              type="button"
              onClick={() => setDisciplineFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                disciplineFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setDisciplineFilter('GAM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                disciplineFilter === 'GAM'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-blue-400 hover:text-blue-300'
              }`}
            >
              <span>GAM · Varones</span>
              <span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px]">
                {stats.gam}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDisciplineFilter('GAF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                disciplineFilter === 'GAF'
                  ? 'bg-fuchsia-700 text-white shadow-xs'
                  : 'text-fuchsia-400 hover:text-fuchsia-300'
              }`}
            >
              <span>GAF · Damas</span>
              <span className="rounded-full bg-fuchsia-500/20 px-1.5 py-0.2 text-[10px]">
                {stats.gaf}
              </span>
            </button>
          </div>

          {/* Toggle Vista Tabla vs Tarjetas */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Vista de Tabla"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Vista de Tarjetas"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Barra de Búsqueda y Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Búsqueda por Nombre o Dorsal */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por #Bib o nombre..."
              className={`w-full rounded-xl border ${borderPrimary} bg-slate-950/90 pl-9 pr-3 py-2 text-xs font-medium ${textPrimary} placeholder-slate-500 focus:border-blue-500 focus:outline-none`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por Categoría */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full rounded-xl border ${borderPrimary} bg-slate-950/90 px-3 py-2 text-xs font-medium ${textPrimary} focus:border-blue-500 focus:outline-none`}
            >
              <option value="ALL">Todas las Categorías ({availableCategories.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Club */}
          <div>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className={`w-full rounded-xl border ${borderPrimary} bg-slate-950/90 px-3 py-2 text-xs font-medium ${textPrimary} focus:border-blue-500 focus:outline-none`}
            >
              <option value="ALL">Todos los Clubes ({availableClubs.length})</option>
              {availableClubs.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Subdivisión */}
          <div>
            <select
              value={subdivisionFilter}
              onChange={(e) => setSubdivisionFilter(e.target.value)}
              className={`w-full rounded-xl border ${borderPrimary} bg-slate-950/90 px-3 py-2 text-xs font-medium ${textPrimary} focus:border-blue-500 focus:outline-none`}
            >
              <option value="ALL">Todas las Franjas / Subdivisión</option>
              {availableSubdivisions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen de resultados del filtro */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Mostrando <strong className={textPrimary}>{filteredAthletes.length}</strong> de {stats.total} gimnastas acreditados
          </span>
          {(disciplineFilter !== 'ALL' || categoryFilter !== 'ALL' || clubFilter !== 'ALL' || subdivisionFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setDisciplineFilter('ALL')
                setCategoryFilter('ALL')
                setClubFilter('ALL')
                setSubdivisionFilter('ALL')
                setSearchQuery('')
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          CONTENIDO: LISTA DE DEPORTISTAS
          --------------------------------------------------------------------- */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
          <p className="mt-3 text-xs font-bold">Cargando nómina oficial de gimnastas...</p>
        </div>
      ) : errorMsg ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-400 space-y-2">
          <p className="text-sm font-bold">{errorMsg}</p>
          <button
            type="button"
            onClick={loadAthletes}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors"
          >
            Reintentar carga
          </button>
        </div>
      ) : filteredAthletes.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 rounded-2xl border ${borderPrimary} ${cardBg} text-center space-y-3`}>
          <Users className="h-10 w-10 text-slate-500" />
          <h4 className={`text-base font-bold ${textPrimary}`}>No se encontraron deportistas</h4>
          <p className={`text-xs max-w-sm ${textSecondary}`}>
            No hay gimnastas que coincidan con los filtros seleccionados. Prueba modificando los criterios de búsqueda.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* VISTA DE TABLA OFICIAL */
        <div className={`overflow-x-auto rounded-2xl border ${borderPrimary} shadow-sm`}>
          <table className="w-full text-left text-xs">
            <thead className={`${tableHeaderBg} border-b ${borderPrimary} font-bold`}>
              <tr>
                <th className="px-4 py-3.5 text-center w-16">Dorsal</th>
                <th className="px-4 py-3.5">Gimnasta</th>
                <th className="px-4 py-3.5 text-center">Disciplina</th>
                <th className="px-4 py-3.5">Categoría / Nivel</th>
                <th className="px-4 py-3.5">Club / Delegación</th>
                <th className="px-4 py-3.5">Subdivisión</th>
                <th className="px-4 py-3.5 text-center">Acreditación</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderPrimary} ${isDark ? 'bg-slate-900/40 text-slate-200' : 'bg-white text-slate-800'}`}>
              {filteredAthletes.map((athlete) => (
                <tr
                  key={athlete.id}
                  onClick={() => onSelectAthlete?.(athlete)}
                  className={`${tableRowHover} transition-colors ${onSelectAthlete ? 'cursor-pointer' : ''}`}
                >
                  {/* Dorsal #Bib */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-lg bg-slate-950 px-2.5 py-1 font-mono text-xs font-black text-white border border-slate-800 shadow-2xs">
                      #{athlete.bibNumber}
                    </span>
                  </td>

                  {/* Nombre del Gimnasta */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {athlete.fullName}
                      </span>
                    </div>
                  </td>

                  {/* Disciplina GAM / GAF */}
                  <td className="px-4 py-3 text-center">
                    {athlete.discipline === 'GAM' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 text-[10px] font-black text-blue-300">
                        GAM · Varón
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-950/80 border border-fuchsia-800/80 px-2 py-0.5 text-[10px] font-black text-fuchsia-300">
                        GAF · Dama
                      </span>
                    )}
                  </td>

                  {/* Categoría */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-300">
                      {athlete.categoryName}
                    </span>
                  </td>

                  {/* Club */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-300">
                        {athlete.clubCode}
                      </span>
                      <span className="text-slate-300 truncate max-w-[200px]" title={athlete.clubName}>
                        {athlete.clubName}
                      </span>
                    </div>
                  </td>

                  {/* Subdivisión */}
                  <td className="px-4 py-3 text-slate-400">
                    {athlete.subdivision}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 border border-emerald-800/70 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Inscrito
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* VISTA EN CUADRÍCULA DE TARJETAS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              onClick={() => onSelectAthlete?.(athlete)}
              className={`rounded-2xl border ${borderPrimary} ${cardBg} p-4 space-y-3 hover:border-slate-700 transition-all shadow-xs ${
                onSelectAthlete ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="inline-block rounded-lg bg-slate-950 px-2.5 py-1 font-mono text-xs font-black text-white border border-slate-800">
                  Dorsal #{athlete.bibNumber}
                </span>

                {athlete.discipline === 'GAM' ? (
                  <span className="inline-flex items-center rounded-md bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 text-[10px] font-black text-blue-300">
                    GAM · Varón
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-fuchsia-950/80 border border-fuchsia-800/80 px-2 py-0.5 text-[10px] font-black text-fuchsia-300">
                    GAF · Dama
                  </span>
                )}
              </div>

              <div>
                <h4 className={`text-sm font-black ${textPrimary} leading-tight`}>
                  {athlete.fullName}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {athlete.categoryName}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="font-mono text-[10px] text-slate-400">[{athlete.clubCode}]</span>
                  <span className="truncate max-w-[150px]">{athlete.clubName}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {athlete.subdivision}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
