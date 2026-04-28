const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getEditProjetos: createRpcHandler("buscar_editar_projetos"),
  setEditProjetos: createRpcHandler("atualizar_editar_projetos", "body"),
};
