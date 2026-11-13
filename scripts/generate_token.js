/**
 * Operix Gymnastics — Token Generator CLI (CSPRNG 128-bit)
 * Desarrollado por Comercial Hels SpA
 *
 * Genera tokens criptográficamente seguros para jueces y delegados.
 * Muestra el token una sola vez en consola para entrega segura y calcula el hash SHA-256
 * que debe ser insertado en la base de datos (NUNCA el token en texto plano).
 */

import crypto from 'node:crypto';

export function generateAccessToken(type = 'judge') {
  // 16 bytes = 128 bits de entropía real CSPRNG
  const rawBytes = crypto.randomBytes(16);
  const plainToken = rawBytes.toString('hex'); // 32 caracteres hex
  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

  return {
    type,
    plainToken,
    tokenHash,
    generatedAt: new Date().toISOString()
  };
}

if (process.argv[1] && process.argv[1].endsWith('generate_token.js')) {
  const type = process.argv[2] === 'delegate' ? 'delegate' : 'judge';
  const tokenData = generateAccessToken(type);

  console.log('===============================================================');
  console.log(` OPERIX GYMNASTICS — GENERADOR DE TOKENS DE ALTA ENTROPÍA`);
  console.log('===============================================================');
  console.log(`Tipo de Acceso    : ${tokenData.type}`);
  console.log(`Generado en       : ${tokenData.generatedAt}`);
  console.log(`---------------------------------------------------------------`);
  console.log(`TOKEN SECRETO     : ${tokenData.plainToken}`);
  console.log(`(IMPORTANTE: Copia este token AHORA. No se guardará en texto plano.)`);
  console.log(`---------------------------------------------------------------`);
  console.log(`SHA-256 HASH      : ${tokenData.tokenHash}`);
  console.log(`(Este es el único valor que debe insertarse en Supabase)`);
  console.log('===============================================================');
}
