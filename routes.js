const express = require("express");
const route = express.Router();
const ProjetosProdController = require("./controllers/projetosPrdController");
const indexController = require("./controllers/indexController");
const ultilsController = require("./controllers/ultilsController");
const acessoCrontroller = require("./controllers/acessosController");
const addProjetosController = require("./controllers/addProjetosController");
const menuController = require("./controllers/menuController");
const addUsersController = require("./controllers/addUsersController");
const capaController = require("./controllers/capaController");
const comprasController = require("./controllers/comprasController");
const deleteController = require("./controllers/deleteController");
const editProjetosController = require("./controllers/editProjetosController");
const projetosExpController = require("./controllers/projetosExpController");
const pcpController = require("./controllers/pcpController");
const pendenciasController = require("./controllers/pendenciasController");
const valoresController = require("./controllers/valoresController");
const projetosPrevController = require("./controllers/projetosPrevController");
const projetosSttsController = require("./controllers/projetosSttsController");
const senhaController = require("./controllers/senhaController");
const usuariosController = require("./controllers/usuariosController");

// rotas utils.js
route.get("/getUsuario", ultilsController.getUsuario);
route.get("/getGroupedLiberador", ultilsController.getGroupedLiberador);
route.get("/getGroupedAmbiente", ultilsController.getGroupedAmbiente);
route.get("/getGroupedVendedor", ultilsController.getGroupedVendedor);
route.get("/getGroupedAcessorios", ultilsController.getGroupedAcessorios);
route.get("/fillTableAcessorios", ultilsController.fillTableAcessorios);

// rotas index.js
route.post("/passwordValidation", indexController.passwordValidation);

// rotas capa.js
route.get("/fillElements", capaController.fillElements);

// rotas compras.js
route.get("/getAcessoriosCompras", comprasController.getAcessoriosCompras);
route.put("/setAcessorios", comprasController.setAcessorios);

// rotas addProjetos.js
route.get("/getContrato", addProjetosController.getContrato);
route.post("/setProjeto", addProjetosController.setProjeto);

// rotas editProjetos.js
route.get("/getEditProjetos", editProjetosController.getEditProjetos);
route.put("/setEditProjetos", editProjetosController.setEditProjetos);

// rotas deleteProjetos.js
route.get("/getDeleteProjetos", deleteController.getDeleteProjetos);
route.delete("/setDeleteProjeto", deleteController.setDeleteProjeto);

// rotas pcp.js
route.get("/getProjetoPcp", pcpController.getProjetoPcp);
route.get("/getLastLote", pcpController.getLastLote);
route.get("/getProjetosLote", pcpController.getProjetosLote);
route.put("/setStartLote", pcpController.setStartLote);
route.put("/setLote", pcpController.setLote);
route.put("/setProjetoPcp", pcpController.setProjetoPcp);
route.get("/exportarDados", pcpController.exportarDados);

// rotas addUser.js
route.get("/getMaxId", addUsersController.getMaxId);
route.post("/insertUser", addUsersController.insertUser);

// rotas pendencias.js
route.get("/getContratoPendencias", pendenciasController.getContratoPendencias);
route.get("/fillTableAPendencia", pendenciasController.fillTableAPendencia);
route.post("/insertAcessorios", pendenciasController.insertAcessorios);
route.delete("/delAcessorios", pendenciasController.delAcessorios);

// rotas valores.js
route.get("/fillTableValores", valoresController.fillTableValores);

// rotas projetosProd.js
route.get("/filltablePrd", ProjetosProdController.fillTable);
route.get("/getProducao", ProjetosProdController.getProducao);

route.put("/setDataProducao", ProjetosProdController.setDataProducao);

// rotas projetosPrev.js
route.get("/fillTablePrevisao", projetosPrevController.fillTablePrevisao);
route.get("/getPrevisao", projetosPrevController.getPrevisao);

// rotas ProjetosExp.js
route.get("/fillTableExp", projetosExpController.fillTable);
route.put("/setDataExpedicao", projetosExpController.setDataExpedicao);
route.get("/getExpedicao", projetosExpController.getExpedicao);

// rotas projetosStts.js
route.get("/fillTableStts", projetosSttsController.fillTable);
route.get("/getProjetosStts", projetosSttsController.getStatus);

// rotas acessos.js
route.get("/getUserAccess", acessoCrontroller.getUserAccess);
route.put("/setUserAccess", acessoCrontroller.setUserAccess);

// rotas senha.js
route.put("/alterarSenha", senhaController.alterarSenha);

// rotas acessos pagina
route.post("/setPermission", usuariosController.setPermissions);
route.get("/checkPermission", usuariosController.checkPermissao);

route.get("/user-data", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ erro: "Não autenticado" });
  }
  res.json(req.session.user);
});

module.exports = route;
