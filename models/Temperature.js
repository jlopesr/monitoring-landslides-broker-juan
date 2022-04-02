const mongoose = require('mongoose');

const Temperature = mongoose.model('Temperature', {
    t0: Number,
    t1: Number,
    t2: Number,
    t3: Number,
    t4: Number,
    t5: Number,
    t6: Number,
    t7: Number,
    t8: Number,
    t9: Number,
    deviceId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = Temperature;