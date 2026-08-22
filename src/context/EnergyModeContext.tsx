import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  EnergyMode,
  EnergyCheckInPayload,
  EnergyAIResponse,
  RecoveryAction,
  GoalAdjustment,
} from '../types/energy';
import { analyzeEnergyCheckIn } from '../services/energyAiService';

interface EnergyModeContextType {
  currentMode: EnergyMode;
  isGentleMode: boolean;
  isCheckInOpen: boolean;
  isSubmittingCheckIn: boolean;
  lastCheckIn: EnergyCheckInPayload | null;
  lastCheckInTime: string | null;
  aiResponse: EnergyAIResponse | null;
  recoveryPlan: RecoveryAction[];
  goalAdjustments: GoalAdjustment[];
  needsReCheck: boolean;
  openCheckInModal: () => void;
  closeCheckInModal: () => void;
  setMode: (mode: EnergyMode) => void;
  toggleMode: () => void;
  submitCheckIn: (payload: Omit<EnergyCheckInPayload, 'timestamp'>) => Promise<EnergyAIResponse>;
  toggleRecoveryAction: (id: string) => void;
}

const EnergyModeContext = createContext<EnergyModeContextType | undefined>(undefined);

const LS_MODE_KEY = 'medivault_current_mode';
const LS_LAST_CHECKIN_KEY = 'medivault_last_checkin';
const LS_RECOVERY_PLAN_KEY = 'medivault_recovery_plan';
const LS_GOAL_ADJUSTMENTS_KEY = 'medivault_goal_adjustments';
const LS_AI_RESPONSE_KEY = 'medivault_ai_response';

export const EnergyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentModeState] = useState<EnergyMode>(() => {
    const saved = localStorage.getItem(LS_MODE_KEY);
    return saved === 'gentle' ? 'gentle' : 'normal';
  });

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

  const [lastCheckIn, setLastCheckIn] = useState<EnergyCheckInPayload | null>(() => {
    try {
      const saved = localStorage.getItem(LS_LAST_CHECKIN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryAction[]>(() => {
    try {
      const saved = localStorage.getItem(LS_RECOVERY_PLAN_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [goalAdjustments, setGoalAdjustments] = useState<GoalAdjustment[]>(() => {
    try {
      const saved = localStorage.getItem(LS_GOAL_ADJUSTMENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [aiResponse, setAiResponse] = useState<EnergyAIResponse | null>(() => {
    try {
      const saved = localStorage.getItem(LS_AI_RESPONSE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Calculate if re-check is suggested (4 to 6 hours since last checkin)
  const [needsReCheck, setNeedsReCheck] = useState<boolean>(false);

  useEffect(() => {
    const checkReCheckNeeded = () => {
      if (!lastCheckIn?.timestamp) {
        setNeedsReCheck(false);
        return;
      }
      const checkInDate = new Date(lastCheckIn.timestamp).getTime();
      const now = new Date().getTime();
      const diffHours = (now - checkInDate) / (1000 * 60 * 60);
      // Re-check after 4 hours
      setNeedsReCheck(diffHours >= 4);
    };

    checkReCheckNeeded();
    const interval = setInterval(checkReCheckNeeded, 60000); // update every minute
    return () => clearInterval(interval);
  }, [lastCheckIn]);

  // Sync `.mode-gentle` class to document root element
  useEffect(() => {
    const root = document.documentElement;
    if (currentMode === 'gentle') {
      root.classList.add('mode-gentle');
    } else {
      root.classList.remove('mode-gentle');
    }
  }, [currentMode]);

  const setMode = useCallback((mode: EnergyMode) => {
    setCurrentModeState(mode);
    localStorage.setItem(LS_MODE_KEY, mode);
  }, []);

  const toggleMode = useCallback(() => {
    const nextMode = currentMode === 'gentle' ? 'normal' : 'gentle';
    setMode(nextMode);
  }, [currentMode, setMode]);

  const openCheckInModal = useCallback(() => setIsCheckInOpen(true), []);
  const closeCheckInModal = useCallback(() => setIsCheckInOpen(false), []);

  const submitCheckIn = useCallback(
    async (rawPayload: Omit<EnergyCheckInPayload, 'timestamp'>): Promise<EnergyAIResponse> => {
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
        setRecoveryPlan(response.recovery_plan);
        setGoalAdjustments(response.goal_adjustments);

        // LocalStorage persistence
        localStorage.setItem(LS_LAST_CHECKIN_KEY, JSON.stringify(fullPayload));
        localStorage.setItem(LS_AI_RESPONSE_KEY, JSON.stringify(response));
        localStorage.setItem(LS_RECOVERY_PLAN_KEY, JSON.stringify(response.recovery_plan));
        localStorage.setItem(LS_GOAL_ADJUSTMENTS_KEY, JSON.stringify(response.goal_adjustments));

        // Automatic mode transition based on AI response
        if (response.trigger_gentle_mode) {
          setMode('gentle');
        } else {
          setMode('normal');
        }

        setIsCheckInOpen(false);
        return response;
      } finally {
        setIsSubmittingCheckIn(false);
      }
    },
    [setMode]
  );

  const toggleRecoveryAction = useCallback((id: string) => {
    setRecoveryPlan((prev) => {
      const next = prev.map((act) => (act.id === id ? { ...act, completed: !act.completed } : act));
      localStorage.setItem(LS_RECOVERY_PLAN_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isGentleMode = currentMode === 'gentle';
  const lastCheckInTime = lastCheckIn?.timestamp || null;

  return (
    <EnergyModeContext.Provider
      value={{
        currentMode,
        isGentleMode,
        isCheckInOpen,
        isSubmittingCheckIn,
        lastCheckIn,
        lastCheckInTime,
        aiResponse,
        recoveryPlan,
        goalAdjustments,
        needsReCheck,
        openCheckInModal,
        closeCheckInModal,
        setMode,
        toggleMode,
        submitCheckIn,
        toggleRecoveryAction,
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
