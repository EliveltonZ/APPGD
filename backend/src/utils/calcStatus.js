const BULLET = "●"; // chr(9679)

function today() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function toDate(v) {
  return v ? new Date(v) : null;
}

function in10Days(now) {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + 10);
  return d;
}

function planejamentoStatus(p) {
  const now = today();
  const delivery = toDate(p.dataentrega);
  const soon = in10Days(now);

  if (p.parceado) return "PARCEADO";
  if (p.pendencia) return "PENDENCIA";
  if (p.entrega) return "ENTREGUE";
  if (p.pronto) return "PRONTO";
  if (p.iniciado && p.urgente) return "URGENTE";
  if (p.iniciado && delivery < now) return "ATRASADO";
  if (p.iniciado && delivery < soon) return "A VENCER";
  if (p.iniciado) return "INICIADO";
  return "AGUARDANDO";
}

function producaoStatus(p) {
  const now = today();
  const delivery = toDate(p.dataentrega);
  const soon = in10Days(now);

  if (p.parceado) return "PARCEADO";
  if (p.pendencia) return "PENDENCIA";
  if (p.entrega) return "ENTREGUE";
  if (p.pronto) return "PRONTO";
  if (p.urgente) return "URGENTE";
  if (delivery < now) return "ATRASADO";
  if (delivery < soon) return "A VENCER";
  if (p.iniciado) return "INICIADO";
  return "AGUARDANDO";
}

function compraStatus({ recebido, pendencia, dataentrega }) {
  const now = today();
  const delivery = toDate(dataentrega);
  const soon = in10Days(now);

  if (recebido) return "ENTREGUE";
  if (pendencia && !recebido) return "PENDENCIA";
  if (delivery && delivery < now && !recebido) return "ATRASADO";
  if (delivery && delivery < soon) return "A VENCER";
  return "AGUARDANDO";
}

function countPending(acessorios) {
  return (acessorios || []).filter((a) => !a.recebido).length;
}

function hasBullet(acessorios) {
  return (acessorios || []).length > 0 ? BULLET : "";
}

function formatDateBR(d) {
  if (!d) return null;
  const date = new Date(d);
  return [
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    date.getUTCFullYear(),
  ].join("/");
}

function assistenciaStatus(a) {
  if (a.dataentrega)  return "ENTREGUE";
  if (a.pronto)       return "PRONTO";
  if (a.pendencia)    return "PENDENCIA";
  if (a.iniciado)     return "INICIADO";
  if (a.producao)     return "PRODUCAO";
  if (a.semMaterial)  return "SEM MATERIAL";
  if (a.escritorio)   return "ESCRITORIO";
  return "EM ABERTO";
}

function stageStatus(inicio, fim, pausa) {
  if (fim) return "FINALIZADO";
  if (pausa) return "PAUSADO";
  if (inicio) return "INICIADO";
  return "AGUARDE";
}

function separacaoStatus(separacao, embalagemfim) {
  if (separacao) return "FINALIZADO";
  if (embalagemfim) return "INICIADO";
  return "AGUARDE";
}

function diasRestantes(dataentrega) {
  if (!dataentrega) return null;
  const now = today();
  const delivery = new Date(dataentrega);
  return Math.round((delivery - now) / (1000 * 60 * 60 * 24));
}

module.exports = {
  planejamentoStatus,
  assistenciaStatus,
  producaoStatus,
  compraStatus,
  countPending,
  hasBullet,
  formatDateBR,
  stageStatus,
  separacaoStatus,
  diasRestantes,
};
