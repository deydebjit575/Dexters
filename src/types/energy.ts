export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type StressLevel = 1 | 2 | 3 | 4 | 5;
export type WellnessMode = 'normal' | 'light' | 'recovery' | 'triage';
export type SafetyLevel = 'none' | 'monitor' | 'urgent';

export type ActivityStepType =
  | 'breathing'
  | 'hydration'
  | 'rest'
  | 'gentle_movement'
  | 'grounding'
  | 'focus_reset';

export interface AIPlanStep {
  title: string;
  description: string;
  duration_seconds: number; // typically 60s each
  type: ActivityStepType;
}

export interface GoalAdjustments {
  activity_target_percent: number; // e.g. 100 for normal, 70 for light, 25 for recovery, 0 for triage
  protect_streak: boolean;
  duration_hours: number;
  original_target?: number;
  new_target?: number;
}

export interface AIWellnessResponse {
  mode: WellnessMode;
  energy_level: EnergyLevel;
  stress_level: StressLevel;
  physical_discomfort: boolean;
  discomfort_details?: string;
  confidence: number;
  reasons: string[];
  plan: AIPlanStep[];
  goal_adjustments: GoalAdjustments;
  safety_level: SafetyLevel;
  forecast_energy_label?: string;
}

export interface EnergyCheckInPayload {
  energyLevel: EnergyLevel;
  stressLevel?: StressLevel;
  physicalDiscomfort?: boolean;
  discomfortType?: string;
  feelingTags: string[];
  note?: string;
  timestamp: string;
  isVoiceInput?: boolean;
}

export interface SafetyResources {
  crisisHotline: string;
  crisisTextLine: string;
  emergencyServices: string;
  disclaimer: string;
  trustedContactAlertEnabled: boolean;
}

export interface RecoveryAuditLog {
  id: string;
  timestamp: string;
  initialMode: WellnessMode;
  assignedMode: WellnessMode;
  reasons: string[];
  originalGoalTarget: number;
  adjustedGoalTarget: number;
  streakProtected: boolean;
  completedActivity?: boolean;
}

export type EnergyMode = 'gentle' | 'normal'; // legacy alias support
