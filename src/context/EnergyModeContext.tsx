import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  WellnessMode,
  EnergyCheckInPayload,
  AIWellnessResponse,
  AIPlanStep,
  SafetyResources,
  RecoveryAuditLog,
  WellnessRecord,
  RecommendationExplanation,
  WellnessPlan10Min,
} from '../types/energy';
import { analyzeEnergyCheckIn, generateWellnessTrendInsight } from '../services/energyAiService';
import {
  saveWellnessRecordToFirestore,
  fetchWellnessHistoryFromFirestore,
  getCurrentUser,
} from '../services/firebaseService';

interface EnergyModeContextType {
  currentMode: WellnessMode;
  isGentleMode: boolean; // boolean helper for recovery or light
  isCheckInOpen: boolean;
  isSubmittingCheckIn: boolean;
  isTriageModalOpen: boolean;
  isRecoveryPlayerOpen: boolean;
  isExplanationModalOpen: boolean;
  lastCheckIn: EnergyCheckInPayload | null;
  lastCheckInTime: string | null;
  aiResponse: AIWellnessResponse | null;
  recoveryPlan: AIPlanStep[];
  wellnessHistory: WellnessRecord[];
  activeExplanation: RecommendationExplanation | null;
  active10MinPlan: WellnessPlan10Min | null;
  wellnessInsight: string;
  originalActivityTarget: number;
  currentActivityTarget: number;
  isStreakProtected: boolean;
  needsReCheck: boolean;
  safetyResources: SafetyResources;
  auditLogs: RecoveryAuditLog[];
  openCheckInModal: () => void;
  closeCheckInModal: () => void;
  openTriageModal: () => void;
  closeTriageModal: () => void;
  openRecoveryPlayer: () => void;
  closeRecoveryPlayer: () => void;
  openExplanationModal: () => void;
  closeExplanationModal: () => void;
  setMode: (mode: WellnessMode) => void;
  toggleMode: () => void;
  submitCheckIn: (payload: Omit<EnergyCheckInPayload, 'timestamp'>) => Promise<AIWellnessResponse>;
  finishRecoveryPlayer: () => void;
  runDemoPreset: (preset: 'demo1_exam' | 'demo2_normal' | 'demo3_urgent') => Promise<void>;
  updateSafetyResources: (updated: Partial<SafetyResources>) => void;
  refreshWellnessHistory: () => Promise<void>;
}

const EnergyModeContext = createContext<EnergyModeContextType | undefined>(undefined);

const LS_MODE_KEY = 'medivault_current_wellness_mode';
const LS_LAST_CHECKIN_KEY = 'medivault_last_wellness_checkin';
const LS_AI_RESPONSE_KEY = 'medivault_ai_wellness_response';
const LS_AUDIT_LOGS_KEY = 'medivault_wellness_audit_logs';

const DEFAULT_SAFETY_RESOURCES: SafetyResources = {
  crisisHotline: '988 (Suicide & Crisis Lifeline - 24/7 Free & Confidential)',
  crisisTextLine: 'Text HOME to 741741',
  emergencyServices: '112 (National Immediate Emergency)',
  disclaimer: 'MediVault provides wellness and workload support and does not replace professional medical diagnosis, treatment, or emergency crisis care.',
  trustedContactAlertEnabled: true,
};

