var mqtt = require('mqtt');
require('dotenv').config();
//ws://localhost:1883
//ws://monitoring-landslides-broker.herokuapp.com
var topic = 'temperatureData';
var deviceId = '62c97c514f13775e9ce6e6e5';
var username = process.env.BROKER_USER_NAME;
var password = process.env.BROKER_PASSWORD;
var client = mqtt.connect('ws://monitoring-landslides-broker.herokuapp.com', {username, password});

client.on('connect', () => {
    console.log('Connected to broker!')
    setInterval(() => {
        var message = {
            deviceId: deviceId,
            temperature: getRandomInt(0, 35)
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