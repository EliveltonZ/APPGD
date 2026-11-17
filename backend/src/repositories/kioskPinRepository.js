const crypto = require('crypto');
const { KioskPin } = require('../client/db');

const ROW_ID = 1;

function gerarPinNumerico() {
  // 6 dígitos, fácil de digitar uma vez no terminal — não precisa de
  // entropia alta, só distinguir de "qualquer um adivinhou por acaso".
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

async function buscarPin() {
  const row = await KioskPin.findByPk(ROW_ID);
  if (!row) return null;
  return { pin: row.pin, atualizadoEm: row.atualizadoEm };
}

async function gerarPin() {
  const pin = gerarPinNumerico();
  const atualizadoEm = new Date();
  await KioskPin.upsert({ id: ROW_ID, pin, atualizadoEm });
  return { pin, atualizadoEm };
}

async function validarPin(pinRecebido) {
  if (!pinRecebido) return false;
  const row = await KioskPin.findByPk(ROW_ID);
  return !!row && row.pin === String(pinRecebido);
}

module.exports = { buscarPin, gerarPin, validarPin };
