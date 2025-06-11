const store = new Map();

module.exports = {
  setUser: (id, data) => store.set(id, data),
  getUser: (id) => store.get(id),
  hasUser: (id) => store.has(id),
  deleteUser: (id) => store.delete(id),
};
