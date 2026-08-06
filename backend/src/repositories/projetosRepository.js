const {
  Projetos, Producao, Avulsos, Acessorios,
  Clientes, TipoCliente, Vendedor, Liberador,
  Loja, TipoAmbiente, TipoContrato, Etapa,
  Usuario,
} = require("../client/db");

async function buscarPorContrato(contrato) {
  const rows = await Projetos.findAll({
    where: { contrato: Number(contrato) },
    attributes: [
      'idCliente', 'idTipocliente', 'idVendedor', 'idLiberador',
      'idLoja', 'datacontrato', 'dataassinatura', 'chegoufabrica',
      'dataentrega', 'idEtapa',
    ],
    include: [
      { model: Clientes, as: 'tblCliente', attributes: ['name'], required: false },
    ],
  });
  return rows.map((p) => ({
    id_cliente:     p.idCliente,
    cliente:        p.tblCliente?.name ?? null,
    id_tipocliente: p.idTipocliente,
    id_vendedor:    p.idVendedor,
    id_liberador:   p.idLiberador,
    id_loja:        p.idLoja,
    datacontrato:   p.datacontrato,
    dataassinatura: p.dataassinatura,
    chegoufabrica:  p.chegoufabrica,
    dataentrega:    p.dataentrega,
    id_etapa:       p.idEtapa,
  }));
}

async function listarClientes() {
  const rows = await Clientes.findAll({ order: [["name", "ASC"]] });
  return rows.map((c) => ({ id: c.id, nome: c.name }));
}

async function listarTiposCliente() {
  const rows = await TipoCliente.findAll({ order: [["name", "ASC"]] });
  return rows.map((t) => ({ id: t.id, tipocliente: t.name }));
}

async function _resolverLookups(body) {
  const [cliente, vendedor, liberador, loja, tipoCliente, tipoAmbiente, tipoContrato, etapa] =
    await Promise.all([
      body.p_id_cliente      ? Clientes.findByPk(body.p_id_cliente)         : null,
      body.p_id_vendedor     ? Vendedor.findByPk(body.p_id_vendedor)         : null,
      body.p_id_liberador    ? Liberador.findByPk(body.p_id_liberador)       : null,
      body.p_id_loja         ? Loja.findByPk(body.p_id_loja)                 : null,
      body.p_id_tipocliente  ? TipoCliente.findByPk(body.p_id_tipocliente)   : null,
      body.p_id_tipoambiente ? TipoAmbiente.findByPk(body.p_id_tipoambiente) : null,
      body.p_id_tipocontrato ? TipoContrato.findByPk(body.p_id_tipocontrato) : null,
      body.p_id_etapa        ? Etapa.findByPk(body.p_id_etapa)               : null,
    ]);
  return { cliente, vendedor, liberador, loja, tipoCliente, tipoAmbiente, tipoContrato, etapa };
}

async function inserirProjeto(body) {
  const { cliente, vendedor, liberador, loja, tipoCliente, tipoAmbiente, tipoContrato, etapa } =
    await _resolverLookups(body);

  await Projetos.create({
    ordemdecompra:          body.p_ordemdecompra,
    contrato:               body.p_contrato               ?? null,
    idCliente:              body.p_id_cliente             ?? null,
    cliente:                cliente?.name                 ?? null,
    idTipoambiente:         body.p_id_tipoambiente        ?? null,
    tipoambiente:           tipoAmbiente?.name            ?? null,
    ambiente:               body.p_ambiente               ?? null,
    numproj:                body.p_numproj                ?? null,
    idVendedor:             body.p_id_vendedor            ?? null,
    vendedor:               vendedor?.name                ?? null,
    idLiberador:            body.p_id_liberador           ?? null,
    liberador:              liberador?.name               ?? null,
    datacontrato:           body.p_datacontrato           ?? null,
    dataassinatura:         body.p_dataassinatura         ?? null,
    chegoufabrica:          body.p_chegoufabrica          ?? null,
    dataentrega:            body.p_dataentrega            ?? null,
    previsao:               body.p_dataentrega            ?? null,
    idLoja:                 body.p_id_loja                ?? null,
    loja:                   loja?.name                    ?? null,
    idTipocliente:          body.p_id_tipocliente         ?? null,
    tipocliente:            tipoCliente?.name             ?? null,
    idEtapa:                body.p_id_etapa               ?? null,
    etapa:                  etapa?.name                   ?? null,
    idTipocontrato:         body.p_id_tipocontrato        ?? null,
    tipocontrato:           tipoContrato?.name            ?? null,
    valorbruto:             body.p_valorbruto             ?? 0,
    valornegociado:         body.p_valornegociado         ?? 0,
    customaterial:          body.p_customaterial          ?? 0,
    customaterialadicional: body.p_custoadicional         ?? 0,
  });

  const oc = body.p_ordemdecompra;
  await Promise.all([
    Producao.findOrCreate({ where: { ordemdecompra: oc } }),
    Avulsos.findOrCreate({ where: { ordemdecompra: oc } }),
  ]);
}

