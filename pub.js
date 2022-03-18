var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var topic = 'vibrationData';
var message = '6233d19e5a995b97fd288d08,7.85,3.69,2.01';

client.on('connect', () => {
    setInterval(() => {
        client.publish(topic,message);
        console.log('message sent!', message);
    }, 10000);
});