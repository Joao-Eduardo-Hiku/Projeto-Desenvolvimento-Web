const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const usuariosService = require('../services/usuariosService');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { erro: 'Muitas tentativas de login incorretas. Tente novamente em 15 minutos.' }
});

function verificarSessao(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.status(401).json({ erro: 'Acesso negado. Você precisa fazer login.' });
}

router.post('/login', loginLimiter, async (req, res) => {
  const { email, senha } = req.body;

  // Validação básica dos campos
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  try {
    const usuario = await usuariosService.buscarPorEmail(email);

    const senhaCorreta = usuario
      ? await bcrypt.compare(senha, usuario.senha)
      : false;

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email };
    return res.json({ mensagem: 'Login realizado com sucesso.' });

  } catch (erro) {
    console.error('Erro no login:', erro);
    return res.status(500).json({ erro: 'Erro interno. Tente novamente.' });
  }
});

router.get('/me', verificarSessao, (req, res) => {
  const { id, nome, email } = req.session.usuario;
  res.json({ id, nome, email });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('lab_session_id');
    res.json({ mensagem: 'Logout realizado com sucesso.' });
  });
});

module.exports = { router, verificarSessao };