const { createRpcHandler } = require("./rpcHandlerFactory");
module.exports = {
  fillTablePrevisao: createRpcHandler("listar_projetos_previsao", "query"),
  getPrevisao: createRpcHandler("buscar_projeto_previsao", "query"),
};
