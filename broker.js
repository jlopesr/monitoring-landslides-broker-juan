const mongoose = require('mongoose');
const mosca = require('mosca');
require('dotenv').config();

const settings = {port: 1883};
var broker = new mosca.Server(settings);

broker.on('ready', () => {
    console.log('Mosca server is up and running');
});

