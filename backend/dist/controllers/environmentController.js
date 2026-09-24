"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentEnvironment = getCurrentEnvironment;
exports.getEnvironmentHistory = getEnvironmentHistory;
exports.postEnvironmentalReading = postEnvironmentalReading;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
async function getCurrentEnvironment(req, res) {
    try {
        const reading = await (0, db_1.queryRow)('SELECT * FROM environmental_readings ORDER BY timestamp DESC LIMIT 1');
        res.json(reading);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch environmental data', details: err.message });
    }
}
async function getEnvironmentHistory(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 30;
        const history = await (0, db_1.queryRows)('SELECT * FROM environmental_readings ORDER BY timestamp DESC LIMIT ?', [limit]);
        res.json(history.reverse());
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch environmental history', details: err.message });
    }
}
async function postEnvironmentalReading(req, res) {
    try {
        const { ambient_temperature, humidity, heat_index, aqi, pm25, uv_index = 5, weather_condition = 'Clear', latitude = 28.6139, longitude = 77.2090 } = req.body;
        const id = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        await (0, db_1.runQuery)(`INSERT INTO environmental_readings (id, latitude, longitude, ambient_temperature, humidity, heat_index, aqi, pm25, uv_index, weather_condition, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, latitude, longitude, ambient_temperature, humidity, heat_index, aqi, pm25, uv_index, weather_condition, timestamp]);
        res.status(201).json({ message: 'Environmental reading stored', id, timestamp });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to store reading', details: err.message });
    }
}
