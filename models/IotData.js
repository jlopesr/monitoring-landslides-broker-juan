const mongoose = require('mongoose');

const IotData = mongoose.model('IotData', {
    value: {},
    deviceId: mongoose.ObjectId,
    measurementTypeId: mongoose.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

module.exports = IotData;