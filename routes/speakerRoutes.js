const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  addSpeaker, 
  getSpeakers, 
  getSpeakerById,
  updateSpeaker, 
  deleteSpeaker 
} = require('../controllers/speakerController');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Déterminer le dossier de destination en fonction du type de fichier
    const dest = file.fieldname === 'imageFlag' 
      ? path.join(__dirname, '../uploads/flags')
      : path.join(__dirname, '../uploads/speakers');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'imageFlag' ? 'flag-' : 'speaker-';
    cb(null, prefix + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accepter uniquement les images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Middleware pour uploader plusieurs types de fichiers
const uploadFields = upload.fields([
  { name: 'imageFlag', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// Routes pour les intervenants
router.post('/', (req, res, next) => {
  // Check if the request is a URL-based request
  if ((req.body.flagUrl || req.body.speakerImageUrl) && 
      !req.is('multipart/form-data')) {
    // If URLs are provided and it's not multipart/form-data, skip multer
    addSpeaker(req, res);
  } else {
    // Otherwise, use multer for file uploads
    uploadFields(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      addSpeaker(req, res);
    });
  }
});
router.get('/', getSpeakers);
router.get('/:id', getSpeakerById);
router.put('/:id', uploadFields, updateSpeaker);
router.delete('/:id', deleteSpeaker);

module.exports = router; 