/**
 * OPERIX GYMNASTICS — SERVICIO DE EJECUCIÓN DE IMPORTACIÓN TRANSACCIONAL
 * Archivo: ARTISTICA CAMPEONATO 2026.xlsx
 * Desarrollado por Comercial Hels SpA
 * Fecha: 12 de noviembre de 2026
 */

import { supabase } from '@/lib/supabase/client'
import type { ExcelAuditResult, ImportExecutionResult } from './types'

export async function executeChampionshipImport(
  audit: ExcelAuditResult,
  organizationId: string,
  onProgress?: (step: string, current: number, total: number) => void
): Promise<ImportExecutionResult> {
  const logs: string[] = []
  const counts = {
    clubsCreatedOrLinked: 0,
    categoriesCreated: 0,
    subcategoriesCreated: 0,
    gymnastsCreatedOrLinked: 0,
    registrationsCreated: 0,
    schedulesCreated: 0,
    rotationGroupsCreated: 0,
    awardsConfigured: 0,
  }

  const slug = 'artistica-paillaco-2026'

  try {
    logs.push(`[INICIO] Iniciando importación controlada para: "${audit.championshipName}"`)
    if (onProgress) onProgress('Verificando existencia de campeonato...', 1, 10)

    // 1. Obtener o crear el campeonato
    let championshipId: string | null = null
    const { data: existingChamp, error: champCheckErr } = await supabase
      .from('championships')
      .select('id, name, slug')
      .eq('organization_id', organizationId)
      .eq('slug', slug)
      .maybeSingle()

    if (champCheckErr) throw champCheckErr

    if (existingChamp) {
      championshipId = existingChamp.id
      logs.push(`[CAMPEONATO] Campeonato existente detectado (${championshipId}). Modo idempotente activado.`)
    } else {
      const { data: newChamp, error: createChampErr } = await supabase
        .from('championships')
        .insert({
          organization_id: organizationId,
          name: audit.championshipName,
          slug,
          description: 'Campeonato de Gimnasia Artística (GAM y GAF) importado desde archivo oficial ARTISTICA CAMPEONATO 2026.xlsx.',
          start_date: '2026-11-15',
          end_date: '2026-11-15',
          location: 'Paillaco, Región de Los Ríos',
          venue_name: 'Gimnasio Municipal de Paillaco',
          visibility: 'private',
          status: 'draft',
          ruleset_version: 'USAG_FIG_CHILE_2026',
          scoring_schema_version: 'USAG_LEVELS_V1',
        })
        .select('id')
        .single()

      if (createChampErr) throw createChampErr
      championshipId = newChamp.id
      logs.push(`[CAMPEONATO] Creado nuevo campeonato ID: ${championshipId} (Estado: Borrador / Privado).`)
    }

    if (onProgress) onProgress('Procesando clubes participantes...', 2, 10)

    // 2. Mapear o crear Clubes
    const clubIdMap = new Map<string, string>()
    for (const clubInfo of audit.clubsDetected) {
      const { data: existingClub, error: clubFetchErr } = await supabase
        .from('clubs')
        .select('id, name, code')
        .eq('organization_id', organizationId)
        .or(`code.eq.${clubInfo.code},name.eq.${clubInfo.canonicalName}`)
        .maybeSingle()

      if (clubFetchErr) throw clubFetchErr

      if (existingClub) {
        clubIdMap.set(clubInfo.canonicalName, existingClub.id)
        counts.clubsCreatedOrLinked++
        logs.push(`[CLUB VINCULADO] "${clubInfo.canonicalName}" -> ID ${existingClub.id}`)
      } else {
        const { data: newClub, error: createClubErr } = await supabase
          .from('clubs')
          .insert({
            organization_id: organizationId,
            name: clubInfo.canonicalName,
            short_name: clubInfo.canonicalName.replace('Club ', '').substring(0, 20),
            code: clubInfo.code,
            country: 'Chile',
            city: 'Paillaco / Región Sur',
          })
          .select('id')
          .single()

        if (createClubErr) throw createClubErr
        clubIdMap.set(clubInfo.canonicalName, newClub.id)
        counts.clubsCreatedOrLinked++
        logs.push(`[CLUB CREADO] "${clubInfo.canonicalName}" (Código: ${clubInfo.code}) -> ID ${newClub.id}`)
      }
    }

    if (onProgress) onProgress('Obteniendo catálogo de aparatos...', 3, 10)

    // 3. Catálogo de aparatos
    const { data: apparatusList, error: appErr } = await supabase
      .from('apparatuses')
      .select('id, code, discipline')

    if (appErr) throw appErr

    const apparatusMap = new Map<string, string>() // `${discipline}_${code}` -> id
    apparatusList?.forEach(a => apparatusMap.set(`${a.discipline}_${a.code}`, a.id))

    if (onProgress) onProgress('Creando categorías y subcategorías...', 4, 10)

    // 4. Categorías y Subcategorías
    const categoryIdMap = new Map<string, string>()
    const subcategoryIdMap = new Map<string, string>()

    for (const catInfo of audit.categoriesDetected) {
      // Buscar o crear categoría
      const { data: existingCat, error: catFetchErr } = await supabase
        .from('categories')
        .select('id, code')
        .eq('championship_id', championshipId)
        .eq('code', catInfo.code)
        .maybeSingle()

      if (catFetchErr) throw catFetchErr

      let catId = existingCat?.id
      if (!catId) {
        const { data: newCat, error: createCatErr } = await supabase
          .from('categories')
          .insert({
            championship_id: championshipId,
            discipline: catInfo.discipline,
            name: catInfo.name,
            code: catInfo.code,
            gender: catInfo.discipline === 'GAM' ? 'male' : 'female',
            scoring_regime: 'free',
            sort_order: catInfo.discipline === 'GAM' ? 10 : 20,
          })
          .select('id')
          .single()

        if (createCatErr) throw createCatErr
        catId = newCat.id
        counts.categoriesCreated++
        logs.push(`[CATEGORÍA CREADA] "${catInfo.name}" (${catInfo.code}) -> ID ${catId}`)

        // Vincular aparatos a la categoría
        const requiredApps = catInfo.discipline === 'GAM' ? ['FX', 'VT', 'PB'] : ['VT', 'UB', 'BB', 'FX']
        for (let i = 0; i < requiredApps.length; i++) {
          const appCode = requiredApps[i]
          const appId = apparatusMap.get(`${catInfo.discipline}_${appCode}`)
          if (appId) {
            await supabase.from('category_apparatuses').insert({
              category_id: catId,
              apparatus_id: appId,
              sort_order: i + 1,
            })
          }
        }
      }
      categoryIdMap.set(catInfo.code, catId)

      // Subcategorías (Franjas)
      for (const franja of catInfo.franjas) {
        const subName = `Franja ${franja}`
        const subKey = `${catInfo.code}_${franja}`

        const { data: existingSub, error: subFetchErr } = await supabase
          .from('subcategories')
          .select('id, name')
          .eq('category_id', catId)
          .eq('name', subName)
          .maybeSingle()

        if (subFetchErr) throw subFetchErr

        if (existingSub) {
          subcategoryIdMap.set(subKey, existingSub.id)
        } else {
          const { data: newSub, error: createSubErr } = await supabase
            .from('subcategories')
            .insert({
              category_id: catId,
              name: subName,
              sort_order: parseInt(franja, 10) || 1,
            })
            .select('id')
            .single()

          if (createSubErr) throw createSubErr
          subcategoryIdMap.set(subKey, newSub.id)
          counts.subcategoriesCreated++
        }
      }
    }

    if (onProgress) onProgress('Registrando deportistas e inscripciones...', 5, 10)

    // 5. Gimnastas e Inscripciones
    let athleteIdx = 0
    for (const ath of audit.athletes) {
      athleteIdx++
      const clubId = clubIdMap.get(ath.canonicalClub)
      if (!clubId) continue

      // Buscar o crear gimnasta
      const { data: existingGymnast, error: gymFetchErr } = await supabase
        .from('gymnasts')
        .select('id, first_name, last_name')
        .eq('organization_id', organizationId)
        .eq('club_id', clubId)
        .ilike('first_name', ath.normalizedFirstName)
        .ilike('last_name', ath.normalizedLastName)
        .maybeSingle()

      if (gymFetchErr) throw gymFetchErr

      let gymnastId = existingGymnast?.id
      if (!gymnastId) {
        const { data: newGym, error: createGymErr } = await supabase
          .from('gymnasts')
          .insert({
            organization_id: organizationId,
            club_id: clubId,
            first_name: ath.normalizedFirstName,
            last_name: ath.normalizedLastName,
            birth_date: ath.birthDate,
            birth_year: ath.birthYear ?? null,
            gender: ath.discipline === 'GAM' ? 'male' : 'female',
            notes: ath.birthYear
              ? `Importado desde Excel Paillaco 2026 (Año informado: ${ath.birthYear}, edad: ${ath.age ?? 'N/D'}).`
              : (ath.isAgeEstimated
                ? `Importado desde Excel Paillaco 2026 (Edad estimada: ${ath.age} años).`
                : `Importado desde Excel Paillaco 2026.`),
          })
          .select('id')
          .single()

        if (createGymErr) throw createGymErr
        gymnastId = newGym.id
        counts.gymnastsCreatedOrLinked++
      }

      // Categoría y Subcategoría
      const catCode = `${ath.discipline}-${ath.normalizedLevel}`
      const catId = categoryIdMap.get(catCode)
      const subKey = `${catCode}_${ath.normalizedFranja}`
      const subId = subcategoryIdMap.get(subKey) || null

      if (!catId) continue

      // Inscripción
      const { data: existingReg, error: regFetchErr } = await supabase
        .from('registrations')
        .select('id')
        .eq('championship_id', championshipId)
        .eq('gymnast_id', gymnastId)
        .maybeSingle()

      if (regFetchErr) throw regFetchErr

      if (!existingReg) {
        const { error: createRegErr } = await supabase.from('registrations').insert({
          championship_id: championshipId,
          category_id: catId,
          subcategory_id: subId,
          gymnast_id: gymnastId,
          club_id: clubId,
          bib_number: 100 + athleteIdx,
          status: 'approved',
          subdivision: ath.discipline === 'GAM' ? 'Varones' : (athleteIdx <= 60 ? 'Grupo AM GAF' : 'Grupo PM GAF'),
          starting_apparatus: ath.apparatusCodes[0] || 'FX',
        })

        if (createRegErr) throw createRegErr
        counts.registrationsCreated++
      }
    }

    if (onProgress) onProgress('Configurando cronograma de competencia...', 7, 10)

    // 6. Cronograma (PROGRAMA)
    for (let idx = 0; idx < audit.schedule.length; idx++) {
      const item = audit.schedule[idx]
      const { data: existingSched, error: schedErr } = await supabase
        .from('competition_schedules')
        .select('id')
        .eq('championship_id', championshipId)
        .eq('title', item.event)
        .maybeSingle()

      if (schedErr) throw schedErr

      if (!existingSched) {
        const { error: createSchedErr } = await supabase.from('competition_schedules').insert({
          championship_id: championshipId,
          time_start: item.time || '08:00',
          time_end: item.time || '18:00',
          title: item.event,
          subdivision: item.event.includes('GRUPO') ? item.event : null,
          sort_order: idx + 1,
        })
        if (!createSchedErr) counts.schedulesCreated++
      }
    }

    if (onProgress) onProgress('Configurando rotaciones y premiaciones...', 9, 10)

    // 7. Configuración de Premiaciones (MEDALLAS)
    const { data: existingAwards, error: awardsFetchErr } = await supabase
      .from('championship_awards_config')
      .select('id')
      .eq('championship_id', championshipId)
      .maybeSingle()

    if (awardsFetchErr) throw awardsFetchErr

    if (!existingAwards) {
      const { error: createAwardsErr } = await supabase.from('championship_awards_config').insert({
        championship_id: championshipId,
        places_awarded_count: 3,
        few_participants_rule: 'standard_all',
        include_trophies_for_teams: true,
        include_club_medals: true,
        special_awards: [
          {
            title: 'POR SU DESTACADA PARTICIPACIÓN',
            quantity: 12,
            type: 'diploma_or_medal',
          },
          {
            title: 'Total Medallas y Podios Programados',
            quantity: audit.counts.totalAwardsCount,
            type: 'championship_aggregate',
          },
        ],
      })
      if (!createAwardsErr) counts.awardsConfigured++
    }

    logs.push(`[FINALIZADO CON ÉXITO] Campeonato "${audit.championshipName}" importado correctamente.`)
    if (onProgress) onProgress('Importación completada con éxito', 10, 10)

    return {
      success: true,
      championshipId,
      championshipSlug: slug,
      organizationId,
      importedCounts: counts,
      logs,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logs.push(`[ERROR CRÍTICO] ${msg}`)
    return {
      success: false,
      championshipId: '',
      championshipSlug: slug,
      organizationId,
      importedCounts: counts,
      logs,
      error: msg,
    }
  }
}
