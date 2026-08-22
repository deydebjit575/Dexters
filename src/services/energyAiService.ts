import {
  EnergyCheckInPayload,
  AIWellnessResponse,
  AIPlanStep,
  WellnessMode,
  SafetyLevel,
  RecommendationExplanation,
  WellnessPlan10Min,
  WellnessPlanStep10Min,
  WellnessRecord,
} from '../types/energy';

const HIGH_RISK_SAFETY_PHRASES = [
  'i am not safe',
  'hurt myself',
  'want to die',
  'suicide',
  'end it all',
  'kill myself',
  'hurt someone',
  'self harm',
  'can\'t go on',
  'chest pain',
  'cannot breathe',
  'passing out',
  'severe bleeding',
];

const URGENT_SYMPTOM_PHRASES = [
  'chest tightness',
  'chest pain',
  'shortness of breath',
  'breathless',
  'fainting',
  'loss of consciousness',
  'severe dizziness',
];

/**
 * Generates an empathetic, understandable, non-diagnostic explanation
 * for why a specific recommendation was selected.
 */
export function generateRecommendationExplanation(
  payload: EnergyCheckInPayload,
  plan: AIPlanStep[],
  safetyLevel: SafetyLevel
): RecommendationExplanation {
  const energyStr = `Energy score ${payload.energyLevel}/5`;
  const stressStr = `Stress score ${payload.stressLevel || 3}/5`;
  const symptomList = payload.symptoms && payload.symptoms.length > 0
    ? payload.symptoms.join(', ')
    : payload.discomfortType || 'No acute physical symptoms reported';
  
  const userInputsSummary = `${energyStr}, ${stressStr}. Selected symptoms: "${symptomList}". ${payload.note ? `Note: "${payload.note.substring(0, 50)}..."` : ''}`.trim();

  let whySelected = '';
  if (safetyLevel === 'urgent' || (payload.stressLevel || 1) >= 5) {
    whySelected = 'Because your inputs indicated severe stress or concerning symptoms, the system immediately prioritized high-safety decompression, crisis escalation, and urgent emergency support options.';
  } else if (payload.energyLevel <= 2 && (payload.stressLevel || 3) >= 4) {
    whySelected = 'You indicated high stress paired with low energy. The system selected a combination of guided breathing, light rest, and hydration to reduce nervous system tension without causing physical fatigue.';
  } else if (symptomList.toLowerCase().includes('headache')) {
    whySelected = 'Optic pressure & headache symptoms were selected. The system prioritized screen-free rest, suboccipital muscle relaxation, and hydration to relieve head pressure.';
  } else if (symptomList.toLowerCase().includes('nausea') || symptomList.toLowerCase().includes('stomach')) {
    whySelected = 'Gastrointestinal discomfort was selected. The system chose upright rest positioning, peppermint/ginger hydration, and abdominal breathing to calm vagus nerve reflexes.';
  } else if (payload.energyLevel >= 4 && (payload.stressLevel || 3) <= 2) {
    whySelected = 'You reported high energy and low stress! The system selected light wellness maintenance and focus-reset micro-actions to keep your body balanced.';
  } else {
    whySelected = 'Based on your overall energy score, stress score, and symptoms, the system selected a balanced combination of breathing, hydration, and short rest breaks.';
  }

  const whatItSupports = 'This activity is intended to lower acute sympathetic nervous system stress, support muscular fascia relaxation, rehydrate cells, and give your mind a structured 3-minute pause.';

  const whenToSeekMedicalHelp = 'If you experience severe or unremitting chest pain, sudden difficulty breathing, high fever, sudden vision changes, severe weakness, or any unexpected worsening symptoms, please contact emergency services (112 / 988) or consult a medical professional immediately. This application provides general wellness guidance only and does NOT replace professional medical advice or diagnosis.';

  return {
    userInputsSummary,
    whySelected,
    whatItSupports,
    whenToSeekMedicalHelp,
  };
}

