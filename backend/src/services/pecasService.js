const repo = require("../repositories/pecasRepository");

const listarPecas  = (idAssistencia)           => repo.listarPecas(idAssistencia);
const inserirPecas = (idAssistencia, pecas)    => repo.inserirPecas(idAssistencia, pecas);

module.exports = { listarPecas, inserirPecas };
