require('dotenv').config();
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const SensorData = require('./models/SensorData');
const RelayStatus = require('./models/RelayStatus')

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

  // Subscribe to multiple topics
  client.subscribe([process.env.MQTT_TOPIC, 'relay/status'], (err) => {
    if (err) {
      console.error('Subscription error:', err);
    }
  });
});

client.on('message', (topic, message) => {
  if (topic === process.env.MQTT_TOPIC) {
    // Handle sensor/data messages
    try {
      const data = JSON.parse(message.toString());
      const sensorData = new SensorData(data);
      sensorData.save()
        .then(() => console.log('Sensor data saved to MongoDB'))
        .catch(err => console.error('MongoDB save error:', err));
    } catch (err) {
      console.error('Message parsing error:', err);
    }
  } else if (topic === 'relay/status') {
    // Handle relay/status messages
    try {
      const data = JSON.parse(message.toString());
      const relayData = new RelayStatus(data);
      relayData.save()
        .then(() => console.log('Relay status saved to MongoDB'))
        .catch(err => console.error('MongoDB save error:', err));
    } catch (err) {
      console.error('Message parsing error:', err);
    }
  }
});

client.on('error', (err) => {
  console.error('MQTT client error:', err);
});