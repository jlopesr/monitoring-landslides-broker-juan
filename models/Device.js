const mongoose = require('mongoose');

const Device = mongoose.model('Devices', {
    name: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = Device;