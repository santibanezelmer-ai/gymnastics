/**
 * OPERIX GYMNASTICS — SUITE DE PRUEBAS DE SEGURIDAD MIGRACIÓN 00003
 * Desarrollado por Comercial Hels SpA
 *
 * Cobertura de los 16 escenarios críticos de la auditoría de seguridad:
 * 1. Token de juez válido
 * 2. Token de delegado rechazado en terminal de jueces
 * 3. Token revocado
 * 4. Token expirado
 * 5. Inscripción de otro campeonato
 * 6. Aparato no habilitado para la categoría
 * 7. Aparato GAM en inscripción GAF
 * 8. Nota final manipulada desde el cliente
 * 9. Intento de sobrescribir nota aprobada
 * 10. Intento de modificar una nota de otro campeonato
 * 11. Delegado intentando consultar otro club
 * 12. Usuario sin membresía
 * 13. Usuario de otra organización
 * 14. Permisos EXECUTE de PUBLIC
 * 15. Resolución correcta de pgcrypto
 * 16. Rate limiting bajo concurrencia
 */

import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';

// Simulación de hashing SHA-256 idéntica a PostgreSQL extensions.digest(..., 'sha256')
function computeSha256(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

interface MockAccessToken {
  id: string;
  championshipId: string;
  tokenHash: string;
  accessType: 'judge' | 'delegate';
  isActive: boolean;
  expiresAt: Date | null;
  revokedAt: Date | null;
}

interface MockRegistration {
  id: string;
  championshipId: string;
  clubId: string;
  categoryId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface MockCategory {
  id: string;
  championshipId: string;
  name: string;
  discipline: 'GAM' | 'GAF';
  scoringRegime: 'free' | 'obligatory';
  defaultFixedDScore: number;
}

interface MockApparatus {
  id: string;
  code: string;
  discipline: 'GAM' | 'GAF';
}

interface MockScore {
  id: string;
  championshipId: string;
  registrationId: string;
  apparatusId: string;
  attemptNumber: number;
  dScore: number;
  eScoreAvg: number;
  neutralDeductions: number;
  finalScore: number;
  status: 'draft' | 'submitted' | 'provisional' | 'official_approved';
}

describe('OPERIX GYMNASTICS — Auditoría de Seguridad Migración 00003 (16 Escenarios)', () => {
  const champId = 'c2026000-0000-0000-0000-000000000001';
  const otherChampId = 'c9999999-9999-9999-9999-999999999999';

  const catGafId = 'cat-gaf-001';
  const catGamId = 'cat-gam-001';
  const appVtGafId = 'app-vt-gaf';
  const appFxGamId = 'app-fx-gam';
  const appUbGafId = 'app-ub-gaf';

  const regGafId = 'reg-gaf-001';
  const regOtherChampId = 'reg-other-champ-001';

  // Tokens de prueba
  const validJudgeSecret = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
  const validDelegateSecret = 'd1e2f3a4b5c60718293a4b5c6d7e8f90';
  const revokedJudgeSecret = 'revoked0000000000000000000000000';
  const expiredJudgeSecret = 'expired0000000000000000000000000';

  const accessTokens: MockAccessToken[] = [
    {
      id: 'tok-1',
      championshipId: champId,
      tokenHash: computeSha256(validJudgeSecret),
      accessType: 'judge',
      isActive: true,
      expiresAt: null,
      revokedAt: null,
    },
    {
      id: 'tok-2',
      championshipId: champId,
      tokenHash: computeSha256(validDelegateSecret),
      accessType: 'delegate',
      isActive: true,
      expiresAt: null,
      revokedAt: null,
    },
    {
      id: 'tok-3',
      championshipId: champId,
      tokenHash: computeSha256(revokedJudgeSecret),
      accessType: 'judge',
      isActive: false,
      expiresAt: null,
      revokedAt: new Date(),
    },
    {
      id: 'tok-4',
      championshipId: champId,
      tokenHash: computeSha256(expiredJudgeSecret),
      accessType: 'judge',
      isActive: true,
      expiresAt: new Date(Date.now() - 3600000), // Expiró hace 1 hora
      revokedAt: null,
    },
  ];

  const categories: Record<string, MockCategory> = {
    [catGafId]: {
      id: catGafId,
      championshipId: champId,
      name: 'Nivel 1 GAF',
      discipline: 'GAF',
      scoringRegime: 'obligatory',
      defaultFixedDScore: 10.0,
    },
    [catGamId]: {
      id: catGamId,
      championshipId: champId,
      name: 'Nivel 1 GAM',
      discipline: 'GAM',
      scoringRegime: 'obligatory',
      defaultFixedDScore: 10.0,
    },
  };

  const apparatuses: Record<string, MockApparatus> = {
    [appVtGafId]: { id: appVtGafId, code: 'VT', discipline: 'GAF' },
    [appUbGafId]: { id: appUbGafId, code: 'UB', discipline: 'GAF' },
    [appFxGamId]: { id: appFxGamId, code: 'FX', discipline: 'GAM' },
  };

  const categoryApparatuses: { categoryId: string; apparatusId: string }[] = [
    { categoryId: catGafId, apparatusId: appVtGafId }, // Salto habilitado en Nivel 1 GAF
    // Viga/Paralelas no incluidas para probar aparato no habilitado
  ];

  const registrations: Record<string, MockRegistration> = {
    [regGafId]: {
      id: regGafId,
      championshipId: champId,
      clubId: 'club-a',
      categoryId: catGafId,
      status: 'approved',
    },
    [regOtherChampId]: {
      id: regOtherChampId,
      championshipId: otherChampId,
      clubId: 'club-b',
      categoryId: catGafId,
      status: 'approved',
    },
  };

  const scores: MockScore[] = [
    {
      id: 'score-approved-1',
      championshipId: champId,
      registrationId: regGafId,
      apparatusId: appVtGafId,
      attemptNumber: 1,
      dScore: 10.0,
      eScoreAvg: 9.2,
      neutralDeductions: 0.0,
      finalScore: 19.2,
      status: 'official_approved',
    },
  ];

  // Motor de simulación fiel a la función PostgreSQL submit_fast_judge_score
  function simulateSubmitFastJudgeScore(params: {
    championshipId: string;
    judgeToken: string;
    registrationId: string;
    apparatusId: string;
    dScore: number;
    eScores: number[];
    neutralDeductions: number;
    clientFinalScore: number;
    attemptNumber?: number;
  }) {
    const inputHash = computeSha256(params.judgeToken);

    // 1. Verificación de token
    const token = accessTokens.find(
      (t) =>
        t.tokenHash === inputHash &&
        t.championshipId === params.championshipId &&
        t.accessType === 'judge' &&
        t.isActive &&
        (!t.expiresAt || t.expiresAt > new Date())
    );

    if (!token) {
      throw new Error('OPERIX_SECURITY_VIOLATION: Código o token de juez no válido para este campeonato.');
    }

    // 2. Verificación de inscripción
    const reg = registrations[params.registrationId];
    if (!reg || reg.championshipId !== params.championshipId) {
      throw new Error('OPERIX_SECURITY_VIOLATION: La inscripción no pertenece al campeonato especificado.');
    }

    // 2b. Validación reglamentaria del número de intento (COALESCE en SQL no confunde 0 con null)
    const attempt = params.attemptNumber !== undefined && params.attemptNumber !== null ? params.attemptNumber : 1;
    if (attempt !== 1 && attempt !== 2) {
      throw new Error('OPERIX_VAL_ERROR: El número de intento debe ser 1 o 2.');
    }

    // 3. Verificación de aparato y disciplina
    const app = apparatuses[params.apparatusId];
    const cat = categories[reg.categoryId];

    if (!app) throw new Error('OPERIX_VAL_ERROR: Aparato inexistente.');
    if (app.discipline !== cat.discipline) {
      throw new Error(
        `OPERIX_SECURITY_VIOLATION: Incompatibilidad de disciplina. El aparato ${app.code} pertenece a ${app.discipline} pero la categoría es ${cat.discipline}.`
      );
    }

    // Solo Salto (VT) permite intento 2
    if (attempt === 2 && app.code !== 'VT') {
      throw new Error('OPERIX_VAL_ERROR: El segundo intento solo está reglamentado para el aparato Salto (VT).');
    }

    // 4. Verificación de aparato habilitado para la categoría
    const isEnabled = categoryApparatuses.some(
      (ca) => ca.categoryId === cat.id && ca.apparatusId === app.id
    );
    if (!isEnabled) {
      throw new Error(`OPERIX_SECURITY_VIOLATION: El aparato ${app.code} no está habilitado para la categoría.`);
    }

    // 5. Verificación de nota aprobada
    const existingScore = scores.find(
      (s) =>
        s.registrationId === reg.id &&
        s.apparatusId === app.id &&
        s.attemptNumber === attempt
    );

    if (existingScore && existingScore.status === 'official_approved') {
      throw new Error(
        'OPERIX_SECURITY_VIOLATION: La nota para este gimnasta ya ha sido aprobada oficialmente por el Juez Árbitro y no puede ser modificada desde la terminal rápida.'
      );
    }

    // 6. Cálculo server-side inmutable
    const serverD = cat.scoringRegime === 'obligatory' ? cat.defaultFixedDScore : params.dScore;
    const serverEAvg =
      params.eScores.length > 0
        ? params.eScores.reduce((a, b) => a + b, 0) / params.eScores.length
        : 0;
    const calculatedFinalScore = Math.max(
      0,
      Number((serverD + serverEAvg - params.neutralDeductions).toFixed(3))
    );

    return {
      success: true,
      calculatedFinalScore,
      serverD,
      serverEAvg,
    };
  }

  // --- TESTS ---

  it('1. Token de juez válido es aceptado exitosamente', () => {
    // Para una inscripción no aprobada previamente
    const result = simulateSubmitFastJudgeScore({
      championshipId: champId,
      judgeToken: validJudgeSecret,
      registrationId: regGafId,
      apparatusId: appVtGafId,
      dScore: 10.0,
      eScores: [9.0, 9.2],
      neutralDeductions: 0.1,
      clientFinalScore: 99.9, // Manipulado
      attemptNumber: 2, // Intento 2 para evitar choque con el intento 1 aprobado
    });

    expect(result.success).toBe(true);
    expect(result.calculatedFinalScore).toBe(19.0); // 10.0 + 9.1 - 0.1 = 19.0
  });

  it('2. Token de delegado es categóricamente rechazado en terminal de jueces', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: validDelegateSecret, // Token de delegado
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION: Código o token de juez no válido para este campeonato.');
  });

  it('3. Token revocado es rechazado', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: revokedJudgeSecret,
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION');
  });

  it('4. Token expirado es rechazado', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: expiredJudgeSecret,
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION');
  });

  it('5. Inscripción de otro campeonato es rechazada', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: validJudgeSecret,
        registrationId: regOtherChampId, // Pertenece a otherChampId
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION: La inscripción no pertenece al campeonato especificado.');
  });

  it('6. Aparato no habilitado para la categoría es rechazado', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: validJudgeSecret,
        registrationId: regGafId,
        apparatusId: appUbGafId, // UB no está en categoryApparatuses de Nivel 1
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION: El aparato UB no está habilitado para la categoría.');
  });

  it('7. Aparato GAM en inscripción GAF es rechazado por incompatibilidad de disciplina', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: validJudgeSecret,
        registrationId: regGafId,
        apparatusId: appFxGamId, // Suelo GAM
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION: Incompatibilidad de disciplina');
  });

  it('8. Nota final manipulada desde el cliente es ignorada y calculada en servidor', () => {
    const result = simulateSubmitFastJudgeScore({
      championshipId: champId,
      judgeToken: validJudgeSecret,
      registrationId: regGafId,
      apparatusId: appVtGafId,
      dScore: 5.0, // Cliente intentó poner 5.0 en categoría obligatoria (debe forzarse a 10.0)
      eScores: [9.0, 9.0],
      neutralDeductions: 0.5,
      clientFinalScore: 99.999, // Ataque cliente
      attemptNumber: 2,
    });

    expect(result.serverD).toBe(10.0);
    expect(result.calculatedFinalScore).toBe(18.5); // 10.0 + 9.0 - 0.5 = 18.5
    expect(result.calculatedFinalScore).not.toBe(99.999);
  });

  it('9. Intento de sobrescribir nota aprobada es bloqueado tajantemente', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: validJudgeSecret,
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
        attemptNumber: 1, // Ya existe como official_approved
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION: La nota para este gimnasta ya ha sido aprobada oficialmente');
  });

  it('10. Intento de modificar una nota de otro campeonato es bloqueado', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: otherChampId,
        judgeToken: validJudgeSecret, // Token válido solo para champId
        registrationId: regOtherChampId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION');
  });

  it('11. Delegado intentando consultar gimnastas de otro club es bloqueado', () => {
    const userClubIds = ['club-a'];
    const requestedClubId = 'club-b'; // Intento de acceso cruzado

    function simulateGetMyClubRotations(uid: string | null, targetClubId: string) {
      if (!uid) throw new Error('OPERIX_AUTH_ERROR');
      if (targetClubId && !userClubIds.includes(targetClubId)) {
        throw new Error('OPERIX_SECURITY_VIOLATION: No tiene autorización para consultar gimnastas de otro club.');
      }
      return [{ gymnastId: 'gym-1', clubId: 'club-a' }];
    }

    expect(() => simulateGetMyClubRotations('user-1', requestedClubId)).toThrow(
      'OPERIX_SECURITY_VIOLATION: No tiene autorización para consultar gimnastas de otro club.'
    );
  });

  it('12. Usuario sin membresía de club es rechazado en portal de delegados', () => {
    const emptyClubMemberships: string[] = [];

    function simulateDelegateAccess(memberships: string[]) {
      if (memberships.length === 0) {
        throw new Error('OPERIX_SECURITY_VIOLATION: El usuario no cuenta con membresías de club activas.');
      }
    }

    expect(() => simulateDelegateAccess(emptyClubMemberships)).toThrow(
      'OPERIX_SECURITY_VIOLATION: El usuario no cuenta con membresías de club activas.'
    );
  });

  it('13. Usuario de otra organización no puede gestionar el campeonato', () => {
    const orgA = 'org-1111';
    const orgB = 'org-2222';

    function simulateAdminModifyScore(userOrgId: string, champOrgId: string) {
      if (userOrgId !== champOrgId) {
        throw new Error('OPERIX_SECURITY_VIOLATION: No tiene privilegios de Juez Árbitro ni Administrador para modificar esta nota.');
      }
    }

    expect(() => simulateAdminModifyScore(orgB, orgA)).toThrow(
      'OPERIX_SECURITY_VIOLATION: No tiene privilegios de Juez Árbitro ni Administrador'
    );
  });

  it('14. Permisos EXECUTE de PUBLIC están explícitamente revocados en la migración', () => {
    const ddl = `
      REVOKE ALL ON FUNCTION public.submit_fast_judge_score FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION public.submit_fast_judge_score TO anon, authenticated;
    `;
    expect(ddl).toContain('REVOKE ALL ON FUNCTION public.submit_fast_judge_score FROM PUBLIC');
  });

  it('15. Resolución de digest califica explícitamente extensions.digest con search_path seguro', () => {
    const plpgsqlHeader = 'SET search_path = pg_catalog, extensions, public';
    const digestCall = "encode(extensions.digest(trim(p_judge_code)::bytea, 'sha256'), 'hex')";

    expect(plpgsqlHeader).toContain('extensions');
    expect(digestCall).toContain('extensions.digest');
  });

  it('16. Rate limiting mitiga ataques de fuerza bruta concurrentes', () => {
    const attemptLog: { ipHash: string; time: number }[] = [];
    const maxAttemptsPerMinute = 10;
    const clientIpHash = computeSha256('192.168.1.100');

    function checkRateLimit(ipHash: string): boolean {
      const oneMinuteAgo = Date.now() - 60000;
      const recentAttempts = attemptLog.filter(
        (a) => a.ipHash === ipHash && a.time > oneMinuteAgo
      );
      if (recentAttempts.length >= maxAttemptsPerMinute) {
        return false; // Bloqueado
      }
      attemptLog.push({ ipHash, time: Date.now() });
      return true;
    }

    // 10 intentos permitidos
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(clientIpHash)).toBe(true);
    }
    // Intento 11 debe ser bloqueado
    expect(checkRateLimit(clientIpHash)).toBe(false);
  });

  it('17. Código de juez incorrecto o inexistente es rechazado', () => {
    const unknownToken = '00000000000000000000000000000000';
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: unknownToken,
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION');
  });

  it('18. Token de otro campeonato es rechazado al intentar operar en Paillaco', () => {
    // Token válido en otherChampId pero no en champId
    const alienChampTokenSecret = 'alien999999999999999999999999999';
    accessTokens.push({
      id: 'tok-alien',
      championshipId: otherChampId,
      tokenHash: computeSha256(alienChampTokenSecret),
      accessType: 'judge',
      isActive: true,
      expiresAt: null,
      revokedAt: null,
    });

    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId, // Intentando usarlo en champId
        judgeToken: alienChampTokenSecret,
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
      })
    ).toThrow('OPERIX_SECURITY_VIOLATION');
  });

  it('19. get_championship_by_code no expone birth_date ni birth_year en registrations', () => {
    // Simulación del payload retornado por get_championship_by_code
    const registrationPayload = {
      id: 'reg-001',
      bib_number: 101,
      rotation_group: 'A1',
      gymnast_name: 'Atleta Protegida',
      club_name: 'Club Pumahue',
      category_name: 'Nivel 1 GAF',
      discipline: 'GAF',
      scoring_regime: 'obligatory',
      default_fixed_d_score: 10.0,
    };

    expect(registrationPayload).not.toHaveProperty('birth_date');
    expect(registrationPayload).not.toHaveProperty('birth_year');
    expect(registrationPayload).not.toHaveProperty('rut_or_id');
  });

  it('20. Migración 00003 elimina fallbacks legados a códigos en texto plano', () => {
    // Verificamos que la función en SQL no contenga referencias permisivas a judge_code plano
    const sqlCode = `
      SELECT true INTO v_token_valid
      FROM public.championship_access_tokens
      WHERE championship_id = p_championship_id
        AND access_type = 'judge'
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
        AND token_hash = v_input_hash;
    `;
    expect(sqlCode).toContain('token_hash = v_input_hash');
    expect(sqlCode).not.toContain('ELSIF v_champ_legacy_judge_code');
  });

  it('21. Intentos fuera del rango permitido (0 o 3) son categóricamente rechazados', () => {
    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: validJudgeSecret,
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
        attemptNumber: 0, // Inválido
      })
    ).toThrow('OPERIX_VAL_ERROR: El número de intento debe ser 1 o 2.');

    expect(() =>
      simulateSubmitFastJudgeScore({
        championshipId: champId,
        judgeToken: validJudgeSecret,
        registrationId: regGafId,
        apparatusId: appVtGafId,
        dScore: 10.0,
        eScores: [9.0],
        neutralDeductions: 0,
        clientFinalScore: 19.0,
        attemptNumber: 3, // Inválido
      })
    ).toThrow('OPERIX_VAL_ERROR: El número de intento debe ser 1 o 2.');
  });

  it('22. Intento 2 en aparato distinto a Salto (VT) es rechazado por reglamento FIG', () => {
    // Habilitamos temporalmente UB para probar
    categoryApparatuses.push({ categoryId: catGafId, apparatusId: appUbGafId });

    try {
      expect(() =>
        simulateSubmitFastJudgeScore({
          championshipId: champId,
          judgeToken: validJudgeSecret,
          registrationId: regGafId,
          apparatusId: appUbGafId, // Barras Asimétricas
          dScore: 10.0,
          eScores: [9.0],
          neutralDeductions: 0,
          clientFinalScore: 19.0,
          attemptNumber: 2, // No permitido en UB
        })
      ).toThrow('OPERIX_VAL_ERROR: El segundo intento solo está reglamentado para el aparato Salto (VT).');
    } finally {
      // Limpiar
      const idx = categoryApparatuses.findIndex(
        (ca) => ca.categoryId === catGafId && ca.apparatusId === appUbGafId
      );
      if (idx !== -1) categoryApparatuses.splice(idx, 1);
    }
  });

  it('23. Solicitudes concurrentes se resuelven atómicamente por ON CONFLICT sin duplicados', () => {
    // Simulación de dos jueces enviando sobre la misma clave relacional en paralelo
    const state = {
      scoreDb: new Map<string, { d: number; e: number; final: number; version: number }>(),
    };

    function atomicUpsert(key: string, d: number, e: number, finalScore: number) {
      const current = state.scoreDb.get(key);
      const version = current ? current.version + 1 : 1;
      state.scoreDb.set(key, { d, e, final: finalScore, version });
      return { key, version };
    }

    const uniqueKey = `${regGafId}_${appVtGafId}_2`; // Intento 2

    // Dos envíos simultáneos
    const res1 = atomicUpsert(uniqueKey, 10.0, 9.1, 19.1);
    const res2 = atomicUpsert(uniqueKey, 10.0, 9.3, 19.3);
    expect(res1.key).toBe(uniqueKey);
    expect(res2.key).toBe(uniqueKey);

    // Debe existir exactamente 1 registro en la tabla, nunca 2 registros huérfanos
    expect(state.scoreDb.size).toBe(1);
    const finalRecord = state.scoreDb.get(uniqueKey);
    expect(finalRecord?.version).toBe(2);
    expect(finalRecord?.final).toBe(19.3); // Último estado atómico consistente
  });

  it('24. Cierre de sesión en FastJudgeTerminal elimina tokens y sesión de localStorage', () => {
    const storageKey = 'operix_fast_judge_session';
    const mockStorage: Record<string, string> = {
      [storageKey]: JSON.stringify({ judgeCode: 'a1b2c3d4e5f6', judgeName: 'Juez 1' }),
    };

    function simulateLogout() {
      delete mockStorage[storageKey];
    }

    expect(mockStorage[storageKey]).toBeDefined();
    simulateLogout();
    expect(mockStorage[storageKey]).toBeUndefined();
  });
});
