const repo = require("../repositories/qualidadeRepository");

const listarPecasQualidade = ()      => repo.listarPecasQualidade();
const updateCausaRaiz      = (dados) => repo.updateCausaRaiz(dados);

module.exports = { listarPecasQualidade, updateCausaRaiz };