// Seed sample historical records for professional dashboard visual demo
const SEED_WELLNESS_HISTORY: WellnessRecord[] = [
  {
    id: 'rec-seed-1',
    uid: 'demo-user',
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    energyLevel: 4,
    stressLevel: 2,
    symptoms: ['None'],
    recommendationTitle: 'General Wellness Decompression',
    plan: [
      { title: 'Deep Mind & Body Breathwork', description: 'Diaphragmatic breathing (4s in, 6s out).', duration_seconds: 60, type: 'breathing' },
      { title: 'Hydration & Mindful Pause', description: 'Drink a glass of water slowly.', duration_seconds: 60, type: 'hydration' },
      { title: 'Shoulder & Jaw Release', description: 'Roll shoulders back 5 times.', duration_seconds: 60, type: 'rest' },
    ],
    explanation: {
      userInputsSummary: 'Energy 4/5, Stress 2/5. Symptoms: None.',
      whySelected: 'Good energy and low stress detected. General wellness maintenance provided.',
      whatItSupports: 'Sustains mental clarity and balanced stamina.',
      whenToSeekMedicalHelp: 'Seek medical evaluation if severe acute symptoms arise.',
    },
    wellnessPlan10Min: {
      title: 'YOUR 10-MINUTE WELLNESS PLAN',
      totalDurationMinutes: 10,
      steps: [
        { title: '3 min mindful respiration', durationMinutes: 3, type: 'breathing', description: 'Slow diaphragmatic breathing.' },
        { title: '2 min hydration/rest reminder', durationMinutes: 2, type: 'hydration', description: 'Sip 250ml water.' },
        { title: '3 min relaxation activity', durationMinutes: 3, type: 'gentle_movement', description: 'Gentle neck stretch.' },
        { title: '2 min reflection', durationMinutes: 2, type: 'reflection', description: 'Acknowledge daily health priority.' },
      ],
    },
    insights: 'Balanced energy day.',
    safetyLevel: 'none',
  },
  {
    id: 'rec-seed-2',
    uid: 'demo-user',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    energyLevel: 3,
    stressLevel: 3,
    symptoms: ['Brain Fog'],
    recommendationTitle: 'Optic Eye Strain & Screen Burnout',
    plan: [
      { title: '20-20-20 Optic Decompression', description: 'Look 20 feet away for 20s.', duration_seconds: 60, type: 'rest' },
      { title: 'Hydration Pause', description: 'Sip cold water.', duration_seconds: 60, type: 'hydration' },
      { title: 'Neck Stretch', description: 'Tilt head right/left.', duration_seconds: 60, type: 'gentle_movement' },
    ],
    explanation: {
      userInputsSummary: 'Energy 3/5, Stress 3/5. Symptoms: Brain Fog.',
      whySelected: 'Moderate stress and brain fog detected.',
      whatItSupports: 'Restores optic focus and cervical neck circulation.',
      whenToSeekMedicalHelp: 'Consult doctor if severe headaches persist.',
    },
    wellnessPlan10Min: {
      title: 'YOUR 10-MINUTE WELLNESS PLAN',
      totalDurationMinutes: 10,
      steps: [
        { title: '3 min mindful respiration', durationMinutes: 3, type: 'breathing', description: 'Slow diaphragmatic breathing.' },
        { title: '2 min hydration/rest reminder', durationMinutes: 2, type: 'hydration', description: 'Sip 250ml water.' },
        { title: '3 min relaxation activity', durationMinutes: 3, type: 'gentle_movement', description: 'Gentle neck stretch.' },
        { title: '2 min reflection', durationMinutes: 2, type: 'reflection', description: 'Acknowledge daily health priority.' },
      ],
    },
    insights: 'Moderate workload strain.',
    safetyLevel: 'none',
  },
  {
    id: 'rec-seed-3',
    uid: 'demo-user',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    energyLevel: 2,
    stressLevel: 4,
    symptoms: ['Headache'],
    recommendationTitle: 'Headache & Optic Pressure Relief',
    plan: [
      { title: 'Dim Lights & Optic Decompression', description: 'Step into quiet room, press cool palms over closed eyes.', duration_seconds: 60, type: 'rest' },
      { title: 'Vascular Hydration Pause', description: 'Sip 250ml water slowly.', duration_seconds: 60, type: 'hydration' },
      { title: 'Suboccipital Massage', description: 'Gentle circular thumb pressure to temples.', duration_seconds: 60, type: 'breathing' },
    ],
    explanation: {
      userInputsSummary: 'Energy 2/5, Stress 4/5. Symptoms: Headache.',
      whySelected: 'Headache and elevated stress reported.',
      whatItSupports: 'Decompresses cranial tension and vascular head pressure.',
      whenToSeekMedicalHelp: 'Seek immediate care for sudden thunderclap headaches.',
    },
    wellnessPlan10Min: {
      title: 'YOUR 10-MINUTE WELLNESS PLAN',
      totalDurationMinutes: 10,
      steps: [
        { title: '3 min guided breathing', durationMinutes: 3, type: 'breathing', description: 'Diaphragmatic breathing.' },
        { title: '2 min hydration/rest reminder', durationMinutes: 2, type: 'hydration', description: 'Hydration pause.' },
        { title: '3 min optic relaxation activity', durationMinutes: 3, type: 'gentle_movement', description: 'Temple massage.' },
        { title: '2 min reflection', durationMinutes: 2, type: 'reflection', description: 'Restful reflection.' },
      ],
    },
    insights: 'High stress & headache symptoms.',
    safetyLevel: 'monitor',
  },
];

