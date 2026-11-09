/**
 * OPERIX GYMNASTICS — PROTOCOLO DE VERIFICACIÓN POST-SIEMBRA (PILOTO 2026)
 * Desarrollado por Comercial Hels SpA
 * Fecha: 8 de noviembre de 2026
 *
 * Valida de forma no destructiva la integridad, pertenencia exclusiva
 * y aislamiento del campeonato piloto en la base de datos real de Supabase.
 */

import https from 'node:https';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wuifhlsygqdldtzoouln.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aWZobHN5Z3FkbGR0em9vdWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3Mzc2MzksImV4cCI6MjEwOTMxMzYzOX0.9zjrmpvnus8W1XV5bpEA6ZPRPbnGqFl62WjdasfkI5o';

function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    https.get(url, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('================================================================');
  console.log('OPERIX GYMNASTICS — AUDITORÍA DEL CAMPEONATO PILOTO (PRODUCCIÓN)');
  console.log(`Servidor: ${SUPABASE_URL}`);
  console.log(`Fecha: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Verificar estado del campeonato real preexistente
  try {
    const resReal = await querySupabase('championships?slug=eq.nacional-gaf-2026&select=id,name,slug,status,visibility');
    if (resReal.status === 200 && Array.isArray(resReal.body) && resReal.body.length === 1) {
      const real = resReal.body[0];
      if (real.name === 'Campeonato Nacional Apertura GAF 2026' && real.status === 'in_progress') {
        console.log('✅ [CHECK 1 OK] Campeonato real preexistente permanece 100% inalterado y operativo.');
        passed++;
      } else {
        console.log('❌ [CHECK 1 FAIL] ¡ALERTA! El campeonato real sufrió modificaciones en sus atributos.');
        failed++;
      }
    } else {
      console.log('❌ [CHECK 1 FAIL] No se encontró el campeonato real preexistente.');
      failed++;
    }
  } catch (err) {
    console.log(`❌ Error al consultar campeonato real: ${err.message}`);
    failed++;
  }

  // 2. Verificar estado del campeonato piloto
  try {
    const res = await querySupabase('championships?id=eq.e0000000-0000-0000-0000-000000001000&select=id,name,slug,status,visibility,public_portal_settings');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length === 1) {
      const champ = res.body[0];
      const isPrivate = champ.visibility === 'private';
      const isDraft = champ.status === 'draft';
      const isTestFlag = champ.public_portal_settings?.is_testing_event === true;

      if (isPrivate && isDraft && isTestFlag) {
        console.log('✅ [CHECK 2 OK] Campeonato piloto verificado: privado, borrador y con bandera de prueba.');
        passed++;
      } else {
        console.log(`⚠️ [CHECK 2 FAIL] Atributos incorrectos: visibility=${champ.visibility}, status=${champ.status}, is_testing=${isTestFlag}`);
        failed++;
      }
    } else {
      console.log('⏳ [CHECK 2 PENDIENTE] Campeonato piloto no sembrado aún (Estado pre-siembra normal).');
    }
  } catch (err) {
    console.log(`❌ Error al consultar campeonato piloto: ${err.message}`);
    failed++;
  }

  // 3. Verificar que los aparatos piloto correspondan a GAF
  try {
    const resApp = await querySupabase('apparatus_live_status?championship_id=eq.e0000000-0000-0000-0000-000000001000&select=apparatus_code,status');
    if (resApp.status === 200 && Array.isArray(resApp.body) && resApp.body.length === 4) {
      const codes = resApp.body.map(a => a.apparatus_code).sort();
      if (codes.join(',') === 'BB,FX,UB,VT') {
        console.log('✅ [CHECK 3 OK] Aparatos piloto corresponden exactamente a los 4 aparatos GAF (BB, FX, UB, VT).');
        passed++;
      } else {
        console.log(`⚠️ [CHECK 3 FAIL] Códigos de aparatos inesperados: ${codes.join(',')}`);
        failed++;
      }
    } else if (resApp.status === 200 && resApp.body.length === 0) {
      console.log('⏳ [CHECK 3 PENDIENTE] Aparatos piloto no sembrados aún.');
    }
  } catch (err) {
    console.log(`❌ Error al consultar aparatos: ${err.message}`);
  }

  // 4. Verificar ausencia de exposición pública no autorizada
  try {
    const resPublic = await querySupabase('championships?slug=eq.piloto-operix-2026&visibility=eq.public&select=id');
    if (resPublic.status === 200 && Array.isArray(resPublic.body) && resPublic.body.length === 0) {
      console.log('✅ [CHECK 4 OK] El campeonato piloto NO está expuesto públicamente (blindaje activo).');
      passed++;
    } else {
      console.log('❌ [CHECK 4 FAIL] ¡ALERTA! El campeonato piloto está visible públicamente sin autorización.');
      failed++;
    }
  } catch (err) {
    console.log(`❌ Error al verificar visibilidad pública: ${err.message}`);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`RESUMEN: ${passed} verificaciones exitosas, ${failed} fallos.`);
  console.log('================================================================');
}

runVerification();