/**
 * Generates an adaptable 10-Minute Personalized Wellness Plan
 */
export function generate10MinWellnessPlan(
  payload: EnergyCheckInPayload,
  plan: AIPlanStep[]
): WellnessPlan10Min {
  const isHighStress = (payload.stressLevel || 3) >= 4;
  const isLowEnergy = payload.energyLevel <= 2;
  const symptomText = (payload.symptoms || []).join(' ').toLowerCase() + ' ' + (payload.discomfortType || '').toLowerCase();

  const steps: WellnessPlanStep10Min[] = [
    {
      title: isHighStress ? '3 min guided breathing' : '3 min mindful respiration',
      durationMinutes: 3,
      type: 'breathing',
      description: 'Slow diaphragmatic breathing (4s inhale, 6s exhale) to steady your heart rate.',
      completed: false,
    },
    {
      title: '2 min hydration/rest reminder',
      durationMinutes: 2,
      type: 'hydration',
      description: 'Sip 250ml water slowly with electrolytes and step back from screens.',
      completed: false,
    },
    {
      title: symptomText.includes('headache')
        ? '3 min optic relaxation activity'
        : symptomText.includes('muscle')
        ? '3 min gentle muscle stretch'
        : '3 min relaxation activity',
      durationMinutes: 3,
      type: 'gentle_movement',
      description: 'Perform light neck/shoulder stretches or close eyes gently in a dim room.',
      completed: false,
    },
    {
      title: '2 min reflection',
      durationMinutes: 2,
      type: 'reflection',
      description: 'Pause to note your current feeling and acknowledge taking time for your health.',
      completed: false,
    },
  ];

  return {
    title: 'YOUR 10-MINUTE WELLNESS PLAN',
    totalDurationMinutes: 10,
    steps,
  };
}

/**
 * Generates a simple, understandable wellness insight based on recent history
 */
export function generateWellnessTrendInsight(pastRecords: WellnessRecord[]): string {
  if (!pastRecords || pastRecords.length === 0) {
    return 'Welcome to your AI Health Trend Dashboard! Complete your daily check-in to track energy and stress trends over time.';
  }

  if (pastRecords.length < 2) {
    return `Logged ${pastRecords.length} wellness assessment so far. Continue checking in daily to generate weekly trends and insights.`;
  }

  const recent = pastRecords.slice(0, 5);
  const latestStress = recent[0].stressLevel;
  const prevStress = recent[1]?.stressLevel || latestStress;
  const oldestStress = recent[recent.length - 1].stressLevel;

  const latestEnergy = recent[0].energyLevel;
  const prevEnergy = recent[1]?.energyLevel || latestEnergy;

  if (recent.length >= 3 && recent[0].stressLevel > recent[1].stressLevel && recent[1].stressLevel > recent[2].stressLevel) {
    return 'Your stress level has increased over the last 3 assessments. We recommend taking extra 3-minute relaxation breaks today.';
  }

  if (recent.length >= 3 && recent[0].stressLevel < recent[1].stressLevel && recent[1].stressLevel < recent[2].stressLevel) {
    return 'Your stress level has decreased over your last 3 assessments! Excellent progress on your wellness balance.';
  }

  if (latestEnergy > prevEnergy) {
    return 'Your energy level has improved since your last assessment. Rest and proper hydration are supporting your recovery.';
  }

  if (latestStress >= 4) {
    return 'Elevated stress levels detected across recent check-ins. Remember your daily targets are lowered during recovery mode.';
  }

  return 'Your energy and stress trends remain steady. Maintaining balanced hydration and sleep will keep your momentum strong.';
}

/**
 * Primary AI Analysis Service
 */
