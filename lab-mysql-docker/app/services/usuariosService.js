const db = require('../db');

async function listar() {
  const [rows] = await db.query('SELECT id, nome, email FROM usuarios ORDER BY id DESC');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query(
    'SELECT id, nome, email FROM usuarios WHERE id = ?',
    [id]
  );

  return rows[0] || null;
}

async function criar({ nome, email, senha }) {
  const [result] = await db.query(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, senha]
  );
  return buscarPorId(result.insertId);
}

async function atualizar(id, { nome, email }) {
  const [result] = await db.query(
    'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
    [nome, email, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return buscarPorId(id);
}

async function remover(id) {
  const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return result.affectedRows > 0;
}


async function buscarPorEmail(email) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0] || null;
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorEmail, 
  criar,
  atualizar,
  remover
};