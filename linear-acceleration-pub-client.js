var mqtt = require('mqtt');
require('dotenv').config();
const measurementTypes = require('./entities/measurementTypes');
//ws://localhost:1883
//ws://monitoring-landslides-broker.herokuapp.com
var topic = measurementTypes.LINEAR_ACCELERATION;
var deviceId = '6314fff6cb6d7893342eb1cd';
var username = process.env.BROKER_USER_NAME;
var password = process.env.BROKER_PASSWORD;
var client = mqtt.connect('ws://monitoring-landslides-broker.herokuapp.com', {username, password});
let isSetIntervalRunning = false;

client.on('connect', () => {
    console.log('Connected to broker!')
    if (!isSetIntervalRunning) {
        isSetIntervalRunning = true;
        setInterval(() => {
            var message = {
                deviceId: deviceId,
                acelX: getRandomInt(-20, 20),
                acelY: getRandomInt(-20, 20),
                acelZ: getRandomInt(-20, 20)
            }
            client.publish(topic, JSON.stringify(message));
            console.log('===================message sent!===================');
            console.log(message);
        }, 10000);
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
