// public/js/auth.js

// Esse objeto “singleton” armazena os dados do usuário
// só enquanto a página estiver aberta, em vez de usar localStorage.
const UsuarioSession = {
  data: null,

  // setData recebe o objeto que veio do backend e salva em memória
  setData(obj) {
    this.data = obj;
  },

  // get retorna qualquer campo que você queira
  get(field) {
    return this.data ? this.data[field] : undefined;
  },

  // hasPerm devolve true/false se aquela flag existe e é truthy
  hasPerm(perm) {
    return Boolean(this.data?.[perm]);
  },
};

export default UsuarioSession;
