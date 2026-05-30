const express = require('express');
const router = express.Router();
const authModule = require('../middlewares/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.get('/', authModule.verificarSessao, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ erro: 'Busca vazia' });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um botânico. Responda APENAS em JSON. Todos os valores devem ser strings, exceto "parecidas" que é um array de strings.'
        },
        {
          role: 'user',
          content: `Informações sobre a planta "${q}". 
          JSON: { 
            "nome": "string", 
            "nomeCientifico": "string", 
            "clima": "string", 
            "cuidados": "string curta (máximo 150 caracteres)", 
            "expectativaVida": "string", 
            "imagemUrl": "retorne uma URL da Unsplash baseada no nome da planta (ex: https://source.unsplash.com/400x300/?sunflower)", 
            "parecidas": ["string", "string", "string"] 
          }`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    let dados = JSON.parse(chatCompletion.choices[0].message.content);

    if (typeof dados.cuidados === 'object') {
      dados.cuidados = Object.values(dados.cuidados).join('. ');
    }
    
    if (dados.imagemUrl.includes('wikimedia.org')) {
       dados.imagemUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(q)}`;
    }

    return res.json({ data: [dados] });

  } catch (erro) {
    console.error('Erro:', erro);
    return res.status(500).json({ erro: 'Erro na IA' });
  }
});

module.exports = router;