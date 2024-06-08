const mongoose = require('mongoose');

const relayStatusSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    relay1: String,
    relay2: String,
});

const RelayStatus = mongoose.model('RelayStatus', relayStatusSchema);

module.exports = RelayStatus;