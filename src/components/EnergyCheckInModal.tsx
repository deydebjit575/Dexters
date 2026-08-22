import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Battery, BatteryCharging, Zap, Flame, Smile, Check } from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';
import { EnergyLevel } from '../types/energy';

const ENERGY_OPTIONS: { level: EnergyLevel; icon: string; label: string; subtext: string; color: string; bgColor: string }[] = [
  { level: 1, icon: '🪫', label: 'Drained', subtext: 'Exhausted & low reserves', color: 'text-rose-500', bgColor: 'bg-rose-50 border-rose-200 hover:bg-rose-100/80' },
  { level: 2, icon: '🥱', label: 'Low Energy', subtext: 'Fatigued or foggy', color: 'text-amber-500', bgColor: 'bg-amber-50 border-amber-200 hover:bg-amber-100/80' },
  { level: 3, icon: '🔋', label: 'Moderate', subtext: 'Balanced & steady', color: 'text-cyan-600', bgColor: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100/80' },
  { level: 4, icon: '⚡', label: 'Active', subtext: 'Focused & energizing', color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-200 hover:bg-teal-100/80' },
  { level: 5, icon: '🔥', label: 'Peak High', subtext: 'High stamina & motivation', color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80' },
];

const PRESET_FEELING_TAGS = [
  'Brain Fog',
  'Physical Fatigue',
  'Stress',
  'Focused',
  'Rested',
  'Anxious',
  'Calm',
  'Overwhelmed',
  'Productive',
  'Tired',
];

export const EnergyCheckInModal: React.FC = () => {
  const { isCheckInOpen, closeCheckInModal, submitCheckIn, isSubmittingCheckIn } = useEnergyMode();

  const [selectedLevel, setSelectedLevel] = useState<EnergyLevel>(2);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Low Energy', 'Stress']);
  const [note, setNote] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCheckIn({
      energyLevel: selectedLevel,
      feelingTags: selectedTags,
      note: note.trim() || undefined,
    });
  };

  if (!isCheckInOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCheckInModal}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-10 my-8"
        >
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-indigo-500/5 border-b border-slate-100">
            <button
              onClick={closeCheckInModal}
              disabled={isSubmittingCheckIn}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
                  Adaptive Energy Check-in
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check in with your mind & body for AI-tailored workload adaptation.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* 1. Energy Scale (1 to 5) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                1. How is your energy level right now?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ENERGY_OPTIONS.map((opt) => {
                  const isSelected = selectedLevel === opt.level;
                  return (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setSelectedLevel(opt.level)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? `bg-white border-2 border-cyan-500 shadow-lg shadow-cyan-500/10 scale-105 ${opt.color}`
                          : `bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100`
                      }`}
                    >
                      <span className="text-2xl mb-1">{opt.icon}</span>
                      <span className="text-[11px] font-bold tracking-tight">{opt.level}</span>
                      <span className="text-[9px] text-slate-500 truncate max-w-full font-medium hidden sm:inline">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Label Subtext */}
              <div className="mt-2.5 text-center">
                <span className="text-xs font-semibold text-slate-700">
                  {ENERGY_OPTIONS.find((o) => o.level === selectedLevel)?.icon}{' '}
                  {ENERGY_OPTIONS.find((o) => o.level === selectedLevel)?.label}
                </span>
                <span className="text-xs text-slate-400 ml-1.5 font-normal">
                  — {ENERGY_OPTIONS.find((o) => o.level === selectedLevel)?.subtext}
                </span>
              </div>
            </div>

            {/* 2. Quick Feeling Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                2. Quick feeling tags
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_FEELING_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-600 ring-offset-1'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Optional 1-line text input */}
            <div>
              <label htmlFor="energy-notes" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                3. What's draining or energizing you today? <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                id="energy-notes"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Back-to-back calls, poor sleep, or post-workout momentum..."
                className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingCheckIn}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmittingCheckIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Energy & Generating Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Check-in</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
