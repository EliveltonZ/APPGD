var DataTypes = require("sequelize").DataTypes;
var _Localizacoes            = require("./tblLocalizacoes");
var _Materiais               = require("./tblMateriais");
var _MateriaisCodigoNF       = require("./tblMateriaisCodigoNF");
var _NotasFiscais            = require("./tblNotasFiscais");
var _NotasFiscaisItens       = require("./tblNotasFiscaisItens");
var _XmlImportacoes          = require("./tblXmlImportacoes");
var _XmlConsumo              = require("./tblXmlConsumo");
var _Transferencias          = require("./tblTransferencias");
var _EstoqueMovimentos       = require("./tblEstoqueMovimentos");
var _SolicitacaoCompras      = require("./tblSolicitacaoCompras");
var _SolicitacaoComprasItens = require("./tblSolicitacaoComprasItens");
var _Acessorios              = require("./tblAcessorios");
var _Maquinas           = require("./tblMaquinas");
var _TipoRequisicao     = require("./tblTipoRequisicao");
var _Paradas            = require("./tblParadas");
var _ParadasHistorico   = require("./tblParadasHistorico");
var _Assistencias  = require("./tblAssistencias");
var _Avulsos       = require("./tblAvulsos");
var _Categorias    = require("./tblCategorias");
var _Causa         = require("./tblCausa");
var _CausaFalha    = require("./tblCausaFalha");
var _CentrosCusto  = require("./tblCentrosCusto");
var _Clientes      = require("./tblClientes");
var _Config        = require("./tblConfig");
var _Datas         = require("./tblDatas");
var _EquipSat      = require("./tblEquipSat");
var _Etapa         = require("./tblEtapa");
var _Falhas        = require("./tblFalhas");
var _Fornecedores  = require("./tblFornecedores");
var _Liberador     = require("./tblLiberador");
var _Loja          = require("./tblLoja");
var _Montador      = require("./tblMontador");
var _Ocorrencia    = require("./tblOcorrencia");
var _Pecas         = require("./tblPecas");
var _PlanoContas   = require("./tblPlanoContas");
var _Producao      = require("./tblProducao");
var _Projetos      = require("./tblProjetos");
var _TipoAmbiente  = require("./tblTipoAmbiente");
var _TipoAssistencia = require("./tblTipoAssistencia");
var _TipoCliente   = require("./tblTipoCliente");
var _TipoContrato  = require("./tblTipoContrato");
var _Usuario       = require("./tblUsuario");
var _Vendedor      = require("./tblVendedor");

