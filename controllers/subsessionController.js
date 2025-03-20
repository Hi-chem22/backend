const { Subsession, Session, Speaker } = require('../models');

// Ajouter une nouvelle sous-session
const addSubsession = async (req, res) => {
  try {
    const subsessionData = { ...req.body };
    
    // Vérifier si la session parente existe
    if (req.body.sessionId) {
      const session = await Session.findById(req.body.sessionId);
      if (!session) {
        return res.status(400).json({ error: 'Session parente non trouvée' });
      }
    }
    
    // Vérifier si les orateurs existent
    if (req.body.speakers && req.body.speakers.length > 0) {
      const speakersCount = await Speaker.countDocuments({
        _id: { $in: req.body.speakers }
      });
      
      if (speakersCount !== req.body.speakers.length) {
        return res.status(400).json({ error: 'Un ou plusieurs orateurs n\'existent pas' });
      }
    }
    
    const subsession = new Subsession(subsessionData);
    await subsession.save();
    
    // Si la sous-session est associée à une session, ajouter la référence à la session
    if (req.body.sessionId) {
      await Session.findByIdAndUpdate(
        req.body.sessionId,
        { $push: { subsessions: subsession._id } }
      );
    }
    
    // Retourner la sous-session avec les orateurs
    const populatedSubsession = await Subsession.findById(subsession._id)
      .populate('speakers')
      .populate('sessionId')
      .populate({
        path: 'subsubsessions.speakers',
        model: 'Speaker'
      });
    
    res.status(201).json(populatedSubsession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les sous-sessions
const getSubsessions = async (req, res) => {
  try {
    const subsessions = await Subsession.find()
      .populate('speakers')
      .populate('sessionId')
      .populate({
        path: 'subsubsessions.speakers',
        model: 'Speaker'
      });
    
    res.status(200).json(subsessions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer une sous-session par ID
const getSubsessionById = async (req, res) => {
  try {
    const subsession = await Subsession.findById(req.params.id)
      .populate('speakers')
      .populate('sessionId')
      .populate({
        path: 'subsubsessions.speakers',
        model: 'Speaker'
      });
    
    if (!subsession) {
      return res.status(404).json({ error: 'Sous-session non trouvée' });
    }
    
    res.status(200).json(subsession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer les sous-sessions par session
const getSubsessionsBySession = async (req, res) => {
  try {
    const subsessions = await Subsession.find({ sessionId: req.params.sessionId })
      .populate('speakers')
      .populate('sessionId')
      .populate({
        path: 'subsubsessions.speakers',
        model: 'Speaker'
      });
    
    res.status(200).json(subsessions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mettre à jour une sous-session
const updateSubsession = async (req, res) => {
  try {
    const subsessionData = { ...req.body };
    
    // Vérifier si les orateurs existent
    if (req.body.speakers && req.body.speakers.length > 0) {
      const speakersCount = await Speaker.countDocuments({
        _id: { $in: req.body.speakers }
      });
      
      if (speakersCount !== req.body.speakers.length) {
        return res.status(400).json({ error: 'Un ou plusieurs orateurs n\'existent pas' });
      }
    }
    
    // Vérifier si la session parente a changé
    if (req.body.sessionId) {
      const oldSubsession = await Subsession.findById(req.params.id);
      
      // Si la session parente a changé, mettre à jour les références
      if (oldSubsession && oldSubsession.sessionId && 
          oldSubsession.sessionId.toString() !== req.body.sessionId.toString()) {
        
        // Supprimer la référence de l'ancienne session
        await Session.findByIdAndUpdate(
          oldSubsession.sessionId,
          { $pull: { subsessions: req.params.id } }
        );
        
        // Ajouter la référence à la nouvelle session
        await Session.findByIdAndUpdate(
          req.body.sessionId,
          { $push: { subsessions: req.params.id } }
        );
      }
      // Si pas de session parente avant, ajouter la référence
      else if (oldSubsession && !oldSubsession.sessionId) {
        await Session.findByIdAndUpdate(
          req.body.sessionId,
          { $push: { subsessions: req.params.id } }
        );
      }
    }
    
    const subsession = await Subsession.findByIdAndUpdate(
      req.params.id,
      subsessionData,
      { new: true, runValidators: true }
    )
      .populate('speakers')
      .populate('sessionId')
      .populate({
        path: 'subsubsessions.speakers',
        model: 'Speaker'
      });
    
    if (!subsession) {
      return res.status(404).json({ error: 'Sous-session non trouvée' });
    }
    
    res.status(200).json(subsession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer une sous-session
const deleteSubsession = async (req, res) => {
  try {
    const subsession = await Subsession.findById(req.params.id);
    
    if (!subsession) {
      return res.status(404).json({ error: 'Sous-session non trouvée' });
    }
    
    // Supprimer la référence de la session parente
    if (subsession.sessionId) {
      await Session.findByIdAndUpdate(
        subsession.sessionId,
        { $pull: { subsessions: req.params.id } }
      );
    }
    
    await Subsession.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Sous-session supprimée avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ajouter une sous-sous-session
const addSubsubsession = async (req, res) => {
  try {
    // Vérifier si les orateurs existent
    if (req.body.speakers && req.body.speakers.length > 0) {
      const speakersCount = await Speaker.countDocuments({
        _id: { $in: req.body.speakers }
      });
      
      if (speakersCount !== req.body.speakers.length) {
        return res.status(400).json({ error: 'Un ou plusieurs orateurs n\'existent pas' });
      }
    }
    
    const subsession = await Subsession.findByIdAndUpdate(
      req.params.subsessionId,
      { $push: { subsubsessions: req.body } },
      { new: true, runValidators: true }
    )
      .populate('speakers')
      .populate('sessionId')
      .populate({
        path: 'subsubsessions.speakers',
        model: 'Speaker'
      });
    
    if (!subsession) {
      return res.status(404).json({ error: 'Sous-session non trouvée' });
    }
    
    res.status(201).json(subsession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addSubsession,
  getSubsessions,
  getSubsessionById,
  getSubsessionsBySession,
  updateSubsession,
  deleteSubsession,
  addSubsubsession
}; 