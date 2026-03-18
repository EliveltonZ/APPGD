const express = require("express");
const route = express.Router();
<<<<<<< HEAD
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require('express-validator');
const ProjetosProdController = require("./controllers/projetosPrdController");
const indexController = require("./controllers/indexController");
const ultilsController = require("./controllers/ultilsController");

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateLogin = [
  body('p_id').isInt().custom(value => {
    if (value < -1) {
      throw new Error('ID deve ser um número inteiro e positivo');
    }
    return true;
  }).withMessage('ID deve ser um número inteiro e positivo'),
  body('p_senha').isLength({ min: 1 }).withMessage('Senha é obrigatória'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

const validatePasswordChange = [
  body('id').isInt().custom(value => {
    if (value < -1) {
      throw new Error('ID deve ser um número inteiro e positivo');
    }
    return true;
  }).withMessage('ID deve ser um número inteiro e positivo'),
  body('nova_senha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
const acessosController = require("./controllers/acessosController");
=======
const ProjetosProdController = require("./controllers/projetosPrdController");
const indexController = require("./controllers/indexController");
const ultilsController = require("./controllers/ultilsController");
const acessoCrontroller = require("./controllers/acessosController");
>>>>>>> da5d35dc1a329033dc243abb7e06c9a70eecddab
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
const emailController = require("./controllers/emailController");
const assistenciaController = require("./controllers/assistenciasController");
<<<<<<< HEAD
const solicitacaoController = require("./controllers/solicitacaoController");
=======
const solicitacaoContgroller = require("./controllers/solicitacaoController");
>>>>>>> da5d35dc1a329033dc243abb7e06c9a70eecddab
const pecasController = require("./controllers/pecasController");

// rota para envio de email
route.post("/sendMail", emailController.sendMails);

// rotas utils.js
route.get("/getUsuario", ultilsController.getUsuario);
route.get("/getGroupedLiberador", ultilsController.getGroupedLiberador);
route.get("/getGroupedAmbiente", ultilsController.getGroupedAmbiente);
route.get("/getGroupedVendedor", ultilsController.getGroupedVendedor);
route.get("/getGroupedAcessorios", ultilsController.getGroupedAcessorios);
route.get("/fillTableAcessorios", ultilsController.fillTableAcessorios);
route.get("/getDate", ultilsController.getDate);
route.put("/setDate", ultilsController.setDate);
route.put("/setEtapa", ultilsController.setEtapa);
route.get("/getCodigoBarras", ultilsController.getCodigoBarras);
route.get("/getOperadores", ultilsController.getOperadores);
route.get("/setTipo", ultilsController.setTipo);
route.get("/getMontador", ultilsController.getMontador);
<<<<<<< HEAD
route.get("/validateLogin", authLimiter, ultilsController.validateLogin);
=======
route.get("/validateLogin", ultilsController.validateLogin);
>>>>>>> da5d35dc1a329033dc243abb7e06c9a70eecddab
route.get("/getSolicitacoes", ultilsController.getSolicitacoes);
route.get("/getPecas", ultilsController.getPecas);

// rotas index.js
<<<<<<< HEAD
route.post("/passwordValidation", authLimiter, validateLogin, indexController.passwordValidation);
=======
route.post("/passwordValidation", indexController.passwordValidation);
>>>>>>> da5d35dc1a329033dc243abb7e06c9a70eecddab

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
route.get("/getProducaoBarcode", ProjetosProdController.getProducaoBarcode);
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
route.get("/getStatus", projetosSttsController.getStatus);

// rotas acessos.js
<<<<<<< HEAD
route.get("/getUserAccess", acessosController.getUserAccess);
route.put("/setUserAccess", acessosController.setUserAccess);

// rotas senha.js
route.put("/alterarSenha", authLimiter, validatePasswordChange, senhaController.alterarSenha);
=======
route.get("/getUserAccess", acessoCrontroller.getUserAccess);
route.put("/setUserAccess", acessoCrontroller.setUserAccess);

// rotas senha.js
route.put("/alterarSenha", senhaController.alterarSenha);
>>>>>>> da5d35dc1a329033dc243abb7e06c9a70eecddab

// rotas acessos pagina
route.post("/setPermission", usuariosController.setPermissions);
route.post("/clearPermissions", usuariosController.clearPermissions);
route.get("/checkPermission", usuariosController.checkPermissao);

// rotas assistencias
route.get("/getAssistencias", assistenciaController.getAssistencias);
route.get("/getAssistencia", assistenciaController.getAssistencia);
route.put("/setAssistencia", assistenciaController.setAssistencia);
route.get("/getCapaAssistencia", assistenciaController.getCapaAssistencia);
route.post("/setNewOrder", assistenciaController.setNewOrder);

// rotas solicitacao
<<<<<<< HEAD
route.get("/getConfig", solicitacaoController.getConfig);
=======
route.get("/getConfig", solicitacaoContgroller.getConfig);
>>>>>>> da5d35dc1a329033dc243abb7e06c9a70eecddab

// rotas pecas
route.get("/getOcorrencia", pecasController.getOcorrencia);
route.get("/getFalhas", pecasController.getFalhas);
route.post("/setPecas", pecasController.setPecas);

route.get("/user-data", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ erro: "Não autenticado" });
  }
  res.json(req.session.user);
});

module.exports = route;
