const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getDeleteProjetos: createRpcHandler("buscar_projeto_deletar", "query"),
  setDeleteProjeto: createRpcHandler("set_delete_projeto", "body"),
};
