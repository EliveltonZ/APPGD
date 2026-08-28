const {
  sequelize,
  Projetos, Producao, Avulsos, Acessorios,
  Clientes, TipoCliente, Vendedor, Liberador,
  Loja, TipoAmbiente, TipoContrato, Etapa,
  Usuario, EquipSat, Pecas, Montador, Falhas, Ocorrencia,
} = require("../client/db");

// A sessão do banco roda em UTC — usar CURRENT_DATE/NOW() do Postgres erra
// a data entre 21h e 23h59 no horário de Brasília. Calcula em America/Sao_Paulo.
function dataAtualBrasil() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
}

// Equipe (tblEquipSat) e Peças (tblPecas) são compartilhadas com o módulo
// de Assistências antigo — id_sat/id_assistencia são colunas TEXT soltas,
// então usamos o ordemdecompra (como string) no lugar do "solicitacao".
async function _salvarEquipePecas(ordemdecompra, equipe, pecas, t) {
  const oc = String(ordemdecompra);

  if (Array.isArray(equipe)) {
    for (const m of equipe) {
      await EquipSat.create({ idSat: oc, idMontador: Number(m.id) }, { transaction: t });
    }
  }

  if (Array.isArray(pecas)) {
    for (const p of pecas) {
      if (!p.id_falha || Number(p.id_falha) === 0)
        throw new Error(`Peça "${p.peca ?? 'sem nome'}" não possui tipo de falha informado.`);
      await Pecas.create({
        idAssistencia: oc,
        qtd:          Number(p.qtd) || 0,
        peca:         p.peca ?? null,
        dimensoes:    p.dimensoes ?? null,
        cor:          p.cor ?? null,
        lado:         p.lado ?? null,
        idOcorrencia: p.id_ocorrencia ? Number(p.id_ocorrencia) : null,
        idFalha:      Number(p.id_falha),
        observacoes:  p.observacoes ?? null,
      }, { transaction: t });
    }
  }
}

async function _buscarEquipe(ordemdecompra) {
  const rows = await EquipSat.findAll({
    where: { idSat: String(ordemdecompra) },
    include: [{ model: Montador, as: 'montador', attributes: ['name'], required: false }],
  });
  return rows.map(r => ({ id: r.idMontador, nome: r.montador?.name ?? '' }));
}

async function _buscarPecas(ordemdecompra) {
  const rows = await Pecas.findAll({
    where: { idAssistencia: String(ordemdecompra) },
    include: [
      { model: Ocorrencia, as: 'ocorrencia', attributes: ['descricao'], required: false },
      { model: Falhas,     as: 'falha',      attributes: ['descricao'], required: false },
    ],
  });
  return rows.map(r => ({
    id:           String(r.codigo),
    qtd:          r.qtd,
    peca:         r.peca ?? '',
    dimensoes:    r.dimensoes ?? '',
    cor:          r.cor ?? '',
    lado:         r.lado ?? '',
    falha:        r.falha?.descricao ?? '',
    falhaId:      r.idFalha,
    tipo:         r.ocorrencia?.descricao ?? '',
    ocorrenciaId: r.idOcorrencia,
    observacoes:  r.observacoes ?? '',
  }));
}

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
      body.id_cliente      ? Clientes.findByPk(body.id_cliente)         : null,
      body.id_vendedor     ? Vendedor.findByPk(body.id_vendedor)         : null,
      body.id_liberador    ? Liberador.findByPk(body.id_liberador)       : null,
      body.id_loja         ? Loja.findByPk(body.id_loja)                 : null,
      body.id_tipocliente  ? TipoCliente.findByPk(body.id_tipocliente)   : null,
      body.id_tipoambiente ? TipoAmbiente.findByPk(body.id_tipoambiente) : null,
      body.id_tipocontrato ? TipoContrato.findByPk(body.id_tipocontrato) : null,
      body.id_etapa        ? Etapa.findByPk(body.id_etapa)               : null,
    ]);
  return { cliente, vendedor, liberador, loja, tipoCliente, tipoAmbiente, tipoContrato, etapa };
}

