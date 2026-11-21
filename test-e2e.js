import { dbHelpers } from './server/database/db.js';
import { runSeed } from './server/database/seed.js';

async function runEndToEndTest() {
  console.log('🧪 Starting CivicResolve Comprehensive End-to-End Test Suite...\n');

  // Reset database with seeds
  runSeed();

  const port = process.env.TEST_PORT || '5088';
  process.env.PORT = port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // Dynamically import and spin up dedicated test server instance
  await import('./server/index.js');
  await new Promise(res => setTimeout(res, 1200));
  console.log(`📡 Test server running on isolated port ${port}\n`);

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Health check
    console.log('1. Testing Health Check Endpoint:');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns 200 OK');
    assert(healthData.status === 'healthy', 'Health status is "healthy"');
    assert(!!healthData.model, `Gemini model configured: ${healthData.model}`);

    // 2. Fetch seeded complaints
    console.log('\n2. Testing Complaints Query & Filtering:');
    const listRes = await fetch(`${baseUrl}/api/complaints?sortBy=priority`);
    const listData = await listRes.json();
    assert(listData.total >= 14, `Found ${listData.total} complaints (>=14)`);
    assert(listData.complaints[0].priority === 'Critical', 'Top sorted complaint has Critical priority');

    // 3. Citizen submits new complaint
    console.log('\n3. Testing Citizen Grievance Submission with AI Classification:');
    const submitPayload = {
      title: 'Massive open electrical conduit sparking in storm water puddle',
      description: 'Severe exposed wiring from pole transformer sitting in deep water after heavy rain. Near bus stop, pedestrians are in danger of electric shock.',
      location: '100 Feet Road, Near Metro Pillar 42, Indiranagar, Bengaluru',
      userCategory: 'Auto-detect'
    };

    const submitRes = await fetch(`${baseUrl}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitPayload)
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 201, 'Complaint created with HTTP 201');
    assert(submitData.complaint?.trackingId?.startsWith('CR-'), `Generated Tracking ID: ${submitData.complaint?.trackingId}`);
    assert(submitData.complaint?.priority === 'Critical', `AI Priority detected as Critical: "${submitData.complaint?.priority}"`);
    assert(submitData.complaint?.aiCategory === 'Public Safety', `AI Category detected: "${submitData.complaint?.aiCategory}"`);
    assert(submitData.complaint?.department.includes('Electricity'), `Recommended department: "${submitData.complaint?.department}"`);

    const newTrackingId = submitData.complaint.trackingId;
    const newId = submitData.complaint.id;

    // 4. Fetch by tracking ID
    console.log('\n4. Testing Citizen Tracking ID Lookup:');
    const trackRes = await fetch(`${baseUrl}/api/complaints/${newTrackingId}`);
    const trackData = await trackRes.json();
    assert(trackRes.status === 200, 'Complaint retrieved via Tracking ID');
    assert(trackData.complaint?.title === submitPayload.title, 'Retrieved complaint title matches');
    assert(trackData.complaint?.status === 'Reported', 'Initial status is "Reported"');
    assert(trackData.complaint?.statusHistory?.length >= 1, 'Initial statusHistory entry present');

    // 5. Citizen upvote ("I'm affected too")
    console.log('\n5. Testing Citizen Upvote ("I\'m affected too"):');
    const upvoteRes = await fetch(`${baseUrl}/api/complaints/${newId}/upvote`, { method: 'POST' });
    const upvoteData = await upvoteRes.json();
    assert(upvoteRes.status === 200, 'Upvote returned 200');
    assert(upvoteData.upvotes === 1, `Upvotes incremented to ${upvoteData.upvotes}`);

    // 6. Generate Formal Escalation Letter
    console.log('\n6. Testing Formal Municipal Grievance Letter Generation:');
    const letterRes = await fetch(`${baseUrl}/api/complaints/${newId}/letter`);
    const letterData = await letterRes.json();
    assert(letterRes.status === 200, 'Formal letter endpoint returned 200');
    assert(letterData.letter?.includes(newTrackingId), 'Letter references the complaint Tracking ID');
    assert(letterData.letter?.includes(submitPayload.location), 'Letter references the location');

    // 7. Admin Authentication
    console.log('\n7. Testing Admin Authentication:');
    const badLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
    });
    assert(badLoginRes.status === 401, 'Unauthorized for bad password');

    const goodLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'civicadmin123' })
    });
    const goodLoginData = await goodLoginRes.json();
    assert(goodLoginRes.status === 200, 'Admin successfully authenticated');
    assert(goodLoginData.token !== undefined, 'Admin bearer token issued');

    // 8. Admin Security & Stats Analytics
    console.log('\n8. Testing Admin Security & Analytics:');
    // Test unauthenticated access is rejected (401)
    const unauthStatsRes = await fetch(`${baseUrl}/api/admin/stats`);
    assert(unauthStatsRes.status === 401, 'Unauthenticated request to /api/admin/stats is blocked (401)');

    // Authenticated request with Bearer token
    const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${goodLoginData.token}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, 'Authenticated stats endpoint returned 200 OK');
    assert(statsData.total >= 15, `Total complaints counted: ${statsData.total}`);
    assert(statsData.byCategory?.length > 0, `Category groups returned: ${statsData.byCategory?.length}`);
    assert(statsData.byPriority?.length === 4, `4 Priority groups returned: Critical, High, Medium, Low`);

    // 9. Admin Updates Status & Reassigns Department (Protected)
    console.log('\n9. Testing Admin Status Update & Reassignment:');
    const updateRes = await fetch(`${baseUrl}/api/admin/complaints/${newId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${goodLoginData.token}`
      },
      body: JSON.stringify({
        status: 'In Progress',
        department: 'Rapid Emergency Power Grid Division',
        adminNotes: 'Field Crew Alpha deployed with emergency insulated lifters.',
        actionNote: 'Emergency isolation squad dispatched to de-energize feeder line.'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'Admin update returned 200');
    assert(updateData.complaint?.status === 'In Progress', 'Status updated to "In Progress"');
    assert(updateData.complaint?.department === 'Rapid Emergency Power Grid Division', 'Department reassigned');

    // 10. Verify Citizen Tracking View Reflects Real-Time History
    console.log('\n10. Testing Real-time Reflection on Citizen Stepper:');
    const verifyRes = await fetch(`${baseUrl}/api/complaints/${newTrackingId}`);
    const verifyData = await verifyRes.json();
    assert(verifyData.complaint?.status === 'In Progress', 'Citizen sees updated status "In Progress"');
    assert(verifyData.complaint?.statusHistory?.length === 2, 'History has 2 logged audit events');
    assert(
      verifyData.complaint?.statusHistory[1].note.includes('Emergency isolation squad'),
      'Admin action note visible in citizen history log'
    );

    // 11. Admin resolves the issue (Protected)
    console.log('\n11. Testing Full Resolution to "Resolved":');
    const resolveRes = await fetch(`${baseUrl}/api/admin/complaints/${newId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${goodLoginData.token}`
      },
      body: JSON.stringify({
        status: 'Resolved',
        actionNote: 'Conduit repaired, insulated, and tested safe. Hazard completely cleared.'
      })
    });
    const resolveData = await resolveRes.json();
    assert(resolveData.complaint?.status === 'Resolved', 'Status reached final "Resolved" state');
    assert(resolveData.complaint?.statusHistory?.length === 3, 'Status history now contains all 3 steps');

    console.log(`\n=================================================`);
    console.log(`🏁 TEST RESULTS: ${passed}/${total} assertions PASSED!`);
    console.log(`=================================================`);

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runEndToEndTest();
