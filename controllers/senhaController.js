const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  alterarSenha: createRpcHandler("set_senha", "body"),
};
