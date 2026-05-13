const express = require('express');
const router = express.Router();
const usuariosService = require('../services/usuariosService');

function verificarSessao(req, res, next) {
  if (req.session && req.session.usuario) {
    next(); 
  } else {
    return res.status(401).json({ erro: 'Acesso negado. Você precisa fazer login.' });
  }
}

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  const usuario = await usuariosService.buscarPorEmail(email);

  if (usuario && usuario.senha === senha) {
    req.session.usuario = { id: usuario.id, nome: usuario.nome };
    return res.json({ mensagem: 'Login realizado com sucesso' });
  }
  
  return res.status(401).json({ erro: 'Credenciais invalidas' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('lab_session_id'); 
    res.json({ mensagem: 'Logout realizado com sucesso' });
  });
});


module.exports = {
  router,
  verificarSessao
};