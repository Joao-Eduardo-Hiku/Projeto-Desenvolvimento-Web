require('dotenv').config();
const favoritosRoutes = require('./routes/favoritos');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const helmet = require('helmet');


const dbPool = require('./db');
const usuariosRoutes = require('./routes/usuarios');
const plantasRoutes = require('./routes/plantas');
const authModule = require('./middlewares/auth');

const app = express();



app.set('trust proxy', 1);
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true
}, dbPool);

app.use(
  session({
    name: 'lab_session_id',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
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
app.use('/api/favoritos', favoritosRoutes);

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});