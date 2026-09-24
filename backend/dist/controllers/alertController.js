"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlerts = getAlerts;
exports.acknowledgeAlert = acknowledgeAlert;
const db_1 = require("../database/db");
async function getAlerts(req, res) {
    try {
        const userId = req.query.userId || (req.user?.role === 'WORKER' ? req.user.id : undefined);
        let sql = `
      SELECT a.*, u.full_name as user_name, u.email as user_email
      FROM alerts a
      JOIN users u ON a.user_id = u.id
    `;
        const params = [];
        if (userId) {
            sql += ` WHERE a.user_id = ? `;
            params.push(userId);
        }
        sql += ` ORDER BY a.created_at DESC LIMIT 50 `;
        const alerts = await (0, db_1.queryRows)(sql, params);
        res.json(alerts.map((a) => ({
            ...a,
            sensor_context: JSON.parse(a.sensor_context || '{}'),
        })));
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch alerts', details: err.message });
    }
}
async function acknowledgeAlert(req, res) {
    try {
        const { id } = req.params;
        const acknowledgedBy = req.user?.full_name || req.user?.email || 'Authorized Caregiver';
        await (0, db_1.runQuery)(`UPDATE alerts
       SET acknowledged = 1, acknowledged_by = ?, acknowledged_at = datetime('now')
       WHERE id = ?`, [acknowledgedBy, id]);
        res.json({ message: 'Alert acknowledged successfully', id });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to acknowledge alert', details: err.message });
    }
}
