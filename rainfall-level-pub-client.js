var mqtt = require('mqtt');
require('dotenv').config();
const measurementTypes = require('./entities/measurementTypes');
//ws://localhost:1883
//ws://monitoring-landslides-broker.herokuapp.com
var topic = measurementTypes.RAINFALL_LEVEL;
var deviceId = '6314fff6cb6d7893342eb1cd';
var username = process.env.BROKER_USER_NAME;
var password = process.env.BROKER_PASSWORD;
var client = mqtt.connect('ws://monitoring-landslides-broker.herokuapp.com', {username, password});

client.on('connect', () => {
    console.log('Connected to broker!')
    setInterval(() => {
        var message = {
            deviceId: deviceId,
            rainfallLevel: getRandomInt(0, 300)
        }
        client.publish(topic, JSON.stringify(message));
        console.log('===================message sent!===================');
        console.log(message);
    }, 10000);
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}