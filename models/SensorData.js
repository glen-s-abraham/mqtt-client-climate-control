const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    timestamp: Date,
    temperature_f: Number,
    temperature_c: Number,
    humidity: Number,
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData;