const repo = require("../repositories/pecasRepository");

const listarPecas  = (id_assistencia)          => repo.listarPecas(id_assistencia);
const inserirPecas = (id_assistencia, p_pecas) => repo.inserirPecas(id_assistencia, p_pecas);

module.exports = { listarPecas, inserirPecas };
