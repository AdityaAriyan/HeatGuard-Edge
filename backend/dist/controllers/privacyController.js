"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivacySettings = getPrivacySettings;
exports.updatePrivacySettings = updatePrivacySettings;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
async function getPrivacySettings(req, res) {
    try {
        const userId = req.user.id;
        let settings = await (0, db_1.queryRow)('SELECT * FROM privacy_settings WHERE user_id = ?', [userId]);
        if (!settings) {
            const id = (0, uuid_1.v4)();
            await (0, db_1.runQuery)(`INSERT INTO privacy_settings (id, user_id, local_edge_ai_only, cloud_health_sync, location_sharing, caregiver_access, emergency_location_broadcast)
         VALUES (?, ?, 0, 1, 1, 1, 1)`, [id, userId]);
            settings = await (0, db_1.queryRow)('SELECT * FROM privacy_settings WHERE user_id = ?', [userId]);
        }
        res.json(settings);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch privacy settings', details: err.message });
    }
}
async function updatePrivacySettings(req, res) {
    try {
        const userId = req.user.id;
        const { local_edge_ai_only, cloud_health_sync, location_sharing, caregiver_access, emergency_location_broadcast, anonymous_analytics, } = req.body;
        await (0, db_1.runQuery)(`UPDATE privacy_settings
       SET local_edge_ai_only = COALESCE(?, local_edge_ai_only),
           cloud_health_sync = COALESCE(?, cloud_health_sync),
           location_sharing = COALESCE(?, location_sharing),
           caregiver_access = COALESCE(?, caregiver_access),
           emergency_location_broadcast = COALESCE(?, emergency_location_broadcast),
           anonymous_analytics = COALESCE(?, anonymous_analytics),
           updated_at = datetime('now')
       WHERE user_id = ?`, [
            local_edge_ai_only !== undefined ? (local_edge_ai_only ? 1 : 0) : null,
            cloud_health_sync !== undefined ? (cloud_health_sync ? 1 : 0) : null,
            location_sharing !== undefined ? (location_sharing ? 1 : 0) : null,
            caregiver_access !== undefined ? (caregiver_access ? 1 : 0) : null,
            emergency_location_broadcast !== undefined ? (emergency_location_broadcast ? 1 : 0) : null,
            anonymous_analytics !== undefined ? (anonymous_analytics ? 1 : 0) : null,
            userId,
        ]);
        const updated = await (0, db_1.queryRow)('SELECT * FROM privacy_settings WHERE user_id = ?', [userId]);
        res.json({ message: 'Privacy preferences updated successfully', settings: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update privacy preferences', details: err.message });
    }
}
