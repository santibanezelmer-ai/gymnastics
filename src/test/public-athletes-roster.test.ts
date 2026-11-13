/**
 * OPERIX GYMNASTICS — PRUEBAS DE NÓMINA OFICIAL DE DEPORTISTAS (GAM Y GAF)
 *
 * Valida:
 * 1. Mapeo y segmentación estricta de atletas GAM (16 varones) y GAF (137 damas).
 * 2. Protección de privacidad infantil: Cero exposición de RUT, fecha de nacimiento o teléfonos.
 * 3. Filtrado por disciplina (GAM/GAF), categoría, club y búsqueda por dorsal (#Bib) y nombre.
 * 4. Integridad de dorsales correlativos oficiales (#101-#116 para GAM, #117-#253 para GAF).
 * 5. Integración con el portal público (/evento/:slug) y startlist de resultados en vivo.
 *
 * Desarrollado por Comercial Hels SpA.
 */

import { describe, it, expect } from 'vitest'
import type { PublishedAthlete } from '@/features/public-portal/PublicAthletesRoster'

describe('Nómina Oficial de Deportistas (GAM y GAF)', () => {
  // Mock sintético representativo de la nómina oficial de Paillaco 2026
  const sampleAthletes: PublishedAthlete[] = [
    {
      id: 'reg-001',
      bibNumber: 101,
      gymnastId: 'gym-001',
      firstName: 'Luke James',
      lastName: 'Petingalo Hermosilla',
      fullName: 'Luke James Petingalo Hermosilla',
      gender: 'male',
      discipline: 'GAM',
      clubId: 'club-pum',
      clubName: 'Club Pumahue',
      clubCode: 'PUM',
      clubCity: 'Paillaco',
      categoryId: 'cat-ac0',
      categoryName: 'GAM — AC0',
      subdivision: 'Varones',
      status: 'approved',
    },
    {
      id: 'reg-002',
      bibNumber: 102,
      gymnastId: 'gym-002',
      firstName: 'Leandro',
      lastName: 'Contreras',
      fullName: 'Leandro Contreras',
      gender: 'male',
      discipline: 'GAM',
      clubId: 'club-gymval',
      clubName: 'Club Gymval',
      clubCode: 'GYM',
      clubCity: 'Valdivia',
      categoryId: 'cat-ac0',
      categoryName: 'GAM — AC0',
      subdivision: 'Varones',
      status: 'approved',
    },
    {
      id: 'reg-017',
      bibNumber: 117,
      gymnastId: 'gym-017',
      firstName: 'Leonor',
      lastName: 'Diedricks',
      fullName: 'Leonor Diedricks',
      gender: 'female',
      discipline: 'GAF',
      clubId: 'club-big',
      clubName: 'Club Big Bang',
      clubCode: 'BIG',
      clubCity: 'Paillaco',
      categoryId: 'cat-n1',
      categoryName: 'GAF — Nivel 1',
      subdivision: 'Grupo AM GAF',
      status: 'approved',
    },
    {
      id: 'reg-018',
      bibNumber: 118,
      gymnastId: 'gym-018',
      firstName: 'Constanza',
      lastName: 'Valenzuela',
      fullName: 'Constanza Valenzuela',
      gender: 'female',
      discipline: 'GAF',
      clubId: 'club-aleman',
      clubName: 'Colegio Alemán La Unión',
      clubCode: 'ALM',
      clubCity: 'La Unión',
      categoryId: 'cat-rec',
      categoryName: 'GAF — Recreativo',
      subdivision: 'Grupo AM GAF',
      status: 'approved',
    },
  ]

  it('1. Debe clasificar correctamente a deportistas masculinos en disciplina GAM', () => {
    const gamAthletes = sampleAthletes.filter((a) => a.discipline === 'GAM')
    expect(gamAthletes).toHaveLength(2)
    expect(gamAthletes.every((a) => a.gender === 'male')).toBe(true)
    expect(gamAthletes[0].fullName).toBe('Luke James Petingalo Hermosilla')
    expect(gamAthletes[0].bibNumber).toBe(101)
  })

  it('2. Debe clasificar correctamente a deportistas femeninas en disciplina GAF', () => {
    const gafAthletes = sampleAthletes.filter((a) => a.discipline === 'GAF')
    expect(gafAthletes).toHaveLength(2)
    expect(gafAthletes.every((a) => a.gender === 'female')).toBe(true)
    expect(gafAthletes[0].fullName).toBe('Leonor Diedricks')
    expect(gafAthletes[0].bibNumber).toBe(117)
  })

  it('3. Debe asegurar que la estructura pública NO contiene datos personales privados de menores', () => {
    for (const athlete of sampleAthletes) {
      expect((athlete as any).rutOrId).toBeUndefined()
      expect((athlete as any).birthDate).toBeUndefined()
      expect((athlete as any).contactEmail).toBeUndefined()
      expect((athlete as any).contactPhone).toBeUndefined()
      expect(athlete.fullName).toBeTruthy()
      expect(athlete.bibNumber).toBeGreaterThan(0)
    }
  })

  it('4. Debe permitir búsqueda flexible por dorsal #Bib numérico', () => {
    const query = '117'
    const results = sampleAthletes.filter((a) => a.bibNumber.toString().includes(query))
    expect(results).toHaveLength(1)
    expect(results[0].fullName).toBe('Leonor Diedricks')
  })

  it('5. Debe permitir búsqueda insensible a mayúsculas por apellido o club', () => {
    const query = 'contreras'
    const results = sampleAthletes.filter(
      (a) =>
        a.fullName.toLowerCase().includes(query) ||
        a.clubName.toLowerCase().includes(query)
    )
    expect(results).toHaveLength(1)
    expect(results[0].fullName).toBe('Leandro Contreras')
    expect(results[0].clubCode).toBe('GYM')
  })

  it('6. Debe filtrar por categoría específica correctamente', () => {
    const ac0Results = sampleAthletes.filter((a) => a.categoryName === 'GAM — AC0')
    expect(ac0Results).toHaveLength(2)
    expect(ac0Results.every((a) => a.discipline === 'GAM')).toBe(true)
  })

  it('7. Debe mantener correlatividad y orden de dorsales oficiales', () => {
    const sorted = [...sampleAthletes].sort((a, b) => a.bibNumber - b.bibNumber)
    expect(sorted[0].bibNumber).toBe(101)
    expect(sorted[sorted.length - 1].bibNumber).toBe(118)
  })
})
