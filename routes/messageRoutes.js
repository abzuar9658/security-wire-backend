const express = require('express');
const Controller = require('../controllers/messageController');

const router = express.Router();

router.post('/', Controller.Create);
router.get('/', Controller.List);
router.get('/:id', Controller.Read);
router.patch('/:id', Controller.Update);
router.delete('/:id', Controller.Delete);

module.exports = router;
