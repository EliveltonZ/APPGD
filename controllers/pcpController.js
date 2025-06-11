const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getProjetoPcp: createRpcHandler("get_projetos_pcp", "query"),
  getLastLote: createRpcHandler("get_last_lote", "query"),
  getProjetosLote: createRpcHandler("get_projetos_lote", "query"),
  setStartLote: createRpcHandler("set_iniciar_lote", "body"),
  setLote: createRpcHandler("setlote", "body"),
  setProjetoPcp: createRpcHandler("set_projetos_pcp", "body"),
  exportarDados: createRpcHandler("get_exportar_projetos", "query"),
};
