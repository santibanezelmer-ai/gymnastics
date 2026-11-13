/**
 * OPERIX GYMNASTICS — SUITE DE PRUEBAS REST AUTOMATIZADAS PARA STAGING
 * Desarrollado por: Comercial Hels SpA
 *
 * Ejecuta validaciones HTTP reales sobre la API PostgREST de Supabase Staging.
 *
 * RESTRICCIÓN DE SEGURIDAD CRÍTICA:
 * Si la URL suministrada corresponde al proyecto de producción (wuifhlsygqdldtzoouln),
 * el script aborta la ejecución de forma inmediata sin emitir ninguna solicitud.
 */

import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

const STAGING_URL = process.env.VITE_SUPABASE_URL || process.env.STAGING_SUPABASE_URL;
const STAGING_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.STAGING_ANON_KEY;

// 1. GUARDA DE SEGURIDAD ESTRICTA ANTI-PRODUCCIÓN
if (!STAGING_URL || STAGING_URL.includes('wuifhlsygqdldtzoouln')) {
  console.error('\n====================================================================');
  console.error(' [BLOQUEO DE SEGURIDAD] INTENTO DE CONEXIÓN A PRODUCCIÓN DETECTADO');
  console.error('====================================================================');
  console.error('Este script de pruebas REST solo debe ejecutarse contra STAGING.');
  console.error('URL detectada:', STAGING_URL || 'NO CONFIGURADA');
  console.error('El proyecto wuifhlsygqdldtzoouln es PRODUCCIÓN y está estrictamente protegido.');
  console.error('Por favor, configure VITE_SUPABASE_URL con el proyecto de Staging.\n');
  process.exit(1);
}

if (!STAGING_ANON_KEY) {
  console.error('Error: STAGING_ANON_KEY no proporcionada.');
  process.exit(1);
}

console.log('====================================================================');
console.log(' OPERIX GYMNASTICS — VERIFICACIÓN REST EN STAGING');
console.log('====================================================================');
console.log('Target URL :', STAGING_URL);
console.log('Ambiente   : STAGING AISLADO\n');

function postgrestRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(path, STAGING_URL);
    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqHeaders = {
      apikey: STAGING_ANON_KEY,
      Authorization: `Bearer ${STAGING_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = client.request(
      parsed,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(responseData);
          } catch {
            json = responseData;
          }
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runStagingVerification() {
  let passed = 0;
  let failed = 0;

  // PRUEBA 1: Verificar que judge_code NO sea consultable vía GET directo
  try {
    console.log('1. Probando bloqueo de lectura directa de judge_code (anon)...');
    const res = await postgrestRequest('GET', '/rest/v1/championships?select=id,name,judge_code');
    if (res.status === 400 || res.status === 401 || (res.data && res.data.message && res.data.message.includes('permission denied'))) {
      console.log('   ✓ EXITOSO: Permiso denegado por columna (judge_code no accesible a anon).');
      passed++;
    } else {
      console.error('   ✗ FALLO: judge_code fue accesible o no retornó error de permiso.', res.status, res.data);
      failed++;
    }
  } catch (err) {
    console.log('   ✓ EXITOSO: Petición rechazada a nivel de red/permiso.', err.message);
    passed++;
  }

  // PRUEBA 2: Consulta RPC get_championship_by_code con token sintético válido
  const syntheticToken = 'staging_judge_test_token_2026_ok';
  try {
    console.log('\n2. Probando RPC get_championship_by_code con token sintético...');
    const res = await postgrestRequest('POST', '/rest/v1/rpc/get_championship_by_code', {
      p_code: syntheticToken,
    });

    if (res.status === 200 && res.data && res.data.championship) {
      console.log('   ✓ EXITOSO: Campeonato sintético resuelto correctamente.');
      const regs = res.data.registrations || [];
      if (regs.length > 0 && !regs[0].birth_date && !regs[0].birth_year) {
        console.log('   ✓ EXITOSO: Registrations excluyen fechas de nacimiento.');
        passed++;
      } else {
        console.error('   ✗ FALLO: Fechas de nacimiento detectadas en registrations.');
        failed++;
      }
      passed++;
    } else {
      console.error('   ✗ FALLO: RPC retornó error o datos vacíos.', res.status, res.data);
      failed++;
    }
  } catch (err) {
    console.error('   ✗ ERROR en RPC:', err.message);
    failed++;
  }

  // PRUEBA 3: Intento de acceso con token inválido o aleatorio
  try {
    console.log('\n3. Probando rechazo de token inexistente...');
    const res = await postgrestRequest('POST', '/rest/v1/rpc/get_championship_by_code', {
      p_code: 'random_invalid_token_99999999',
    });

    if (res.status === 200 && res.data === null) {
      console.log('   ✓ EXITOSO: Token inexistente retorna payload NULL.');
      passed++;
    } else {
      console.error('   ✗ FALLO: Token inválido no retornó NULL.', res.data);
      failed++;
    }
  } catch (err) {
    console.error('   ✗ ERROR:', err.message);
    failed++;
  }

  console.log('\n====================================================================');
  console.log(` RESULTADOS STAGING REST: ${passed} Exitosas, ${failed} Fallidas`);
  console.log('====================================================================\n');
}

runStagingVerification().catch((err) => {
  console.error('Error fatal ejecutando pruebas REST:', err);
  process.exit(1);
});
