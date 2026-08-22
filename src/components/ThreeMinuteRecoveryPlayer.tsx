import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Droplets,
  Wind,
  ArrowRight,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';

type BreathingPhase = 'breathe_in' | 'hold' | 'breathe_out';

export const ThreeMinuteRecoveryPlayer: React.FC = () => {
  const {
    isRecoveryPlayerOpen,
    closeRecoveryPlayer,
    recoveryPlan,
    finishRecoveryPlayer,
    aiResponse,
  } = useEnergyMode();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [postRating, setPostRating] = useState<number | null>(null);

  // Breathing Phase State (4s In -> 4s Hold -> 6s Out = 14s total cycle)
  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>('breathe_in');
  const [phaseSeconds, setPhaseSeconds] = useState(0);

  const planSteps =
    recoveryPlan.length >= 3
      ? recoveryPlan
      : [
          {
            title: '3-Min Guided Decompression Breathing',
            description: 'Inhale for 4s, hold gently for 4s, and exhale for 6s.',
            duration_seconds: 60,
            type: 'breathing' as const,
          },
          {
            title: 'Hydration & Quiet Rest',
            description: 'Drink a glass of cold water and rest your eyes away from screens.',
            duration_seconds: 60,
            type: 'hydration' as const,
          },
          {
            title: 'Relax Shoulders & Mindful Reflection',
            description: 'Unclench your jaw, relax your shoulders, and pick 1 small step.',
            duration_seconds: 60,
            type: 'rest' as const,
          },
        ];

  const currentStep = planSteps[currentStepIndex] || planSteps[0];
  const totalSteps = planSteps.length;

  // Countdown timer effect
  useEffect(() => {
    if (!isRecoveryPlayerOpen || !isPlaying || isFinished) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return 60;
          } else {
            setIsFinished(true);
            setIsPlaying(false);
            return 0;
          }
        }
        return prev - 1;
      });

      // Breathing Cycle Logic (14s loop)
      setPhaseSeconds((prevCycle) => {
        const next = (prevCycle + 1) % 14;
        if (next < 4) {
          setBreathingPhase('breathe_in');
        } else if (next < 8) {
          setBreathingPhase('hold');
        } else {
          setBreathingPhase('breathe_out');
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecoveryPlayerOpen, isPlaying, currentStepIndex, totalSteps, isFinished]);

  if (!isRecoveryPlayerOpen) return null;

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSecondsRemaining(60);
    } else {
      setIsFinished(true);
      setIsPlaying(false);
    }
  };

  const handleComplete = () => {
    finishRecoveryPlayer();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalSessionSeconds = totalSteps * 60;
  const elapsedTotalSeconds = currentStepIndex * 60 + (60 - secondsRemaining);
  const totalProgressPercent = Math.min(100, Math.round((elapsedTotalSeconds / totalSessionSeconds) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Dark Healthcare Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeRecoveryPlayer}
          className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
        >
          {/* Header Bar */}
          <div className="p-6 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 backdrop-blur-md">
                <Wind className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight font-display text-white">
                  3-Minute Guided Wellness Exercise
                </h3>
                <p className="text-[11px] text-teal-300 font-medium">
                  {isFinished ? 'Session Complete 🎉' : `Step ${currentStepIndex + 1} of ${totalSteps}: ${currentStep.title}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isAudioEnabled ? 'Mute Chime' : 'Enable Chime'}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4 text-teal-300" /> : <VolumeX className="w-4 h-4 text-white/50" />}
              </button>
              <button
                onClick={closeRecoveryPlayer}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isFinished ? (
            <div className="p-6 sm:p-8 text-center space-y-6">
              {/* Overall Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Exercise Progress</span>
                  <span>{totalProgressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Central Animated Breathing Circle */}
              <div className="py-4 flex flex-col items-center justify-center relative">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  {/* Outer Pulsing Glow Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 blur-xl"
                    animate={{
                      scale: breathingPhase === 'breathe_in' ? 1.35 : breathingPhase === 'hold' ? 1.35 : 1,
                      opacity: breathingPhase === 'breathe_in' ? 0.8 : 0.4,
                    }}
                    transition={{ duration: breathingPhase === 'breathe_in' ? 4 : breathingPhase === 'breathe_out' ? 6 : 0.5, ease: 'easeInOut' }}
                  />

                  {/* Animated Breathing Circle */}
                  <motion.div
                    className="w-36 h-36 rounded-full bg-gradient-to-tr from-teal-500 via-cyan-500 to-emerald-400 p-1 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-white"
                    animate={{
                      scale: breathingPhase === 'breathe_in' ? 1.28 : breathingPhase === 'hold' ? 1.28 : 1,
                    }}
                    transition={{ duration: breathingPhase === 'breathe_in' ? 4 : breathingPhase === 'breathe_out' ? 6 : 0.5, ease: 'easeInOut' }}
                  >
                    <div className="w-full h-full rounded-full bg-[#0F172A] flex flex-col items-center justify-center text-center p-3">
                      <span className="text-xs font-extrabold tracking-widest uppercase text-cyan-400">
                        {breathingPhase === 'breathe_in'
                          ? 'BREATHE IN'
                          : breathingPhase === 'hold'
                          ? 'HOLD'
                          : 'BREATHE OUT'}
                      </span>
                      <span className="text-3xl font-extrabold font-mono text-white mt-1">
                        {formatTime(secondsRemaining)}
                      </span>
                    </div>
                  </motion.div>
                </div>

                <p className="text-xs font-bold text-slate-700 mt-4 max-w-xs mx-auto">
                  {currentStep.description}
                </p>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 text-teal-400" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-teal-400" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextStep}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors border border-slate-200"
                >
                  <span>Skip Step</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={closeRecoveryPlayer}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  End Session Anytime
                </button>
              </div>
            </div>
          ) : (
            /* Session Complete Screen */
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-slate-900 font-display">
                  Session Complete 🎉
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  "You completed your 3-minute wellness exercise."
                </p>
              </div>

              {/* AI Forecast Banner */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs text-left">
                <div className="flex items-center space-x-1.5 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                  <span>{aiResponse?.forecast_energy_label || 'AI Estimate: Energy & Focus Boosted'}</span>
                </div>
                <p className="text-[11px] text-teal-700">
                  Your streak is protected for 24 hours. Daily target adjusted to lower cognitive load.
                </p>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2"
              >
                <span>View Wellness Result</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
