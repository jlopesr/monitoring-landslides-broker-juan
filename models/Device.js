const mongoose = require('mongoose');

const Device = mongoose.model('Devices', {
    name: String,
    latitude: Number,
    longiude: Number,
    isActive: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = Device;