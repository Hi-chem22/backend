const { Speaker } = require('../models');
const fs = require('fs');
const path = require('path');

// Ajouter un nouvel intervenant
const addSpeaker = async (req, res) => {
  try {
    const speakerData = { ...req.body };
    
    // Gérer les URLs d'images directes depuis le body
    // Si flagUrl est fourni directement (Postman)
    if (speakerData.flagUrl && speakerData.flagUrl.startsWith('http')) {
      // Conserver l'URL directement dans flagUrl
      // Pas besoin de modification car le schema accepte déjà flagUrl
    }
    
    // Si speakerImageUrl est fourni directement (Postman)
    if (speakerData.speakerImageUrl && speakerData.speakerImageUrl.startsWith('http')) {
      // Conserver l'URL directement dans speakerImageUrl
      // Pas besoin de modification car le schema accepte déjà speakerImageUrl
    }
    
    // Si imageFlag est une URL externe (comme Imgur), la conserver
    if (speakerData.imageFlag && speakerData.imageFlag.startsWith('http')) {
      speakerData.externalImageFlag = speakerData.imageFlag;
      delete speakerData.imageFlag; // Pour éviter la confusion
    }
    
    // Si des fichiers ont été uploadés
    if (req.files) {
      // Gérer le drapeau (imageFlag)
      if (req.files.imageFlag && req.files.imageFlag.length > 0) {
        speakerData.flagUrl = `/uploads/flags/${req.files.imageFlag[0].filename}`;
      }
      
      // Gérer l'image du speaker
      if (req.files.image && req.files.image.length > 0) {
        speakerData.speakerImageUrl = `/uploads/speakers/${req.files.image[0].filename}`;
      }
    }
    
    // Afficher le speakerData pour déboguer
    console.log("Speaker data to save:", speakerData);
    
    const speaker = new Speaker(speakerData);
    await speaker.save();
    
    res.status(201).json(speaker);
  } catch (err) {
    console.error("Error saving speaker:", err);
    res.status(400).json({ error: err.message });
  }
};

// Récupérer tous les intervenants
const getSpeakers = async (req, res) => {
  try {
    const speakers = await Speaker.find();
    res.status(200).json(speakers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer un intervenant par ID
const getSpeakerById = async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    
    if (!speaker) {
      return res.status(404).json({ error: 'Speaker not found' });
    }
    
    res.status(200).json(speaker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer l'image du drapeau d'un intervenant
const getSpeakerFlagImage = async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id, {
      'flagImage.data': 0, 
      'speakerImage.data': 0
    });
    
    if (!speaker || !speaker.flagImage || !speaker.flagImage.data) {
      return res.status(404).json({ error: 'Flag image not found' });
    }
    
    res.set('Content-Type', speaker.flagImage.contentType);
    res.send(speaker.flagImage.data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer l'image du speaker
const getSpeakerImage = async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id, {
      'speakerImage.data': 0
    });
    
    if (!speaker || !speaker.speakerImage || !speaker.speakerImage.data) {
      return res.status(404).json({ error: 'Speaker image not found' });
    }
    
    res.set('Content-Type', speaker.speakerImage.contentType);
    res.send(speaker.speakerImage.data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mettre à jour un intervenant
const updateSpeaker = async (req, res) => {
  try {
    const speakerData = { ...req.body };
    const oldSpeaker = await Speaker.findById(req.params.id);
    
    if (!oldSpeaker) {
      return res.status(404).json({ error: 'Speaker not found' });
    }
    
    // Si imageFlag est une URL externe (comme Imgur), la conserver
    if (speakerData.imageFlag && speakerData.imageFlag.startsWith('http')) {
      speakerData.externalImageFlag = speakerData.imageFlag;
      delete speakerData.imageFlag; // Pour éviter la confusion
    }
    
    // Si des fichiers ont été uploadés
    if (req.files) {
      // Gérer le drapeau (imageFlag)
      if (req.files.imageFlag && req.files.imageFlag.length > 0) {
        // Supprimer l'ancien fichier de drapeau s'il existe
        if (oldSpeaker.flagUrl) {
          const oldFlagPath = path.join(__dirname, '..', oldSpeaker.flagUrl);
          if (fs.existsSync(oldFlagPath)) {
            fs.unlinkSync(oldFlagPath);
          }
        }
        
        speakerData.flagUrl = `/uploads/flags/${req.files.imageFlag[0].filename}`;
      }
      
      // Gérer l'image du speaker
      if (req.files.image && req.files.image.length > 0) {
        // Supprimer l'ancienne image s'il existe
        if (oldSpeaker.speakerImageUrl) {
          const oldImagePath = path.join(__dirname, '..', oldSpeaker.speakerImageUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        speakerData.speakerImageUrl = `/uploads/speakers/${req.files.image[0].filename}`;
      }
    }
    
    // Afficher le speakerData pour déboguer
    console.log("Speaker data to update:", speakerData);
    
    const speaker = await Speaker.findByIdAndUpdate(
      req.params.id,
      speakerData,
      { new: true, runValidators: true }
    );
    
    if (!speaker) {
      return res.status(404).json({ error: 'Speaker not found' });
    }
    
    res.status(200).json(speaker);
  } catch (err) {
    console.error("Error updating speaker:", err);
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un intervenant
const deleteSpeaker = async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    
    if (!speaker) {
      return res.status(404).json({ error: 'Speaker not found' });
    }
    
    // Supprimer le fichier de drapeau si existant
    if (speaker.flagUrl) {
      const flagPath = path.join(__dirname, '..', speaker.flagUrl);
      if (fs.existsSync(flagPath)) {
        fs.unlinkSync(flagPath);
      }
    }
    
    // Supprimer l'image du speaker si existante
    if (speaker.speakerImageUrl) {
      const imagePath = path.join(__dirname, '..', speaker.speakerImageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Speaker.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Speaker deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addSpeaker,
  getSpeakers,
  getSpeakerById,
  getSpeakerFlagImage,
  getSpeakerImage,
  updateSpeaker,
  deleteSpeaker
}; 