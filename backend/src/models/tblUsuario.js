const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblUsuario', {
    id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      autoIncrementIdentity: true,
    },
    login: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    senha: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    setor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adicionarProjetos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'adicionar_projetos'
    },
    producao: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    expedicao: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    adicionarUsuarios: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'adicionar_usuarios'
    },
    acesso: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    definicoes: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    pcp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    previsao: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    compras: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    producaoAssistencia: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'producao_assistencia'
    },
    solicitarAssistencia: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'solicitar_assistencia'
    },
    valores: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    dashboard: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    camiseta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    calca: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sapato: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    local: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qualidade: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    logisticaAssistencia: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'logistica_assistencia'
    },
    novoPedido: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'novo_pedido'
    },
    editarPedido: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'editar_pedido'
    },
    excluirPedido: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'excluir_pedido'
    },
    pendencia: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    planejamento: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    novaSolicitacao: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'nova_solicitacao'
    },
    password: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    relatorios: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    apontamento: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    paradasMaquina: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'paradas_maquina'
    },
    paradasAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'paradas_admin'
    },
    cadastrosEquipe: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'cadastros_equipe'
    },
    cadastrosQualidade: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'cadastros_qualidade'
    },
    cadastrosComercial: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'cadastros_comercial'
    },
    cadastrosClientes: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'cadastros_clientes'
    },
    cadastrosUsuarios: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'cadastros_usuarios'
    }
  }, {
    sequelize,
    tableName: 'tblUsuario',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblusuario_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
