const assert = require('assert');
const aiService = require('../src/services/ai.service');

async function testAIService() {
  console.log('==============================================');
  console.log(' Starting CivicTrack AI Diagnostic Test Suite ');
  console.log('==============================================\n');

  // Test 1: Pothole detection & critical priority check
  const res1 = await aiService.analyzeComplaint(
    'There is a dangerous pothole on the asphalt main street causing accidents.', 
    'pothole.png', 
    37.7, 
    -122.4
  );
  assert.strictEqual(res1.category, 'Pothole');
  assert.strictEqual(res1.severity, 'High');
  assert.strictEqual(res1.priority, 'Critical');
  console.log('✔ Test 1: High Severity Pothole -> Critical Priority passed.');

  // Test 2: Broken Streetlight detection
  const res2 = await aiService.analyzeComplaint(
    'The lamp post is completely dark on the corner block.', 
    'light.jpg', 
    37.7, 
    -122.4
  );
  assert.strictEqual(res2.category, 'Broken Streetlight');
  assert.strictEqual(res2.severity, 'Medium');
  assert.strictEqual(res2.priority, 'Medium');
  console.log('✔ Test 2: Broken Streetlight -> Medium Severity passed.');

  // Test 3: Minor Water Leakage
  const res3 = await aiService.analyzeComplaint(
    'A tiny water leak from the pipe near the lawn, cosmetic issue.', 
    'leak.jpg', 
    37.7, 
    -122.4
  );
  assert.strictEqual(res3.category, 'Water Leakage');
  assert.strictEqual(res3.severity, 'Low');
  assert.strictEqual(res3.priority, 'Low');
  console.log('✔ Test 3: Minor Water Leak -> Low Priority passed.');

  console.log('\n==============================================');
  console.log('   All AI Diagnostic assertions passed!      ');
  console.log('==============================================');
}

testAIService().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
