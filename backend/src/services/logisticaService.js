const repo = require("../repositories/logisticaRepository");

const listarProjetosLogistica = (data_condition) => repo.listarProjetosLogistica(data_condition);
const buscarProjetoLogistica  = (ordemdecompra)  => repo.buscarProjetoLogistica(ordemdecompra);

module.exports = { listarProjetosLogistica, buscarProjetoLogistica };
