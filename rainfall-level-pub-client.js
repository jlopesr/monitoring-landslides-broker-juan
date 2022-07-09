var mqtt = require('mqtt');
require('dotenv').config();
//ws://localhost:1883
//ws://monitoring-landslides-broker.herokuapp.com
var topic = 'rainfallLevelData';
var deviceId = '62c7bcf68bc998424078d5fd';
var username = process.env.BROKER_USER_NAME;
var password = process.env.BROKER_PASSWORD;
var client = mqtt.connect('ws://monitoring-landslides-broker.herokuapp.com', {username, password});

client.on('connect', () => {
    console.log('Connected to broker!')
    setInterval(() => {
        var message = {
            deviceId: deviceId,
            value: getRandomInt(0, 300)
            // t1: getRandomInt(0, 35),
            // t2: getRandomInt(0, 35),
            // t3: getRandomInt(0, 35),
            // t4: getRandomInt(0, 35),
            // t5: getRandomInt(0, 35),
            // t6: getRandomInt(0, 35),
            // t7: getRandomInt(0, 35),
            // t8: getRandomInt(0, 35),
            // t9: getRandomInt(0, 35)
        }
        client.publish(topic, JSON.stringify(message));
        console.log('===================message sent!===================');
        console.log(message);
    }, 5000);
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}