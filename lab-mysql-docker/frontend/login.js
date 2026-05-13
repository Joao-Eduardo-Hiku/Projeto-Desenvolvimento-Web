const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const mensagem = document.getElementById('mensagem');

const API_LOGIN_URL = '/api/auth/login';

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#b42318' : '#0b5b55';
}

async function fazerLogin(event) {
  event.preventDefault();

  const payload = {
    email: emailInput.value.trim(),
    senha: senhaInput.value.trim()
  };

  try {
    const resposta = await fetch(API_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
      mostrarMensagem('Email ou senha inválidos!', true);
      return;
    }

    mostrarMensagem('Login realizado! Redirecionando...');
    
    setTimeout(() => {
      alert("Sucesso! Aqui você redirecionaria para uma página restrita (Dashboard).");
      window.location.href = 'index.html'; 
    }, 1000);

  } catch (error) {
    mostrarMensagem('Erro de conexão com o servidor', true);
  }
}

form.addEventListener('submit', fazerLogin);