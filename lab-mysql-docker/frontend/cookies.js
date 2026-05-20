document.addEventListener('DOMContentLoaded', () => {
  const cookieBanner = document.getElementById('cookie-banner');
  const btnAceitar = document.getElementById('btn-aceitar-cookies');

  // Verifica no armazenamento do navegador se o utilizador já aceitou antes
  const cookiesAceitos = localStorage.getItem('cookiesAceitos');

  // Se não tiver aceitado ainda, mostra o banner (remove o display: none)
  if (!cookiesAceitos) {
    cookieBanner.style.display = 'flex';
  }

  // Quando clicar no botão "Entendi"
  btnAceitar.addEventListener('click', () => {
    // Salva a preferência do utilizador para as próximas visitas
    localStorage.setItem('cookiesAceitos', 'true');
    // Esconde o banner
    cookieBanner.style.display = 'none';
  });
});