async function inserirProjeto(body) {
  const { cliente, vendedor, liberador, loja, tipoCliente, tipoAmbiente, tipoContrato, etapa } =
    await _resolverLookups(body);

  // Assistência: OC gerada só agora, no momento real de salvar — não mais
  // ao abrir a tela, pra não "queimar" números de quem abre e desiste.
  const oc = body.tipo_projeto === 'ASSISTENCIA'
    ? await gerarOcAssistencia()
    : body.ordemdecompra;

  await sequelize.transaction(async (t) => {
    await Projetos.create({
      ordemdecompra:          oc,
      contrato:               body.contrato               ?? null,
      idCliente:              body.id_cliente             ?? null,
      cliente:                body.cliente_nome           ?? cliente?.name ?? null,
      idTipoambiente:         body.id_tipoambiente        ?? null,
      tipoambiente:           tipoAmbiente?.name            ?? null,
      ambiente:               body.ambiente               ?? null,
      numproj:                body.numproj                ?? null,
      idVendedor:             body.id_vendedor            ?? null,
      vendedor:               vendedor?.name                ?? null,
      idLiberador:            body.id_liberador           ?? null,
      liberador:              body.liberador_nome         ?? liberador?.name ?? null,
      datacontrato:           body.datacontrato           ?? null,
      dataassinatura:         body.dataassinatura         ?? null,
      chegoufabrica:          body.chegoufabrica          ?? null,
      dataentrega:            body.dataentrega            ?? null,
      previsao:               body.dataentrega            ?? null,
      idLoja:                 body.id_loja                ?? null,
      loja:                   loja?.name                    ?? null,
      idTipocliente:          body.id_tipocliente         ?? null,
      tipocliente:            tipoCliente?.name             ?? null,
      idEtapa:                body.id_etapa               ?? null,
      etapa:                  etapa?.name                   ?? null,
      idTipocontrato:         body.id_tipocontrato        ?? null,
      tipocontrato:           tipoContrato?.name            ?? null,
      valorbruto:             body.valorbruto             ?? 0,
      valornegociado:         body.valornegociado         ?? 0,
      customaterial:          body.customaterial          ?? 0,
      customaterialadicional: body.custoadicional         ?? 0,
      tipoProjeto:            body.tipo_projeto           ?? 'PROJETO',
      motivoAssistencia:      body.motivo_assistencia     ?? null,
      numeroSolicitacao:      body.numero_solicitacao     ?? null,
      supervisor:             body.supervisor             ?? null,
      tipoSolicitacao:        body.tipo_solicitacao       ?? null,
      origemMontagem:         body.origem_montagem        ?? null,
      origemPromob:           body.origem_promob          ?? null,
      origemCobrada:          body.origem_cobrada         ?? null,
      origemEntrega:          body.origem_entrega         ?? null,
      bairro:                 body.bairro                 ?? null,
      tempo:                  body.tempo                  ?? null,
      destino:                body.destino                ?? null,
      observacoes:            body.observacoes            ?? null,
      idResponsavel:          body.id_responsavel         ?? null,
      dataCriacao:            dataAtualBrasil(),
      urgente:                body.urgente                ?? false,
    }, { transaction: t });

    await _salvarEquipePecas(oc, body.equipe, body.pecas, t);
  });

  await Promise.all([
    Producao.findOrCreate({ where: { ordemdecompra: oc } }),
    Avulsos.findOrCreate({ where: { ordemdecompra: oc } }),
  ]);

  return oc;
}

async function inserirCliente(body) {
  return Clientes.create({ name: body.nome_cliente });
}