async function inserirCliente(body) {
  return Clientes.create({ name: body.p_nome_cliente });
}

async function buscarParaEditar(ordemdecompra) {
  const p = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'ordemdecompra', 'contrato', 'idCliente', 'idTipocliente', 'idTipoambiente',
      'ambiente', 'numproj', 'idVendedor', 'idLiberador', 'idLoja', 'idEtapa',
      'idTipocontrato', 'datacontrato', 'dataassinatura', 'chegoufabrica', 'dataentrega',
      'valorbruto', 'valornegociado', 'customaterial', 'customaterialadicional',
    ],
    include: [
      { model: Clientes, as: 'tblCliente', attributes: ['name'], required: false },
    ],
  });
  if (!p) return [];
  return [{
    ordemdecompra:          p.ordemdecompra,
    contrato:               p.contrato,
    id_cliente:             p.idCliente,
    cliente:                p.tblCliente?.name ?? null,
    id_tipocliente:         p.idTipocliente,
    id_tipoambiente:        p.idTipoambiente,
    ambiente:               p.ambiente,
    numproj:                p.numproj,
    id_vendedor:            p.idVendedor,
    id_liberador:           p.idLiberador,
    id_loja:                p.idLoja,
    id_etapa:               p.idEtapa,
    id_tipocontrato:        p.idTipocontrato,
    datacontrato:           p.datacontrato,
    dataassinatura:         p.dataassinatura,
    chegoufabrica:          p.chegoufabrica,
    dataentrega:            p.dataentrega,
    valorbruto:             p.valorbruto,
    valornegociado:         p.valornegociado,
    customaterial:          p.customaterial,
    customaterialadicional: p.customaterialadicional,
  }];
}

async function atualizarProjeto(body) {
  const { cliente, vendedor, liberador, loja, tipoCliente, tipoAmbiente, tipoContrato, etapa } =
    await _resolverLookups(body);

  await Projetos.update(
    {
      contrato:               body.p_contrato               ?? null,
      idCliente:              body.p_id_cliente             ?? null,
      cliente:                cliente?.name                 ?? null,
      idTipoambiente:         body.p_id_tipoambiente        ?? null,
      tipoambiente:           tipoAmbiente?.name            ?? null,
      ambiente:               body.p_ambiente               ?? null,
      numproj:                body.p_numproj                ?? null,
      idVendedor:             body.p_id_vendedor            ?? null,
      vendedor:               vendedor?.name                ?? null,
      idLiberador:            body.p_id_liberador           ?? null,
      liberador:              liberador?.name               ?? null,
      datacontrato:           body.p_datacontrato           ?? null,
      dataassinatura:         body.p_dataassinatura         ?? null,
      chegoufabrica:          body.p_chegoufabrica          ?? null,
      dataentrega:            body.p_dataentrega            ?? null,
      idLoja:                 body.p_id_loja                ?? null,
      loja:                   loja?.name                    ?? null,
      idTipocliente:          body.p_id_tipocliente         ?? null,
      tipocliente:            tipoCliente?.name             ?? null,
      idEtapa:                body.p_id_etapa               ?? null,
      etapa:                  etapa?.name                   ?? null,
      idTipocontrato:         body.p_id_tipocontrato        ?? null,
      tipocontrato:           tipoContrato?.name            ?? null,
      valorbruto:             body.p_valorbruto             ?? 0,
      valornegociado:         body.p_valornegociado         ?? 0,
      customaterial:          body.p_customaterial          ?? 0,
      customaterialadicional: body.p_customaterialadicional ?? 0,
    },
    { where: { ordemdecompra: body.p_ordemdecompra } },
  );
}

