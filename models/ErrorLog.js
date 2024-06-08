const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now }, // The timestamp field is set to the current date and time by default
    error: String,
});

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog
