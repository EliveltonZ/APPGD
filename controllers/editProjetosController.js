const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getEditProjetos: createRpcHandler("get_edit_projetos", "query"),
  setEditProjetos: createRpcHandler("set_edit_projetos", "body"),
};