async function buscarParaDeletar(ordemdecompra) {
  const p = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'ordemdecompra', 'contrato', 'cliente', 'tipocliente', 'tipoambiente', 'ambiente',
      'numproj', 'vendedor', 'liberador', 'loja', 'etapa', 'tipocontrato',
      'datacontrato', 'dataassinatura', 'chegoufabrica', 'dataentrega',
      'valorbruto', 'valornegociado', 'customaterial', 'customaterialadicional',
    ],
  });
  if (!p) return [];
  return [p.toJSON()];
}

async function deletarProjeto(body) {
  const oc = Number(body.p_ordemdecompra);
  await Acessorios.destroy({ where: { ordemdecompra: oc } });
  await Promise.all([
    Producao.destroy({ where: { ordemdecompra: oc } }),
    Avulsos.destroy({ where: { ordemdecompra: oc } }),
  ]);
  await Projetos.destroy({ where: { ordemdecompra: oc } });
}

async function buscarCapaProducao(ordemdecompra) {
  const row = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'codcc', 'lote', 'pedido', 'contrato', 'numproj', 'urgente',
      'cliente', 'ambiente', 'dataentrega', 'vendedor', 'liberador',
      'tipo', 'pronto', 'entrega',
    ],
    include: [
      {
        model: Producao,
        as: 'tblProducao',
        required: false,
        attributes: [
          'observacoes',
          'corteinicio',      'cortefim',      'cortepausa',      'corteresp',
          'customizacaoinicio','customizacaofim','customizacaopausa','customizacaoresp',
          'coladeirainicio',  'coladeirafim',  'coladeirapausa',  'coladeiraresp',
          'usinageminicio',   'usinagemfim',   'usinagempausa',   'usinagemresp',
          'montageminicio',   'montagemfim',   'montagempausa',   'montagemresp',
          'paineisinicio',    'paineisfim',    'paineispausa',    'paineisresp',
          'embalageminicio',  'embalagemfim',  'embalagempausa',  'embalagemresp',
          'acabamentoinicio', 'acabamentofim', 'acabamentopausa', 'acabamentoresp',
          'conferido', 'motorista',
        ],
      },
      {
        model: Avulsos,
        as: 'tblAvulso',
        required: false,
        attributes: [
          'modulosq', 'modulosl', 'avulsoq', 'avulsol',
          'paineisq', 'paineisl', 'portaaluminioq', 'portaaluminiol',
          'vidrosq', 'vidrosl', 'pecaspintadasq', 'pecaspintadasl',
          'tapecariaq', 'tapecarial', 'serralheriaq', 'serralherial',
          'cabideq', 'cabidel', 'trilhoq', 'trilhol', 'totalvolumes',
        ],
      },
    ],
  });

  if (!row) return [];

  const prod = row.tblProducao;
  const a    = row.tblAvulso;

  const respIds = [
    prod?.corteresp, prod?.customizacaoresp, prod?.coladeiraresp,
    prod?.usinagemresp, prod?.montagemresp, prod?.paineisresp,
    prod?.embalagemresp, prod?.acabamentoresp, prod?.conferido, prod?.motorista,
  ].filter(id => id != null && id !== 0);

  const users = respIds.length
    ? await Usuario.findAll({ where: { id: [...new Set(respIds)] }, attributes: ['id', 'login'] })
    : [];
  const um = Object.fromEntries(users.map(u => [u.id, u.login]));

  return [{
    codcc:            row.codcc,
    lote:             row.lote,
    pedido:           row.pedido,
    contrato:         row.contrato,
    numproj:          row.numproj,
    urgente:          row.urgente,
    cliente:          row.cliente,
    ambiente:         row.ambiente,
    dataentrega:      row.dataentrega,
    vendedor:         row.vendedor,
    liberador:        row.liberador,
    tipo:             row.tipo,
    pronto:           row.pronto,
    entrega:          row.entrega,
    observacoes:      prod?.observacoes      ?? null,
    corteinicio:      prod?.corteinicio      ?? null,
    cortefim:         prod?.cortefim         ?? null,
    cortepausa:       prod?.cortepausa       ?? null,
    corte_resp:       um[prod?.corteresp]    ?? null,
    customizacaoinicio:  prod?.customizacaoinicio  ?? null,
    customizacaofim:     prod?.customizacaofim     ?? null,
    customizacaopausa:   prod?.customizacaopausa   ?? null,
    customizacao_resp:   um[prod?.customizacaoresp] ?? null,
    coladeirainicio:  prod?.coladeirainicio  ?? null,
    coladeirafim:     prod?.coladeirafim     ?? null,
    coladeirapausa:   prod?.coladeirapausa   ?? null,
    coladeira_resp:   um[prod?.coladeiraresp] ?? null,
    usinageminicio:   prod?.usinageminicio   ?? null,
    usinagemfim:      prod?.usinagemfim      ?? null,
    usinagempausa:    prod?.usinagempausa    ?? null,
    usinagem_resp:    um[prod?.usinagemresp]  ?? null,
    montageminicio:   prod?.montageminicio   ?? null,
    montagemfim:      prod?.montagemfim      ?? null,
    montagempausa:    prod?.montagempausa    ?? null,
    montagem_resp:    um[prod?.montagemresp]  ?? null,
    paineisinicio:    prod?.paineisinicio    ?? null,
    paineisfim:       prod?.paineisfim       ?? null,
    paineispausa:     prod?.paineispausa     ?? null,
    paineis_resp:     um[prod?.paineisresp]   ?? null,
    embalageminicio:  prod?.embalageminicio  ?? null,
    embalagemfim:     prod?.embalagemfim     ?? null,
    embalagempausa:   prod?.embalagempausa   ?? null,
    embalagem_resp:   um[prod?.embalagemresp] ?? null,
    acabamentoinicio: prod?.acabamentoinicio ?? null,
    acabamentofim:    prod?.acabamentofim    ?? null,
    acabamentopausa:  prod?.acabamentopausa  ?? null,
    acabamento_resp:  um[prod?.acabamentoresp] ?? null,
    conferido_resp:   um[prod?.conferido]    ?? null,
    motorista_resp:   um[prod?.motorista]    ?? null,
    modulosq:         a?.modulosq         ?? 0,
    modulosl:         a?.modulosl         ?? null,
    avulsoq:          a?.avulsoq          ?? 0,
    avulsol:          a?.avulsol          ?? null,
    paineisq:         a?.paineisq         ?? 0,
    paineisl:         a?.paineisl         ?? null,
    portaaluminioq:   a?.portaaluminioq   ?? 0,
    portaaluminiol:   a?.portaaluminiol   ?? null,
    vidrosq:          a?.vidrosq          ?? 0,
    vidrosl:          a?.vidrosl          ?? null,
    pecaspintadasq:   a?.pecaspintadasq   ?? 0,
    pecaspintadasl:   a?.pecaspintadasl   ?? null,
    tapecariaq:       a?.tapecariaq       ?? 0,
    tapecarial:       a?.tapecarial       ?? null,
    serralheriaq:     a?.serralheriaq     ?? 0,
    serralherial:     a?.serralherial     ?? null,
    cabideq:          a?.cabideq          ?? 0,
    cabidel:          a?.cabidel          ?? null,
    trilhoq:          a?.trilhoq          ?? 0,
    trilhol:          a?.trilhol          ?? null,
    totalvolumes:     a?.totalvolumes     ?? 0,
  }];
}

module.exports = {
  buscarPorContrato,
  listarClientes,
  listarTiposCliente,
  inserirProjeto,
  inserirCliente,
  buscarParaEditar,
  atualizarProjeto,
  buscarParaDeletar,
  deletarProjeto,
  buscarCapaProducao,
};
