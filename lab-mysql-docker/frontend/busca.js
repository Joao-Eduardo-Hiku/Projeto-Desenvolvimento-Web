const API_BASE_URL = '/api/plantas';

const form = document.getElementById('busca-form');
const inputBusca = document.getElementById('termo-busca');
const statusBusca = document.getElementById('status-busca');
const listaPlantas = document.getElementById('lista-plantas');

async function buscarPlantas(event) {
  event.preventDefault();

  const termo = inputBusca.value.trim();
  if (!termo) return;

  statusBusca.textContent = `Buscando resultados para "${termo}"...`;
  statusBusca.style.color = 'var(--text)';
  listaPlantas.innerHTML = '';

  try {
    const url = `${API_BASE_URL}?q=${encodeURIComponent(termo)}`;
    const resposta = await fetch(url, { credentials: 'include' });

    if (!resposta.ok) {
      throw new Error('Falha na comunicação com o servidor');
    }

    const dados = await resposta.json();

    if (dados.data && dados.data.length > 0) {
      statusBusca.textContent = `${dados.data.length} espécies encontradas.`;
      renderizarResultados(dados.data);
    } else {
      statusBusca.textContent = 'Nenhuma planta encontrada. Tente buscar em inglês (ex: Rose, Cactus).';
    }

  } catch (erro) {
    console.error('Erro na requisição:', erro);
    statusBusca.textContent = 'Ocorreu um erro ao buscar as plantas. Tente novamente mais tarde.';
    statusBusca.style.color = 'var(--danger)';
  }
}

function renderizarResultados(plantas) {
  plantas.forEach(planta => {
    const imagemUrl = (planta.default_image && planta.default_image.regular_url)
      ? planta.default_image.regular_url
      : 'https://placehold.co/300x200?text=Sem+Imagem'; 

    const card = document.createElement('div');
    card.className = 'planta-card';

    card.innerHTML = `
      <img src="${imagemUrl}" alt="${planta.common_name}">
      <div class="planta-info">
        <h3>${planta.common_name}</h3>
        <p><strong>Científico:</strong> <em>${planta.scientific_name ? planta.scientific_name[0] : 'N/A'}</em></p>
        <p><strong>Rega:</strong> ${planta.watering || 'Não informado'}</p>
        <p><strong>Luz:</strong> ${planta.sunlight ? planta.sunlight.join(', ') : 'Não informado'}</p>
        <span class="ciclo">${planta.cycle || 'Desconhecido'}</span>
      </div>
    `;

    listaPlantas.appendChild(card);
  });
}

form.addEventListener('submit', buscarPlantas);
