const repo = require('../repositories/paradasRepository');

function erroValidacao(msg) {
  return Object.assign(new Error(msg), { code: 'VALIDACAO' });
}

const listarMaquinas = () => repo.listarMaquinas();
const listarTipos    = () => repo.listarTipos();

function buscarPedido(tipo, pedido) {
  if (!tipo || isNaN(pedido)) throw erroValidacao('Parâmetros inválidos');
  return repo.buscarPedido(tipo, pedido);
}

const buscarAberta  = (id_maquina) => repo.buscarAberta(id_maquina);
const listarAbertas = () => repo.listarAbertas();
const listarTodas   = (filtros) => repo.listarTodas(filtros);

function iniciar({ pedido, id_maquina, id_tipo, id_usuario }) {
  if (pedido === undefined || pedido === null || String(pedido).trim() === '') {
    throw erroValidacao('Pedido é obrigatório');
  }
  if (!id_maquina) throw erroValidacao('Máquina é obrigatória');
  if (!id_tipo)    throw erroValidacao('Tipo é obrigatório');
  return repo.iniciar({
    pedido:     Number(pedido),
    id_maquina: Number(id_maquina),
    id_tipo:    Number(id_tipo),
    id_usuario,
  });
}

function finalizar(id_maquina) {
  if (!id_maquina) throw erroValidacao('Máquina é obrigatória');
  return repo.finalizar(Number(id_maquina));
}

const editarParada    = (id, changes, id_usuario) => repo.editarParada(id, changes, id_usuario);
const listarHistorico = (id) => repo.listarHistorico(id);

module.exports = {
  listarMaquinas,
  listarTipos,
  buscarPedido,
  buscarAberta,
  listarAbertas,
  iniciar,
  finalizar,
  listarTodas,
  editarParada,
  listarHistorico,
};