export async function analyzeEnergyCheckIn(
  payload: EnergyCheckInPayload,
  currentGoals: string[] = [],
  pastRecords: WellnessRecord[] = []
): Promise<AIWellnessResponse> {
  // Simulate network processing delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const noteLower = (payload.note || '').toLowerCase();
  const discomfortLower = (payload.discomfortType || '').toLowerCase();
  const symptomsJoined = (payload.symptoms || []).join(' ').toLowerCase();

  const combinedText = `${noteLower} ${discomfortLower} ${symptomsJoined}`;

  // 1. Immediate Safety Triage Check for High Risk Phrases or Urgent Symptoms
  const hasHighRiskPhrase = HIGH_RISK_SAFETY_PHRASES.some((phrase) => combinedText.includes(phrase));
  const hasUrgentSymptom = URGENT_SYMPTOM_PHRASES.some((phrase) => combinedText.includes(phrase));

  if (hasHighRiskPhrase || (hasUrgentSymptom && (payload.stressLevel || 1) >= 4)) {
    const warningText = 'Your symptoms may require urgent medical attention. Please contact emergency services or seek help from a qualified medical professional.';

    const explanation: RecommendationExplanation = {
      userInputsSummary: `Energy ${payload.energyLevel}/5, Stress ${payload.stressLevel}/5. Urgent input: "${payload.discomfortType || payload.symptoms?.join(', ') || payload.note}"`,
      whySelected: 'Urgent risk indicators detected in check-in inputs. Immediate crisis safety escalation initiated.',
      whatItSupports: 'Prioritizes immediate user safety, direct emergency contact access, and pauses non-essential notifications.',
      whenToSeekMedicalHelp: 'SEEK IMMEDIATE EMERGENCY MEDICAL CARE. Call 112 or 988 immediately if you experience severe chest pain, shortness of breath, or safety risk.',
    };

    const plan10min = generate10MinWellnessPlan(payload, []);

    return {
      mode: 'triage',
      energy_level: payload.energyLevel,
      stress_level: 5,
      physical_discomfort: true,
      discomfort_details: payload.discomfortType || 'Urgent Symptoms',
      symptoms: payload.symptoms || ['Urgent Attention Needed'],
      confidence: 0.99,
      reasons: [
        'Urgent safety indicator detected in wellness check-in.',
        warningText,
      ],
      plan: [],
      goal_adjustments: {
        activity_target_percent: 0,
        protect_streak: true,
        duration_hours: 48,
      },
      safety_level: 'urgent',
      forecast_energy_label: 'Safety Escalation: Paused daily targets to prioritize immediate support.',
      explanation,
      wellness_plan_10min: plan10min,
      urgent_warning: warningText,
    };
  }

  // 2. Classify Mode & generate problem-specific precautions
  const problemAnalysis = generateProblemSpecificPlan(payload);

  const isSymptomatic =
    payload.physicalDiscomfort ||
    (payload.symptoms && payload.symptoms.length > 0 && !payload.symptoms.includes('None')) ||
    combinedText.includes('headache') ||
    combinedText.includes('sick') ||
    combinedText.includes('nausea') ||
    combinedText.includes('pain') ||
    combinedText.includes('stomach') ||
    combinedText.includes('cramp') ||
    combinedText.includes('fever') ||
    combinedText.includes('chest') ||
    combinedText.includes('insomnia');

  const isLowEnergy = payload.energyLevel <= 2;
  const isHighStress = (payload.stressLevel || 1) >= 4;

  let mode: WellnessMode = 'normal';
  const reasons: string[] = [problemAnalysis.insights];

  if (isSymptomatic || (isLowEnergy && isHighStress) || isLowEnergy || isHighStress) {
    mode = 'recovery';
    if (isSymptomatic) {
      const sympName = payload.symptoms?.length ? payload.symptoms.join(', ') : payload.discomfortType || 'Body Discomfort';
      reasons.push(`Physical symptom detected: ${sympName}.`);
    }
    if (isLowEnergy) reasons.push(`Low energy reserves (${payload.energyLevel}/5).`);
    if (isHighStress) reasons.push(`Elevated stress levels (${payload.stressLevel}/5).`);
    reasons.push('Switched to Recovery Mode to lower cognitive load.');
  } else if (payload.energyLevel === 3 || (payload.stressLevel || 1) === 3) {
    mode = 'light';
    reasons.push('Moderate energy/stress detected. Switched to Light Mode (70% target).');
  } else {
    mode = 'normal';
    reasons.push('Energy and stress levels are balanced. Normal mode maintained.');
  }

  const safety_level: SafetyLevel = mode === 'recovery' && isHighStress ? 'monitor' : 'none';

  const explanation = generateRecommendationExplanation(payload, problemAnalysis.plan, safety_level);
  const plan10min = generate10MinWellnessPlan(payload, problemAnalysis.plan);

  const rawResponse: AIWellnessResponse = {
    mode,
    energy_level: payload.energyLevel,
    stress_level: payload.stressLevel || 2,
    physical_discomfort: !!payload.physicalDiscomfort,
    discomfort_details: payload.discomfortType,
    symptoms: payload.symptoms || (payload.discomfortType ? [payload.discomfortType] : []),
    confidence: 0.95,
    reasons,
    plan: problemAnalysis.plan,
    goal_adjustments: {
      activity_target_percent: mode === 'recovery' ? 25 : mode === 'light' ? 70 : 100,
      protect_streak: mode === 'recovery' || mode === 'light',
      duration_hours: 24,
    },
    safety_level,
    forecast_energy_label: `AI Estimate: Tailored precautions for ${problemAnalysis.problemTitle}`,
    explanation,
    wellness_plan_10min: plan10min,
  };

  return validateAndSanitizeAIResponse(rawResponse, payload);
}