async function buscarParaEditar(ordemdecompra) {
  const p = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'ordemdecompra', 'contrato', 'idCliente', 'cliente', 'idTipocliente', 'idTipoambiente',
      'ambiente', 'numproj', 'idVendedor', 'idLiberador', 'idLoja', 'idEtapa',
      'idTipocontrato', 'datacontrato', 'dataassinatura', 'chegoufabrica', 'dataentrega',
      'valorbruto', 'valornegociado', 'customaterial', 'customaterialadicional',
      'tipoProjeto', 'motivoAssistencia', 'numeroSolicitacao',
      'urgente', 'supervisor', 'tipoSolicitacao', 'origemMontagem',
      'origemPromob', 'origemCobrada', 'origemEntrega', 'bairro', 'tempo', 'destino',
      'observacoes', 'idResponsavel', 'dataCriacao', 'liberador',
    ],
    include: [
      { model: Clientes, as: 'tblCliente',     attributes: ['name'],  required: false },
      { model: Usuario,  as: 'usuarioResponsavel', attributes: ['login'], required: false },
    ],
  });
  if (!p) return [];

  const isAssistencia = p.tipoProjeto === 'ASSISTENCIA';
  const [equipe, pecas] = isAssistencia
    ? await Promise.all([_buscarEquipe(p.ordemdecompra), _buscarPecas(p.ordemdecompra)])
    : [[], []];

  return [{
    ordemdecompra:          p.ordemdecompra,
    contrato:               p.contrato,
    id_cliente:             p.idCliente,
    cliente:                p.cliente ?? p.tblCliente?.name ?? null,
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
    tipo_projeto:           p.tipoProjeto,
    motivo_assistencia:     p.motivoAssistencia,
    numero_solicitacao:     p.numeroSolicitacao,
    urgente:                p.urgente,
    supervisor:             p.supervisor,
    tipo_solicitacao:       p.tipoSolicitacao,
    origem_montagem:        p.origemMontagem,
    origem_promob:          p.origemPromob,
    origem_cobrada:         p.origemCobrada,
    origem_entrega:         p.origemEntrega,
    bairro:                 p.bairro,
    tempo:                  p.tempo,
    destino:                p.destino,
    liberador_nome:         p.liberador,
    observacoes:            p.observacoes,
    responsavel:            p.usuarioResponsavel?.login ?? null,
    id_responsavel:         p.idResponsavel,
    data_criacao:           p.dataCriacao,
    equipe,
    pecas,
  }];
}

async function atualizarProjeto(body) {
  const { cliente, vendedor, liberador, loja, tipoCliente, tipoAmbiente, tipoContrato, etapa } =
    await _resolverLookups(body);

  const oc = body.ordemdecompra;

  await sequelize.transaction(async (t) => {
    await Projetos.update(
      {
        contrato:               body.contrato               ?? null,
        idCliente:              body.id_cliente             ?? null,
        cliente:                body.cliente_nome           ?? cliente?.name ?? null,
        idTipoambiente:         body.id_tipoambiente        ?? null,
        tipoambiente:           tipoAmbiente?.name            ?? null,
        ambiente:               body.ambiente               ?? null,
        numproj:                body.numproj                ?? null,
        idVendedor:             body.id_vendedor            ?? null,
        vendedor:               vendedor?.name                ?? null,
        idLiberador:            body.id_liberador           ?? null,
        liberador:              body.liberador_nome         ?? liberador?.name ?? null,
        datacontrato:           body.datacontrato           ?? null,
        dataassinatura:         body.dataassinatura         ?? null,
        chegoufabrica:          body.chegoufabrica          ?? null,
        dataentrega:            body.dataentrega            ?? null,
        idLoja:                 body.id_loja                ?? null,
        loja:                   loja?.name                    ?? null,
        idTipocliente:          body.id_tipocliente         ?? null,
        tipocliente:            tipoCliente?.name             ?? null,
        idEtapa:                body.id_etapa               ?? null,
        etapa:                  etapa?.name                   ?? null,
        idTipocontrato:         body.id_tipocontrato        ?? null,
        tipocontrato:           tipoContrato?.name            ?? null,
        valorbruto:             body.valorbruto             ?? 0,
        valornegociado:         body.valornegociado         ?? 0,
        customaterial:          body.customaterial          ?? 0,
        customaterialadicional: body.customaterialadicional ?? 0,
        tipoProjeto:            body.tipo_projeto           ?? 'PROJETO',
        motivoAssistencia:      body.motivo_assistencia     ?? null,
        numeroSolicitacao:      body.numero_solicitacao     ?? null,
        supervisor:             body.supervisor             ?? null,
        tipoSolicitacao:        body.tipo_solicitacao       ?? null,
        origemMontagem:         body.origem_montagem        ?? null,
        origemPromob:           body.origem_promob          ?? null,
        origemCobrada:          body.origem_cobrada         ?? null,
        origemEntrega:          body.origem_entrega         ?? null,
        bairro:                 body.bairro                 ?? null,
        tempo:                  body.tempo                  ?? null,
        destino:                body.destino                ?? null,
        observacoes:            body.observacoes            ?? null,
        idResponsavel:          body.id_responsavel         ?? null,
        urgente:                body.urgente                ?? false,
      },
      { where: { ordemdecompra: oc }, transaction: t },
    );

    if (body.tipo_projeto === 'ASSISTENCIA') {
      await EquipSat.destroy({ where: { idSat: String(oc) }, transaction: t });
      await Pecas.destroy({ where: { idAssistencia: String(oc) }, transaction: t });
      await _salvarEquipePecas(oc, body.equipe, body.pecas, t);
    }
  });
}

