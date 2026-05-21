require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');
const plantasRoutes = require('./routes/plantas');
const authModule = require('./middlewares/auth');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'lab_session_id',
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authModule.router);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/plantas', plantasRoutes);

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
