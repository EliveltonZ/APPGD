// Central registry for table and critical column names.
// To rename: 1 SQL migration + 1 line here.

const T = {
  // ── Core ──────────────────────────────────────────────────────────────────
  projetos: {
    name: 'tblProjetos',
    pk: 'ordemdecompra',
    cols: {
      oc:          'ordemdecompra',
      idCliente:   'id_cliente',
      idVendedor:  'id_vendedor',
      idLiberador: 'id_liberador',
      idLoja:      'id_loja',
      idTipoAmb:   'id_tipoambiente',
    },
  },
  producao:   { name: 'tblProducao',   pk: 'ordemdecompra' },
  clientes:   { name: 'tblClientes',   pk: 'id', cols: { nome: 'name' } },
  avulsos:    { name: 'tblAvulsos',    pk: 'ordemdecompra' },
  acessorios: { name: 'tblAcessorios', pk: 'id' },

  // ── Fábrica ───────────────────────────────────────────────────────────────
  paradas: {
    name: 'tblParadas',
    pk: 'id',
    cols: {
      idMaquina:  'id_maquina',
      idTipo:     'id_tipo',
      dataInicio: 'data_inicio',
      dataFim:    'data_fim',
    },
  },
  paradasHistorico: { name: 'tblParadasHistorico', pk: 'id' },
  maquinas:         { name: 'tblMaquinas',         pk: 'id' },
  tipoRequisicao:   { name: 'tblTipoRequisicao',   pk: 'id' },
  montador:         { name: 'tblMontador',          pk: 'id' },
  pecas: {
    name: 'tblPecas',
    pk: 'codigo',
    cols: {
      idMontador:    'id_montador',
      idAssistencia: 'id_assistencia',
      idOcorrencia:  'id_ocorrencia',
    },
  },
  ocorrencia: { name: 'tblOcorrencia', pk: 'cod' },

  // ── Lookup tables ─────────────────────────────────────────────────────────
  vendedor:     { name: 'tblVendedor',     pk: 'id', cols: { nome: 'name' } },
  liberador:    { name: 'tblLiberador',    pk: 'id', cols: { nome: 'name' } },
  loja:         { name: 'tblLoja',         pk: 'id', cols: { nome: 'name' } },
  tipoAmbiente: { name: 'tblTipoAmbiente', pk: 'id', cols: { nome: 'name' } },
  etapa:        { name: 'tblEtapa',        pk: 'id', cols: { nome: 'name' } },
  tipoContrato: { name: 'tblTipoContrato', pk: 'id', cols: { nome: 'name' } },
  tipoCliente:  { name: 'tblTipoCliente',  pk: 'id', cols: { nome: 'name' } },

  // ── Assistências / Qualidade ──────────────────────────────────────────────
  assistencias:    { name: 'tblAssistencias',    pk: 'solicitacao' },
  categorias:      { name: 'tblCategorias',      pk: 'id' },
  causa:           { name: 'tblCausa',           pk: 'id' },
  causaFalha:      { name: 'tblCausaFalha',      pk: 'id' },
  falhas:          { name: 'tblFalhas',          pk: 'codigo' },
  tipoAssistencia: { name: 'tblTipoAssistencia', pk: 'id' },

  // ── Financeiro ────────────────────────────────────────────────────────────
  planoContas:  { name: 'tblPlanoContas',  pk: 'id' },
  centrosCusto: { name: 'tblCentrosCusto', pk: 'id' },
  fornecedores: { name: 'tblFornecedores', pk: 'id' },

  // ── Outros ───────────────────────────────────────────────────────────────
  usuarios: { name: 'tblUsuario', pk: 'id' },
  datas:    { name: 'tblDatas',   pk: 'id' },
  config:   { name: 'tblConfig',  pk: 'cod' },
  equipSat: { name: 'tblEquipSat', pk: 'id' },

  // ── Promob (futuras) ──────────────────────────────────────────────────────
  promobImport:    { name: 'tblPromobImport',    pk: 'id' },
  promobItens:     { name: 'tblPromobItens',     pk: 'id' },
  promobOperacoes: { name: 'tblPromobOperacoes', pk: 'id' },

  // ── Estoque de Matéria Prima ─────────────────────────────────────────────
  localizacoes:            { name: 'tblLocalizacoes',            pk: 'id' },
  materiais:               { name: 'tblMateriais',               pk: 'id' },
  materiaisCodigoNF:       { name: 'tblMateriaisCodigoNF',       pk: 'id' },
  notasFiscais:            { name: 'tblNotasFiscais',            pk: 'id' },
  notasFiscaisItens:       { name: 'tblNotasFiscaisItens',       pk: 'id' },
  xmlImportacoes:          { name: 'tblXmlImportacoes',          pk: 'id' },
  xmlConsumo:              { name: 'tblXmlConsumo',              pk: 'id' },
  transferencias:          { name: 'tblTransferencias',          pk: 'id' },
  estoqueMovimentos:       { name: 'tblEstoqueMovimentos',       pk: 'id' },
  solicitacaoCompras:      { name: 'tblSolicitacaoCompras',      pk: 'id' },
  solicitacaoComprasItens: { name: 'tblSolicitacaoComprasItens', pk: 'id' },
};

module.exports = T;