function initModels(sequelize) {
  var Localizacoes            = _Localizacoes(sequelize, DataTypes);
  var Materiais               = _Materiais(sequelize, DataTypes);
  var MateriaisCodigoNF       = _MateriaisCodigoNF(sequelize, DataTypes);
  var NotasFiscais            = _NotasFiscais(sequelize, DataTypes);
  var NotasFiscaisItens       = _NotasFiscaisItens(sequelize, DataTypes);
  var XmlImportacoes          = _XmlImportacoes(sequelize, DataTypes);
  var XmlConsumo              = _XmlConsumo(sequelize, DataTypes);
  var Transferencias          = _Transferencias(sequelize, DataTypes);
  var EstoqueMovimentos       = _EstoqueMovimentos(sequelize, DataTypes);
  var SolicitacaoCompras      = _SolicitacaoCompras(sequelize, DataTypes);
  var SolicitacaoComprasItens = _SolicitacaoComprasItens(sequelize, DataTypes);
  var Acessorios              = _Acessorios(sequelize, DataTypes);
  var Maquinas           = _Maquinas(sequelize, DataTypes);
  var TipoRequisicao     = _TipoRequisicao(sequelize, DataTypes);
  var Paradas            = _Paradas(sequelize, DataTypes);
  var ParadasHistorico   = _ParadasHistorico(sequelize, DataTypes);
  var Assistencias   = _Assistencias(sequelize, DataTypes);
  var Avulsos        = _Avulsos(sequelize, DataTypes);
  var Categorias     = _Categorias(sequelize, DataTypes);
  var Causa          = _Causa(sequelize, DataTypes);
  var CausaFalha     = _CausaFalha(sequelize, DataTypes);
  var CentrosCusto   = _CentrosCusto(sequelize, DataTypes);
  var Clientes       = _Clientes(sequelize, DataTypes);
  var Config         = _Config(sequelize, DataTypes);
  var Datas          = _Datas(sequelize, DataTypes);
  var EquipSat       = _EquipSat(sequelize, DataTypes);
  var Etapa          = _Etapa(sequelize, DataTypes);
  var Falhas         = _Falhas(sequelize, DataTypes);
  var Fornecedores   = _Fornecedores(sequelize, DataTypes);
  var Liberador      = _Liberador(sequelize, DataTypes);
  var Loja           = _Loja(sequelize, DataTypes);
  var Montador       = _Montador(sequelize, DataTypes);
  var Ocorrencia     = _Ocorrencia(sequelize, DataTypes);
  var Pecas          = _Pecas(sequelize, DataTypes);
  var PlanoContas    = _PlanoContas(sequelize, DataTypes);
  var Producao       = _Producao(sequelize, DataTypes);
  var Projetos       = _Projetos(sequelize, DataTypes);
  var TipoAmbiente   = _TipoAmbiente(sequelize, DataTypes);
  var TipoAssistencia = _TipoAssistencia(sequelize, DataTypes);
  var TipoCliente    = _TipoCliente(sequelize, DataTypes);
  var TipoContrato   = _TipoContrato(sequelize, DataTypes);
  var Usuario        = _Usuario(sequelize, DataTypes);
  var Vendedor       = _Vendedor(sequelize, DataTypes);

  Paradas.belongsTo(Maquinas,       { as: "maquina",    foreignKey: "id_maquina" });
  Paradas.belongsTo(TipoRequisicao, { as: "tipo",       foreignKey: "id_tipo"    });
  Paradas.hasMany(ParadasHistorico,  { as: "historico",  foreignKey: "parada_id"  });
  ParadasHistorico.belongsTo(Paradas,{ as: "parada",    foreignKey: "parada_id"  });
  ParadasHistorico.belongsTo(Usuario,{ as: "usuario",   foreignKey: "alterado_por" });

  Acessorios.belongsTo(Projetos,   { as: "ordemdecompraTblProjeto", foreignKey: "ordemdecompra" });
  Acessorios.belongsTo(Categorias, { as: "tblCategoria",            foreignKey: "idCategoria"   });
  Projetos.hasMany(Acessorios,     { as: "tblAcessorios",           foreignKey: "ordemdecompra" });
  Avulsos.belongsTo(Projetos,      { as: "ordemdecompraTblProjeto", foreignKey: "ordemdecompra" });
  Projetos.hasOne(Avulsos,         { as: "tblAvulso",               foreignKey: "ordemdecompra" });
  Projetos.belongsTo(Clientes,     { as: "tblCliente",              foreignKey: "idCliente"     });
  Projetos.belongsTo(Usuario,      { as: "usuarioResponsavel",      foreignKey: "idResponsavel" });
  Projetos.belongsTo(Etapa,        { as: "tblEtapum",               foreignKey: "idEtapa"       });
  Projetos.belongsTo(Liberador,    { as: "tblLiberador",            foreignKey: "idLiberador"   });
  Projetos.hasOne(Producao,        { as: "tblProducao",             foreignKey: "ordemdecompra" });
  Projetos.belongsTo(Vendedor,     { as: "tblVendedor",             foreignKey: "idVendedor"    });

  CausaFalha.belongsTo(Causa,      { as: "causa",      foreignKey: "idCausa"                   });
  EquipSat.belongsTo(Montador,     { as: "montador",   foreignKey: "idMontador"                });

  Pecas.belongsTo(Ocorrencia,   { as: "ocorrencia",  foreignKey: "idOcorrencia", targetKey: "cod"      });
  Pecas.belongsTo(Falhas,       { as: "falha",       foreignKey: "idFalha",      targetKey: "codigo"   });
  Pecas.belongsTo(Assistencias, { as: "assistencia", foreignKey: "idAssistencia", targetKey: "solicitacao" });

  // Estoque de Matéria Prima
  MateriaisCodigoNF.belongsTo(Materiais,    { as: "material",   foreignKey: "materialId"   });
  MateriaisCodigoNF.belongsTo(Fornecedores, { as: "fornecedor", foreignKey: "fornecedorId" });

  NotasFiscaisItens.belongsTo(NotasFiscais, { as: "notaFiscal", foreignKey: "notaFiscalId" });
  NotasFiscaisItens.belongsTo(Materiais,    { as: "material",   foreignKey: "materialId"   });
  NotasFiscais.hasMany(NotasFiscaisItens,   { as: "itens",      foreignKey: "notaFiscalId" });

  XmlConsumo.belongsTo(XmlImportacoes, { as: "importacao",    foreignKey: "importacaoId"    });
  XmlConsumo.belongsTo(Materiais,      { as: "material",      foreignKey: "materialId"      });
  XmlImportacoes.hasMany(XmlConsumo,   { as: "consumos",      foreignKey: "importacaoId"    });

  Transferencias.belongsTo(Materiais,     { as: "material",          foreignKey: "materialId"          });
  Transferencias.belongsTo(Localizacoes,  { as: "localizacaoOrigem", foreignKey: "localizacaoOrigemId" });
  Transferencias.belongsTo(Localizacoes,  { as: "localizacaoDestino",foreignKey: "localizacaoDestinoId"});

  EstoqueMovimentos.belongsTo(Materiais,       { as: "material",     foreignKey: "materialId"     });
  EstoqueMovimentos.belongsTo(Localizacoes,    { as: "localizacao",  foreignKey: "localizacaoId"  });
  EstoqueMovimentos.belongsTo(Fornecedores,    { as: "fornecedor",   foreignKey: "fornecedorId"   });
  EstoqueMovimentos.belongsTo(NotasFiscaisItens,{ as: "nfItem",      foreignKey: "nfItemId"       });
  EstoqueMovimentos.belongsTo(XmlConsumo,      { as: "xmlConsumo",   foreignKey: "xmlConsumoId"   });
  EstoqueMovimentos.belongsTo(Transferencias,  { as: "transferencia",foreignKey: "transferenciaId"});

  SolicitacaoComprasItens.belongsTo(SolicitacaoCompras,  { as: "solicitacao", foreignKey: "solicitacaoId" });
  SolicitacaoComprasItens.belongsTo(Materiais,           { as: "material",    foreignKey: "materialId"    });
  SolicitacaoComprasItens.belongsTo(Fornecedores,        { as: "fornecedor",  foreignKey: "fornecedorId"  });
  SolicitacaoComprasItens.belongsTo(NotasFiscaisItens,   { as: "nfItem",      foreignKey: "nfItemId"      });
  SolicitacaoCompras.hasMany(SolicitacaoComprasItens,    { as: "itens",       foreignKey: "solicitacaoId" });

  return {
    Acessorios,
    Assistencias,
    Avulsos,
    Categorias,
    Causa,
    CausaFalha,
    CentrosCusto,
    Clientes,
    Config,
    Datas,
    EquipSat,
    Etapa,
    Falhas,
    Fornecedores,
    Liberador,
    Loja,
    Montador,
    Ocorrencia,
    Pecas,
    PlanoContas,
    Producao,
    Projetos,
    TipoAmbiente,
    TipoAssistencia,
    TipoCliente,
    TipoContrato,
    Usuario,
    Vendedor,
    Maquinas,
    TipoRequisicao,
    Paradas,
    ParadasHistorico,
    Localizacoes,
    Materiais,
    MateriaisCodigoNF,
    NotasFiscais,
    NotasFiscaisItens,
    XmlImportacoes,
    XmlConsumo,
    Transferencias,
    EstoqueMovimentos,
    SolicitacaoCompras,
    SolicitacaoComprasItens,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
