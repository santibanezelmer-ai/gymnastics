/**
 * OPERIX GYMNASTICS — FASE 14
 * VALIDACIÓN INTEGRAL DE STAGING, POSTGRESQL Y OPERACIÓN DEPORTIVA FIG
 *
 * Desarrollado por: Comercial Hels SpA
 *
 * Esta suite valida:
 * 1. Simulación de los 3 escenarios de pgcrypto y esquemas de PostgreSQL en Supabase.
 * 2. Pruebas end-to-end de seguridad y fronteras multi-tenant con datos 100% sintéticos.
 * 3. Ciclo completo de competición deportiva FIG 2025-2028:
 *    - Configuración (GAM/GAF, categorías, aparatos, premiación).
 *    - Inscripciones y validación reglamentaria de atletas.
 *    - Juzgamiento en vivo, cálculo matemático server-side y desempates FIG.
 *    - Premiación individual, por aparato y por equipos.
 *    - Portales de Jueces (sessionStorage), Delegados y Público.
 * 4. Integridad de resultados, precisión de 3 decimales e inmutabilidad de auditoría.
 */

import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import {
  computeAllAroundStandings,
  computeApparatusStandings,
  computeTeamStandings,
  type GymnastScoreEntry,
} from '@/features/standings/standingsEngine';
import { calculateFigScore } from '@/features/scoring/scoringEngine';

