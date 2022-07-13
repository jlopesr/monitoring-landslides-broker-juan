const mongoose = require('mongoose');
const aedes = require("aedes")();
const httpServer = require("http").createServer();
const ws = require("websocket-stream");
require('dotenv').config();
const LinearAcceleration = require('./models/LinearAcceleration');
const AngularAcceleration = require('./models/AngularAcceleration');
const Humidity = require('./models/Humidity');
const Temperature = require('./models/Temperature');
const RainfallLevel = require('./models/RainfallLevel');
const PoroPressure = require('./models/PoroPressure');
const Device = require('./models/Device');

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const PORT = process.env.PORT;
const BROKER_USER_NAME = process.env.BROKER_USER_NAME;
const BROKER_PASSWORD = process.env.BROKER_PASSWORD;
let isMongoConnected = false;

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@field-data-cluster.xz66x.mongodb.net/fieldData?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Connected to Mongodb!');
        isMongoConnected = true;
    })
    .catch((error) => {console.log(error);});

ws.createServer({ server: httpServer }, aedes.handle);

httpServer.listen(PORT, () => {
    console.log("Broker websocket server listening on port ", PORT);
});

aedes.authenticate = (client, username, password, callback) => {
    const receivedPassword = Buffer.from(password, 'base64').toString();
    if ((username === BROKER_USER_NAME) && (receivedPassword === BROKER_PASSWORD)) {
        return callback(null, true);
    } else {
        const error = new Error('Authentication Failed!! Please enter the correct credentials.');
        console.log('Authentication failed for Client ID: ' + client.id);
        return callback(error, false);
    }
}

aedes.on('client', function(client) {
    console.log('Client connected! id: ' + client.id);
});

aedes.on('clientDisconnect', function (client) {
    console.log('client disconnected! id: ' + client.id);

});

aedes.on('publish', function(packet, client) {
    const packetTopic = packet.topic.toString();
    if(packetTopic == 'linearAccelerationData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveLinearAccelerationData(packetData);
    }
    else if (packetTopic == 'angularAccelerationData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveAngularAccelerationData(packetData);
    } 
    else if (packetTopic == 'humidityData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveHumidityData(packetData);
    }
    else if (packetTopic == 'temperatureData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveTemperatureData(packetData);
    }
    else if (packetTopic == 'rainfallLevelData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveRainfallLevelData(packetData);
    }
    else if (packetTopic == 'poroPressureData') {
        var packetData = JSON.parse(packet.payload.toString());
        savePoroPressureData(packetData);
    }
});

async function fixMeasuredValue(value, deviceId, measurementType) {
    const device = await Device.findOne({
        _id: deviceId, 
        isActive: true, 
        measuredDataTypes: {
            $elemMatch: {
                measurementType: measurementType
            }
        }
    }, {"measuredDataTypes.$": 1});
    if (device) {
        const sensorGain = device.measuredDataTypes[0].gain;
        const sensorOffset = device.measuredDataTypes[0].offSet;
        const fixedValue = (value - sensorOffset)/sensorGain;
        return Math.round(fixedValue * 100) / 100;
    }
    else {
        return null;
    }
}

async function fixMeasuredValues(values, deviceId, measurementType) {
    const device = await Device.findOne({
        _id: deviceId, 
        isActive: true, 
        measuredDataTypes: {
            $elemMatch: {
                measurementType: measurementType
            }
        }
    }, {"measuredDataTypes.$": 1});
    if (device) {
        const sensorGain = device.measuredDataTypes[0].gain;
        const sensorOffset = device.measuredDataTypes[0].offSet;
        const fixedValueX = (values[0] - sensorOffset)/sensorGain;
        const fixedValueY = (values[1]  - sensorOffset)/sensorGain;
        const fixedValueW = (values[2]  - sensorOffset)/sensorGain;
        return [Math.round(fixedValueX * 100) / 100, Math.round(fixedValueY * 100) / 100, Math.round(fixedValueW * 100) / 100];
    }
    else {
        return null;
    }
}

async function saveLinearAccelerationData(packetData) {
    const fixedMeasuredValues =  await fixMeasuredValues([packetData.acelX, packetData.acelY, packetData.acelZ], packetData.deviceId, 'Linear Acceleration');
    if (!fixedMeasuredValues) {
        return;
    }
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
    packetData.acelX = fixedMeasuredValues[0];
    packetData.acelY = fixedMeasuredValues[1];
    packetData.acelZ = fixedMeasuredValues[2];
    const vibration = Object.assign({}, packetData);
    try {
        await LinearAcceleration.create(vibration);
        console.log('====================Linear Acceleration Data saved in Mongo DB!====================');
        console.log(vibration);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveAngularAccelerationData(packetData) {
    const fixedMeasuredValues =  await fixMeasuredValues([packetData.alphaX, packetData.alphaY, packetData.alphaZ], packetData.deviceId, 'Angular Acceleration');
    if (!fixedMeasuredValues) {
        return;
    }
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
    packetData.alphaX = fixedMeasuredValues[0];
    packetData.alphaY = fixedMeasuredValues[1];
    packetData.alphaZ = fixedMeasuredValues[2];
    const vibration = Object.assign({}, packetData);
    try {
        await AngularAcceleration.create(vibration);
        console.log('====================Angular Acceleration Data saved in Mongo DB!====================');
        console.log(vibration);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveHumidityData(packetData) {
    const fixedMeasuredValue =  await fixMeasuredValue(packetData.value, packetData.deviceId, 'Humidity');
    if (!fixedMeasuredValue) {
        return;
    }
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
    packetData.value = fixedMeasuredValue;
    const humidity = Object.assign({}, packetData);
    try {
        await Humidity.create(humidity);
        console.log('====================Humidity Data saved in Mongo DB!====================');
        console.log(humidity);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveTemperatureData(packetData) {
    const fixedMeasuredValue =  await fixMeasuredValue(packetData.value, packetData.deviceId, 'Temperature');
    if (!fixedMeasuredValue) {
        return;
    }
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
    packetData.value = fixedMeasuredValue;
    const temperature = Object.assign({}, packetData);
    try {
        await Temperature.create(temperature);
        console.log('====================Temperature Data saved in Mongo DB!====================');
        console.log(temperature);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveRainfallLevelData(packetData) {
    const fixedMeasuredValue =  await fixMeasuredValue(packetData.value, packetData.deviceId, 'Rainfall Level');
    if (!fixedMeasuredValue) {
        return;
    }
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
    packetData.value = fixedMeasuredValue;
    const rainfallLevel = Object.assign({}, packetData);
    try {
        await RainfallLevel.create(rainfallLevel);
        console.log('====================Rainfall level Data saved in Mongo DB!====================');
        console.log(rainfallLevel);
    }
    catch (error) {
        console.log(error);
    }
}

async function savePoroPressureData(packetData) {
    const fixedMeasuredValue =  await fixMeasuredValue(packetData.value, packetData.deviceId, 'Pore Pressure');
    if (!fixedMeasuredValue) {
        return;
    }
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
    packetData.value = fixedMeasuredValue;
    const poroPressure = Object.assign({}, packetData);
    try {
        await PoroPressure.create(poroPressure);
        console.log('====================Poro pressure Data saved in Mongo DB!====================');
        console.log(poroPressure);
    }
    catch (error) {
        console.log(error);
    }
}



