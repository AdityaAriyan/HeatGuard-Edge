"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = initWebSocketServer;
exports.broadcastSensorPacket = broadcastSensorPacket;
exports.broadcastAlert = broadcastAlert;
exports.broadcastEmergencyEvent = broadcastEmergencyEvent;
exports.broadcastDisasterAlert = broadcastDisasterAlert;
const ws_1 = require("ws");
const clients = new Set();
let wssInstance = null;
function initWebSocketServer(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
    wssInstance = wss;
    wss.on('connection', (ws) => {
        const client = { ws };
        clients.add(client);
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === 'SUBSCRIBE') {
                    client.userId = data.userId;
                    client.isCaregiverOrAdmin = data.isCaregiverOrAdmin || false;
                    ws.send(JSON.stringify({ type: 'SUBSCRIBED', userId: data.userId }));
                }
                else if (data.type === 'PING') {
                    ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
                }
            }
            catch (err) {
                // invalid JSON, ignore
            }
        });
        ws.on('close', () => {
            clients.delete(client);
        });
        ws.on('error', () => {
            clients.delete(client);
        });
        // Send initial welcome message
        ws.send(JSON.stringify({
            type: 'CONNECTED',
            message: 'HeatGuard-Edge Realtime Telemetry WebSocket connected',
            timestamp: new Date().toISOString(),
        }));
    });
    return wss;
}
function broadcastSensorPacket(packet, risk) {
    const payload = JSON.stringify({
        type: 'SENSOR_TELEMETRY',
        userId: packet.userId,
        packet,
        risk,
        timestamp: new Date().toISOString(),
    });
    for (const client of clients) {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            if (!client.userId || client.userId === packet.userId || client.isCaregiverOrAdmin) {
                client.ws.send(payload);
            }
        }
    }
}
function broadcastAlert(alert) {
    const payload = JSON.stringify({
        type: 'SAFETY_ALERT',
        alert,
        timestamp: new Date().toISOString(),
    });
    for (const client of clients) {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            if (!client.userId || client.userId === alert.userId || client.isCaregiverOrAdmin) {
                client.ws.send(payload);
            }
        }
    }
}
function broadcastEmergencyEvent(event) {
    const payload = JSON.stringify({
        type: 'EMERGENCY_SOS',
        event,
        timestamp: new Date().toISOString(),
    });
    for (const client of clients) {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            client.ws.send(payload);
        }
    }
}
function broadcastDisasterAlert(disaster) {
    const payload = JSON.stringify({
        type: 'DISASTER_EVENT',
        disaster,
        timestamp: new Date().toISOString(),
    });
    for (const client of clients) {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            client.ws.send(payload);
        }
    }
}
