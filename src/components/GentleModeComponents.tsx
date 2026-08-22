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
  Coffee,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';
import { RecoveryAction, GoalAdjustment } from '../types/energy';

/**
 * Top Header Pill for Gentle Mode status & exit controls
 */
export const HeaderPill: React.FC = () => {
  const { isGentleMode, setMode, needsReCheck, openCheckInModal, lastCheckIn } = useEnergyMode();

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-teal-200/60 py-2.5 px-4 sm:px-6 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2.5 text-teal-900 font-medium">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold font-display text-teal-950 flex items-center gap-1.5">
            🌱 Gentle Mode Active
          </span>
          <span className="text-teal-700/60 hidden md:inline">•</span>
          <span className="text-teal-800/80 hidden md:inline">
            Low-cognitive workload mode enabled based on your energy check-in.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {needsReCheck && (
            <button
              onClick={openCheckInModal}
              className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold text-[11px] transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>⚡ Energy Re-check Due</span>
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
 * Prominently displayed Recovery Plan Card with checkable micro-actions
 */
export const RecoveryPlanCard: React.FC = () => {
  const { recoveryPlan, toggleRecoveryAction, aiResponse, lastCheckIn, openCheckInModal } = useEnergyMode();

  if (!recoveryPlan || recoveryPlan.length === 0) return null;

  const completedCount = recoveryPlan.filter((a) => a.completed).length;
  const progressPct = Math.round((completedCount / recoveryPlan.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-teal-200/80 p-6 sm:p-8 shadow-sm backdrop-blur-md mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-teal-200/60">
        <div className="flex items-start space-x-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                🌱 🌱 Recovery Plan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {aiResponse?.energy_state || 'Restorative Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              {aiResponse?.insights ||
                'Here are low-effort micro-habits designed to restore your mental & physical energy today.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center min-w-[140px]">
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 mb-1.5">
            <span>Progress: {progressPct}%</span>
            <span className="text-slate-500 font-normal">({completedCount}/{recoveryPlan.length})</span>
          </div>
          <div className="w-full bg-teal-200/60 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
            />
          </div>
          <button
            onClick={openCheckInModal}
            className="mt-3 text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Re-check Energy</span>
          </button>
        </div>
      </div>

      {/* Micro-actions checklist */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {recoveryPlan.map((action) => {
          return (
            <button
              key={action.id}
              onClick={() => toggleRecoveryAction(action.id)}
              className={`flex items-start space-x-3 p-4 rounded-2xl border text-left transition-all duration-200 ${
                action.completed
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                  : 'bg-white/90 border-teal-200/70 hover:border-teal-400 hover:bg-white text-slate-800 shadow-xs'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {action.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5 text-teal-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold leading-snug ${
                    action.completed ? 'line-through text-emerald-800 opacity-80' : 'text-slate-800'
                  }`}
                >
                  {action.task}
                </p>
                <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium bg-teal-100/70 text-teal-800 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3" />
                    {action.duration}
                  </span>
                  {action.category && (
                    <span className="capitalize text-slate-500 font-medium">• {action.category}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

/**
 * Collapsible section for deferred tasks under Rest Mode
 */
export const DeferredTasksAccordion: React.FC = () => {
  const { goalAdjustments } = useEnergyMode();
  const [isOpen, setIsOpen] = useState(false);

  const deferred = goalAdjustments.filter((g) => g.status === 'deferred');

  if (deferred.length === 0) {
    // Default fallback deferred tasks if none provided
    const defaultDeferred: GoalAdjustment[] = [
      {
        id: 'def-1',
        title: 'Deep Health Metric Analytics & Trend Comparison',
        status: 'deferred',
        reason: 'Requires high cognitive energy. Saved safely for tomorrow.',
      },
      {
        id: 'def-2',
        title: 'Detailed Audit Log Review & Access Revocation',
        status: 'deferred',
        reason: 'Administrative maintenance task deferred.',
      },
      {
        id: 'def-3',
        title: 'Multi-document OCR Batch Uploads',
        status: 'deferred',
        reason: 'Complex file workflow postponed to preserve energy.',
      },
    ];
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 overflow-hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
              🌙 {defaultDeferred.length}
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 font-display">
                Deferred for Tomorrow (Rest Mode)
              </h4>
              <p className="text-[11px] text-slate-500">
                Non-essential tasks automatically tucked away to reduce visual clutter.
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
              {defaultDeferred.map((item) => (
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
  }

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
              High-cognitive tasks paused so you can focus on gentle recovery.
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