export const EnergyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentModeState] = useState<WellnessMode>(() => {
    const saved = localStorage.getItem(LS_MODE_KEY);
    return (saved as WellnessMode) || 'normal';
  });

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [isRecoveryPlayerOpen, setIsRecoveryPlayerOpen] = useState(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);

  const [originalActivityTarget] = useState<number>(8000);

  const [lastCheckIn, setLastCheckIn] = useState<EnergyCheckInPayload | null>(() => {
    try {
      const saved = localStorage.getItem(LS_LAST_CHECKIN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [aiResponse, setAiResponse] = useState<AIWellnessResponse | null>(() => {
    try {
      const saved = localStorage.getItem(LS_AI_RESPONSE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [safetyResources, setSafetyResources] = useState<SafetyResources>(DEFAULT_SAFETY_RESOURCES);
  const [wellnessHistory, setWellnessHistory] = useState<WellnessRecord[]>(SEED_WELLNESS_HISTORY);

  const [auditLogs, setAuditLogs] = useState<RecoveryAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(LS_AUDIT_LOGS_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'log-demo-1',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              initialMode: 'normal',
              assignedMode: 'recovery',
              reasons: ['Low energy reserves (2/5)', 'Exam stress & physical headache'],
              originalGoalTarget: 8000,
              adjustedGoalTarget: 2000,
              streakProtected: true,
              completedActivity: true,
            },
          ];
    } catch {
      return [];
    }
  });

  // Load user wellness history from Firestore simulator on mount
  const refreshWellnessHistory = useCallback(async () => {
    const user = getCurrentUser();
    const uid = user ? user.uid : 'demo-user';
    const records = await fetchWellnessHistoryFromFirestore(uid);
    if (records && records.length > 0) {
      setWellnessHistory(records);
    } else {
      setWellnessHistory(SEED_WELLNESS_HISTORY);
    }
  }, []);

  useEffect(() => {
    refreshWellnessHistory();
  }, [refreshWellnessHistory]);

  // Calculate current target based on mode
  const currentActivityTarget =
    currentMode === 'triage'
      ? 0
      : currentMode === 'recovery'
      ? Math.round(originalActivityTarget * 0.25)
      : currentMode === 'light'
      ? Math.round(originalActivityTarget * 0.7)
      : originalActivityTarget;

  const isStreakProtected = currentMode === 'recovery' || currentMode === 'light' || currentMode === 'triage';

  // Calculate 4-6h re-check
  const [needsReCheck, setNeedsReCheck] = useState<boolean>(false);

  useEffect(() => {
    const checkReCheck = () => {
      if (!lastCheckIn?.timestamp) return;
      const elapsedHours = (Date.now() - new Date(lastCheckIn.timestamp).getTime()) / (1000 * 60 * 60);
      setNeedsReCheck(elapsedHours >= 4);
    };
    checkReCheck();
    const interval = setInterval(checkReCheck, 60000);
    return () => clearInterval(interval);
  }, [lastCheckIn]);

  // Sync mode class to html document
  useEffect(() => {
    const root = document.documentElement;
    if (currentMode === 'recovery' || currentMode === 'light') {
      root.classList.add('mode-gentle');
    } else {
      root.classList.remove('mode-gentle');
    }
  }, [currentMode]);

  const setMode = useCallback(
    (mode: WellnessMode) => {
      setCurrentModeState(mode);
      localStorage.setItem(LS_MODE_KEY, mode);
      if (mode === 'triage') {
        setIsTriageModalOpen(true);
      }
    },
    []
  );

  const toggleMode = useCallback(() => {
    const nextMode = currentMode === 'normal' ? 'recovery' : 'normal';
    setMode(nextMode);
  }, [currentMode, setMode]);

  const openCheckInModal = useCallback(() => setIsCheckInOpen(true), []);
  const closeCheckInModal = useCallback(() => setIsCheckInOpen(false), []);
  const openTriageModal = useCallback(() => setIsTriageModalOpen(true), []);
  const closeTriageModal = useCallback(() => setIsTriageModalOpen(false), []);
  const openRecoveryPlayer = useCallback(() => setIsRecoveryPlayerOpen(true), []);
  const closeRecoveryPlayer = useCallback(() => setIsRecoveryPlayerOpen(false), []);
  const openExplanationModal = useCallback(() => setIsExplanationModalOpen(true), []);
  const closeExplanationModal = useCallback(() => setIsExplanationModalOpen(false), []);

  const updateSafetyResources = useCallback((updated: Partial<SafetyResources>) => {
    setSafetyResources((prev) => ({ ...prev, ...updated }));
  }, []);

  const submitCheckIn = useCallback(
    async (rawPayload: Omit<EnergyCheckInPayload, 'timestamp'>): Promise<AIWellnessResponse> => {
      setIsSubmittingCheckIn(true);
      try {
        const user = getCurrentUser();
        const uid = user ? user.uid : 'demo-user';

        const fullPayload: EnergyCheckInPayload = {
          ...rawPayload,
          timestamp: new Date().toISOString(),
          uid,
        };

        const response = await analyzeEnergyCheckIn(fullPayload, [], wellnessHistory);

        // Update state
        setLastCheckIn(fullPayload);
        setAiResponse(response);
        setMode(response.mode);

        // Build new WellnessRecord for Firestore
        const newRecord: WellnessRecord = {
          id: `rec-${Date.now()}`,
          uid,
          timestamp: fullPayload.timestamp,
          energyLevel: fullPayload.energyLevel,
          stressLevel: fullPayload.stressLevel || 3,
          symptoms: fullPayload.symptoms || (fullPayload.discomfortType ? [fullPayload.discomfortType] : ['None']),
          recommendationTitle: response.plan?.[0]?.title ? `Plan: ${response.plan[0].title}` : 'General Wellness Plan',
          plan: response.plan,
          explanation: response.explanation!,
          wellnessPlan10Min: response.wellness_plan_10min!,
          insights: response.reasons?.[0] || 'AI Wellness Check-in completed.',
          safetyLevel: response.safety_level,
          urgentWarning: response.urgent_warning,
        };

        // Save to Firestore simulator
        await saveWellnessRecordToFirestore(uid, newRecord);

        // Update local wellness history list
        setWellnessHistory((prev) => [newRecord, ...prev]);

        // Record audit log entry
        const newLog: RecoveryAuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          initialMode: currentMode,
          assignedMode: response.mode,
          reasons: response.reasons,
          originalGoalTarget: originalActivityTarget,
          adjustedGoalTarget:
            response.mode === 'recovery'
              ? 2000
              : response.mode === 'light'
              ? 5600
              : response.mode === 'triage'
              ? 0
              : 8000,
          streakProtected: response.goal_adjustments.protect_streak,
          completedActivity: false,
        };

        setAuditLogs((prev) => {
          const next = [newLog, ...prev];
          localStorage.setItem(LS_AUDIT_LOGS_KEY, JSON.stringify(next));
          return next;
        });

        localStorage.setItem(LS_LAST_CHECKIN_KEY, JSON.stringify(fullPayload));
        localStorage.setItem(LS_AI_RESPONSE_KEY, JSON.stringify(response));

        setIsCheckInOpen(false);

        if (response.mode === 'triage' || response.urgent_warning) {
          setIsTriageModalOpen(true);
        }

        return response;
      } finally {
        setIsSubmittingCheckIn(false);
      }
    },
    [currentMode, originalActivityTarget, setMode, wellnessHistory]
  );

  const finishRecoveryPlayer = useCallback(() => {
    setIsRecoveryPlayerOpen(false);
    // Mark completed in latest audit log
    setAuditLogs((prev) => {
      if (prev.length === 0) return prev;
      const updated = [{ ...prev[0], completedActivity: true }, ...prev.slice(1)];
      localStorage.setItem(LS_AUDIT_LOGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Demo scenario shortcuts requested in specification
  const runDemoPreset = useCallback(
    async (preset: 'demo1_exam' | 'demo2_normal' | 'demo3_urgent') => {
      if (preset === 'demo1_exam') {
        await submitCheckIn({
          energyLevel: 2,
          stressLevel: 5,
          physicalDiscomfort: true,
          discomfortType: 'Headache & Nausea',
          symptoms: ['Headache', 'Nausea', 'Exam Stress'],
          feelingTags: ['Brain Fog', 'Physical Fatigue', 'Exam Stress'],
          note: 'Exams start in two hours, I slept 3 hours, have a severe headache and feel sick.',
        });
      } else if (preset === 'demo2_normal') {
        await submitCheckIn({
          energyLevel: 5,
          stressLevel: 1,
          physicalDiscomfort: false,
          symptoms: ['None'],
          feelingTags: ['Focused', 'Rested', 'Productive'],
          note: 'Slept 8 hours, morning coffee done, feeling energized!',
        });
      } else if (preset === 'demo3_urgent') {
        await submitCheckIn({
          energyLevel: 1,
          stressLevel: 5,
          physicalDiscomfort: true,
          discomfortType: 'Chest Tightness',
          symptoms: ['Chest Tightness', 'Shortness of Breath'],
          feelingTags: ['Anxious', 'Overwhelmed'],
          note: 'Exams pressure high. I have severe chest tightness and shortness of breath right now.',
        });
      }
    },
    [submitCheckIn]
  );

  const recoveryPlan = aiResponse?.plan || [];
  const activeExplanation = aiResponse?.explanation || (wellnessHistory[0]?.explanation || null);
  const active10MinPlan = aiResponse?.wellness_plan_10min || (wellnessHistory[0]?.wellnessPlan10Min || null);
  const wellnessInsight = generateWellnessTrendInsight(wellnessHistory);
  const isGentleMode = currentMode === 'recovery' || currentMode === 'light';
  const lastCheckInTime = lastCheckIn?.timestamp || null;

  return (
    <EnergyModeContext.Provider
      value={{
        currentMode,
        isGentleMode,
        isCheckInOpen,
        isSubmittingCheckIn,
        isTriageModalOpen,
        isRecoveryPlayerOpen,
        isExplanationModalOpen,
        lastCheckIn,
        lastCheckInTime,
        aiResponse,
        recoveryPlan,
        wellnessHistory,
        activeExplanation,
        active10MinPlan,
        wellnessInsight,
        originalActivityTarget,
        currentActivityTarget,
        isStreakProtected,
        needsReCheck,
        safetyResources,
        auditLogs,
        openCheckInModal,
        closeCheckInModal,
        openTriageModal,
        closeTriageModal,
        openRecoveryPlayer,
        closeRecoveryPlayer,
        openExplanationModal,
        closeExplanationModal,
        setMode,
        toggleMode,
        submitCheckIn,
        finishRecoveryPlayer,
        runDemoPreset,
        updateSafetyResources,
        refreshWellnessHistory,
      }}
    >
      {children}
    </EnergyModeContext.Provider>
  );
};

export const useEnergyMode = () => {
  const context = useContext(EnergyModeContext);
  if (!context) {
    throw new Error('useEnergyMode must be used within an EnergyModeProvider');
  }
  return context;
};

