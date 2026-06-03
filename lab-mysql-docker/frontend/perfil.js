async function carregarFavoritos() {
  const container = document.getElementById('lista-favoritos');
  try {
    const res = await fetch('/api/favoritos', { credentials: 'include' });
    const json = await res.json();
    const favoritos = json.data;
    
    if (!favoritos || favoritos.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--muted); grid-column: 1/-1;">Você ainda não favoritou nenhuma planta.</p>';
      return;
    }
    
    container.innerHTML = '';
    
    favoritos.forEach(planta => {
      const card = document.createElement('div');
      card.className = 'planta-card';
      
      const parecidas = Array.isArray(planta.parecidas) ? planta.parecidas.join(', ') : (planta.parecidas || 'Nenhuma');
             
      card.innerHTML = `
        <div style="position: relative;">
          <img src="${planta.imagemUrl}" alt="${planta.nome}" onerror="this.src='https://placehold.co/400x300?text=Planta'">
        </div>
        <div class="planta-info">
          <h3>${planta.nome}</h3>
          <p><strong>Científico:</strong> <em>${planta.nomeCientifico}</em></p>
          <p><strong>Clima:</strong> ${planta.clima}</p>
          <p><strong>Cuidados:</strong> ${planta.cuidados}</p>
          <p><strong>Parecidas:</strong> ${parecidas}</p>
          <span class="ciclo">Vida: ${planta.expectativaVida}</span>
          ${planta.linkReferencia ? `<a href="${planta.linkReferencia}" target="_blank" rel="noopener noreferrer" class="link-referencia">🔗 Ver referência</a>` : ''}
          
          <button onclick="removerFavorito('${planta.nome}')" style="background: var(--danger); color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; margin-top: 10px; font-size: 12px; font-weight: bold;">
            Remover Favorito
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (erro) {
    console.error('Erro ao carregar favoritos:', erro);
    container.innerHTML = '<p>Erro ao carregar favoritos.</p>';
  }
}

async function removerFavorito(nome) {
  if (!confirm(`Deseja remover ${nome} dos favoritos?`)) return;
  
  try {
    await fetch('/api/favoritos/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
      credentials: 'include'
    });
    carregarFavoritos();
  } catch (erro) {
    alert('Erro ao remover favorito');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosUsuario();
  carregarFavoritos();
});
async function carregarDadosUsuario() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      window.location.replace('login.html');
      return;
    }
    const usuario = await res.json();
    document.getElementById('perfil-nome').textContent = usuario.nome;
    document.getElementById('perfil-email').textContent = usuario.email;
  } catch (erro) {
    console.error('Erro ao carregar dados do usuário:', erro);
  }
}