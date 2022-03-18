const mongoose = require('mongoose');

const Vibration = mongoose.model('Vibrations', {
    acelX: Number,
    acelY: Number,
    acelZ: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = Vibration;