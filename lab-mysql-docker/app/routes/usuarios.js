const express = require('express');
const controller = require('../controllers/usuariosController');
const authModule = require('../middlewares/auth');

const router = express.Router();

router.post('/', controller.criar);

router.use(authModule.verificarSessao);

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.remover);

module.exports = router;