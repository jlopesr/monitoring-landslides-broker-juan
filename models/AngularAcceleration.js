const mongoose = require('mongoose');

const AngularAcceleration = mongoose.model('AngularAcceleration', {
    alphaX: Number,
    alphaY: Number,
    alphaZ: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = AngularAcceleration;