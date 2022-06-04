var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var topic = 'humidityData';
var deviceId = '628eccd5aa6849c399d00ee6';

client.on('connect', () => {
    setInterval(() => {
        var message = {
            deviceId: deviceId,
            h0: getRandomInt(0, 100),
            h1: getRandomInt(0, 100),
            h2: getRandomInt(0, 100),
            h3: getRandomInt(0, 100),
            h4: getRandomInt(0, 100),
            h5: getRandomInt(0, 100),
            h6: getRandomInt(0, 100),
            h7: getRandomInt(0, 100),
            h8: getRandomInt(0, 100),
            h9: getRandomInt(0, 100)
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