/**
 * Validates raw JSON object against AIWellnessResponse schema.
 * Returns safe fallback response if structure is invalid.
 */
export function validateAndSanitizeAIResponse(
  raw: any,
  payload: EnergyCheckInPayload
): AIWellnessResponse {
  try {
    const validModes: WellnessMode[] = ['normal', 'light', 'recovery', 'triage'];
    const mode = validModes.includes(raw?.mode) ? raw.mode : 'recovery';

    const energy_level =
      typeof raw?.energy_level === 'number' && raw.energy_level >= 1 && raw.energy_level <= 5
        ? raw.energy_level
        : payload.energyLevel;

    const stress_level =
      typeof raw?.stress_level === 'number' && raw.stress_level >= 1 && raw.stress_level <= 5
        ? raw.stress_level
        : payload.stressLevel || 3;

    const physical_discomfort =
      typeof raw?.physical_discomfort === 'boolean'
        ? raw.physical_discomfort
        : !!payload.physicalDiscomfort;

    const confidence = typeof raw?.confidence === 'number' ? raw.confidence : 0.95;
    const problemAnalysis = generateProblemSpecificPlan(payload);

    const reasons = Array.isArray(raw?.reasons) && raw.reasons.length > 0 ? raw.reasons : [problemAnalysis.insights];

    let plan: AIPlanStep[] = [];
    if (Array.isArray(raw?.plan) && raw.plan.length >= 3) {
      plan = raw.plan.slice(0, 3).map((step: any, idx: number) => ({
        title: step.title || `Recovery Step ${idx + 1}`,
        description: step.description || 'Focus gently on your well-being.',
        duration_seconds: typeof step.duration_seconds === 'number' ? step.duration_seconds : 60,
        type: step.type || (idx === 0 ? 'breathing' : idx === 1 ? 'hydration' : 'rest'),
      }));
    } else {
      plan = problemAnalysis.plan;
    }

    const activity_target_percent =
      typeof raw?.goal_adjustments?.activity_target_percent === 'number'
        ? raw.goal_adjustments.activity_target_percent
        : mode === 'triage'
        ? 0
        : mode === 'recovery'
        ? 25
        : mode === 'light'
        ? 70
        : 100;

    const protect_streak =
      typeof raw?.goal_adjustments?.protect_streak === 'boolean'
        ? raw.goal_adjustments.protect_streak
        : mode === 'recovery' || mode === 'light' || mode === 'triage';

    const duration_hours =
      typeof raw?.goal_adjustments?.duration_hours === 'number'
        ? raw.goal_adjustments.duration_hours
        : 24;

    const safety_level: SafetyLevel =
      ['none', 'monitor', 'urgent'].includes(raw?.safety_level)
        ? raw.safety_level
        : mode === 'triage'
        ? 'urgent'
        : 'none';

    const explanation = raw?.explanation || generateRecommendationExplanation(payload, plan, safety_level);
    const plan10min = raw?.wellness_plan_10min || generate10MinWellnessPlan(payload, plan);

    return {
      mode,
      energy_level,
      stress_level,
      physical_discomfort,
      discomfort_details: payload.discomfortType || raw?.discomfort_details,
      symptoms: payload.symptoms || (payload.discomfortType ? [payload.discomfortType] : []),
      confidence,
      reasons,
      plan,
      goal_adjustments: {
        activity_target_percent,
        protect_streak,
        duration_hours,
      },
      safety_level,
      forecast_energy_label: `AI Estimate: Tailored 3-min plan for ${problemAnalysis.problemTitle}`,
      explanation,
      wellness_plan_10min: plan10min,
      urgent_warning: raw?.urgent_warning,
    };
  } catch (e) {
    console.warn('AI Response validation failed. Executing safe fallback plan.', e);
    return generateSafeFallbackResponse(payload);
  }
}

