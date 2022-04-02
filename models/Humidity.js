const mongoose = require('mongoose');

const Humidity = mongoose.model('Humidity', {
    h0: Number,
    h1: Number,
    h2: Number,
    h3: Number,
    h4: Number,
    h5: Number,
    h6: Number,
    h7: Number,
    h8: Number,
    h9: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = Humidity;