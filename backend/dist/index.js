"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const db_1 = require("./database/db");
const schema_1 = require("./database/schema");
const server_1 = require("./websocket/server");
const sensorSimulator_1 = require("./simulation/sensorSimulator");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
// Enable CORS & JSON Parsing
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Healthcheck
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ONLINE',
        system: 'HeatGuard-Edge Realtime Platform',
        version: '2.4.0',
        edgeEngineStatus: 'OPERATIONAL',
        timestamp: new Date().toISOString(),
    });
});
// Mount Main API Routes
app.use('/api', routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
async function startServer() {
    try {
        // 1. Initialize SQLite database & schema
        await (0, db_1.getDatabase)();
        await (0, schema_1.initSchema)();
        console.log('✅ SQLite Database & Relational Schema ready.');
        // 2. Attach WebSocket Server
        (0, server_1.initWebSocketServer)(server);
        console.log('📡 Realtime WebSocket server attached.');
        // 3. Initialize Simulator Grid
        await sensorSimulator_1.sensorSimulator.initialize();
        sensorSimulator_1.sensorSimulator.start(3000); // 3-second simulation pulse
        server.listen(PORT, () => {
            console.log(`🛡️  HeatGuard-Edge Server running on http://localhost:${PORT}`);
            console.log(`📡 WebSocket endpoint live on ws://localhost:${PORT}/ws`);
        });
    }
    catch (err) {
        console.error('❌ Fatal server startup error:', err);
        process.exit(1);
    }
}
startServer();
