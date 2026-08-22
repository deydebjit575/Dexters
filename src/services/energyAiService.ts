import { EnergyCheckInPayload, EnergyAIResponse, RecoveryAction, GoalAdjustment } from '../types/energy';

/**
 * AI Integration & Recovery Engine for Energy Check-in.
 * Evaluates user check-in data, current cognitive/physical feelings, and notes
 * to generate a tailored JSON recovery plan and goal adjustments.
 */
export async function analyzeEnergyCheckIn(
  payload: EnergyCheckInPayload,
  currentGoals: string[] = []
): Promise<EnergyAIResponse> {
  // Simulate network latency for realistic AI analysis experience
  await new Promise((resolve) => setTimeout(resolve, 800));

  const { energyLevel, feelingTags, note } = payload;

  const isLowEnergy = energyLevel <= 2;
  const hasFatigue = feelingTags.some((t) =>
    ['Brain Fog', 'Physical Fatigue', 'Stress', 'Anxious', 'Overwhelmed', 'Tired'].includes(t)
  );

  const triggerGentleMode = isLowEnergy || (energyLevel === 3 && hasFatigue);

  let energyStateLabel = '';
  if (energyLevel === 1) energyStateLabel = '🪫 Severely Drained & Depleted';
  else if (energyLevel === 2) energyStateLabel = '🥱 Low Energy / Fatigue Risk';
  else if (energyLevel === 3) energyStateLabel = '🔋 Moderate & Balanced';
  else if (energyLevel === 4) energyStateLabel = '⚡ Active & Focused';
  else energyStateLabel = '🔥 Peak Energy & High Output';

  // Build targeted recovery actions based on feeling tags
  const recoveryPlan: RecoveryAction[] = [];

  if (feelingTags.includes('Brain Fog') || energyLevel <= 2) {
    recoveryPlan.push({
      id: 'rec-1',
      task: 'Hydrate: Drink a full glass of cold water with electrolyte/lemon',
      duration: '2 mins',
      completed: false,
      category: 'hydration',
    });
    recoveryPlan.push({
      id: 'rec-2',
      task: '4-7-8 Guided Calming Breathwork for mental clarity',
      duration: '5 mins',
      completed: false,
      category: 'mindfulness',
    });
  }

  if (feelingTags.includes('Physical Fatigue') || feelingTags.includes('Tired') || energyLevel <= 2) {
    recoveryPlan.push({
      id: 'rec-3',
      task: 'Gentle neck & shoulder stretch (step away from screens)',
      duration: '5 mins',
      completed: false,
      category: 'movement',
    });
  }

  if (feelingTags.includes('Stress') || feelingTags.includes('Overwhelmed') || feelingTags.includes('Anxious')) {
    recoveryPlan.push({
      id: 'rec-4',
      task: '20-20-20 eye rest & restorative 10-min quiet sit',
      duration: '10 mins',
      completed: false,
      category: 'rest',
    });
  }

  // Ensure default micro-actions if plan is short
  if (recoveryPlan.length < 3) {
    recoveryPlan.push({
      id: 'rec-5',
      task: 'Nourish: Have a light protein snack or warm herbal tea',
      duration: '5 mins',
      completed: false,
      category: 'nutrition',
    });
  }

  // Build goal adjustments (defer complex/heavy tasks, keep essential ones)
  const defaultGoals = currentGoals.length > 0 ? currentGoals : [
    'Analyze complex medical record graphs',
    'Review prescription history & dosage',
    'Take evening prescribed medication',
    'Upload & process new lab documents',
    'Schedule upcoming specialist consultation',
  ];

  const goalAdjustments: GoalAdjustment[] = defaultGoals.map((goalTitle, idx) => {
    const isEssential =
      goalTitle.toLowerCase().includes('medication') ||
      goalTitle.toLowerCase().includes('emergency') ||
      goalTitle.toLowerCase().includes('prescription');

    if (triggerGentleMode && !isEssential) {
      return {
        id: `g-${idx}`,
        title: goalTitle,
        status: 'deferred',
        reason: 'Deferred to protect cognitive load during recovery mode.',
      };
    }

    if (triggerGentleMode && isEssential) {
      return {
        id: `g-${idx}`,
        title: goalTitle,
        status: 'essential',
        reason: 'High-priority critical task kept active.',
      };
    }

    return {
      id: `g-${idx}`,
      title: goalTitle,
      status: 'simplified',
      reason: 'Active and balanced for current energy level.',
    };
  });

  let insights = '';
  if (triggerGentleMode) {
    insights = `Based on your level ${energyLevel}/5 energy check-in (${feelingTags.join(', ')}), Gentle Mode has been activated. Non-essential dashboard widgets and high-stress analytics are hidden to protect your well-being. Focus on micro-recovery steps today.`;
  } else {
    insights = `You checked in at level ${energyLevel}/5 (${feelingTags.join(', ')}). You're in a good state to tackle your day! Remember to pace yourself and stay hydrated.`;
  }

  return {
    energy_state: energyStateLabel,
    trigger_gentle_mode: triggerGentleMode,
    recovery_plan: recoveryPlan,
    goal_adjustments: goalAdjustments,
    insights,
  };
}