async function buscarParaDeletar(ordemdecompra) {
  const p = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'ordemdecompra', 'tipoProjeto', 'contrato', 'cliente', 'tipocliente', 'tipoambiente', 'ambiente',
      'numproj', 'vendedor', 'liberador', 'loja', 'etapa', 'tipocontrato',
      'datacontrato', 'dataassinatura', 'chegoufabrica', 'dataentrega',
      'valorbruto', 'valornegociado', 'customaterial', 'customaterialadicional',
      'idResponsavel', 'supervisor', 'motivoAssistencia', 'numeroSolicitacao',
      'tipoSolicitacao', 'origemMontagem', 'origemPromob', 'origemCobrada', 'origemEntrega',
      'bairro', 'tempo', 'destino',
    ],
    include: [
      { model: Usuario, as: 'usuarioResponsavel', attributes: ['login'], required: false },
    ],
  });
  if (!p) return [];

  const isAssistencia = p.tipoProjeto === 'ASSISTENCIA';
  const [equipe, pecas] = isAssistencia
    ? await Promise.all([_buscarEquipe(p.ordemdecompra), _buscarPecas(p.ordemdecompra)])
    : [[], []];

  return [{
    ordemdecompra:          p.ordemdecompra,
    tipo_projeto:           p.tipoProjeto,
    contrato:               p.contrato,
    cliente:                p.cliente,
    tipocliente:            p.tipocliente,
    tipoambiente:           p.tipoambiente,
    ambiente:               p.ambiente,
    numproj:                p.numproj,
    vendedor:               p.vendedor,
    liberador:              p.liberador,
    loja:                   p.loja,
    etapa:                  p.etapa,
    tipocontrato:           p.tipocontrato,
    datacontrato:           p.datacontrato,
    dataassinatura:         p.dataassinatura,
    chegoufabrica:          p.chegoufabrica,
    dataentrega:            p.dataentrega,
    valorbruto:             p.valorbruto,
    valornegociado:         p.valornegociado,
    customaterial:          p.customaterial,
    customaterialadicional: p.customaterialadicional,
    responsavel:            p.usuarioResponsavel?.login ?? null,
    supervisor:             p.supervisor,
    motivo_assistencia:     p.motivoAssistencia,
    numero_solicitacao:     p.numeroSolicitacao,
    tipo_solicitacao:       p.tipoSolicitacao,
    origem_montagem:        p.origemMontagem,
    origem_promob:          p.origemPromob,
    origem_cobrada:         p.origemCobrada,
    origem_entrega:         p.origemEntrega,
    bairro:                 p.bairro,
    tempo:                  p.tempo,
    destino:                p.destino,
    equipe,
    pecas,
  }];
}

async function deletarProjeto(body) {
  const oc = Number(body.ordemdecompra);
  await Acessorios.destroy({ where: { ordemdecompra: oc } });
  await Promise.all([
    Producao.destroy({ where: { ordemdecompra: oc } }),
    Avulsos.destroy({ where: { ordemdecompra: oc } }),
    EquipSat.destroy({ where: { idSat: String(oc) } }),
    Pecas.destroy({ where: { idAssistencia: String(oc) } }),
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

async function gerarOcAssistencia() {
  const [rows] = await sequelize.query("SELECT NEXTVAL('seq_assistencia_oc') AS oc");
  return Number(rows[0].oc);
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
