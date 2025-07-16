// projectController.js
const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  fillTable: createRpcHandler("get_project_prod", "query"),
  getProducao: createRpcHandler("get_producao", "query"),
  getProducaoBarcode: createRpcHandler("get_producao_barcode", "query"),
  setDataProducao: createRpcHandler("set_data_producao", "body"),
};
