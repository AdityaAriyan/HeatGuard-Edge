import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  isCaregiverOrAdmin?: boolean;
}

const clients: Set<ClientConnection> = new Set();
let wssInstance: WebSocketServer | null = null;

export function initWebSocketServer(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });
  wssInstance = wss;

  wss.on('connection', (ws: WebSocket) => {
    const client: ClientConnection = { ws };
    clients.add(client);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'SUBSCRIBE') {
          client.userId = data.userId;
          client.isCaregiverOrAdmin = data.isCaregiverOrAdmin || false;
          ws.send(JSON.stringify({ type: 'SUBSCRIBED', userId: data.userId }));
        } else if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
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
    ws.send(
      JSON.stringify({
        type: 'CONNECTED',
        message: 'HeatGuard-Edge Realtime Telemetry WebSocket connected',
        timestamp: new Date().toISOString(),
      })
    );
  });

  return wss;
}

export function broadcastSensorPacket(packet: any, risk: any): void {
  const payload = JSON.stringify({
    type: 'SENSOR_TELEMETRY',
    userId: packet.userId,
    packet,
    risk,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (!client.userId || client.userId === packet.userId || client.isCaregiverOrAdmin) {
        client.ws.send(payload);
      }
    }
  }
}

export function broadcastAlert(alert: any): void {
  const payload = JSON.stringify({
    type: 'SAFETY_ALERT',
    alert,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (!client.userId || client.userId === alert.userId || client.isCaregiverOrAdmin) {
        client.ws.send(payload);
      }
    }
  }
}

export function broadcastEmergencyEvent(event: any): void {
  const payload = JSON.stringify({
    type: 'EMERGENCY_SOS',
    event,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

export function broadcastDisasterAlert(disaster: any): void {
  const payload = JSON.stringify({
    type: 'DISASTER_EVENT',
    disaster,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}
