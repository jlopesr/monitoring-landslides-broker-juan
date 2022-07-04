const mongoose = require('mongoose');
const aedes = require("aedes")();
const httpServer = require("http").createServer();
const ws = require("websocket-stream");
require('dotenv').config();
const Vibration = require('./models/Vibration');
const Humidity = require('./models/Humidity');
const Temperature = require('./models/Temperature');
const Device = require('./models/Device');

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const PORT = process.env.PORT;
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

aedes.on('client', function(client) {
    console.log('Client connected! id: ' + client.id);
});

aedes.on('clientDisconnect', function (client) {
    console.log('client disconnected! id: ' + client.id);

});

aedes.on('publish', function(packet, client) {
    const packetTopic = packet.topic.toString();
    if(isMongoConnected && packetTopic == 'vibrationData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveVibrationData(packetData);
    }
    else if (isMongoConnected && packetTopic == 'humidityData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveHumidityData(packetData);
    }
    else if (isMongoConnected && packetTopic == 'temperatureData') {
        var packetData = JSON.parse(packet.payload.toString());
        saveTemperatureData(packetData);
    }
});

async function isDeviceWorking(deviceId) {
    const device = await Device.findOne({_id: deviceId, isActive: true});
    if (device) {
        return true;
    }
    else {
        return false;
    }
}

async function saveVibrationData(packetData) {
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
    const vibration = Object.assign({}, packetData);
    try {
        await Vibration.create(vibration);
        console.log('====================Vibration Data saved in Mongo DB!====================');
        console.log(vibration);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveHumidityData(packetData) {
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
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
    packetData.deviceId = mongoose.Types.ObjectId(packetData.deviceId);
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



