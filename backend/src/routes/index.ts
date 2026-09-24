import { Router } from 'express';
import * as authCtrl from '../controllers/authController';
import * as sensorCtrl from '../controllers/sensorController';
import * as riskCtrl from '../controllers/riskController';
import * as dashCtrl from '../controllers/dashboardController';
import * as alertCtrl from '../controllers/alertController';
import * as emergCtrl from '../controllers/emergencyController';
import * as locCtrl from '../controllers/locationController';
import * as envCtrl from '../controllers/environmentController';
import * as disCtrl from '../controllers/disasterController';
import * as syncCtrl from '../controllers/syncController';
import * as privCtrl from '../controllers/privacyController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sensorSimulator } from '../simulation/sensorSimulator';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticateToken, authCtrl.getMe);
router.get('/auth/demo-users', authCtrl.listDemoUsers);

// --- Sensor Routes (Hardware Ingestion & Telemetry) ---
router.post('/sensors/readings', sensorCtrl.ingestSensorReading); // Hardware-ready or simulation ingest
router.get('/sensors/latest/:userId?', authenticateToken, sensorCtrl.getLatestSensorReading);
router.get('/sensors/history/:userId?', authenticateToken, sensorCtrl.getSensorHistory);

// --- Risk Routes ---
router.get('/risk/current/:userId?', authenticateToken, riskCtrl.getCurrentRisk);
router.get('/risk/history/:userId?', authenticateToken, riskCtrl.getRiskHistory);
router.post('/risk/calculate', riskCtrl.calculateAdHocRisk);

// --- Dashboard Routes ---
router.get('/dashboard/personal', authenticateToken, dashCtrl.getPersonalDashboard);
router.get('/dashboard/caregiver', authenticateToken, dashCtrl.getCaregiverDashboard);

// --- Alert Routes ---
router.get('/alerts', authenticateToken, alertCtrl.getAlerts);
router.post('/alerts/:id/acknowledge', authenticateToken, alertCtrl.acknowledgeAlert);

// --- Emergency Routes ---
router.post('/emergency/sos', authenticateToken, emergCtrl.triggerSos);
router.post('/emergency/cancel/:eventId', authenticateToken, emergCtrl.cancelEmergency);
router.get('/emergency/history', authenticateToken, emergCtrl.getEmergencyHistory);

// --- Location Routes ---
router.post('/location', authenticateToken, locCtrl.updateLocation);
router.get('/location/:userId?', authenticateToken, locCtrl.getLocation);

// --- Environment Routes ---
router.get('/environment/current', envCtrl.getCurrentEnvironment);
router.get('/environment/history', envCtrl.getEnvironmentHistory);
router.post('/environment/readings', envCtrl.postEnvironmentalReading);

// --- Disaster Routes ---
router.get('/disasters/active', disCtrl.getActiveDisasters);
router.post('/disasters/simulate', authenticateToken, disCtrl.simulateDisasterEvent);

// --- Sync Routes ---
router.post('/sync', authenticateToken, syncCtrl.syncOfflineData);

// --- Privacy Routes ---
router.get('/privacy/settings', authenticateToken, privCtrl.getPrivacySettings);
router.put('/privacy/settings', authenticateToken, privCtrl.updatePrivacySettings);

// --- Simulator Control Routes ---
router.get('/simulator/status', (req, res) => {
  res.json(sensorSimulator.getSimulationState());
});

router.post('/simulator/start', (req, res) => {
  const { intervalMs = 3000 } = req.body;
  sensorSimulator.start(intervalMs);
  res.json({ message: 'Simulator started', state: sensorSimulator.getSimulationState() });
});

router.post('/simulator/stop', (req, res) => {
  sensorSimulator.stop();
  res.json({ message: 'Simulator stopped', state: sensorSimulator.getSimulationState() });
});

router.post('/simulator/scenario', (req, res) => {
  const { userId, scenario } = req.body;
  if (!userId || !scenario) {
    res.status(400).json({ error: 'userId and scenario are required' });
    return;
  }
  sensorSimulator.setScenario(userId, scenario);
  res.json({ message: `Scenario set to ${scenario} for user ${userId}` });
});

export default router;
