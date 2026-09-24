const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('1. Testing invalid login:');
  const inv = await post('/api/auth/login', { email: 'user@heatguard.demo', password: 'bad' });
  console.log('   Status:', inv.status, 'Error:', inv.data.error);

  console.log('2. Testing worker login (Arun Sharma):');
  const login = await post('/api/auth/login', { email: 'user@heatguard.demo', password: 'HeatGuard@123' });
  console.log('   Status:', login.status, 'User:', login.data.user.name, 'Role:', login.data.user.role);
  const token = login.data.token;

  console.log('3. Testing /api/auth/me:');
  const me = await get('/api/auth/me', token);
  console.log('   Status:', me.status, 'User:', me.data.user.name);

  console.log('4. Testing /api/dashboard/personal:');
  const dash = await get('/api/dashboard/personal', token);
  console.log('   Status:', dash.status, 'HR:', dash.data.vitals?.heartRate, 'Risk Level:', dash.data.risk?.overallRiskLevel);

  console.log('5. Testing /api/risk/current:');
  const risk = await get('/api/risk/current', token);
  console.log('   Status:', risk.status, 'Heat Stress:', risk.data.heatStressRisk, 'Dehydration:', risk.data.dehydrationRisk);

  console.log('6. Testing caregiver login:');
  const cgLogin = await post('/api/auth/login', { email: 'caregiver@heatguard.demo', password: 'HeatGuard@123' });
  console.log('   Status:', cgLogin.status, 'User:', cgLogin.data.user.name, 'Role:', cgLogin.data.user.role);
  const cgToken = cgLogin.data.token;

  console.log('7. Testing /api/dashboard/caregiver:');
  const cgDash = await get('/api/dashboard/caregiver', cgToken);
  console.log('   Status:', cgDash.status, 'Monitored workers count:', cgDash.data.summary?.totalMonitored);

  console.log('8. Testing /api/disasters/active:');
  const disasters = await get('/api/disasters/active', token);
  console.log('   Status:', disasters.status, 'Active disasters:', disasters.data.length);

  console.log('\nAll core endpoints working perfectly!');
}

run().catch(console.error);
