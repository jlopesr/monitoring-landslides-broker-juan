const mongoose = require('mongoose');
const { Schema } = mongoose;
const measuredDataType = new Schema({ measurementTypeId: mongoose.ObjectId, measurementType: String, unit: String });

const Device = mongoose.model('Devices', {
    name: String,
    latitude: Number,
    longitude: Number,
    creatorUserId: mongoose.ObjectId,
    measuredDataTypes: [measuredDataType],
    isActive: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = Device;