const mongoose = require('mongoose');

const Gateway = mongoose.model('Gateway', {
    name: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = Gateway;