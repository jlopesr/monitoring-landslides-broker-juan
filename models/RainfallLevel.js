const mongoose = require('mongoose');

const RainfallLevel = mongoose.model('RainfallLevel', {
    value: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = RainfallLevel;