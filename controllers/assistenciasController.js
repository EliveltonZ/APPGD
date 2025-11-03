const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getAssistencias: createRpcHandler("get_assistencias", "query"),
  getAssistencia: createRpcHandler("get_assistencia", "query"),
  setAssistencia: createRpcHandler("set_assistencia", "body"),
  getCapaAssistencia: createRpcHandler("get_capa_assistencia", "query"),
  setNewOrder: createRpcHandler("set_solicitacao", "body"),
  getMontador: createRpcHandler("get_montador", "query"),
};
