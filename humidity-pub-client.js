var mqtt = require('mqtt');
require('dotenv').config();
const measurementTypes = require('./entities/measurementTypes');
//http://localhost:1883
//ws://monitoring-landslides-broker.herokuapp.com
var topic = measurementTypes.HUMIDITY;
var deviceId = '631680220c880dd427193473';
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
                humidity: getRandomInt(0, 100)
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