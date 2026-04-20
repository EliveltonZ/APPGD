const { createRpcHandler } = require("./rpcHandlerFactory");

// Exportando as funções
module.exports = {
  fillTable: createRpcHandler("listar_projetos_expedicao", "query"),
  getExpedicao: createRpcHandler("buscar_projeto_expedicao", "query"),
  setDataExpedicao: createRpcHandler("set_expedicao", "body"),
};
