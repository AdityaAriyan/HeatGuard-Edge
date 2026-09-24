"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocation = updateLocation;
exports.getLocation = getLocation;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const auth_1 = require("../middleware/auth");
async function updateLocation(req, res) {
    try {
        const userId = req.body.userId || req.user.id;
        const { latitude, longitude, accuracy = 5.0, source = 'GPS_GNSS' } = req.body;
        if (latitude === undefined || longitude === undefined) {
            res.status(400).json({ error: 'latitude and longitude are required' });
            return;
        }
        const id = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        await (0, db_1.runQuery)(`INSERT INTO location_records (id, user_id, latitude, longitude, accuracy, source, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, userId, latitude, longitude, accuracy, source, timestamp]);
        res.status(201).json({ message: 'Location updated', id, timestamp });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update location', details: err.message });
    }
}
async function getLocation(req, res) {
    try {
        const userId = req.params.userId || req.user.id;
        const authorized = await (0, auth_1.canAccessUserData)(req.user.id, userId);
        if (!authorized) {
            res.status(403).json({ error: 'Location sharing is disabled or permission not granted' });
            return;
        }
        const location = await (0, db_1.queryRow)('SELECT * FROM location_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1', [userId]);
        res.json(location);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch location', details: err.message });
    }
}
