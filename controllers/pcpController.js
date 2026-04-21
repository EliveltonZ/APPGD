const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getProjetoPcp: createRpcHandler("buscar_projetos_pcp"),
  getLastLote: createRpcHandler("buscar_ultimo_lote"),
  getProjetosLote: createRpcHandler("listar_projetos_lote"),
  setStartLote: createRpcHandler("atualizar_iniciar_lote", "body"),
  setLote: createRpcHandler("atualizar_lote", "body"),
  setProjetoPcp: createRpcHandler("atualizar_projeto_pcp", "body"),
  exportarDados: createRpcHandler("list_exportar_projetos_periodo"),
};
