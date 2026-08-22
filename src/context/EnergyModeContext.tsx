import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  WellnessMode,
  EnergyCheckInPayload,
  AIWellnessResponse,
  AIPlanStep,
  SafetyResources,
  RecoveryAuditLog,
} from '../types/energy';
import { analyzeEnergyCheckIn } from '../services/energyAiService';

interface EnergyModeContextType {
  currentMode: WellnessMode;
  isGentleMode: boolean; // boolean helper for recovery or light
  isCheckInOpen: boolean;
  isSubmittingCheckIn: boolean;
  isTriageModalOpen: boolean;
  isRecoveryPlayerOpen: boolean;
  lastCheckIn: EnergyCheckInPayload | null;
  lastCheckInTime: string | null;
  aiResponse: AIWellnessResponse | null;
  recoveryPlan: AIPlanStep[];
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
  setMode: (mode: WellnessMode) => void;
  toggleMode: () => void;
  submitCheckIn: (payload: Omit<EnergyCheckInPayload, 'timestamp'>) => Promise<AIWellnessResponse>;
  finishRecoveryPlayer: () => void;
  runDemoPreset: (preset: 'demo1_exam' | 'demo2_normal' | 'demo3_urgent') => Promise<void>;
  updateSafetyResources: (updated: Partial<SafetyResources>) => void;
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

export const EnergyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentModeState] = useState<WellnessMode>(() => {
    const saved = localStorage.getItem(LS_MODE_KEY);
    return (saved as WellnessMode) || 'normal';
  });

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [isRecoveryPlayerOpen, setIsRecoveryPlayerOpen] = useState(false);

  const [originalActivityTarget] = useState<number>(8000); // Default 8,000 steps/points target

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

  const updateSafetyResources = useCallback((updated: Partial<SafetyResources>) => {
    setSafetyResources((prev) => ({ ...prev, ...updated }));
  }, []);

  const submitCheckIn = useCallback(
    async (rawPayload: Omit<EnergyCheckInPayload, 'timestamp'>): Promise<AIWellnessResponse> => {
      setIsSubmittingCheckIn(true);
      try {
        const fullPayload: EnergyCheckInPayload = {
          ...rawPayload,
          timestamp: new Date().toISOString(),
        };

        const response = await analyzeEnergyCheckIn(fullPayload);

        // Update state
        setLastCheckIn(fullPayload);
        setAiResponse(response);
        setMode(response.mode);

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

        if (response.mode === 'triage') {
          setIsTriageModalOpen(true);
        }

        return response;
      } finally {
        setIsSubmittingCheckIn(false);
      }
    },
    [currentMode, originalActivityTarget, setMode]
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
          feelingTags: ['Brain Fog', 'Physical Fatigue', 'Stress'],
          note: 'Exams start in two hours, I slept 3 hours, have a headache and feel sick.',
        });
      } else if (preset === 'demo2_normal') {
        await submitCheckIn({
          energyLevel: 5,
          stressLevel: 1,
          physicalDiscomfort: false,
          feelingTags: ['Focused', 'Rested', 'Productive'],
          note: 'Slept 8 hours, morning coffee done, ready for the day!',
        });
      } else if (preset === 'demo3_urgent') {
        await submitCheckIn({
          energyLevel: 1,
          stressLevel: 5,
          physicalDiscomfort: false,
          feelingTags: ['Anxious', 'Overwhelmed'],
          note: 'Exams and life pressure are too high. I feel overwhelmed and I am not safe right now.',
        });
      }
    },
    [submitCheckIn]
  );

  const recoveryPlan = aiResponse?.plan || [];
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
        lastCheckIn,
        lastCheckInTime,
        aiResponse,
        recoveryPlan,
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
        setMode,
        toggleMode,
        submitCheckIn,
        finishRecoveryPlayer,
        runDemoPreset,
        updateSafetyResources,
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
