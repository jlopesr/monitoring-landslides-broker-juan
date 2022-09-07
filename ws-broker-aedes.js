const mongoose = require('mongoose');
const aedes = require("aedes")();
const httpServer = require("http").createServer();
const ws = require("websocket-stream");
require('dotenv').config();
const Device = require('./models/Device');
const IotData = require('./models/IotData');
const measurementTypes = require('./entities/measurementTypes');
const Math = require('mathjs')

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const PORT = process.env.PORT;
const BROKER_USER_NAME = process.env.BROKER_USER_NAME;
const BROKER_PASSWORD = process.env.BROKER_PASSWORD;
let isMongoConnected = false;

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@field-data-cluster.xz66x.mongodb.net/fieldData?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Connected to Mongodb!');
        isMongoConnected = true;
    })
    .catch((error) => {console.log(error);});

ws.createServer({ server: httpServer }, aedes.handle);

httpServer.listen(PORT, () => {
    console.log("Broker websocket server listening on port ", PORT);
});

aedes.authenticate = (client, username, password, callback) => {
    const receivedPassword = Buffer.from(password, 'base64').toString();
    if ((username === BROKER_USER_NAME) && (receivedPassword === BROKER_PASSWORD)) {
        return callback(null, true);
    } else {
        const error = new Error('Authentication Failed!! Please enter the correct credentials.');
        console.log('Authentication failed for Client ID: ' + client.id);
        return callback(error, false);
    }
}

aedes.on('client', function(client) {
    console.log('Client connected! id: ' + client.id);
});

aedes.on('clientDisconnect', function (client) {
    console.log('client disconnected! id: ' + client.id);

});

aedes.on('publish', function(packet, client) {
    const packetTopic = packet.topic.toString();
    if(packetTopic == measurementTypes.LINEAR_ACCELERATION) {
        var packetData = JSON.parse(packet.payload.toString());
        saveLinearAccelerationData(packetData);
    }
    else if (packetTopic == measurementTypes.ANGULAR_VELOCITY) {
        var packetData = JSON.parse(packet.payload.toString());
        saveAngularVelocityData(packetData);
    } 
    else if (packetTopic == measurementTypes.HUMIDITY) {
        var packetData = JSON.parse(packet.payload.toString());
        saveHumidityData(packetData);
    }
    else if (packetTopic == measurementTypes.TEMPERATURE) {
        var packetData = JSON.parse(packet.payload.toString());
        saveTemperatureData(packetData);
    }
    else if (packetTopic == measurementTypes.RAINFALL_LEVEL) {
        var packetData = JSON.parse(packet.payload.toString());
        saveRainfallLevelData(packetData);
    }
    else if (packetTopic == measurementTypes.PRESSURE) {
        var packetData = JSON.parse(packet.payload.toString());
        savePressureData(packetData);
    }
});

async function fixMeasuredValue(value, deviceId, measurementType) {
    const device = await Device.findOne({
        _id: deviceId, 
        isActive: true, 
        measuredDataTypes: {
            $elemMatch: {
                measurementType: measurementType
            }
        }
    }, {"measuredDataTypes.$": 1});
    if (device) {
        try {
            const parser = Math.parser()
            let fixedValue = 0;
            const calibrationCurve = device.measuredDataTypes[0].calibrationCurve;
            if (calibrationCurve) {
                parser.evaluate(calibrationCurve); 
                fixedValue = parser.evaluate(`f(${value})`); 
            }
            else {
                fixedValue = value;
            }
            const fixedMeasuredValue = Math.round(fixedValue * 100) / 100;
            const measurementTypeId = device.measuredDataTypes[0].measurementTypeId;
            return {measurementTypeId, fixedMeasuredValue};
        }
        catch (error) {
            console.log(`Error when calculating device ${deviceId} calibration curve`);
            return null;
        } 
    }
    else {
        return null;
    }
}

async function fixMeasuredValues(values, deviceId, measurementType) {
    const device = await Device.findOne({
        _id: deviceId, 
        isActive: true, 
        measuredDataTypes: {
            $elemMatch: {
                measurementType: measurementType
            }
        }
    });
    if (device) {
        try {
            const fixedMeasuredValues = [];
            const parser = Math.parser()
            const filteredMeasurementTypes = device.measuredDataTypes.filter(obj => obj.measurementType === measurementType);
            filteredMeasurementTypes.forEach((measuredDataType, index) => {
                const calibrationCurve = measuredDataType.calibrationCurve;
                if (calibrationCurve) {
                    parser.evaluate(calibrationCurve); 
                    const fixedValue = parser.evaluate(`f(${values[index]})`); 
                    fixedMeasuredValues.push(Math.round(fixedValue * 100) / 100);
                }
                else {
                    fixedMeasuredValues.push(Math.round(values[index] * 100) / 100);
                }
            });
            const measurementTypeId = filteredMeasurementTypes[0].measurementTypeId;
            return {measurementTypeId, fixedMeasuredValues};
        }
        catch (error) {
            console.log(`Error when calculating device ${deviceId} calibration curve`);
            return null;
        } 
    }
    else {
        return null;
    }
}

