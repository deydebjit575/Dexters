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
  Shield,
  Smile,
  RefreshCw,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';

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

  const planSteps =
    recoveryPlan.length >= 3
      ? recoveryPlan
      : [
          {
            title: 'Slow Breathing Decompression',
            description: 'Breathe in slowly for 4s, hold for 4s, and exhale for 6s.',
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
            title: 'Relax Shoulders & Small Next Step',
            description: 'Unclench your jaw, relax your shoulders, and pick 1 low-effort task.',
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeRecoveryPlayer}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-teal-100 overflow-hidden z-10 my-8"
        >
          {/* Header Bar */}
          <div className="p-6 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight font-display">
                  3-Minute Recovery Guided Session
                </h3>
                <p className="text-[11px] text-teal-100 font-medium">
                  {isFinished ? 'Session Complete' : `Step ${currentStepIndex + 1} of ${totalSteps}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title={isAudioEnabled ? 'Mute Guided Chime' : 'Enable Guided Chime'}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white/60" />}
              </button>
              <button
                onClick={closeRecoveryPlayer}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isFinished ? (
            <div className="p-6 sm:p-8 text-center space-y-6">
              {/* Progress Step Indicator */}
              <div className="flex justify-center items-center space-x-2">
                {planSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex
                        ? 'w-10 bg-teal-600'
                        : idx < currentStepIndex
                        ? 'w-6 bg-emerald-400'
                        : 'w-4 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Step Display Card */}
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 rounded-3xl bg-slate-50 border border-teal-100 shadow-sm space-y-4"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-100 text-teal-700">
                  {currentStep.type === 'breathing' ? (
                    <Wind className="w-6 h-6 animate-pulse" />
                  ) : currentStep.type === 'hydration' ? (
                    <Droplets className="w-6 h-6 animate-bounce" />
                  ) : (
                    <Heart className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-display">
                    {currentStep.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>

                {/* Animated Sound Wave Visualizer when Audio is ON */}
                {isAudioEnabled && isPlaying && (
                  <div className="flex items-center justify-center space-x-1 pt-2">
                    <span className="w-1 h-4 bg-teal-500 rounded-full animate-pulse" />
                    <span className="w-1 h-6 bg-cyan-500 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse delay-150" />
                    <span className="w-1 h-7 bg-teal-600 rounded-full animate-pulse delay-200" />
                    <span className="w-1 h-4 bg-cyan-600 rounded-full animate-pulse delay-100" />
                  </div>
                )}
              </motion.div>

              {/* Big Countdown Timer Circle */}
              <div className="flex flex-col items-center">
                <div className="text-4xl font-extrabold font-mono text-teal-800 tracking-wider">
                  {formatTime(secondsRemaining)}
                </div>
                <span className="text-[11px] text-slate-400 font-medium mt-1">
                  Step {currentStepIndex + 1} of {totalSteps} Remaining
                </span>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-4 pt-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-teal-600/20 transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
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

              {/* Stop Without Penalty */}
              <div className="pt-2">
                <button
                  onClick={closeRecoveryPlayer}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  Stop activity anytime without penalty
                </button>
              </div>
            </div>
          ) : (
            /* Session Completion State */
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-900 font-display">
                  Recovery Activity Complete! 🎉
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  You took 3 minutes for yourself today. Your daily target is protected and lowered to ease pressure.
                </p>
              </div>

              {/* AI Forecast Banner */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs text-left">
                <div className="flex items-center space-x-1.5 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{aiResponse?.forecast_energy_label || 'AI Estimate: Energy boost expected'}</span>
                </div>
                <p className="text-[11px] text-teal-700">
                  This forecast is an AI wellness estimate to encourage pacing, not a medical prediction.
                </p>
              </div>

              {/* Follow-up Check-in */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  How are you feeling right now?
                </label>
                <div className="flex justify-center space-x-2">
                  {['😴 Tired', '🙂 Better', '⚡ Energized', '😌 Calm'].map((label, idx) => (
                    <button
                      key={label}
                      onClick={() => setPostRating(idx + 1)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        postRating === idx + 1
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
              >
                Done & Return to Recovery Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
