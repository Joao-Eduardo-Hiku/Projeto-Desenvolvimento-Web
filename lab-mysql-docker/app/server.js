const express = require('express');
const session = require('express-session');
const cors = require('cors'); 
const usuariosRoutes = require('./routes/usuarios');
const authModule = require('./middlewares/auth'); 

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'lab_session_id', 
    secret: 'segredo-super-seguro-lab-2026', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, 
      secure: false,  
      sameSite: 'lax', 
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authModule.router);

app.use('/usuarios', authModule.verificarSessao, usuariosRoutes);

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});