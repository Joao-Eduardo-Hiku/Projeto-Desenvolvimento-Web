const form = document.getElementById('usuario-form');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const mensagem = document.getElementById('mensagem');

const API_URL = '/api/usuarios';

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#b42318' : '#0b5b55';
}

async function salvarUsuario(event) {
  event.preventDefault();

  const payload = {
    nome: nomeInput.value.trim(),
    email: emailInput.value.trim(),
    senha: senhaInput.value.trim()
  };

  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      mostrarMensagem(erro.erro || 'Falha ao cadastrar', true);
      return;
    }

    mostrarMensagem('Usuário cadastrado com sucesso!');
    form.reset(); // Limpa os campos do formulário
  } catch (error) {
    mostrarMensagem('Erro de conexão com o servidor', true);
  }
}

form.addEventListener('submit', salvarUsuario);