async function saveLinearAccelerationData(packetData) {
    const fixedData =  await fixMeasuredValues([packetData.acelX, packetData.acelY, packetData.acelZ], packetData.deviceId, measurementTypes.LINEAR_ACCELERATION);
    if (!fixedData) {
        return;
    }
    const vibration = {
        deviceId: mongoose.Types.ObjectId(packetData.deviceId),
        measurementTypeId: mongoose.Types.ObjectId(fixedData.measurementTypeId),
        value: {
            acelX: fixedData.fixedMeasuredValues[0],
            acelY: fixedData.fixedMeasuredValues[1],
            acelZ: fixedData.fixedMeasuredValues[2]
        }
    };
    try {
        await IotData.create(vibration);
        console.log('====================Linear Acceleration Data saved in Mongo DB!====================');
        console.log(vibration);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveAngularVelocityData(packetData) {
    const fixedData =  await fixMeasuredValues([packetData.wX, packetData.wY, packetData.wZ], packetData.deviceId, measurementTypes.ANGULAR_VELOCITY);
    if (!fixedData) {
        return;
    }
    const vibration = {
        deviceId: mongoose.Types.ObjectId(packetData.deviceId),
        measurementTypeId: mongoose.Types.ObjectId(fixedData.measurementTypeId),
        value: {
            wX: fixedData.fixedMeasuredValues[0],
            wY: fixedData.fixedMeasuredValues[1],
            wZ: fixedData.fixedMeasuredValues[2]
        }
    };
    try {
        await IotData.create(vibration);
        console.log('====================Angular Velocity Data saved in Mongo DB!====================');
        console.log(vibration);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveHumidityData(packetData) {
    const fixedData =  await fixMeasuredValue(packetData.humidity, packetData.deviceId, measurementTypes.HUMIDITY);
    if (!fixedData) {
        return;
    }
    const humidity = {
        deviceId: mongoose.Types.ObjectId(packetData.deviceId),
        measurementTypeId: mongoose.Types.ObjectId(fixedData.measurementTypeId),
        value: {
            humidity: fixedData.fixedMeasuredValue
        }
    }
    try {
        await IotData.create(humidity);
        console.log('====================Humidity Data saved in Mongo DB!====================');
        console.log(humidity);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveTemperatureData(packetData) {
    const fixedData =  await fixMeasuredValue(packetData.temperature, packetData.deviceId, measurementTypes.TEMPERATURE);
    if (!fixedData) {
        return;
    }
    const temperature = {
        deviceId: mongoose.Types.ObjectId(packetData.deviceId),
        measurementTypeId: mongoose.Types.ObjectId(fixedData.measurementTypeId),
        value: {
            temperature: fixedData.fixedMeasuredValue
        }
    }
    try {
        await IotData.create(temperature);
        console.log('====================Temperature Data saved in Mongo DB!====================');
        console.log(temperature);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveRainfallLevelData(packetData) {
    const fixedData =  await fixMeasuredValue(packetData.rainfallLevel, packetData.deviceId, measurementTypes.RAINFALL_LEVEL);
    if (!fixedData) {
        return;
    }
    const rainfallLevel = {
        deviceId: mongoose.Types.ObjectId(packetData.deviceId),
        measurementTypeId: mongoose.Types.ObjectId(fixedData.measurementTypeId),
        value: {
            rainfallLevel: fixedData.fixedMeasuredValue
        }
    }
    try {
        await IotData.create(rainfallLevel);
        console.log('====================Rainfall level Data saved in Mongo DB!====================');
        console.log(rainfallLevel);
    }
    catch (error) {
        console.log(error);
    }
}

async function savePressureData(packetData) {
    const fixedData =  await fixMeasuredValue(packetData.poroPressure, packetData.deviceId, measurementTypes.PRESSURE);
    if (!fixedData) {
        return;
    }
    const poroPressure = {
        deviceId: mongoose.Types.ObjectId(packetData.deviceId),
        measurementTypeId: mongoose.Types.ObjectId(fixedData.measurementTypeId),
        value: {
            pressure: fixedData.fixedMeasuredValue
        }
    }
    try {
        await IotData.create(poroPressure);
        console.log('====================Pressure Data saved in Mongo DB!====================');
        console.log(poroPressure);
    }
    catch (error) {
        console.log(error);
    }
}



