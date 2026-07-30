const repo = require("../repositories/previsaoRepository");

const listarProjetosPrevisoes = ()               => repo.listarProjetosPrevisoes();
const buscarProjetoPrevisao   = (ordemdecompra)  => repo.buscarProjetoPrevisao(ordemdecompra);

module.exports = { listarProjetosPrevisoes, buscarProjetoPrevisao };
