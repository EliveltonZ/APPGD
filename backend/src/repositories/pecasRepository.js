const { Pecas, Ocorrencia, Falhas, Projetos } = require('../client/db');

// Quem chama aqui (Capa de Assistência) manda o "solicitacao"/numero da
// Asteca, não a ordemdecompra real — mas Pecas.idAssistencia guarda a OC
// desde a migração pra tblProjetos. Resolve numero_solicitacao -> OC antes
// de buscar; se não achar (ou já vier a própria OC), usa o valor como veio.
async function _resolverIdAssistencia(idAssistencia) {
  const projeto = await Projetos.findOne({
    where: { numeroSolicitacao: String(idAssistencia) },
    attributes: ['ordemdecompra'],
  });
  return projeto ? String(projeto.ordemdecompra) : String(idAssistencia);
}

async function listarPecas(idAssistenciaParam) {
  const idAssistencia = await _resolverIdAssistencia(idAssistenciaParam);
  const rows = await Pecas.findAll({
    where: { idAssistencia: String(idAssistencia) },
    attributes: ['codigo', 'qtd', 'peca', 'dimensoes', 'cor', 'lado', 'idOcorrencia', 'idFalha', 'observacoes'],
    include: [
      { model: Ocorrencia, as: 'ocorrencia', attributes: ['descricao'], required: true },
      { model: Falhas,     as: 'falha',      attributes: ['descricao'], required: true },
    ],
  });
  return rows.map(pk => ({
    codigo:       pk.codigo,
    qtd:          pk.qtd,
    peca:         pk.peca,
    dimensoes:    pk.dimensoes,
    cor:          pk.cor,
    lado:         pk.lado,
    id_ocorrencia: pk.idOcorrencia,
    ocorrencia:   pk.ocorrencia?.descricao ?? null,
    id_falha:     pk.idFalha,
    falha:        pk.falha?.descricao      ?? null,
    observacoes:  pk.observacoes,
  }));
}

async function inserirPecas(idAssistenciaParam, pecas) {
  const idAssistencia = await _resolverIdAssistencia(idAssistenciaParam);
  await Pecas.bulkCreate(
    pecas.map(r => ({
      qtd:           Number(r.qtd) || 0,
      cor:           r.cor                        ?? null,
      peca:          r.peca                       ?? null,
      idAssistencia: String(idAssistencia),
      dimensoes:     r.dimensoes                  ?? null,
      lado:          r.lado                       ?? null,
      idOcorrencia:  r.id_ocorrencia ? Number(r.id_ocorrencia) : null,
      observacoes:   r.observacoes                ?? null,
      idFalha:       r.id_falha     ? Number(r.id_falha)      : null,
    }))
  );
}

module.exports = { listarPecas, inserirPecas };
