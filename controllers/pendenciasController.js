const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getContratoPendencias: createRpcHandler("buscar_contrato_pendencia"),
  fillTableAPendencia: createRpcHandler("get_acessorios_pendencias"),
  insertAcessorios: createRpcHandler("inserir_acessorios", "body"),
  delAcessorios: createRpcHandler("del_acessorio", "body"),
  listarCategoria: createRpcHandler("listar_categoria"),
};
