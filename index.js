require('dotenv').config();
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const SensorData = require('./models/SensorData');
const RelayStatus = require('./models/RelayStatus');
const ErrorLog = require('./models/ErrorLog');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// MQTT Client Configuration
const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
});

client.on('connect', () => {
    console.log('MQTT client connected');
    // Subscribe to the sensor/data, relay/status and sensor/error topics
    client.subscribe([process.env.MQTT_TOPIC, 'relay/status', 'sensor/error'], (err) => {
        if (err) console.error('Subscription error:', err);
    });
});

client.on('message', (topic, message) => {
    // Handle messages based on the topic
    switch (topic) {
        case process.env.MQTT_TOPIC: // sensor/data
            handleSensorData(message);
            break;
        case 'relay/status':
            handleRelayStatus(message);
            break;
        case 'sensor/error':
            handleErrorLog(message);
            break;
        default:
            console.warn(`No handler for topic ${topic}`);
    }
});

client.on('error', (err) => {
    console.error('MQTT client error:', err);
    // Log MQTT client errors to MongoDB
    const errorLog = new ErrorLog({ error: `MQTT client error: ${err.message}` });
    errorLog.save()
        .then(() => console.log('MQTT client error logged to MongoDB'))
        .catch(err => console.error('MongoDB save error:', err));
});

function handleSensorData(message) {
    try {
        const data = JSON.parse(message.toString());
        const sensorData = new SensorData(data);
        sensorData.save()
            .then(() => console.log('Sensor data saved to MongoDB'))
            .catch(err => console.error('MongoDB save error:', err));
    } catch (err) {
        console.error('Message parsing error:', err);
        logError(err.message);
    }
}

function handleRelayStatus(message) {
    try {
        const data = JSON.parse(message.toString());
        const relayData = new RelayStatus(data);
        relayData.save()
            .then(() => console.log('Relay status saved to MongoDB'))
            .catch(err => console.error('MongoDB save error:', err));
    } catch (err) {
        console.error('Message parsing error:', err);
        logError(err.message);
    }
}

function handleErrorLog(message) {
    try {
        const data = JSON.parse(message.toString());
        const errorLog = new ErrorLog({ error: data.error });
        errorLog.save()
            .then(() => console.log('Error log saved to MongoDB'))
            .catch(err => console.error('MongoDB save error:', err));
    } catch (err) {
        console.error('Message parsing error:', err);
        logError(err.message);
    }
}

function logError(error_msg) {
    const errorLog = new ErrorLog({ error: error_msg });
    errorLog.save()
        .then(() => console.log('Logged error to MongoDB'))
        .catch(err => console.error('MongoDB save error:', err));
}