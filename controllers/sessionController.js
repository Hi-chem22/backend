const { Session, Room, Day, Subsession, Chairperson } = require('../models');

// Ajouter une nouvelle session
const addSession = async (req, res) => {
  try {
    const sessionData = { ...req.body };
    
    // Si room est un ID, essayer de trouver la salle
    if (req.body.roomId) {
      const room = await Room.findById(req.body.roomId);
      if (!room) {
        return res.status(400).json({ error: 'Salle non trouvée' });
      }
      // Ne pas automatiquement ajouter le champ room
    }
    
    // Si dayId est fourni, essayer de trouver le jour
    if (req.body.dayId) {
      const day = await Day.findById(req.body.dayId);
      if (!day) {
        return res.status(400).json({ error: 'Jour non trouvé' });
      }
      // Ne pas automatiquement ajouter le champ day
    }
    
    // Vérifier les chairpersons
    if (req.body.chairpersons && req.body.chairpersons.length > 0) {
      const chairpersonsCount = await Chairperson.countDocuments({
        _id: { $in: req.body.chairpersons }
      });
      
      if (chairpersonsCount !== req.body.chairpersons.length) {
        return res.status(400).json({ error: 'Un ou plusieurs modérateurs n\'existent pas' });
      }
    }
    
    // Gérer les sous-sessions intégrées (cas de rétrocompatibilité)
    if (req.body.subsessionsData && Array.isArray(req.body.subsessionsData)) {
      // Supprimer les données de sous-sessions de l'objet session
      const subsessionsData = req.body.subsessionsData;
      delete sessionData.subsessionsData;
      
      // Créer la session d'abord (sans sous-sessions)
      const session = new Session(sessionData);
      await session.save();
      
      // Ajouter les sous-sessions et les lier à la session
      const subsessionPromises = subsessionsData.map(async (subsessionData) => {
        const newSubsession = new Subsession({
          ...subsessionData,
          sessionId: session._id
        });
        await newSubsession.save();
        return newSubsession._id;
      });
      
      const subsessionIds = await Promise.all(subsessionPromises);
      
      // Ajouter les références des sous-sessions à la session
      session.subsessions = subsessionIds;
      await session.save();
      
      // Récupérer la session complète avec toutes les données liées
      const populatedSession = await Session.findById(session._id)
        .populate('roomId')
        .populate('dayId')
        .populate('speakers')
        .populate('chairpersons')
        .populate({
          path: 'subsessions',
          populate: [
            { path: 'speakers' },
            { 
              path: 'subsubsessions.speakers',
              model: 'Speaker'
            }
          ]
        });
        
      return res.status(201).json(populatedSession);
    }
    else {
      // Cas normal, sans sous-sessions intégrées
      const session = new Session(sessionData);
      await session.save();
      
      // Retourner la session avec toutes les références peuplées
      const populatedSession = await Session.findById(session._id)
        .populate('roomId')
        .populate('dayId')
        .populate('speakers')
        .populate('chairpersons')
        .populate({
          path: 'subsessions',
          populate: { 
            path: 'speakers'
          }
        });
        
      return res.status(201).json(populatedSession);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('roomId')
      .populate('dayId')
      .populate('speakers')
      .populate('chairpersons')
      .populate({
        path: 'subsessions',
        populate: { 
          path: 'speakers'
        }
      });
    res.status(200).json(sessions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer une session par ID
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('roomId')
      .populate('dayId')
      .populate('speakers')
      .populate('chairpersons')
      .populate({
        path: 'subsessions',
        populate: [
          { path: 'speakers' },
          { 
            path: 'subsubsessions',
            populate: { path: 'speakers' }
          }
        ]
      });
      
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.status(200).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer les sessions par jour et par salle
const getSessionsByDayAndRoom = async (req, res) => {
  try {
    const { day, room, dayId, roomId } = req.query;
    
    const query = {};
    
    // Utiliser dayId en priorité s'il est fourni, sinon utiliser day
    if (dayId) {
      query.dayId = dayId;
    } else if (day) {
      query.day = parseInt(day);
    }
    
    // Utiliser roomId en priorité s'il est fourni, sinon utiliser room
    if (roomId) {
      query.roomId = roomId;
    } else if (room) {
      query.room = room;
    }
    
    const sessions = await Session.find(query)
      .populate('roomId')
      .populate('dayId')
      .populate('speakers')
      .populate('chairpersons')
      .populate({
        path: 'subsessions',
        populate: { 
          path: 'speakers'
        }
      });
      
    res.status(200).json(sessions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mettre à jour une session
const updateSession = async (req, res) => {
  try {
    const sessionData = { ...req.body };
    
    // Si roomId est fourni, essayer de trouver la salle
    if (req.body.roomId) {
      const room = await Room.findById(req.body.roomId);
      if (!room) {
        return res.status(400).json({ error: 'Salle non trouvée' });
      }
      // Ne pas automatiquement ajouter le champ room
    }
    
    // Si dayId est fourni, essayer de trouver le jour
    if (req.body.dayId) {
      const day = await Day.findById(req.body.dayId);
      if (!day) {
        return res.status(400).json({ error: 'Jour non trouvé' });
      }
      // Ne pas automatiquement ajouter le champ day
    }
    
    // Vérifier les chairpersons
    if (req.body.chairpersons && req.body.chairpersons.length > 0) {
      const chairpersonsCount = await Chairperson.countDocuments({
        _id: { $in: req.body.chairpersons }
      });
      
      if (chairpersonsCount !== req.body.chairpersons.length) {
        return res.status(400).json({ error: 'Un ou plusieurs modérateurs n\'existent pas' });
      }
    }
    
    // Gérer les sous-sessions intégrées (cas de rétrocompatibilité)
    if (req.body.subsessionsData && Array.isArray(req.body.subsessionsData)) {
      // Supprimer les données de sous-sessions de l'objet session
      const subsessionsData = req.body.subsessionsData;
      delete sessionData.subsessionsData;
      
      // Récupérer la session existante
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Supprimer les sous-sessions existantes
      if (session.subsessions && session.subsessions.length > 0) {
        await Subsession.deleteMany({ _id: { $in: session.subsessions } });
      }
      
      // Ajouter les nouvelles sous-sessions et les lier à la session
      const subsessionPromises = subsessionsData.map(async (subsessionData) => {
        const newSubsession = new Subsession({
          ...subsessionData,
          sessionId: session._id
        });
        await newSubsession.save();
        return newSubsession._id;
      });
      
      const subsessionIds = await Promise.all(subsessionPromises);
      
      // Mettre à jour la session avec les nouvelles données et références
      const updatedSession = await Session.findByIdAndUpdate(
        req.params.id,
        { ...sessionData, subsessions: subsessionIds },
        { new: true, runValidators: true }
      )
        .populate('roomId')
        .populate('dayId')
        .populate('speakers')
        .populate('chairpersons')
        .populate({
          path: 'subsessions',
          populate: [
            { path: 'speakers' },
            { 
              path: 'subsubsessions.speakers',
              model: 'Speaker'
            }
          ]
        });
        
      return res.status(200).json(updatedSession);
    }
    else {
      // Cas normal, sans sous-sessions intégrées
      const session = await Session.findByIdAndUpdate(
        req.params.id,
        sessionData,
        { new: true, runValidators: true }
      )
        .populate('roomId')
        .populate('dayId')
        .populate('speakers')
        .populate('chairpersons')
        .populate({
          path: 'subsessions',
          populate: { 
            path: 'speakers'
          }
        });
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.status(200).json(session);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer une session
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Supprimer les sous-sessions associées
    if (session.subsessions && session.subsessions.length > 0) {
      await Subsession.deleteMany({ _id: { $in: session.subsessions } });
    }
    
    await Session.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ajouter ou supprimer des modérateurs
const updateSessionChairpersons = async (req, res) => {
  try {
    const { id } = req.params;
    const { chairpersonIds } = req.body;

    // Vérifier si la session existe
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Vérifier si les modérateurs existent
    if (chairpersonIds && chairpersonIds.length > 0) {
      const chairpersonsCount = await Chairperson.countDocuments({
        _id: { $in: chairpersonIds }
      });
      
      if (chairpersonsCount !== chairpersonIds.length) {
        return res.status(400).json({ error: 'Un ou plusieurs modérateurs n\'existent pas' });
      }
    }

    // Mettre à jour les modérateurs de la session
    session.chairpersons = chairpersonIds || [];
    await session.save();

    // Retourner la session mise à jour
    const updatedSession = await Session.findById(id)
      .populate('roomId')
      .populate('dayId')
      .populate('speakers')
      .populate('chairpersons')
      .populate({
        path: 'subsessions',
        populate: { 
          path: 'speakers'
        }
      });

    res.status(200).json(updatedSession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addSession,
  getSessions,
  getSessionById,
  getSessionsByDayAndRoom,
  updateSession,
  deleteSession,
  updateSessionChairpersons
}; 