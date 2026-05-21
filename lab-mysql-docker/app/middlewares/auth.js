const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const usuariosService = require('../services/usuariosService');

function verificarSessao(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.status(401).json({ erro: 'Acesso negado. Você precisa fazer login.' });
}

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  // Validação básica dos campos
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  try {
    const usuario = await usuariosService.buscarPorEmail(email);

    // bcrypt.compare retorna false se usuario não existir ou senha não bater
    // A verificação é feita mesmo sem usuário para evitar timing attacks
    const senhaCorreta = usuario
      ? await bcrypt.compare(senha, usuario.senha)
      : false;

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    req.session.usuario = { id: usuario.id, nome: usuario.nome };
    return res.json({ mensagem: 'Login realizado com sucesso.' });

  } catch (erro) {
    console.error('Erro no login:', erro);
    return res.status(500).json({ erro: 'Erro interno. Tente novamente.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('lab_session_id');
    res.json({ mensagem: 'Logout realizado com sucesso.' });
  });
});

module.exports = { router, verificarSessao };