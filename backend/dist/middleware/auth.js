"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
exports.authenticateToken = authenticateToken;
exports.requireRole = requireRole;
exports.canAccessUserData = canAccessUserData;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../database/db");
exports.JWT_SECRET = process.env.JWT_SECRET || 'heatguard_edge_super_secret_jwt_key_2026';
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Authentication token required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }
}
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` });
            return;
        }
        next();
    };
}
/**
 * Privacy permission check: Verifies if the requester is either the user themselves,
 * an authorized caregiver with active permission, or an admin.
 */
async function canAccessUserData(requesterId, targetUserId) {
    if (requesterId === targetUserId)
        return true;
    const requester = await (0, db_1.queryRow)('SELECT role FROM users WHERE id = ?', [requesterId]);
    if (requester?.role === 'ADMIN')
        return true;
    if (requester?.role === 'CAREGIVER') {
        // Check if caregiver relationship is active and user privacy settings allow caregiver access
        const privacy = await (0, db_1.queryRow)('SELECT caregiver_access FROM privacy_settings WHERE user_id = ?', [targetUserId]);
        if (privacy && privacy.caregiver_access === 0) {
            return false; // User explicitly disabled caregiver access
        }
        const relationship = await (0, db_1.queryRow)('SELECT status FROM caregiver_relationships WHERE user_id = ? AND caregiver_id = ? AND status = "ACTIVE"', [targetUserId, requesterId]);
        return !!relationship;
    }
    return false;
}
