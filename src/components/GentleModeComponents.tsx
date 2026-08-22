import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  BatteryCharging,
  Sun,
  ShieldCheck,
  RefreshCw,
  Heart,
  Droplets,
  HelpCircle,
  Play,
  Check,
  Info,
  ShieldAlert,
  Wind,
  Activity,
  Brain,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';

/**
 * Top Header Status Bar for Recovery / Light Mode
 */
export const HeaderPill: React.FC = () => {
  const { currentMode, setMode, needsReCheck, openCheckInModal } = useEnergyMode();

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-teal-200/60 py-2.5 px-4 sm:px-6 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2.5 text-teal-900 font-medium">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold font-display text-teal-950 flex items-center gap-1.5">
            🌱 {currentMode === 'recovery' ? 'Recovery Day Mode Active' : 'Light Mode Active'}
          </span>
          <span className="text-teal-700/60 hidden md:inline">•</span>
          <span className="text-teal-800/80 hidden md:inline">
            Today can be lighter. Your streak is protected for 24 hours.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {needsReCheck && (
            <button
              onClick={openCheckInModal}
              className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold text-[11px] transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>⚡ Energy Re-check</span>
            </button>
          )}

          <button
            onClick={() => setMode('normal')}
            className="px-3 py-1 rounded-full bg-white text-teal-800 hover:text-teal-950 hover:bg-teal-100/60 border border-teal-300/80 font-bold text-[11px] transition-all shadow-xs"
          >
            Switch to Normal Mode
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Recovery Mode Dashboard Card
 */
export const RecoveryPlanCard: React.FC = () => {
  const {
    aiResponse,
    recoveryPlan,
    openRecoveryPlayer,
    setMode,
    openTriageModal,
    originalActivityTarget,
    currentActivityTarget,
  } = useEnergyMode();

  const [showStreakTooltip, setShowStreakTooltip] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const problemInsightText =
    aiResponse?.reasons?.[0] ||
    'AI Analysis: Tailored precautions generated specifically for your reported problem.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-teal-200/80 p-6 sm:p-8 shadow-sm backdrop-blur-md mb-8 space-y-6"
    >
      {/* Reassuring Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-teal-200/60">
        <div className="flex items-start space-x-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                Today can be lighter 🌱
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                {aiResponse?.mode || 'Recovery Mode'}
              </span>
            </div>
            <p className="text-xs font-medium text-teal-800 mt-1 max-w-xl">
              "You do not need to complete everything right now. Your recovery day is protected."
            </p>
          </div>
        </div>

        {/* Streak Protection Badge with Tooltip */}
        <div className="relative flex flex-col items-end justify-center">
          <div
            onMouseEnter={() => setShowStreakTooltip(true)}
            onMouseLeave={() => setShowStreakTooltip(false)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Streak Protected Today</span>
            <Info className="w-3.5 h-3.5 text-emerald-700 ml-1" />
          </div>

          <AnimatePresence>
            {showStreakTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-10 right-0 w-64 p-3 rounded-2xl bg-slate-900 text-white text-[11px] shadow-xl z-20 font-sans leading-relaxed"
              >
                🌱 <strong>Rest is Progress:</strong> Recovery Days count intentionally as part of your wellness journey. No broken-streak warnings during recovery mode!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Problem Analysis Banner */}
      <div className="p-4 rounded-2xl bg-white/90 border border-teal-200/80 shadow-xs space-y-1">
        <div className="flex items-center space-x-2 text-xs font-bold text-teal-900">
          <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
          <span>Tailored Precautions & Problem Analysis</span>
        </div>
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          {problemInsightText}
        </p>
      </div>

      {/* PROBLEM-SPECIFIC TAILORED RECOVERY MICRO-ACTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Problem-Specific Recovery Micro-Actions:
          </h4>
          <span className="text-[11px] text-slate-500">3-Minute Tailored Plan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recoveryPlan.map((step, idx) => {
            const isDone = !!completedSteps[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleStepCompleted(idx)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                    : 'bg-white/90 border-teal-200/80 hover:border-teal-400 hover:bg-white shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100/70 text-teal-800">
                      Step {idx + 1} ({step.duration_seconds}s)
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-teal-300" />
                    )}
                  </div>
                  <h5 className={`text-xs font-bold ${isDone ? 'line-through text-emerald-900 opacity-75' : 'text-slate-900'}`}>
                    {step.title}
                  </h5>
                  <p className={`text-[11px] leading-relaxed ${isDone ? 'text-emerald-700 opacity-80' : 'text-slate-600'}`}>
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Adjustment Summary & Hydration Guidance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Adjusted Goal Target */}
        <div className="p-4 rounded-2xl bg-white/90 border border-teal-200/80 shadow-xs space-y-1">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Adjusted Daily Target
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-teal-900">{currentActivityTarget} steps</span>
            <span className="text-xs text-slate-400 line-through">({originalActivityTarget})</span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium">
            25% optional light goal for 24 hours.
          </p>
        </div>

        {/* Hydration & Rest Guidance */}
        <div className="p-4 rounded-2xl bg-white/90 border border-teal-200/80 shadow-xs space-y-1">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
            Hydration Guidance
          </p>
          <p className="text-xs font-bold text-slate-800">
            Sip 500ml cold water with electrolytes
          </p>
          <p className="text-[11px] text-slate-500">
            Crucial for head pressure & cognitive fatigue recovery.
          </p>
        </div>

        {/* Mode Duration Timer */}
        <div className="p-4 rounded-2xl bg-white/90 border border-teal-200/80 shadow-xs space-y-1">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Recovery Mode Duration
          </p>
          <p className="text-xl font-bold text-slate-900">23h 59m remaining</p>
          <p className="text-[11px] text-slate-500">This is a temporary adjustment.</p>
        </div>
      </div>

      {/* Primary Recovery Action Buttons requested in spec */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Start 3-Minute Recovery Button */}
          <button
            onClick={openRecoveryPlayer}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start 3-Minute Guided Session</span>
          </button>

          {/* I Feel Better Button */}
          <button
            onClick={() => setMode('normal')}
            className="px-4 py-3 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>I Feel Better</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* I Need Help Button (Safety Escalation) */}
          <button
            onClick={openTriageModal}
            className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>I Need Help</span>
          </button>

          {/* Return to Normal Mode Option */}
          <button
            onClick={() => setMode('normal')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium underline px-2"
          >
            Return to Normal Mode
          </button>
        </div>
      </div>

      {/* Non-medical Disclaimer */}
      <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
        ℹ️ This feature provides wellness support and does not replace medical or emergency care.
      </div>
    </motion.div>
  );
};

/**
 * Collapsible section for deferred tasks under Rest Mode
 */
export const DeferredTasksAccordion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const deferred = [
    {
      id: 'def-1',
      title: 'Heavy Clinical Data & Multi-graph Analytics',
      reason: 'Deferred to protect cognitive load during recovery mode.',
    },
    {
      id: 'def-2',
      title: 'Batch OCR Prescription Processing',
      reason: 'Administrative task paused for 24 hours.',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 overflow-hidden mb-8 shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left"
      >
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
            🌙 {deferred.length}
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-800 font-display">
              Deferred for Tomorrow (Rest Mode)
            </h4>
            <p className="text-[11px] text-slate-500">
              Demanding tasks automatically hidden so you can rest.
            </p>
          </div>
        </div>
        <div className="text-slate-400">{isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 space-y-2.5 border-t border-slate-200/60 bg-white"
          >
            {deferred.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 line-through opacity-75">{item.title}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.reason}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  Deferred
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
