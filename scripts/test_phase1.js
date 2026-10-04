const http = require('http');
const app = require('../backend/server');

let server;
const PORT = 5099;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : null;
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   WorkConnect - Phase 1 Verification Test Suite    ');
  console.log('====================================================\n');

  await new Promise((resolve) => {
    server = app.listen(PORT, '127.0.0.1', resolve);
  });

  try {
    // Test 1: Health Check
    console.log('Test Suite 1: System & Database Health Check');
    const health = await request({ path: '/api/health', method: 'GET' });
    assert(health.status === 200, 'Health endpoint returns 200 OK');
    assert(health.data.database.status === 'connected', 'PostgreSQL database is connected');
    assert(health.data.database.postgis.includes('USE_GEOS'), 'PostGIS extension is operational');
    console.log('');

    // Test 2: Seed Users Login & Authentication
    console.log('Test Suite 2: Seed Users Authentication');
    const adminLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'admin@workconnect.com', password: 'Password@123' }
    );
    assert(adminLogin.status === 200, 'Admin can login with default credentials');
    assert(adminLogin.data.data.user.role === 'admin', 'Admin user has role admin');
    assert(!!adminLogin.data.data.token, 'Admin receives JWT token');
    const adminToken = adminLogin.data.data.token;

    const customerLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'customer@workconnect.com', password: 'Password@123' }
    );
    assert(customerLogin.status === 200, 'Customer can login with default credentials');
    assert(customerLogin.data.data.user.role === 'customer', 'Customer user has role customer');
    const customerToken = customerLogin.data.data.token;

    const proLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'rahul.electrician@workconnect.com', password: 'Password@123' }
    );
    assert(proLogin.status === 200, 'Professional can login with default credentials');
    assert(proLogin.data.data.user.role === 'professional', 'Professional user has role professional');
    assert(!!proLogin.data.data.user.professional, 'Professional login returns professional profile');
    const proToken = proLogin.data.data.token;
    console.log('');

    // Test 3: Invalid Credentials & Security
    console.log('Test Suite 3: Login Security & Rejection');
    const badPass = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'customer@workconnect.com', password: 'WrongPassword' }
    );
    assert(badPass.status === 401, 'Wrong password returns 401 Unauthorized');

    const nonExistent = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'nobody@workconnect.com', password: 'Password@123' }
    );
    assert(nonExistent.status === 401, 'Non-existent email returns 401 Unauthorized');
    console.log('');

    // Test 4: Registration of Customer and Professional
    console.log('Test Suite 4: User Registration Flow');
    const uniqueId = Date.now();
    const newCustomerEmail = `test.customer.${uniqueId}@example.com`;
    const regCust = await request(
      { path: '/api/auth/register', method: 'POST' },
      {
        name: 'Jane Doe',
        email: newCustomerEmail,
        phone: '+91 9999911111',
        password: 'Password@123',
        role: 'customer',
      }
    );
    assert(regCust.status === 201, 'Customer registration returns 201 Created');
    assert(regCust.data.data.user.role === 'customer', 'Registered user has role customer');
    assert(!!regCust.data.data.token, 'Registered user receives JWT token');

    // Duplicate registration should fail
    const dupReg = await request(
      { path: '/api/auth/register', method: 'POST' },
      {
        name: 'Jane Doe',
        email: newCustomerEmail,
        phone: '+91 9999911111',
        password: 'Password@123',
        role: 'customer',
      }
    );
    assert(dupReg.status === 409, 'Duplicate registration returns 409 Conflict');

    // Professional registration with professional profile details
    const newProEmail = `test.pro.${uniqueId}@example.com`;
    const regPro = await request(
      { path: '/api/auth/register', method: 'POST' },
      {
        name: 'Suresh Carpenter',
        email: newProEmail,
        phone: '+91 9999922222',
        password: 'Password@123',
        role: 'professional',
        professionalDetails: {
          bio: 'Master carpenter specializing in solid teak wood & modular interiors',
          experience: 9,
          price: 450,
          address: 'South Extension, New Delhi',
        },
      }
    );
    assert(regPro.status === 201, 'Professional registration returns 201 Created');
    assert(regPro.data.data.user.role === 'professional', 'Registered user has role professional');
    assert(regPro.data.data.user.professional.experience === 9, 'Professional profile experience is recorded');
    console.log('');

    // Test 5: Validation Middleware
    console.log('Test Suite 5: Validation Middleware');
    const invalidEmail = await request(
      { path: '/api/auth/register', method: 'POST' },
      { name: 'Invalid', email: 'notanemail', password: '123', role: 'customer' }
    );
    assert(invalidEmail.status === 400, 'Invalid email and short password return 400 Bad Request');
    assert(Array.isArray(invalidEmail.data.errors), 'Validation errors returned in structured array');
    console.log('');

    // Test 6: Authenticated /me endpoint
    console.log('Test Suite 6: Token Verification & /me Endpoint');
    const meRes = await request({
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(meRes.status === 200, 'Authenticated user can access /api/auth/me');
    assert(meRes.data.data.email === 'customer@workconnect.com', 'Returns correct customer data');

    const noTokenRes = await request({ path: '/api/auth/me', method: 'GET' });
    assert(noTokenRes.status === 401, 'Access without token returns 401 Unauthorized');

    const badTokenRes = await request({
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: 'Bearer bad.token.here' },
    });
    assert(badTokenRes.status === 401, 'Access with invalid token returns 401 Unauthorized');
    console.log('');

    // Test 7: Role-Based Authorization
    console.log('Test Suite 7: Role-Based Access Control (RBAC)');
    // Customer attempting to access Admin endpoint
    const forbiddenAdmin = await request({
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(forbiddenAdmin.status === 403, 'Customer accessing /api/admin/users is rejected with 403 Forbidden');

    // Customer attempting to access Professional-only endpoint
    const forbiddenPro = await request(
      {
        path: '/api/users/availability',
        method: 'PATCH',
        headers: { Authorization: `Bearer ${customerToken}` },
      },
      { isAvailable: false }
    );
    assert(forbiddenPro.status === 403, 'Customer accessing /api/users/availability is rejected with 403 Forbidden');

    // Professional accessing Professional-only endpoint
    const proAvail = await request(
      {
        path: '/api/users/availability',
        method: 'PATCH',
        headers: { Authorization: `Bearer ${proToken}` },
      },
      { isAvailable: false }
    );
    assert(proAvail.status === 200, 'Professional can update availability status');

    // Admin accessing Admin endpoints
    const adminStats = await request({
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStats.status === 200, 'Admin can access /api/admin/stats');
    assert(parseInt(adminStats.data.data.total_users, 10) >= 8, 'Admin statistics report user counts accurately');

    const adminUsers = await request({
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsers.status === 200, 'Admin can list platform users with /api/admin/users');
    assert(adminUsers.data.data.users.length > 0, 'Admin receives user list');
    console.log('');

    console.log('====================================================');
    console.log(' 🎉 ALL PHASE 1 TEST SUITES PASSED SUCCESSFULLY!    ');
    console.log('====================================================');
  } catch (error) {
    console.error('Test Suite Failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    process.exit(0);
  }
}

runTests();
