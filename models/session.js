const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  room: String,
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  day: Number,
  dayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Day'
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  description: String,
  speakers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Speaker' 
  }],
  subsessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subsession'
  }],
  chairpersons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chairperson'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session; 