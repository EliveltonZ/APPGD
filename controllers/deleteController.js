const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getDeleteProjetos: createRpcHandler("get_delete_projetos", "query"),
  setDeleteProjeto: createRpcHandler("set_delete_projeto", "body"),
};
