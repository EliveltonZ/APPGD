const repo = require('../repositories/preferenciasRepository');

const buscarPreferencias = (userId, chaves) => repo.buscarPreferencias(userId, chaves);
const salvarPreferencias = (userId, entries) => repo.salvarPreferencias(userId, entries);

module.exports = { buscarPreferencias, salvarPreferencias };
