const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middlewares/auth');


router.get('/', auth.verificarSessao, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM favoritos WHERE usuario_id = ?', [req.session.usuario.id]);
   
    const data = rows.map(r => ({ ...r, parecidas: r.parecidas ? r.parecidas.split(',') : [] }));
    res.json({ data });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar favoritos' });
  }
});


router.post('/toggle', auth.verificarSessao, async (req, res) => {
  const { nome, nomeCientifico, clima, cuidados, expectativaVida, imagemUrl, parecidas } = req.body;
  const usuario_id = req.session.usuario.id;

  try {
   
    const [existente] = await db.query('SELECT id FROM favoritos WHERE usuario_id = ? AND nome = ?', [usuario_id, nome]);

    if (existente.length > 0) {
    
      await db.query('DELETE FROM favoritos WHERE id = ?', [existente[0].id]);
      return res.json({ favorito: false });
    } else {
      
      const parecidasStr = Array.isArray(parecidas) ? parecidas.join(',') : '';
      await db.query(
        'INSERT INTO favoritos (usuario_id, nome, nomeCientifico, clima, cuidados, expectativaVida, imagemUrl, parecidas) VALUES (?,?,?,?,?,?,?,?)',
        [usuario_id, nome, nomeCientifico, clima, cuidados, expectativaVida, imagemUrl, parecidasStr]
      );
      return res.json({ favorito: true });
    }
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao processar favorito' });
  }
});

module.exports = router;