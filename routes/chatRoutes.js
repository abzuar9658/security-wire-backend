const express = require('express');
const authController = require('./../controllers/authController');
const chatController = require('./../controllers/chatController');

const router = express.Router();

router.get('/:userId', authController.protect, chatController.getChat);
router.post('/', authController.protect, chatController.create);

module.exports = router;
