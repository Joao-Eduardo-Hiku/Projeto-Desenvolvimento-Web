const express = require('express');
const router = express.Router();
const authModule = require('../middlewares/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
function normalizarNomeBusca(nomeCientifico) {
  return nomeCientifico
    .replace(/[×x]\s+/gi, '')   // remove × ou x seguido de espaço
    .replace(/\s+/g, ' ')
    .trim();
}

async function buscarImagemReal(nomeCientifico) {
  const nomeBusca = normalizarNomeBusca(nomeCientifico);

  // Wikipedia PT
  try {
    const url = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(nomeBusca)}&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    if (page.pageid && page.thumbnail) {
      return page.thumbnail.source;
    }
  } catch (e) { /* segue */ }

  // Wikipedia EN 
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(nomeBusca)}&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    if (page.pageid && page.thumbnail) {
      return page.thumbnail.source;
    }
  } catch (e) { /* segue */ }

  // Wikimedia Commons 
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(nomeBusca)}&prop=images&imlimit=5&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    if (page.images && page.images.length > 0) {
      // Pega a primeira imagem que pareça uma foto (não ícone/mapa)
      const imagem = page.images.find(img =>
        /\.(jpg|jpeg|png)/i.test(img.title) &&
        !/(flag|map|icon|logo|locator|blank|silhouette)/i.test(img.title)
      );
      if (imagem) {
        // Monta URL do Wikimedia Commons via API imageinfo
        const titleEncoded = encodeURIComponent(imagem.title);
        const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${titleEncoded}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*`;
        const infoRes = await fetch(infoUrl);
        const infoData = await infoRes.json();
        const infoPages = infoData.query.pages;
        const infoPage = Object.values(infoPages)[0];
        if (infoPage.imageinfo && infoPage.imageinfo[0].thumburl) {
          return infoPage.imageinfo[0].thumburl;
        }
      }
    }
  } catch (e) { /* segue */ }

  // iNaturalist
  try {
    const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(nomeBusca)}&rank=species&per_page=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const taxon = data.results[0];
      if (taxon.default_photo && taxon.default_photo.medium_url) {
        return taxon.default_photo.medium_url;
      }
    }
  } catch (e) { /* segue */ }

  return 'https://placehold.co/400x300?text=Foto+Indispon%C3%ADvel';
}

router.get('/', authModule.verificarSessao, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ erro: 'Busca vazia' });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um botânico especialista. Responda APENAS em JSON estrito. Não invente dados falsos.'
        },
        {
          role: 'user',
          content: `Gere um JSON com uma lista de exatamente 4 plantas.
          REGRA 1: A primeira planta DEVE ser a espécie "${q}".
          REGRA 2: As plantas 2, 3 e 4 DEVEM ser parentes muito próximas e serem exatamente as mesmas espécies que você listar no array "parecidas" da primeira planta, e nelas coloque tambem outras plantas parecidas.
          REGRA 3: Todas as informações devem ser reais.
          REGRA 4: O campo "linkReferencia" deve ser a URL real da página da Wikipedia em português (pt.wikipedia.org/wiki/...) para o nome científico da planta. Se não existir página em português, use a URL em inglês (en.wikipedia.org/wiki/...).
          
          Retorne APENAS este formato exato de JSON:
          {
            "data": [
              {
                "nome": "string",
                "nomeCientifico": "string",
                "clima": "string",
                "cuidados": "string (máx 150 char)",
                "expectativaVida": "string",
                "parecidas": ["nome exato da planta 2", "nome exato da planta 3", "nome exato da planta 4"],
                "linkReferencia": "string (URL Wikipedia)"
              }
            ]
          }`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    let dados = JSON.parse(chatCompletion.choices[0].message.content);

    if (dados.data && Array.isArray(dados.data)) {
      const plantasComImagem = await Promise.all(dados.data.map(async (planta) => {
        if (typeof planta.cuidados === 'object') {
          planta.cuidados = Object.values(planta.cuidados).join('. ');
        }
        planta.imagemUrl = await buscarImagemReal(planta.nomeCientifico);
        return planta;
      }));

      return res.json({ data: plantasComImagem });
    } else {
      return res.json({ data: [] });
    }

  } catch (erro) {
    console.error('Erro ao consultar a IA:', erro);
    res.status(500).json({ erro: 'Erro ao consultar a Inteligência Artificial' });
  }
});

module.exports = router;