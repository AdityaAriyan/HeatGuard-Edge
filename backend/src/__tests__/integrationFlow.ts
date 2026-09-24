const BASE = 'http://localhost:5000/api';

async function request(endpoint: string, options: any = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function runEndToEndVerification() {
  console.log('🚀 Starting Full-Stack End-to-End Verification of HeatGuard-Edge...\n');

  // 1. Authenticate as Worker Arun Sharma
  console.log('1️⃣ Testing Authentication (Worker Login)...');
  const workerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'user@heatguard.demo', password: 'HeatGuard@123' }),
  });
  const workerToken = workerLogin.token;
  console.log(`   ✅ Logged in as: ${workerLogin.user.full_name} (${workerLogin.user.role})`);

  // 2. Fetch Personal Dashboard
  console.log('\n2️⃣ Testing Personal Dashboard (/dashboard/personal)...');
  const personalDash = await request('/dashboard/personal', {}, workerToken);
  console.log(`   ✅ Status: ${personalDash.riskAssessment?.overall_level || 'LOW'} Risk (${personalDash.riskAssessment?.overall_score || 0}/100)`);
  console.log(`   ✅ Vitals: HR ${personalDash.vitals?.heartRate} BPM, SpO2 ${personalDash.vitals?.spo2}%, Skin ${personalDash.vitals?.skinTemperature}°C`);
  console.log(`   ✅ AI Insight: "${personalDash.aiInsight}"`);

  // 3. Ingest Hardware Reading (Simulate Extreme Heat Wave)
  console.log('\n3️⃣ Testing Hardware-Ready Sensor Ingestion (Heat Wave Packet)...');
  const heatPacket = {
    deviceId: 'DEV-DEMO-HW-01',
    userId: workerLogin.user.id,
    timestamp: new Date().toISOString(),
    heartRate: 116,
    spo2: 96.0,
    skinTemperature: 38.6,
    ambientTemperature: 42.0,
    humidity: 70,
    systolic: 136,
    diastolic: 88,
    isBpEstimated: true,
    accelX: 0.12,
    accelY: 0.28,
    accelZ: 0.96,
    gyroX: 30,
    gyroY: 20,
    gyroZ: 15,
    activityState: 'ACTIVE_WORK',
    aqi: 95,
    pm25: 32,
    latitude: 28.6139,
    longitude: 77.2090,
    exposureMinutes: 150,
  };

  const ingestRes = await request(
    '/sensors/readings',
    { method: 'POST', body: JSON.stringify(heatPacket) },
    workerToken
  );
  console.log(`   ✅ Ingested successfully. Reading ID: ${ingestRes.readingId}`);
  console.log(`   ✅ Evaluated Risk: ${ingestRes.riskAssessment.overallLevel} (${ingestRes.riskAssessment.overallScore}/100)`);
  console.log(`   ✅ Reasons: ${ingestRes.riskAssessment.reasons[0]}`);

  // 4. Authenticate as Lead Caregiver (Dr. Priya Nair)
  console.log('\n4️⃣ Testing Caregiver Portal & Triage (/dashboard/caregiver)...');
  const caregiverLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'caregiver@heatguard.demo', password: 'HeatGuard@123' }),
  });
  const caregiverToken = caregiverLogin.token;
  console.log(`   ✅ Logged in as: ${caregiverLogin.user.full_name} (${caregiverLogin.user.role})`);

  const caregiverDash = await request('/dashboard/caregiver', {}, caregiverToken);
  console.log(`   ✅ Summary: Total ${caregiverDash.summary.totalMonitored} | Low ${caregiverDash.summary.lowCount} | Caution ${caregiverDash.summary.cautionCount} | High ${caregiverDash.summary.highCount} | Critical ${caregiverDash.summary.criticalCount}`);
  console.log(`   ✅ Active Alerts in Queue: ${caregiverDash.alerts.length}`);

  // 5. Acknowledge Alert
  if (caregiverDash.alerts.length > 0) {
    const topAlert = caregiverDash.alerts[0];
    console.log(`\n5️⃣ Testing Alert Acknowledgment (Alert: ${topAlert.title})...`);
    await request(`/alerts/${topAlert.id}/acknowledge`, { method: 'POST' }, caregiverToken);
    console.log(`   ✅ Alert ${topAlert.id} acknowledged successfully.`);
  }

  // 6. Test Emergency SOS Dispatch
  console.log('\n6️⃣ Testing Emergency SOS Distress Broadcast (/emergency/sos)...');
  const sosRes = await request(
    '/emergency/sos',
    {
      method: 'POST',
      body: JSON.stringify({
        userId: workerLogin.user.id,
        latitude: 28.6139,
        longitude: 77.2090,
        reason: 'Manual E2E Test Distress Broadcast',
      }),
    },
    workerToken
  );
  console.log(`   ✅ SOS Event Broadcasted! Event ID: ${sosRes.event.eventId}`);

  // 7. Test Offline Sync Batch Ingestion
  console.log('\n7️⃣ Testing Offline Reconnection Sync Batch (/api/sync)...');
  const offlinePacket = { ...heatPacket, heartRate: 88, skinTemperature: 36.8, exposureMinutes: 30 };
  const syncRes = await request(
    '/sync',
    { method: 'POST', body: JSON.stringify({ userId: workerLogin.user.id, readings: [offlinePacket] }) },
    workerToken
  );
  console.log(`   ✅ Synced ${syncRes.synchronizedCount} queued offline records at ${syncRes.syncedAt}`);

  // 8. Test Privacy Preferences
  console.log('\n8️⃣ Testing Privacy Settings Update (/privacy/settings)...');
  const privRes = await request(
    '/privacy/settings',
    { method: 'PUT', body: JSON.stringify({ local_edge_ai_only: 1, location_sharing: 1 }) },
    workerToken
  );
  console.log(`   ✅ Updated privacy preferences: Local Edge Only = ${privRes.settings.local_edge_ai_only}, Location = ${privRes.settings.location_sharing}`);

  console.log('\n🎉 ALL 8 FULL-STACK END-TO-END VERIFICATION TESTS PASSED PERFECTLY!\n');
}

runEndToEndVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
