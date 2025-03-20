const express = require('express');
const router = express.Router();
const { 
  addSession, 
  getSessions, 
  getSessionById, 
  getSessionsByDayAndRoom,
  updateSession, 
  deleteSession,
  updateSessionChairpersons
} = require('../controllers/sessionController');

// Routes pour les sessions
router.post('/', addSession);
router.get('/', getSessions);
router.get('/byDayAndRoom', getSessionsByDayAndRoom);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);
router.put('/:id/chairpersons', updateSessionChairpersons);

module.exports = router; 