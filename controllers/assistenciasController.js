const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getAssistencias: createRpcHandler("listar_assistencias"),
  getAssistencia: createRpcHandler("buscar_assistencia"),
  setAssistencia: createRpcHandler("atualizar_assistencia", "body"),
  getCapaAssistencia: createRpcHandler("buscar_capa_assistencia"),
  setNewOrder: createRpcHandler("inserir_solicitacao", "body"),
};
