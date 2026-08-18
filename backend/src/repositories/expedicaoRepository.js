const { Op } = require("sequelize");
const {
  Projetos, Clientes, Etapa, Acessorios,
  Producao, Avulsos, Usuario,
} = require("../client/db");
const { producaoStatus, countPending, hasBullet } = require("../utils/calcStatus");

async function _getLoginName(id) {
  if (!id) return null;
  const u = await Usuario.findByPk(id, { attributes: ['login'] });
  return u?.login ?? null;
}

async function listarProjetosExpedicao(data_condition) {
  const rows = await Projetos.findAll({
    where: { dataentrega: { [Op.gt]: data_condition } },
    attributes: [
      'ordemdecompra', 'pedido', 'codcc', 'contrato', 'numproj', 'ambiente',
      'tipo', 'chegoufabrica', 'dataentrega', 'lote',
      'iniciado', 'pronto', 'entrega', 'parceado', 'pendencia', 'urgente',
    ],
    include: [
      { model: Clientes,   as: 'tblCliente',   attributes: ['name'], required: true },
      { model: Etapa,      as: 'tblEtapum',    attributes: ['name'], required: true },
      { model: Acessorios, as: 'tblAcessorios', attributes: ['recebido'], required: false },
    ],
    order: [
      ['dataentrega', 'ASC'],
      [{ model: Clientes, as: 'tblCliente' }, 'name', 'ASC'],
    ],
  });

  return rows.map((p) => {
    const acessorios = p.tblAcessorios || [];
    return {
      total:         countPending(acessorios),
      a:             hasBullet(acessorios),
      ordemdecompra: p.ordemdecompra,
      pedido:        p.pedido,
      etapa:         p.tblEtapum?.name ?? '-',
      codcc:         p.codcc,
      cliente:       p.tblCliente?.name ?? '',
      contrato:      p.contrato,
      numproj:       p.numproj,
      ambiente:      p.ambiente,
      tipo:          p.tipo,
      chegoufabrica: p.chegoufabrica,
      dataentrega:   p.dataentrega,
      lote:          p.lote,
      status:        producaoStatus(p),
      iniciado:      p.iniciado,
      pronto:        p.pronto,
      entrega:       p.entrega,
    };
  });
}

async function buscarProjetoExpedicao(ordemdecompra) {
  const oc = Number(ordemdecompra);

  const projeto = await Projetos.findOne({
    where: { ordemdecompra: oc },
    attributes: [
      'ordemdecompra', 'contrato', 'codcc', 'ambiente', 'numproj',
      'lote', 'chegoufabrica', 'dataentrega', 'pronto', 'entrega',
      'pendencia', 'parceado',
    ],
    include: [
      { model: Clientes, as: 'tblCliente', attributes: ['name'], required: true },
      {
        model: Producao,
        as: 'tblProducao',
        required: true,
        attributes: [
          'separacao', 'conferido', 'motorista',
          'embalageminicio', 'embalagemfim', 'embalagempausa', 'embalagemresp',
          'corteinicio', 'cortefim', 'customizacaoinicio', 'customizacaofim',
          'coladeirainicio', 'coladeirafim', 'usinageminicio', 'usinagemfim',
          'montageminicio', 'montagemfim', 'paineisinicio', 'paineisfim',
          'acabamentoinicio', 'acabamentofim',
          'tamanho', 'observacoes',
        ],
      },
      {
        model: Avulsos,
        as: 'tblAvulso',
        required: true,
        attributes: [
          'avulso', 'avulsol', 'avulsoq',
          'cabide', 'cabidel', 'cabideq',
          'paineis', 'paineisl', 'paineisq',
          'pecaspintadas', 'pecaspintadasl', 'pecaspintadasq',
          'portaaluminio', 'portaaluminiol', 'portaaluminioq',
          'serralheria', 'serralherial', 'serralheriaq',
          'tapecaria', 'tapecarial', 'tapecariaq',
          'trilho', 'trilhol', 'trilhoq',
          'vidros', 'vidrosl', 'vidrosq',
          'volmod', 'modulosl', 'modulosq',
          'totalvolumes',
        ],
      },
    ],
  });

  if (!projeto) return [];

  const prod = projeto.tblProducao;
  const av   = projeto.tblAvulso;

  const [p_total, conferidoname, motoristaname, embalagemname] = await Promise.all([
    Acessorios.count({ where: { ordemdecompra: oc, recebido: null } }),
    _getLoginName(prod.conferido),
    _getLoginName(prod.motorista),
    _getLoginName(prod.embalagemresp),
  ]);

  const etapa = !!(
    prod.corteinicio        && prod.cortefim        &&
    prod.customizacaoinicio && prod.customizacaofim &&
    prod.coladeirainicio    && prod.coladeirafim    &&
    prod.usinageminicio     && prod.usinagemfim     &&
    prod.montageminicio     && prod.montagemfim     &&
    prod.paineisinicio      && prod.paineisfim      &&
    prod.acabamentoinicio   && prod.acabamentofim   &&
    prod.embalageminicio    && prod.embalagemfim
  );

  return [{
    total: p_total,
    ordemdecompra:   projeto.ordemdecompra,
    cliente:         projeto.tblCliente.name,
    contrato:        projeto.contrato,
    codcc:           projeto.codcc,
    ambiente:        projeto.ambiente,
    numproj:         projeto.numproj,
    lote:            projeto.lote,
    chegoufabrica:   projeto.chegoufabrica,
    dataentrega:     projeto.dataentrega,
    pronto:          projeto.pronto,
    entrega:         projeto.entrega,
    pendencia:       projeto.pendencia,
    parcial:         projeto.parceado,
    separacao:       prod.separacao,
    conferido:       prod.conferido,
    conferidoname,
    motorista:       prod.motorista,
    motoristaname,
    embalageminicio: prod.embalageminicio,
    embalagemfim:    prod.embalagemfim,
    embalagempausa:  prod.embalagempausa,
    embalagemresp:   prod.embalagemresp,
    embalagemname,
    avulso:          av.avulso,
    avulsol:         av.avulsol,
    avulsoq:         av.avulsoq,
    cabide:          av.cabide,
    cabidel:         av.cabidel,
    cabideq:         av.cabideq,
    paineis:         av.paineis,
    paineisl:        av.paineisl,
    paineisq:        av.paineisq,
    pecaspintadas:   av.pecaspintadas,
    pecaspintadasl:  av.pecaspintadasl,
    pecaspintadasq:  av.pecaspintadasq,
    portaaluminio:   av.portaaluminio,
    portaaluminiol:  av.portaaluminiol,
    portaaluminioq:  av.portaaluminioq,
    serralheria:     av.serralheria,
    serralherial:    av.serralherial,
    serralheriaq:    av.serralheriaq,
    tapecaria:       av.tapecaria,
    tapecarial:      av.tapecarial,
    tapecariaq:      av.tapecariaq,
    trilho:          av.trilho,
    trilhol:         av.trilhol,
    trilhoq:         av.trilhoq,
    vidros:          av.vidros,
    vidrosl:         av.vidrosl,
    vidrosq:         av.vidrosq,
    volmod:          av.volmod,
    modulosl:        av.modulosl,
    modulosq:        av.modulosq,
    totalvolumes:    av.totalvolumes,
    tamanho:         prod.tamanho,
    observacoes:     prod.observacoes,
    etapa,
  }];
}

