const { Message } = require('../models');

// Ajouter un nouveau message
const addMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer tous les messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer un message par ID
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.status(200).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mettre à jour un message
const updateMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.status(200).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage
}; 