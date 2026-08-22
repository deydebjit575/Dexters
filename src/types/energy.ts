export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface EnergyCheckInPayload {
  energyLevel: EnergyLevel;
  feelingTags: string[];
  note?: string;
  timestamp: string;
}

export interface RecoveryAction {
  id: string;
  task: string;
  duration: string;
  completed: boolean;
  category?: 'hydration' | 'mindfulness' | 'movement' | 'rest' | 'nutrition';
}

export interface GoalAdjustment {
  id: string;
  title: string;
  status: 'deferred' | 'essential' | 'simplified';
  reason: string;
}

export interface EnergyAIResponse {
  energy_state: string;
  trigger_gentle_mode: boolean;
  recovery_plan: RecoveryAction[];
  goal_adjustments: GoalAdjustment[];
  insights: string;
}

export type EnergyMode = 'gentle' | 'normal';
