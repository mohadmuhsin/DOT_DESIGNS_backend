const { Router } = require('express');
const { addMessage, getMessage } = require('../controllers/messageController');
const router = Router();

router.post('/', addMessage)
router.get('/:chatId',getMessage)

module.exports = router