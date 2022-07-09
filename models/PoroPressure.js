const mongoose = require('mongoose');

const PorePressure = mongoose.model('PorePressure', {
    value: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = PorePressure;