function generateSafeFallbackResponse(payload: EnergyCheckInPayload): AIWellnessResponse {
  const isLowEnergy = payload.energyLevel <= 2;
  const isHighStress = (payload.stressLevel || 3) >= 4;

  const mode: WellnessMode = isLowEnergy || isHighStress || payload.physicalDiscomfort ? 'recovery' : 'normal';
  const problemAnalysis = generateProblemSpecificPlan(payload);
  const safety_level: SafetyLevel = 'none';

  const explanation = generateRecommendationExplanation(payload, problemAnalysis.plan, safety_level);
  const plan10min = generate10MinWellnessPlan(payload, problemAnalysis.plan);

  return {
    mode,
    energy_level: payload.energyLevel,
    stress_level: payload.stressLevel || 3,
    physical_discomfort: !!payload.physicalDiscomfort,
    discomfort_details: payload.discomfortType,
    symptoms: payload.symptoms || (payload.discomfortType ? [payload.discomfortType] : []),
    confidence: 0.95,
    reasons: [problemAnalysis.insights],
    plan: problemAnalysis.plan,
    goal_adjustments: {
      activity_target_percent: mode === 'recovery' ? 25 : 100,
      protect_streak: mode === 'recovery',
      duration_hours: 24,
    },
    safety_level,
    forecast_energy_label: `AI Estimate: Tailored precautions for ${problemAnalysis.problemTitle}`,
    explanation,
    wellness_plan_10min: plan10min,
  };
}

