var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var topic = 'temperatureData';
var deviceId = '6233d19e5a995b97fd288d08';

client.on('connect', () => {
    setInterval(() => {
        var message = {
            deviceId: deviceId,
            t0: getRandomInt(0, 35),
            t1: getRandomInt(0, 35),
            t2: getRandomInt(0, 35),
            t3: getRandomInt(0, 35),
            t4: getRandomInt(0, 35),
            t5: getRandomInt(0, 35),
            t6: getRandomInt(0, 35),
            t7: getRandomInt(0, 35),
            t8: getRandomInt(0, 35),
            t9: getRandomInt(0, 35)
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