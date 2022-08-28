var mqtt = require('mqtt');
require('dotenv').config();
//http://localhost:1883
//ws://monitoring-landslides-broker.herokuapp.com
var topic = 'humidityData';
var deviceId = '62c97c514f13775e9ce6e6e5';
var username = process.env.BROKER_USER_NAME;
var password = process.env.BROKER_PASSWORD;
var client = mqtt.connect('ws://monitoring-landslides-broker.herokuapp.com', {username, password});

client.on('connect', () => {
    setInterval(() => {
        var message = {
            deviceId: deviceId,
            humidity: getRandomInt(0, 100)
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