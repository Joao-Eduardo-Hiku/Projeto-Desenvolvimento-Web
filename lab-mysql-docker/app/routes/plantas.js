require('dotenv').config();
const express = require('express');
const router = express.Router();
const authModule = require('../middlewares/auth');

const PERENUAL_KEY = process.env.PERENUAL_API_KEY;
const PERENUAL_BASE = 'https://perenual.com/api/v2';

// Rota protegida — só usuários logados podem buscar plantas
router.get('/', authModule.verificarSessao, async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ erro: 'Parâmetro de busca "q" é obrigatório.' });
  }

  try {
    const url = `${PERENUAL_BASE}/species-list?key=${PERENUAL_KEY}&q=${encodeURIComponent(q)}`;

    // Timeout de 15 segundos para a API da Perenual
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const resposta = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resposta.ok) {
      return res.status(502).json({ erro: 'Falha ao comunicar com a API de plantas.' });
    }

    const dados = await resposta.json();
    return res.json(dados);

  } catch (erro) {
    if (erro.name === 'AbortError') {
      return res.status(504).json({ erro: 'A API de plantas demorou demais para responder. Tente novamente.' });
    }
    console.error('Erro no proxy Perenual:', erro);
    return res.status(500).json({ erro: 'Erro interno. Tente novamente.' });
  }
});

module.exports = router;