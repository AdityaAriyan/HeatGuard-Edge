"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentRisk = getCurrentRisk;
exports.getRiskHistory = getRiskHistory;
exports.calculateAdHocRisk = calculateAdHocRisk;
const db_1 = require("../database/db");
const auth_1 = require("../middleware/auth");
const EdgeRiskEngine_1 = require("../edge/risk-engine/EdgeRiskEngine");
async function getCurrentRisk(req, res) {
    try {
        const userId = req.params.userId || req.user?.id;
        if (!userId) {
            res.status(400).json({ error: 'userId required' });
            return;
        }
        const authorized = await (0, auth_1.canAccessUserData)(req.user.id, userId);
        if (!authorized) {
            res.status(403).json({ error: 'Access denied due to privacy permissions' });
            return;
        }
        const risk = await (0, db_1.queryRow)('SELECT * FROM risk_assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1', [userId]);
        const baseline = await (0, db_1.queryRow)('SELECT * FROM baselines WHERE user_id = ?', [userId]);
        if (!risk) {
            res.status(404).json({ error: 'No risk assessment found for user' });
            return;
        }
        res.json({
            ...risk,
            reasons: JSON.parse(risk.reasons || '[]'),
            recommendations: JSON.parse(risk.recommendations || '[]'),
            baseline,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch current risk', details: err.message });
    }
}
async function getRiskHistory(req, res) {
    try {
        const userId = req.params.userId || req.user?.id;
        const limit = parseInt(req.query.limit) || 30;
        if (!userId) {
            res.status(400).json({ error: 'userId required' });
            return;
        }
        const authorized = await (0, auth_1.canAccessUserData)(req.user.id, userId);
        if (!authorized) {
            res.status(403).json({ error: 'Access denied due to privacy permissions' });
            return;
        }
        const history = await (0, db_1.queryRows)('SELECT * FROM risk_assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?', [userId, limit]);
        const parsed = history.map((item) => ({
            ...item,
            reasons: JSON.parse(item.reasons || '[]'),
            recommendations: JSON.parse(item.recommendations || '[]'),
        }));
        res.json(parsed.reverse());
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch risk history', details: err.message });
    }
}
async function calculateAdHocRisk(req, res) {
    try {
        const { packet, baseline, disasterContext } = req.body;
        if (!packet) {
            res.status(400).json({ error: 'packet is required' });
            return;
        }
        const effectiveBaseline = baseline || {
            userId: packet.userId || 'adhoc-user',
            baselineHeartRate: 72,
            baselineSpo2: 98.0,
            baselineSkinTemp: 36.4,
            baselineSystolic: 120,
            baselineDiastolic: 80,
            typicalSleepMinutes: 450,
        };
        const assessment = EdgeRiskEngine_1.EdgeRiskEngine.assessRisk(packet, effectiveBaseline, disasterContext || 'NONE', 'BACKEND_CLOUD');
        res.json(assessment);
    }
    catch (err) {
        res.status(500).json({ error: 'Ad-hoc calculation failed', details: err.message });
    }
}
