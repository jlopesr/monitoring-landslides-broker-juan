const mongoose = require('mongoose');

const LinearAcceleration = mongoose.model('LinearAcceleration', {
    acelX: Number,
    acelY: Number,
    acelZ: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = LinearAcceleration;