document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const mensagem = document.getElementById('mensagem');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      email: document.getElementById('email').value.trim(),
      senha: document.getElementById('senha').value.trim()
    };

    try {
      const resposta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resposta.ok) {
        window.location.replace('busca.html');
      } else {
        const dados = await resposta.json();
        mensagem.textContent = dados.erro || 'Credenciais inválidas.';
        mensagem.style.color = 'red';
      }
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      mensagem.textContent = 'Erro de conexão com o servidor.';
      mensagem.style.color = 'red';
    }
  });
});