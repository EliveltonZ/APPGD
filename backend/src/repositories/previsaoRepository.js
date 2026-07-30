const { Op } = require('sequelize');
const { Projetos, Clientes, Acessorios, Producao, Etapa, Usuario } = require('../client/db');
const {
  planejamentoStatus, countPending, hasBullet,
  stageStatus, separacaoStatus, diasRestantes,
} = require('../utils/calcStatus');

const ACTIVE_STATUSES = new Set([
  'INICIADO', 'ATRASADO', 'PARCEADO', 'A VENCER', 'URGENTE', 'PENDENCIA',
]);

async function listarProjetosPrevisoes() {
  const rows = await Projetos.findAll({
    where: { codcc: { [Op.ne]: null } },
    attributes: [
      'ordemdecompra', 'idEtapa', 'codcc', 'cliente', 'contrato', 'ambiente',
      'dataentrega', 'previsao', 'urgente', 'pedido', 'lote', 'numproj',
      'parceado', 'pendencia', 'entrega', 'pronto', 'iniciado',
    ],
    include: [
      {
        model: Producao,
        as: 'tblProducao',
        required: true,
        attributes: [
          'corteinicio',       'cortefim',       'cortepausa',
          'customizacaoinicio','customizacaofim','customizacaopausa',
          'coladeirainicio',   'coladeirafim',   'coladeirapausa',
          'usinageminicio',    'usinagemfim',    'usinagempausa',
          'montageminicio',    'montagemfim',    'montagempausa',
          'paineisinicio',     'paineisfim',     'paineispausa',
          'acabamentoinicio',  'acabamentofim',  'acabamentopausa',
          'embalageminicio',   'embalagemfim',   'embalagempausa',
          'separacao', 'observacoes',
        ],
      },
      { model: Clientes,   as: 'tblCliente',   required: true,  attributes: ['name'] },
      { model: Etapa,      as: 'tblEtapum',    required: false, attributes: ['name'] },
      { model: Acessorios, as: 'tblAcessorios', required: false, attributes: ['recebido'] },
    ],
  });

  return rows
    .map(p => {
      const status = planejamentoStatus(p);
      if (!ACTIVE_STATUSES.has(status)) return null;

      const prod = p.tblProducao;
      const acessorios = p.tblAcessorios || [];

      return {
        total:         countPending(acessorios),
        a:             hasBullet(acessorios),
        ordemdecompra: p.ordemdecompra,
        etapa:         p.tblEtapum?.name ?? '',
        codcc:         p.codcc,
        scorte:        stageStatus(prod.corteinicio,        prod.cortefim,       prod.cortepausa),
        scustom:       stageStatus(prod.customizacaoinicio, prod.customizacaofim, prod.customizacaopausa),
        scoladeira:    stageStatus(prod.coladeirainicio,    prod.coladeirafim,   prod.coladeirapausa),
        susinagem:     stageStatus(prod.usinageminicio,     prod.usinagemfim,    prod.usinagempausa),
        smontagem:     stageStatus(prod.montageminicio,     prod.montagemfim,    prod.montagempausa),
        spaineis:      stageStatus(prod.paineisinicio,      prod.paineisfim,     prod.paineispausa),
        sseparacao:    separacaoStatus(prod.separacao, prod.embalagemfim),
        sacabamento:   stageStatus(prod.acabamentoinicio,   prod.acabamentofim,  prod.acabamentopausa),
        sembalagem:    stageStatus(prod.embalageminicio,    prod.embalagemfim,   prod.embalagempausa),
        cliente:       p.tblCliente?.name ?? p.cliente ?? '',
        contrato:      p.contrato,
        ambiente:      p.ambiente,
        dataentrega:   p.dataentrega,
        dias_restantes: diasRestantes(p.dataentrega),
        observacoes:   prod.observacoes,
        previsao:      p.previsao,
        status,
        urgente:       p.urgente,
        iniciado:      p.iniciado,
        pedido:        p.pedido,
        lote:          p.lote,
        numproj:       p.numproj,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const pa = a.previsao || '';
      const pb = b.previsao || '';
      if (pa !== pb) return pa < pb ? -1 : 1;
      const da = a.dataentrega || '';
      const db = b.dataentrega || '';
      if (da !== db) return da < db ? -1 : 1;
      return (a.cliente || '') < (b.cliente || '') ? -1 : 1;
    });
}

async function buscarProjetoPrevisao(ordemdecompra) {
  const row = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'ordemdecompra', 'contrato', 'codcc', 'ambiente',
      'numproj', 'lote', 'chegoufabrica', 'dataentrega',
    ],
    include: [
      {
        model: Producao,
        as: 'tblProducao',
        required: true,
        attributes: [
          'corteinicio',      'cortefim',      'cortepausa',      'corteresp',
          'customizacaoinicio','customizacaofim','customizacaopausa','customizacaoresp',
          'coladeirainicio',  'coladeirafim',  'coladeirapausa',  'coladeiraresp',
          'usinageminicio',   'usinagemfim',   'usinagempausa',   'usinagemresp',
          'montageminicio',   'montagemfim',   'montagempausa',   'montagemresp',
          'paineisinicio',    'paineisfim',    'paineispausa',    'paineisresp',
          'acabamentoinicio', 'acabamentofim', 'acabamentopausa', 'acabamentoresp',
          'embalageminicio',  'embalagemfim',  'embalagempausa',  'embalagemresp',
          'observacoes',
        ],
      },
      { model: Clientes, as: 'tblCliente', required: true, attributes: ['name'] },
    ],
  });

  if (!row) return [];

  const prod = row.tblProducao;
  const respIds = [
    prod.corteresp, prod.customizacaoresp, prod.coladeiraresp, prod.usinagemresp,
    prod.montagemresp, prod.paineisresp, prod.acabamentoresp, prod.embalagemresp,
  ].filter(id => id != null && id !== 0);

  const users = respIds.length
    ? await Usuario.findAll({ where: { id: [...new Set(respIds)] }, attributes: ['id', 'login'] })
    : [];
  const um = Object.fromEntries(users.map(u => [u.id, u.login]));

  return [{
    ordemdecompra:       row.ordemdecompra,
    cliente:             row.tblCliente.name,
    contrato:            row.contrato,
    codcc:               row.codcc,
    ambiente:            row.ambiente,
    numproj:             row.numproj,
    lote:                row.lote,
    chegoufabrica:       row.chegoufabrica,
    dataentrega:         row.dataentrega,
    corteinicio:         prod.corteinicio,
    cortefim:            prod.cortefim,
    cortepausa:          prod.cortepausa,
    corteresp:           prod.corteresp,
    cortename:           um[prod.corteresp]           ?? null,
    customizacaoinicio:  prod.customizacaoinicio,
    customizacaofim:     prod.customizacaofim,
    customizacaopausa:   prod.customizacaopausa,
    customizacaoresp:    prod.customizacaoresp,
    customizacaoname:    um[prod.customizacaoresp]    ?? null,
    coladeirainicio:     prod.coladeirainicio,
    coladeirafim:        prod.coladeirafim,
    coladeirapausa:      prod.coladeirapausa,
    coladeiraresp:       prod.coladeiraresp,
    coladeiraname:       um[prod.coladeiraresp]       ?? null,
    usinageminicio:      prod.usinageminicio,
    usinagemfim:         prod.usinagemfim,
    usinagempausa:       prod.usinagempausa,
    usinagemresp:        prod.usinagemresp,
    usinagemname:        um[prod.usinagemresp]        ?? null,
    montageminicio:      prod.montageminicio,
    montagemfim:         prod.montagemfim,
    montagempausa:       prod.montagempausa,
    montagemresp:        prod.montagemresp,
    montagemname:        um[prod.montagemresp]        ?? null,
    paineisinicio:       prod.paineisinicio,
    paineisfim:          prod.paineisfim,
    paineispausa:        prod.paineispausa,
    paineisresp:         prod.paineisresp,
    paineisname:         um[prod.paineisresp]         ?? null,
    acabamentoinicio:    prod.acabamentoinicio,
    acabamentofim:       prod.acabamentofim,
    acabamentopausa:     prod.acabamentopausa,
    acabamentoresp:      prod.acabamentoresp,
    acabamentoname:      um[prod.acabamentoresp]      ?? null,
    embalageminicio:     prod.embalageminicio,
    embalagemfim:        prod.embalagemfim,
    embalagempausa:      prod.embalagempausa,
    embalagemresp:       prod.embalagemresp,
    embalagemname:       um[prod.embalagemresp]       ?? null,
    observacoes:         prod.observacoes,
  }];
}

module.exports = { listarProjetosPrevisoes, buscarProjetoPrevisao };
