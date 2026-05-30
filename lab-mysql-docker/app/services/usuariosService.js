const bcrypt = require('bcryptjs');
const db = require('../db');

const SALT_ROUNDS = 12;

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

async function buscarPorEmail(email) {
  const [rows] = await db.query(
    'SELECT id, nome, email, senha FROM usuarios WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function criar({ nome, email, senha }) {
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const [result] = await db.query(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, senhaHash]
  );
  return buscarPorId(result.insertId);
}

async function atualizar(id, { nome, email }) {
  const [result] = await db.query(
    'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
    [nome, email, id]
  );
  if (result.affectedRows === 0) return null;
  return buscarPorId(id);
}

async function remover(id) {
  const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { listar, buscarPorId, buscarPorEmail, criar, atualizar, remover };