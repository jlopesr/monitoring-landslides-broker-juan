const mongoose = require('mongoose');
const mosca = require('mosca');
require('dotenv').config();
const Vibration = require('./models/Vibration');

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
        saveVibrationData(packetData, client.id);
    }
});


async function saveVibrationData(packetData, clientId) {
    client = {deviceId: mongoose.Types.ObjectId(clientId)};
    const vibration = Object.assign({}, client, packetData);
    //console.log(vibration);
    try {
        await Vibration.create(vibration);
        console.log('====================Data saved in Mongo DB!====================');
        console.log(vibration);
    }
    catch (error) {
        console.log(error);
    }
}