export function generateProblemSpecificPlan(payload: EnergyCheckInPayload): {
  plan: AIPlanStep[];
  problemTitle: string;
  insights: string;
} {
  const noteLower = (payload.note || '').toLowerCase();
  const discomfort = (payload.discomfortType || '').toLowerCase();
  const tags = payload.feelingTags.map((t) => t.toLowerCase());

  // 1. CHEST TIGHTNESS / RESPIRATION PRESSURE / ANXIETY BREATHING
  if (
    discomfort.includes('chest') ||
    noteLower.includes('chest') ||
    noteLower.includes('tightness') ||
    noteLower.includes('breathless') ||
    noteLower.includes('shortness of breath') ||
    noteLower.includes('heavy chest')
  ) {
    return {
      problemTitle: 'Chest Tightness & Respiration Strain',
      insights: 'AI Analysis: Detected chest tightness & breathing strain. Recovery plan prioritizes slow 4-7-8 diaphragmatic chest release, posture un-slouching, and calm warm fluids.',
      plan: [
        {
          title: 'Torso Un-slouching & Chest Expansion',
          description: 'Sit upright with back supported and shoulders back to open intercostal muscles and expand ribcage capacity.',
          duration_seconds: 60,
          type: 'rest',
        },
        {
          title: '4-7-8 Diaphragmatic Respiration',
          description: 'Inhale through nose for 4s, hold gently for 7s, and exhale through pursed lips for 8s to calm chest nerves.',
          duration_seconds: 60,
          type: 'breathing',
        },
        {
          title: 'Warm Fluid Sip & Torso Decompression',
          description: 'Sip warm water slowly to soothe vagus nerve reflex and relax tight pectoral muscle fascia.',
          duration_seconds: 60,
          type: 'hydration',
        },
      ],
    };
  }

  // 2. MUSCLE PAIN / PHYSICAL SORENESS / MUSCULOSKELETAL ACHE
  if (
    discomfort.includes('muscle') ||
    noteLower.includes('muscle') ||
    noteLower.includes('sore') ||
    noteLower.includes('ache') ||
    noteLower.includes('backache') ||
    noteLower.includes('spasm') ||
    noteLower.includes('body pain') ||
    noteLower.includes('workout')
  ) {
    return {
      problemTitle: 'Musculoskeletal Soreness & Muscle Spasm',
      insights: 'AI Analysis: Detected acute muscle pain & bodily soreness. Recovery plan provides gentle static fascia stretching, mineral hydration, and limb elevation.',
      plan: [
        {
          title: 'Gentle Static Fascia Stretch',
          description: 'Extend arms, hamstrings, and gentle neck side stretches without bouncing to lengthen constricted muscular fascia.',
          duration_seconds: 60,
          type: 'gentle_movement',
        },
        {
          title: 'Mineral & Magnesium Hydration Pause',
          description: 'Drink 300ml cold water with a pinch of electrolytes/magnesium to flush lactic acid from muscle tissue.',
          duration_seconds: 60,
          type: 'hydration',
        },
        {
          title: 'Elevated Muscular Rest & Release',
          description: 'Sit in a comfortable chair, elevate legs slightly on a footrest, and focus on dropping lower back tension.',
          duration_seconds: 60,
          type: 'rest',
        },
      ],
    };
  }

  // 3. NAUSEA / STOMACH DISTRESS / ACIDITY / GI CRAMPS
  if (
    discomfort.includes('nausea') ||
    discomfort.includes('stomach') ||
    noteLower.includes('stomach') ||
    noteLower.includes('nausea') ||
    noteLower.includes('cramp') ||
    noteLower.includes('acidity') ||
    noteLower.includes('vomit') ||
    noteLower.includes('indigestion')
  ) {
    return {
      problemTitle: 'Acute Nausea & Gastrointestinal Relief',
      insights: 'AI Analysis: Detected nausea & GI upset. Recovery plan focuses on left-side/upright rest positioning, peppermint/ginger hydration, and abdominal breathing.',
      plan: [
        {
          title: 'Upright / Left-Side Rest Positioning',
          description: 'Sit in a supportive upright chair or rest on your left side to minimize gastrointestinal reflux & abdominal pressure.',
          duration_seconds: 60,
          type: 'rest',
        },
        {
          title: 'Warm Peppermint or Ginger Fluid Sip',
          description: 'Sip warm water or peppermint/ginger tea in small slow sips; avoid cold carbonated or acidic beverages.',
          duration_seconds: 60,
          type: 'hydration',
        },
        {
          title: 'Diaphragmatic Abdominal Breathing',
          description: 'Inhale gently into your belly without tight waistbands; exhale slowly for 6s to relax hyperactive GI tract nerves.',
          duration_seconds: 60,
          type: 'breathing',
        },
      ],
    };
  }

  // 4. GENERAL SICKNESS / FEVER / COLD & FLU
  if (
    discomfort.includes('sickness') ||
    discomfort.includes('general') ||
    noteLower.includes('sick') ||
    noteLower.includes('fever') ||
    noteLower.includes('cold') ||
    noteLower.includes('flu') ||
    noteLower.includes('chills') ||
    noteLower.includes('unwell')
  ) {
    return {
      problemTitle: 'General Illness & Fever Recovery',
      insights: 'AI Analysis: Detected general sickness & fever symptoms. Recovery plan enforces complete physical pause, thermal blanket rest, and high electrolyte fluid intake.',
      plan: [
        {
          title: 'Thermal Blanket Rest & Complete Physical Pause',
          description: 'Wrap in a comfortable blanket in a quiet room; pause all demanding physical and cognitive tasks completely.',
          duration_seconds: 60,
          type: 'rest',
        },
        {
          title: 'High Electrolyte & Vitamin Hydration',
          description: 'Sip 300ml electrolyte water or warm broth to replace lost fluids & support natural immune recovery.',
          duration_seconds: 60,
          type: 'hydration',
        },
        {
          title: 'Cool Forehead & Neck Thermal Compress',
          description: 'Apply a damp cool cloth to your forehead or back of neck to assist natural thermal body regulation.',
          duration_seconds: 60,
          type: 'rest',
        },
      ],
    };
  }

  // 5. HEADACHE / MIGRAINE / OPTIC PRESSURE
  if (
    discomfort.includes('headache') ||
    noteLower.includes('headache') ||
    noteLower.includes('head ache') ||
    noteLower.includes('migraine') ||
    noteLower.includes('throbbing head')
  ) {
    return {
      problemTitle: 'Headache & Optic Pressure Relief',
      insights: 'AI Analysis: Detected acute headache / migraine symptoms. Recovery plan focuses on optic decompression, temple massage, and vascular hydration.',
      plan: [
        {
          title: 'Dim Lights & Optic Decompression',
          description: 'Step into a quiet, dim room. Gently press cool palms over closed eyes for 60s to reduce optic nerve glare.',
          duration_seconds: 60,
          type: 'rest',
        },
        {
          title: 'Vascular Hydration Pause',
          description: 'Sip 250ml cool water slowly with lemon or electrolytes to ease vascular head constriction.',
          duration_seconds: 60,
          type: 'hydration',
        },
        {
          title: 'Suboccipital & Temple Massage',
          description: 'Apply gentle circular thumb pressure to your temples and the base of your skull to release muscle tension.',
          duration_seconds: 60,
          type: 'breathing',
        },
      ],
    };
  }

  // 6. EXAM STRESS / TEST ANXIETY / DEADLINE PANIC
  if (
    tags.includes('exam stress') ||
    tags.includes('overwhelmed') ||
    tags.includes('anxious') ||
    noteLower.includes('exam') ||
    noteLower.includes('test') ||
    noteLower.includes('study') ||
    noteLower.includes('deadline') ||
    noteLower.includes('panic') ||
    noteLower.includes('overwhelmed')
  ) {
    return {
      problemTitle: 'Acute Exam & Cognitive Overwhelm',
      insights: 'AI Analysis: Detected high exam / deadline stress. Recovery plan provides 4-4-4 box breathing, single-task isolation, and jaw tension release.',
      plan: [
        {
          title: '4-4-4 Box Breathing Decompression',
          description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s to deactivate fight-or-flight sympathetic nervous system panic.',
          duration_seconds: 60,
          type: 'breathing',
        },
        {
          title: 'Cognitive Dump & Task Isolation',
          description: 'Write down the SINGLE most urgent step for your exam/task; defer all non-essential backlog items for 24h.',
          duration_seconds: 60,
          type: 'focus_reset',
        },
        {
          title: 'Jaw & Shoulder Tension Release',
          description: 'Drop your shoulders, unclench your teeth, and sip water to restore steady oxygen flow to the cerebral cortex.',
          duration_seconds: 60,
          type: 'hydration',
        },
      ],
    };
  }

  // 7. INSOMNIA / SLEEP DEPRIVATION / EXHAUSTION
  if (
    tags.includes('tired') ||
    tags.includes('brain fog') ||
    noteLower.includes('sleep') ||
    noteLower.includes('slept') ||
    noteLower.includes('insomnia') ||
    noteLower.includes('exhausted') ||
    noteLower.includes('all-nighter')
  ) {
    return {
      problemTitle: 'Sleep Deprivation & Severe Fatigue',
      insights: 'AI Analysis: Detected sleep deficit & exhaustion. Recovery plan applies 4-7-8 parasympathetic rest breathing and facial cool hydration.',
      plan: [
        {
          title: '4-7-8 Parasympathetic Rest Breathing',
          description: 'Inhale 4s, hold 7s, exhale 8s to signal your central nervous system that it is safe to rest and lower adrenaline.',
          duration_seconds: 60,
          type: 'breathing',
        },
        {
          title: 'Hydration & Facial Cool Reset',
          description: 'Sip room-temperature water. Wash your face with cool water to refresh fatigued nerve endings.',
          duration_seconds: 60,
          type: 'hydration',
        },
        {
          title: 'Progressive Muscular Relaxation',
          description: 'Tense and relax your facial muscles, neck, and shoulders to release accumulated physical fatigue.',
          duration_seconds: 60,
          type: 'rest',
        },
      ],
    };
  }

  // 8. EYE STRAIN / SCREEN BURNOUT
  if (
    tags.includes('brain fog') ||
    noteLower.includes('eye') ||
    noteLower.includes('screen') ||
    noteLower.includes('vision') ||
    noteLower.includes('blurry')
  ) {
    return {
      problemTitle: 'Optic Eye Strain & Screen Burnout',
      insights: 'AI Analysis: Detected eye strain & screen fatigue. Recovery plan focuses on 20-20-20 optic decompression and eye lubrication.',
      plan: [
        {
          title: '20-20-20 Optic Decompression',
          description: 'Look at a far object 20 feet away for 20 seconds; then gently cup warm palms over eyes without pressing.',
          duration_seconds: 60,
          type: 'rest',
        },
        {
          title: 'Hydration & Blinking Exercise',
          description: 'Sip water and perform 10 slow, deliberate blinks to rehydrate the corneal surface.',
          duration_seconds: 60,
          type: 'hydration',
        },
        {
          title: 'Cervical Neck Stretch',
          description: 'Tilt head right for 15s, left for 15s, and tuck chin gently to release optic nerve trapezius tension.',
          duration_seconds: 60,
          type: 'gentle_movement',
        },
      ],
    };
  }

  // Default tailored plan
  return {
    problemTitle: 'General Wellness Decompression',
    insights: 'AI Analysis: Analyzed check-in parameters. Recovery plan provides tailored diaphragmatic breathing, hydration, and shoulder release.',
    plan: [
      {
        title: 'Deep Mind & Body Breathwork',
        description: 'Slow diaphragmatic breathing (4s in, 6s out) to lower acute stress and restore focus.',
        duration_seconds: 60,
        type: 'breathing',
      },
      {
        title: 'Hydration & Mindful Pause',
        description: 'Drink a glass of water slowly. Step away from high-stimulus screens.',
        duration_seconds: 60,
        type: 'hydration',
      },
      {
        title: 'Shoulder & Jaw Release',
        description: 'Roll shoulders back 5 times, unclench your jaw, and choose 1 small next step.',
        duration_seconds: 60,
        type: 'rest',
      },
    ],
  };
}


