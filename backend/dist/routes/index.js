"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authCtrl = __importStar(require("../controllers/authController"));
const sensorCtrl = __importStar(require("../controllers/sensorController"));
const riskCtrl = __importStar(require("../controllers/riskController"));
const dashCtrl = __importStar(require("../controllers/dashboardController"));
const alertCtrl = __importStar(require("../controllers/alertController"));
const emergCtrl = __importStar(require("../controllers/emergencyController"));
const locCtrl = __importStar(require("../controllers/locationController"));
const envCtrl = __importStar(require("../controllers/environmentController"));
const disCtrl = __importStar(require("../controllers/disasterController"));
const syncCtrl = __importStar(require("../controllers/syncController"));
const privCtrl = __importStar(require("../controllers/privacyController"));
const auth_1 = require("../middleware/auth");
const sensorSimulator_1 = require("../simulation/sensorSimulator");
const router = (0, express_1.Router)();
// --- Auth Routes ---
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', auth_1.authenticateToken, authCtrl.getMe);
router.get('/auth/demo-users', authCtrl.listDemoUsers);
// --- Sensor Routes (Hardware Ingestion & Telemetry) ---
router.post('/sensors/readings', sensorCtrl.ingestSensorReading); // Hardware-ready or simulation ingest
router.get('/sensors/latest/:userId?', auth_1.authenticateToken, sensorCtrl.getLatestSensorReading);
router.get('/sensors/history/:userId?', auth_1.authenticateToken, sensorCtrl.getSensorHistory);
// --- Risk Routes ---
router.get('/risk/current/:userId?', auth_1.authenticateToken, riskCtrl.getCurrentRisk);
router.get('/risk/history/:userId?', auth_1.authenticateToken, riskCtrl.getRiskHistory);
router.post('/risk/calculate', riskCtrl.calculateAdHocRisk);
// --- Dashboard Routes ---
router.get('/dashboard/personal', auth_1.authenticateToken, dashCtrl.getPersonalDashboard);
router.get('/dashboard/caregiver', auth_1.authenticateToken, dashCtrl.getCaregiverDashboard);
// --- Alert Routes ---
router.get('/alerts', auth_1.authenticateToken, alertCtrl.getAlerts);
router.post('/alerts/:id/acknowledge', auth_1.authenticateToken, alertCtrl.acknowledgeAlert);
// --- Emergency Routes ---
router.post('/emergency/sos', auth_1.authenticateToken, emergCtrl.triggerSos);
router.post('/emergency/cancel/:eventId', auth_1.authenticateToken, emergCtrl.cancelEmergency);
router.get('/emergency/history', auth_1.authenticateToken, emergCtrl.getEmergencyHistory);
// --- Location Routes ---
router.post('/location', auth_1.authenticateToken, locCtrl.updateLocation);
router.get('/location/:userId?', auth_1.authenticateToken, locCtrl.getLocation);
// --- Environment Routes ---
router.get('/environment/current', envCtrl.getCurrentEnvironment);
router.get('/environment/history', envCtrl.getEnvironmentHistory);
router.post('/environment/readings', envCtrl.postEnvironmentalReading);
// --- Disaster Routes ---
router.get('/disasters/active', disCtrl.getActiveDisasters);
router.post('/disasters/simulate', auth_1.authenticateToken, disCtrl.simulateDisasterEvent);
// --- Sync Routes ---
router.post('/sync', auth_1.authenticateToken, syncCtrl.syncOfflineData);
// --- Privacy Routes ---
router.get('/privacy/settings', auth_1.authenticateToken, privCtrl.getPrivacySettings);
router.put('/privacy/settings', auth_1.authenticateToken, privCtrl.updatePrivacySettings);
// --- Simulator Control Routes ---
router.get('/simulator/status', (req, res) => {
    res.json(sensorSimulator_1.sensorSimulator.getSimulationState());
});
router.post('/simulator/start', (req, res) => {
    const { intervalMs = 3000 } = req.body;
    sensorSimulator_1.sensorSimulator.start(intervalMs);
    res.json({ message: 'Simulator started', state: sensorSimulator_1.sensorSimulator.getSimulationState() });
});
router.post('/simulator/stop', (req, res) => {
    sensorSimulator_1.sensorSimulator.stop();
    res.json({ message: 'Simulator stopped', state: sensorSimulator_1.sensorSimulator.getSimulationState() });
});
router.post('/simulator/scenario', (req, res) => {
    const { userId, scenario } = req.body;
    if (!userId || !scenario) {
        res.status(400).json({ error: 'userId and scenario are required' });
        return;
    }
    sensorSimulator_1.sensorSimulator.setScenario(userId, scenario);
    res.json({ message: `Scenario set to ${scenario} for user ${userId}` });
});
exports.default = router;
