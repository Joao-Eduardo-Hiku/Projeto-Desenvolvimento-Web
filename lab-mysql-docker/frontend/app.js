document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('usuario-form');
  const mensagem = document.getElementById('mensagem');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      senha: document.getElementById('senha').value.trim()
    };

    try {
      const resposta = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resposta.ok) {
        window.location.replace('login.html');
      } else {
        const dados = await resposta.json();
        mensagem.textContent = dados.erro || 'Erro ao realizar cadastro.';
        mensagem.style.color = 'red';
      }
    } catch (erro) {
      console.error('Erro no cadastro:', erro);
      mensagem.textContent = 'Erro de conexão com o servidor.';
      mensagem.style.color = 'red';
    }
  });
});