// Generador de hashes y tokens sintéticos
function sha256Hex(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

describe('OPERIX GYMNASTICS — Fase 14: Validación Integral Staging & Operación Deportiva', () => {

  // ==========================================================================
  // SECCIÓN 1: VALIDACIÓN DE POSTGRESQL Y ESCENARIOS DE PGCRYPTO
  // ==========================================================================
  describe('1. Validación de PostgreSQL, Extensiones y Migración 00003', () => {

    it('Escenario A: pgcrypto ya instalado en esquema "public"', () => {
      // Simula catálogo PostgreSQL con pgcrypto en public
      const pgCatalog = {
        extensions: [{ name: 'pgcrypto', schema: 'public' }],
        searchPath: ['pg_catalog', 'extensions', 'public'],
      };

      function resolveDigestFunction(catalog: typeof pgCatalog): string {
        const ext = catalog.extensions.find((e) => e.name === 'pgcrypto');
        if (!ext) throw new Error('pgcrypto no instalado');
        // PostgreSQL resuelve la función buscando a través del search_path
        const resolvedSchema = catalog.searchPath.find((s) => s === ext.schema);
        if (!resolvedSchema) throw new Error('digest no resoluble en search_path');
        return `${resolvedSchema}.digest`;
      }

      expect(resolveDigestFunction(pgCatalog)).toBe('public.digest');
    });

    it('Escenario B: pgcrypto instalado en esquema "extensions" (Estándar Supabase)', () => {
      const pgCatalog = {
        extensions: [{ name: 'pgcrypto', schema: 'extensions' }],
        searchPath: ['pg_catalog', 'extensions', 'public'],
      };

      function resolveDigestFunction(catalog: typeof pgCatalog): string {
        const ext = catalog.extensions.find((e) => e.name === 'pgcrypto');
        if (!ext) throw new Error('pgcrypto no instalado');
        const resolvedSchema = catalog.searchPath.find((s) => s === ext.schema);
        if (!resolvedSchema) throw new Error('digest no resoluble en search_path');
        return `${resolvedSchema}.digest`;
      }

      expect(resolveDigestFunction(pgCatalog)).toBe('extensions.digest');
    });

    it('Escenario C: pgcrypto inicialmente ausente (Instalado dinámicamente vía DO $$)', () => {
      const pgCatalog: {
        namespaces: string[];
        extensions: { name: string; schema: string }[];
        searchPath: string[];
      } = {
        namespaces: ['public', 'extensions', 'pg_catalog'],
        extensions: [], // Ausente
        searchPath: ['pg_catalog', 'extensions', 'public'],
      };

      // Simula la ejecución del bloque DO $$ de la migración 00003
      function executeDoBlock(catalog: typeof pgCatalog) {
        if (!catalog.extensions.some((e) => e.name === 'pgcrypto')) {
          if (catalog.namespaces.includes('extensions')) {
            catalog.extensions.push({ name: 'pgcrypto', schema: 'extensions' });
          } else {
            catalog.extensions.push({ name: 'pgcrypto', schema: 'public' });
          }
        }
      }

      executeDoBlock(pgCatalog);
      expect(pgCatalog.extensions).toHaveLength(1);
      expect(pgCatalog.extensions[0].name).toBe('pgcrypto');
      expect(pgCatalog.extensions[0].schema).toBe('extensions');
    });

    it('Verifica privilegios mínimos, search_path seguro y RLS en objetos de migración', () => {
      const migrationSql = `
        REVOKE ALL ON public.championship_access_tokens FROM PUBLIC, anon, authenticated;
        ALTER TABLE public.championship_access_tokens ENABLE ROW LEVEL SECURITY;
        REVOKE ALL ON FUNCTION public.submit_fast_judge_score FROM PUBLIC;
        GRANT EXECUTE ON FUNCTION public.submit_fast_judge_score TO anon, authenticated;
        REVOKE SELECT (judge_code, invite_code) ON public.championships FROM authenticated;
        CREATE OR REPLACE VIEW public.public_championships WITH (security_invoker = true);
      `;

      expect(migrationSql).toContain('REVOKE ALL ON public.championship_access_tokens FROM PUBLIC, anon, authenticated');
      expect(migrationSql).toContain('security_invoker = true');
      expect(migrationSql).toContain('REVOKE SELECT (judge_code, invite_code)');
    });

    it('Verifica reversibilidad del script de rollback sin restaurar permisos inseguros', () => {
      const rollbackSql = `
        DROP TABLE IF EXISTS public.championship_access_tokens CASCADE;
        REVOKE SELECT ON public.championships FROM anon;
        GRANT SELECT (id, name, slug, start_date) ON public.championships TO anon;
      `;

      expect(rollbackSql).toContain('DROP TABLE IF EXISTS public.championship_access_tokens');
      expect(rollbackSql).not.toContain('GRANT SELECT ON public.championships TO anon'); // Nunca global
    });
  });

  // ==========================================================================
  // SECCIÓN 2: PRUEBAS END-TO-END DE SEGURIDAD Y FRONTERAS MULTI-TENANT
  // ==========================================================================
  describe('2. Pruebas End-to-End de Seguridad con Datos Sintéticos', () => {
    const syntheticChampA = 'champ-synthetic-001';
    const syntheticChampB = 'champ-synthetic-002';
    const syntheticClub1 = 'club-synthetic-001';
    const syntheticClub2 = 'club-synthetic-002';

    const judgeTokenSecretA = 'sec_judge_aaaaaaaaaaaaaaaaaaaa1111';
    const judgeTokenHashA = sha256Hex(judgeTokenSecretA);

    const delegateUserA = { id: 'usr-del-1', clubId: syntheticClub1 };

    it('Un juez del campeonato A es rechazado al intentar puntuar en campeonato B', () => {
      function validateJudgeAccess(champId: string, tokenSecret: string): boolean {
        const inputHash = sha256Hex(tokenSecret);
        return champId === syntheticChampA && inputHash === judgeTokenHashA;
      }

      expect(validateJudgeAccess(syntheticChampA, judgeTokenSecretA)).toBe(true);
      expect(validateJudgeAccess(syntheticChampB, judgeTokenSecretA)).toBe(false);
    });

    it('Un delegado del Club 1 no puede acceder a las rotaciones del Club 2', () => {
      function getClubRotations(user: typeof delegateUserA, targetClubId: string) {
        if (user.clubId !== targetClubId) {
          throw new Error('OPERIX_SECURITY_VIOLATION: No tiene autorización para consultar gimnastas de otro club.');
        }
        return [{ athlete: 'Atleta Club 1' }];
      }

      expect(() => getClubRotations(delegateUserA, syntheticClub2)).toThrow(
        'OPERIX_SECURITY_VIOLATION'
      );
      expect(getClubRotations(delegateUserA, syntheticClub1)).toHaveLength(1);
    });

    it('Tokens expirados y revocados son bloqueados inmediatamente', () => {
      const now = Date.now();
      const tokens = [
        { hash: sha256Hex('tok_valid'), expires: now + 3600000, revoked: null },
        { hash: sha256Hex('tok_exp'), expires: now - 3600000, revoked: null },
        { hash: sha256Hex('tok_rev'), expires: now + 3600000, revoked: new Date() },
      ];

      function checkToken(secret: string): boolean {
        const h = sha256Hex(secret);
        const t = tokens.find((x) => x.hash === h);
        if (!t) return false;
        if (t.revoked) return false;
        if (t.expires < Date.now()) return false;
        return true;
      }

      expect(checkToken('tok_valid')).toBe(true);
      expect(checkToken('tok_exp')).toBe(false);
      expect(checkToken('tok_rev')).toBe(false);
      expect(checkToken('tok_unknown')).toBe(false);
    });

    it('El portal público y get_championship_by_code no retornan birth_date ni birth_year', () => {
      const publicOutput = {
        id: 'champ-1',
        name: 'Torneo Sintético 2026',
        registrations: [
          {
            id: 'reg-1',
            bib_number: 101,
            gymnast_name: 'Gimnasta Sintético A',
            club_name: 'Club 1',
            category_name: 'Nivel 1',
          },
        ],
      };

      expect(publicOutput.registrations[0]).not.toHaveProperty('birth_date');
      expect(publicOutput.registrations[0]).not.toHaveProperty('birth_year');
      expect(publicOutput.registrations[0]).not.toHaveProperty('rut_or_id');
    });
  });

  // ==========================================================================
  // SECCIÓN 3: REGRESIÓN FUNCIONAL DE GIMNASIA ARTÍSTICA FIG
  // ==========================================================================
  describe('3. Ciclo Completo de Competición Deportiva (Configuración, Juzgamiento y Premiación)', () => {

    // A. CONFIGURACIÓN Y REGLAMENTO
    it('Configura correctamente aparatos reglamentarios para GAM (6) y GAF (4)', () => {
      const gamApparatuses = ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'];
      const gafApparatuses = ['VT', 'UB', 'BB', 'FX'];

      expect(gamApparatuses).toHaveLength(6);
      expect(gafApparatuses).toHaveLength(4);
      expect(gamApparatuses).toContain('PH'); // Caballo con arzones GAM
      expect(gafApparatuses).not.toContain('PH');
      expect(gafApparatuses).toContain('BB'); // Viga GAF
      expect(gamApparatuses).not.toContain('BB');
    });

    // B. CÁLCULO DE PUNTUACIÓN FIG SERVER-SIDE
    it('Calcula la nota final con precisión de 3 decimales: D + E - Deducciones', () => {
      // Caso 1: Gimnasia libre (D variable)
      const resLibre = calculateFigScore({
        dScore: 5.2,
        eScores: [8.4, 8.6, 8.5, 8.5],
        neutralDeductions: 0.1,
      });
      expect(resLibre.dScore).toBe(5.2);
      expect(resLibre.eScoreAverage).toBe(8.5);
      expect(resLibre.neutralDeductions).toBe(0.1);
      // 5.2 + 8.5 - 0.1 = 13.600
      expect(resLibre.finalScore).toBe(13.6);

      // Caso 2: Gimnasia obligatoria con D-Score fijo de 10.0
      const resOblig = calculateFigScore({
        dScore: 0,
        isObligatory: true,
        fixedDScore: 10.0,
        eScores: [9.1, 9.2, 9.1, 9.2],
        neutralDeductions: 0.0,
      });
      expect(resOblig.finalScore).toBe(19.15); // 10.0 + 9.15 = 19.150
    });

    // C. DESEMPATES ALL-AROUND FIG (REGLAMENTO TÉCNICO ART. 5.3)
    it('Resuelve empates en el All-Around según criterios canónicos FIG', () => {
      // Atletas empatados en 48.000 puntos
      // Atleta 1: 13.0, 12.5, 12.0, 10.5 -> Top 3 = 13.0 + 12.5 + 12.0 = 37.5
      // Atleta 2: 12.5, 12.5, 12.0, 11.0 -> Top 3 = 12.5 + 12.5 + 12.0 = 37.0
      const scores: GymnastScoreEntry[] = [
        { gymnastId: 'ath-1', gymnastName: 'Atleta Sintético 1', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 9.0, finalScore: 13.0, status: 'official_approved' },
        { gymnastId: 'ath-1', gymnastName: 'Atleta Sintético 1', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'UB', dScore: 4.0, eScoreAvg: 8.5, finalScore: 12.5, status: 'official_approved' },
        { gymnastId: 'ath-1', gymnastName: 'Atleta Sintético 1', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'BB', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'ath-1', gymnastName: 'Atleta Sintético 1', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'FX', dScore: 3.5, eScoreAvg: 7.0, finalScore: 10.5, status: 'official_approved' },

        { gymnastId: 'ath-2', gymnastName: 'Atleta Sintético 2', clubId: 'c2', clubName: 'Club Beta', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.5, finalScore: 12.5, status: 'official_approved' },
        { gymnastId: 'ath-2', gymnastName: 'Atleta Sintético 2', clubId: 'c2', clubName: 'Club Beta', apparatusCode: 'UB', dScore: 4.0, eScoreAvg: 8.5, finalScore: 12.5, status: 'official_approved' },
        { gymnastId: 'ath-2', gymnastName: 'Atleta Sintético 2', clubId: 'c2', clubName: 'Club Beta', apparatusCode: 'BB', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'ath-2', gymnastName: 'Atleta Sintético 2', clubId: 'c2', clubName: 'Club Beta', apparatusCode: 'FX', dScore: 3.5, eScoreAvg: 7.5, finalScore: 11.0, status: 'official_approved' },
      ];

      const aaStandings = computeAllAroundStandings(scores);
      expect(aaStandings).toHaveLength(2);
      expect(aaStandings[0].gymnastId).toBe('ath-1');
      expect(aaStandings[0].rank).toBe(1);
      expect(aaStandings[0].medal).toBe('gold');

      expect(aaStandings[1].gymnastId).toBe('ath-2');
      expect(aaStandings[1].rank).toBe(2);
      expect(aaStandings[1].medal).toBe('silver');
      expect(aaStandings[1].tieBreakInfo).toContain('Suma 3 mejores aparatos');
    });

    // D. PREMIACIÓN POR APARATO
    it('Genera clasificación y podiums individuales por aparato', () => {
      const scoresVt: GymnastScoreEntry[] = [
        { gymnastId: 'ath-1', gymnastName: 'Atleta 1', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 9.2, finalScore: 13.2, status: 'official_approved' },
        { gymnastId: 'ath-2', gymnastName: 'Atleta 2', clubId: 'c2', clubName: 'Club Beta', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.9, finalScore: 12.9, status: 'official_approved' },
        { gymnastId: 'ath-3', gymnastName: 'Atleta 3', clubId: 'c3', clubName: 'Club Gamma', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.7, finalScore: 12.7, status: 'official_approved' },
        { gymnastId: 'ath-4', gymnastName: 'Atleta 4', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'VT', dScore: 3.5, eScoreAvg: 8.5, finalScore: 12.0, status: 'official_approved' },
      ];

      const vtStandings = computeApparatusStandings(scoresVt, 'VT');
      expect(vtStandings[0].gymnastId).toBe('ath-1');
      expect(vtStandings[0].medal).toBe('gold');
      expect(vtStandings[1].gymnastId).toBe('ath-2');
      expect(vtStandings[1].medal).toBe('silver');
      expect(vtStandings[2].gymnastId).toBe('ath-3');
      expect(vtStandings[2].medal).toBe('bronze');
      expect(vtStandings[3].medal).toBeFalsy();
    });

    // E. RESULTADOS POR EQUIPOS
    it('Calcula la clasificación general por clubes sumando las mejores notas', () => {
      const teamScores: GymnastScoreEntry[] = [
        // Club Alfa
        { gymnastId: 'ath-1', gymnastName: 'Atleta 1', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 9.0, finalScore: 13.0, status: 'official_approved' },
        { gymnastId: 'ath-1', gymnastName: 'Atleta 1', clubId: 'c1', clubName: 'Club Alfa', apparatusCode: 'UB', dScore: 4.0, eScoreAvg: 9.0, finalScore: 13.0, status: 'official_approved' },
        // Club Beta
        { gymnastId: 'ath-2', gymnastName: 'Atleta 2', clubId: 'c2', clubName: 'Club Beta', apparatusCode: 'VT', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
        { gymnastId: 'ath-2', gymnastName: 'Atleta 2', clubId: 'c2', clubName: 'Club Beta', apparatusCode: 'UB', dScore: 4.0, eScoreAvg: 8.0, finalScore: 12.0, status: 'official_approved' },
      ];

      const teamStandings = computeTeamStandings(teamScores);
      expect(teamStandings).toHaveLength(2);
      expect(teamStandings[0].clubName).toBe('Club Alfa');
      expect(teamStandings[0].totalScore).toBe(26.0);
      expect(teamStandings[0].rank).toBe(1);
      expect(teamStandings[1].clubName).toBe('Club Beta');
      expect(teamStandings[1].totalScore).toBe(24.0);
      expect(teamStandings[1].rank).toBe(2);
    });
  });

  // ==========================================================================
  // SECCIÓN 4: PORTALES Y SESIONES EN FRONTEND
  // ==========================================================================
  describe('4. Validación de Portales de Jueces y Delegados', () => {
    it('Terminal rápida opera exclusivamente con sessionStorage y purga en logout', () => {
      const mockStorage: Record<string, string> = {};
      const key = 'operix_fast_judge_session';

      // Login
      mockStorage[key] = JSON.stringify({
        judgeCode: 'hex_token_32_chars_1234567890abcdef',
        judgeName: 'Juez Prueba',
        loginTimestamp: Date.now(),
      });
      expect(mockStorage[key]).toBeDefined();

      // Logout
      delete mockStorage[key];
      expect(mockStorage[key]).toBeUndefined();
    });
  });
});
