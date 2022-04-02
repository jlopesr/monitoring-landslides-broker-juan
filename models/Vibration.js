const mongoose = require('mongoose');

const Vibration = mongoose.model('Vibration', {
    acelX: Number,
    acelY: Number,
    acelZ: Number,
    alphaX: Number,
    alphaY: Number,
    alphaZ: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = Vibration;