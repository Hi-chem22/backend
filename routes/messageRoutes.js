const express = require('express');
const router = express.Router();
const { 
  addMessage, 
  getMessages, 
  getMessageById, 
  updateMessage, 
  deleteMessage 
} = require('../controllers/messageController');

// Routes pour les messages
router.post('/', addMessage);
router.get('/', getMessages);
router.get('/:id', getMessageById);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

module.exports = router; 