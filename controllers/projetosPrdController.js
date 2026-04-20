// projectController.js
const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  fillTable: createRpcHandler("listar_projetos_producao", "query"),
  getProducao: createRpcHandler("buscar_projeto_producao", "query"),
  getProducaoBarcode: createRpcHandler("get_producao_barcode", "query"),
  setDataProducao: createRpcHandler("atualizar_dados_producao", "body"),
};