async function listarAcessoriosExpedicao(ordemdecompra) {
  return Acessorios.findAll({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: ['id', 'categoria', 'descricao', 'medida', 'qtd', 'datacompra', 'previsao', 'recebido'],
    order: [['id', 'ASC']],
    raw: true,
  });
}

async function atualizarProjetoExpedicao(body) {
  const oc = body.ordemdecompra;

  await Projetos.update(
    {
      pronto:    body.pronto    ?? null,
      entrega:   body.entrega   ?? null,
      pendencia: body.pendencia ?? false,
      parceado:  body.parcial   ?? false,
    },
    { where: { ordemdecompra: oc } },
  );

  await Producao.update(
    {
      separacao:       body.separacao       ?? null,
      conferido:       body.conferido       ?? null,
      motorista:       body.motorista       ?? null,
      embalageminicio: body.embalageminicio ?? null,
      embalagemfim:    body.embalagemfim    ?? null,
      embalagempausa:  body.embalagempausa  ?? false,
      embalagemresp:   body.embalagemresp   ?? null,
      tamanho:         body.tamanho         ?? null,
      observacoes:     body.observacoes     ?? null,
    },
    { where: { ordemdecompra: oc } },
  );

  await Avulsos.update(
    {
      avulso:         body.avulso          ?? false,
      avulsol:        body.avulsol         ?? null,
      avulsoq:        body.avulsoq         ?? 0,
      cabide:         body.cabide          ?? false,
      cabidel:        body.cabidel         ?? null,
      cabideq:        body.cabideq         ?? 0,
      paineis:        body.paineis         ?? false,
      paineisl:       body.paineisl        ?? null,
      paineisq:       body.paineisq        ?? 0,
      pecaspintadas:  body.pecaspintadas   ?? false,
      pecaspintadasl: body.pecaspintadasl  ?? null,
      pecaspintadasq: body.pecaspintadasq  ?? 0,
      portaaluminio:  body.portaaluminio   ?? false,
      portaaluminiol: body.portaaluminiol  ?? null,
      portaaluminioq: body.portaaluminioq  ?? 0,
      serralheria:    body.serralheria     ?? false,
      serralherial:   body.serralherial    ?? null,
      serralheriaq:   body.serralheriaq    ?? 0,
      tapecaria:      body.tapecaria       ?? false,
      tapecarial:     body.tapecarial      ?? null,
      tapecariaq:     body.tapecariaq      ?? 0,
      trilho:         body.trilho          ?? false,
      trilhol:        body.trilhol         ?? null,
      trilhoq:        body.trilhoq         ?? 0,
      vidros:         body.vidros          ?? false,
      vidrosl:        body.vidrosl         ?? null,
      vidrosq:        body.vidrosq         ?? 0,
      volmod:         body.volmod          ?? false,
      modulosl:       body.modulosl        ?? null,
      modulosq:       body.modulosq        ?? 0,
      totalvolumes:   body.totalvolumes    ?? 0,
    },
    { where: { ordemdecompra: oc } },
  );
}

module.exports = {
  listarProjetosExpedicao,
  buscarProjetoExpedicao,
  listarAcessoriosExpedicao,
  atualizarProjetoExpedicao,
};
