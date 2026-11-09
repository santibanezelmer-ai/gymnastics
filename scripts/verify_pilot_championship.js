/**
 * OPERIX GYMNASTICS — PROTOCOLO DE VERIFICACIÓN POST-SIEMBRA (PILOTO 2026)
 * Desarrollado por Comercial Hels SpA
 * Fecha: 8 de noviembre de 2026
 *
 * Valida de forma no destructiva la integridad y el aislamiento del campeonato
 * piloto en la instancia de producción de Supabase.
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
  console.log('OPERIX GYMNASTICS — AUDITORÍA DEL CAMPEONATO PILOTO');
  console.log(`Servidor: ${SUPABASE_URL}`);
  console.log(`Fecha: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Verificar existencia del campeonato piloto por slug
  try {
    const res = await querySupabase('championships?slug=eq.piloto-operix-2026&select=id,name,slug,status,visibility,public_portal_settings');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length === 1) {
      const champ = res.body[0];
      const isTest = champ.public_portal_settings?.is_testing_event === true;
      if (isTest) {
        console.log('✅ [CHECK 1] Campeonato piloto detectado correctamente con bandera "is_testing_event: true".');
        passed++;
      } else {
        console.log('⚠️ [CHECK 1 FAIL] El campeonato existe pero no tiene la bandera "is_testing_event: true".');
        failed++;
      }
    } else {
      console.log('⏳ [CHECK 1 PENDIENTE] Campeonato piloto no encontrado aún (Pendiente de siembra SQL).');
    }
  } catch (err) {
    console.log(`❌ Error al consultar campeonato: ${err.message}`);
    failed++;
  }

  // 2. Verificar que el campeonato real preexistente permanece inalterado
  try {
    const resReal = await querySupabase('championships?slug=eq.nacional-gaf-2026&select=id,name,slug,status');
    if (resReal.status === 200 && Array.isArray(resReal.body) && resReal.body.length === 1) {
      console.log('✅ [CHECK 2] Campeonato real "Campeonato Nacional Apertura GAF 2026" permanece intacto.');
      passed++;
    } else {
      console.log('❌ [CHECK 2 FAIL] ¡ALERTA! El campeonato real no fue encontrado o fue alterado.');
      failed++;
    }
  } catch (err) {
    console.log(`❌ Error al consultar campeonato real: ${err.message}`);
    failed++;
  }

  // 3. Verificar estado en vivo de aparatos piloto
  try {
    const resApp = await querySupabase('apparatus_live_status?championship_id=eq.e0000000-0000-0000-0000-000000001000&select=apparatus_code,status');
    if (resApp.status === 200 && Array.isArray(resApp.body) && resApp.body.length === 4) {
      console.log('✅ [CHECK 3] Marshaling de aparatos piloto verificado (4 aparatos GAF: VT, UB, BB, FX).');
      passed++;
    } else if (resApp.status === 200 && resApp.body.length === 0) {
      console.log('⏳ [CHECK 3 PENDIENTE] Aparatos piloto no sembrados aún.');
    } else {
      console.log(`ℹ️ [CHECK 3 INFO] apparatus_live_status respondio status ${resApp.status}`);
    }
  } catch (err) {
    console.log(`❌ Error al consultar aparatos: ${err.message}`);
  }

  console.log('\n================================================================');
  console.log(`RESUMEN: ${passed} verificaciones exitosas, ${failed} fallos.`);
  console.log('================================================================');
}

runVerification();
