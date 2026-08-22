import {
  analyzeEnergyCheckIn,
  validateAndSanitizeAIResponse,
} from '../services/energyAiService';
import { EnergyCheckInPayload } from '../types/energy';

/**
 * Lightweight Test Runner Suite for Wellness Recovery & Safety Triage
 */
export async function runWellnessRecoveryUnitTests() {
  console.log('🧪 Running Wellness Recovery & Triage Unit Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  }

  // Test 1: High Risk Safety Phrase -> Triage Mode with 112 routing
  const triagePayload: EnergyCheckInPayload = {
    energyLevel: 1,
    stressLevel: 5,
    feelingTags: ['Overwhelmed'],
    note: 'Exams and pressure are too high. I feel overwhelmed and I am not safe right now.',
    timestamp: new Date().toISOString(),
  };

  const triageResponse = await analyzeEnergyCheckIn(triagePayload);
  assert(triageResponse.mode === 'triage', 'Safety phrase triggers triage mode classification');
  assert(triageResponse.safety_level === 'urgent', 'Triage mode sets safety_level to urgent');
  assert(triageResponse.goal_adjustments.activity_target_percent === 0, 'Triage mode sets activity target percent to 0%');
  assert(triageResponse.reasons.some(r => r.includes('112')), 'Triage reasons explicitly cite Dial 112 emergency routing');

  // Test 2: Headache Specific Analysis & Precautions
  const headachePayload: EnergyCheckInPayload = {
    energyLevel: 2,
    stressLevel: 4,
    physicalDiscomfort: true,
    discomfortType: 'Headache',
    feelingTags: ['Brain Fog', 'Physical Fatigue'],
    note: 'Severe headache and eye throbbing from screen work.',
    timestamp: new Date().toISOString(),
  };

  const headacheResponse = await analyzeEnergyCheckIn(headachePayload);
  assert(headacheResponse.mode === 'recovery', 'Headache triggers recovery mode');
  assert(headacheResponse.plan[0].title.includes('Dim Lights') || headacheResponse.plan[0].title.includes('Decompression'), 'Generates headache-specific eye decompression step');
  assert(headacheResponse.plan[1].title.includes('Hydration'), 'Generates vascular hydration step');
  assert(headacheResponse.plan[2].title.includes('Massage'), 'Generates temple & suboccipital massage step');

  // Test 3: Stomach / Nausea Specific Analysis & Precautions
  const stomachPayload: EnergyCheckInPayload = {
    energyLevel: 2,
    stressLevel: 3,
    physicalDiscomfort: true,
    discomfortType: 'Nausea / Stomach',
    feelingTags: ['Physical Fatigue'],
    note: 'Having acute stomach cramps and nausea.',
    timestamp: new Date().toISOString(),
  };

  const stomachResponse = await analyzeEnergyCheckIn(stomachPayload);
  assert(stomachResponse.plan[0].title.includes('Upright') || stomachResponse.plan[0].title.includes('Left-Side'), 'Generates GI-specific posture step');
  assert(stomachResponse.plan[1].title.includes('Warm Fluid'), 'Generates warm hydration step for stomach');

  // Test 4: Normal High Energy -> Normal Mode with 100% Target
  const normalPayload: EnergyCheckInPayload = {
    energyLevel: 5,
    stressLevel: 1,
    physicalDiscomfort: false,
    feelingTags: ['Focused', 'Rested'],
    note: 'Slept 8 hours, morning coffee done, ready for the day!',
    timestamp: new Date().toISOString(),
  };

  const normalResponse = await analyzeEnergyCheckIn(normalPayload);
  assert(normalResponse.mode === 'normal', 'High energy & low stress triggers normal mode');
  assert(normalResponse.goal_adjustments.activity_target_percent === 100, 'Normal mode maintains 100% target');

  // Test 5: Invalid AI Response Fallback Protection
  const invalidRawResponse = {
    mode: 'INVALID_UNKNOWN_MODE',
    energy_level: 'not a number',
    plan: 'broken non-array string',
  };

  const fallbackResult = validateAndSanitizeAIResponse(invalidRawResponse, headachePayload);
  assert(fallbackResult.mode === 'recovery', 'Invalid AI response falls back safely to recovery mode');
  assert(Array.isArray(fallbackResult.plan) && fallbackResult.plan.length === 3, 'Fallback generates 3 valid problem-specific plan steps');

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

// Auto-run unit test suite
runWellnessRecoveryUnitTests();
