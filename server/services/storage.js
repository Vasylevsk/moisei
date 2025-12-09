// Простое хранилище в памяти
// В продакшене замените на Redis или базу данных (MongoDB, PostgreSQL)

const reservations = new Map();

const save = (id, data) => {
  reservations.set(id, data);
  return true;
};

const get = (id) => {
  return reservations.get(id);
};

const update = (id, data) => {
  const existing = reservations.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  reservations.set(id, updated);
  return updated;
};

const remove = (id) => {
  return reservations.delete(id);
};

const getAll = () => {
  return Array.from(reservations.values());
};

module.exports = {
  save,
  get,
  update,
  remove,
  getAll,
};





