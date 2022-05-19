const mongoose = require('mongoose');

const Device = mongoose.model('Devices', {
    name: String,
    latitude: Number,
    longitude: Number,
    creatorUserId: mongoose.ObjectId,
    isActive: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = Device;