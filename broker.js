const mongoose = require('mongoose');
const mosca = require('mosca');
require('dotenv').config();
const Vibration = require('./models/Vibration');
const Humidity = require('./models/Humidity');
const Temperature = require('./models/Temperature');

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const settings = {port: 1883};
let isMongoConnected = false;

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@field-data-cluster.xz66x.mongodb.net/fieldData?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Connected to Mongodb!');
        isMongoConnected = true;
    })
    .catch((error) => {console.log(error);});

var broker = new mosca.Server(settings);

broker.on('ready', () => {
    console.log('Mosca server is up and running');
});

broker.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

broker.on('published', function(packet, client) {
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



