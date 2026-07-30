const repo = require("../repositories/valoresRepository");

const listarValoresProjetos = (p_inicio, p_fim) => repo.listarValoresProjetos(p_inicio, p_fim);

module.exports = { listarValoresProjetos };
