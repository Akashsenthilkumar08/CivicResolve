import { predictCivicIssueWithDeBERTa } from './server/services/huggingface.js';
import { analyzeComplaint } from './server/services/gemini.js';
import { dbHelpers } from './server/database/db.js';

async function testMlIntegration() {
  console.log('🧪 Testing MoritzLaurer/mDeBERTa-v3-base-mnli-xnli integration...');

  const complaintText = `
    A huge pothole has formed near the main road.
    Several vehicles are struggling to pass.
    It may cause accidents.
  `;

  // 1. Test DeBERTa prediction
  const mlResult = await predictCivicIssueWithDeBERTa(complaintText);
  console.log('\n--- ML Prediction Result ---');
  console.log('Model:', mlResult.model);
  console.log('Category:', mlResult.categoryLabel);
  console.log('Standard Category:', mlResult.standardCategory);
  console.log('Confidence:', mlResult.confidence, `(${mlResult.confidencePercent}%)`);
  console.log('Assessed Priority:', mlResult.priority);
  console.log('Recommended Department:', mlResult.recommendedDepartment);

  if (!mlResult.categoryLabel || mlResult.confidence == null) {
    throw new Error('ML Prediction failed to return required fields');
  }

  // 2. Test Gemini Synthesis with ML predictions
  console.log('\n🧪 Testing Gemini synthesis with ML predictions...');
  const geminiResult = await analyzeComplaint({
    title: 'Huge pothole on main road',
    description: complaintText,
    location: '100 Feet Road, Indiranagar',
    userCategory: 'Auto-detect',
    mlPredictions: mlResult
  });

  console.log('\n--- Gemini Synthesis Result ---');
  console.log('Classified Category:', geminiResult.category);
  console.log('Priority:', geminiResult.priority);
  console.log('Priority Reason:', geminiResult.priority_reason);
  console.log('Gemini Explanation:', geminiResult.gemini_explanation);
  console.log('Recommended Actions:', geminiResult.recommended_actions);

  // 3. Test Database read for seeded ML fields
  const sample = dbHelpers.get('SELECT * FROM complaints LIMIT 1');
  console.log('\n--- Seeded DB Record ML Verification ---');
  console.log('Tracking ID:', sample.trackingId);
  console.log('ML Model:', sample.mlModel);
  console.log('ML Category:', sample.mlCategory);
  console.log('ML Confidence:', sample.mlConfidence);

  if (!sample.mlModel || !sample.mlCategory) {
    throw new Error('Database schema does not contain ML fields');
  }

  console.log('\n🎉 ALL ML INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

testMlIntegration().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
