import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { getDatabase } from './database/db';
import { initSchema } from './database/schema';
import { initWebSocketServer } from './websocket/server';
import { sensorSimulator } from './simulation/sensorSimulator';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));

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
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

async function startServer() {
  try {
    // 1. Initialize SQLite database & schema
    await getDatabase();
    await initSchema();
    console.log('✅ SQLite Database & Relational Schema ready.');

    // 2. Attach WebSocket Server
    initWebSocketServer(server);
    console.log('📡 Realtime WebSocket server attached.');

    // 3. Initialize Simulator Grid
    await sensorSimulator.initialize();
    sensorSimulator.start(3000); // 3-second simulation pulse

    server.listen(PORT, () => {
      console.log(`🛡️  HeatGuard-Edge Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket endpoint live on ws://localhost:${PORT}/ws`);
    });
  } catch (err) {
    console.error('❌ Fatal server startup error:', err);
    process.exit(1);
  }
}

startServer();
