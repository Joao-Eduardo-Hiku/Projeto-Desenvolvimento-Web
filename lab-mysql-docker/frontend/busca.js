const API_BASE_URL = '/api/plantas';

const form = document.getElementById('busca-form');
const inputBusca = document.getElementById('termo-busca');
const statusBusca = document.getElementById('status-busca');
const listaPlantas = document.getElementById('lista-plantas');

async function buscarPlantas(event) {
  event.preventDefault();

  const termo = inputBusca.value.trim();
  if (!termo) return;

  statusBusca.textContent = `A consultar a Inteligência Artificial sobre "${termo}". Isto pode demorar alguns segundos, aguarde...`;
  statusBusca.style.color = 'var(--text)';
  listaPlantas.innerHTML = '';

  try {
    const url = `${API_BASE_URL}?q=${encodeURIComponent(termo)}`;
    const resposta = await fetch(url, { credentials: 'include' });

    const dados = await resposta.json();

    if (!resposta.ok) {
      statusBusca.textContent = dados.erro || 'Ocorreu um erro ao comunicar com a IA. Tente novamente mais tarde.';
      statusBusca.style.color = 'var(--danger)';
      return;
    }

    if (dados.data && dados.data.length > 0) {
      statusBusca.innerHTML = `Aqui estão as informações geradas por IA para <strong>"${termo}"</strong>.`;
      
      const resFav = await fetch('/api/favoritos', { credentials: 'include' });
      const jsonFav = resFav.ok ? await resFav.json() : { data: [] };
      const favoritosAtuais = jsonFav.data || [];

      renderizarResultados(dados.data, favoritosAtuais);
    } else {
      statusBusca.textContent = `Nenhuma informação encontrada para "${termo}".`;
    }

  } catch (erro) {
    console.error('Erro na requisição:', erro);
    statusBusca.textContent = 'Ocorreu um erro ao comunicar com a IA. Tente novamente mais tarde.';
    statusBusca.style.color = 'var(--danger)';
  }
}

function renderizarResultados(plantas, favoritos = []) {
  listaPlantas.innerHTML = '';
  plantas.forEach(planta => {
    const card = document.createElement('div');
    card.className = 'planta-card';

    const imagemUrl = planta.imagemUrl || 'https://placehold.co/400x300?text=Planta';
    const parecidas = Array.isArray(planta.parecidas) ? planta.parecidas.join(', ') : 'Nenhuma';

    const jaFavoritado = favoritos.some(fav => 
      (fav.nomeCientifico && planta.nomeCientifico && fav.nomeCientifico.toLowerCase() === planta.nomeCientifico.toLowerCase()) || 
      (fav.nome && planta.nome && fav.nome.toLowerCase() === planta.nome.toLowerCase())
    );

    const iconeCoracao = jaFavoritado ? '❤' : '♡';
    const classeBotao = jaFavoritado ? 'btn-favorito active' : 'btn-favorito';

    card.innerHTML = `
      <div style="position: relative;">
        <img src="${imagemUrl}" alt="${planta.nome}" onerror="this.src='https://placehold.co/400x300?text=Planta'">
        <button class="${classeBotao}" onclick='gerenciarFavorito(this, ${JSON.stringify(planta).replace(/'/g, "&apos;")})'>
          <span class="coracao-icon">${iconeCoracao}</span>
        </button>
      </div>
      <div class="planta-info">
        <h3>${planta.nome}</h3>
        <p><strong>Científico:</strong> <em>${planta.nomeCientifico}</em></p>
        <p><strong>Clima:</strong> ${planta.clima}</p>
        <p><strong>Cuidados:</strong> ${planta.cuidados}</p>
        <p><strong>Parecidas:</strong> ${parecidas}</p>
        <span class="ciclo">Vida: ${planta.expectativaVida}</span>
        ${planta.linkReferencia ? `<a href="${planta.linkReferencia}" target="_blank" rel="noopener noreferrer" class="link-referencia">🔗 Ver referência</a>` : ''}
      </div>
    `;
    listaPlantas.appendChild(card);
  });
}

async function gerenciarFavorito(btn, planta) {
  try {
    const res = await fetch('/api/favoritos/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planta),
      credentials: 'include'
    });
    
    if (!res.ok) throw new Error('Erro na resposta do servidor');

    const dados = await res.json();
    const icon = btn.querySelector('.coracao-icon');

    if (dados.favorito) {
      icon.textContent = '❤';
      btn.classList.add('active'); 
      alert(`${planta.nome} adicionado aos favoritos!`);
    } else {
      icon.textContent = '♡';
      btn.classList.remove('active');
      alert(`${planta.nome} removido dos favoritos!`);
    }
  } catch (erro) {
    console.error('Erro ao favoritar:', erro);
    alert('Erro ao salvar favorito. Verifique se a tabela existe no banco.');
  }
}

form.addEventListener('submit', buscarPlantas);