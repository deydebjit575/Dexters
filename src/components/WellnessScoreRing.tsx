import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { EnergyLevel, StressLevel } from '../types/energy';

interface WellnessScoreRingProps {
  energyLevel: EnergyLevel;
  stressLevel: StressLevel;
  symptomsCount?: number;
  scoreOverride?: number;
  size?: number;
  strokeWidth?: number;
  onClickCheckIn?: () => void;
}

export const WellnessScoreRing: React.FC<WellnessScoreRingProps> = ({
  energyLevel = 3,
  stressLevel = 2,
  symptomsCount = 0,
  scoreOverride,
  size = 220,
  strokeWidth = 14,
  onClickCheckIn,
}) => {
  // Calculate wellness score (0 - 100)
  // Energy (1-5) contributes 40 points
  // Stress (1-5 inverted: 6 - stress) contributes 40 points
  // Symptom absence contributes 20 points
  const rawScore =
    scoreOverride ??
    Math.min(
      100,
      Math.max(
        10,
        Math.round((energyLevel / 5) * 40 + ((6 - stressLevel) / 5) * 40 + (symptomsCount === 0 ? 20 : 10 - Math.min(10, symptomsCount * 3)))
      )
    );

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rawScore / 100) * circumference;

  // Determine state & colors based on score
  let statusLabel = 'Positive Wellness State';
  let colorGradient = {
    start: '#10B981', // Emerald
    end: '#06B6D4',   // Cyan
    badgeBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    ringTrack: 'stroke-emerald-100',
  };

  if (rawScore < 50) {
    statusLabel = 'Needs Attention';
    colorGradient = {
      start: '#F43F5E', // Rose
      end: '#F97316',   // Orange
      badgeBg: 'bg-rose-500/10 text-rose-700 border-rose-200',
      ringTrack: 'stroke-rose-100',
    };
  } else if (rawScore < 75) {
    statusLabel = 'Moderate Wellness';
    colorGradient = {
      start: '#0D9488', // Teal
      end: '#F59E0B',   // Amber
      badgeBg: 'bg-amber-500/10 text-amber-700 border-amber-200',
      ringTrack: 'stroke-amber-100',
    };
  }

  const gradientId = `wellness-score-grad-${rawScore}`;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Circular Score Ring Container */}
      <div
        className="relative flex items-center justify-center cursor-pointer group"
        onClick={onClickCheckIn}
        style={{ width: size, height: size }}
      >
        {/* Soft Background Ambient Glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ background: `radial-gradient(circle, ${colorGradient.start}, ${colorGradient.end})` }}
        />

        <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorGradient.start} />
              <stop offset="100%" stopColor={colorGradient.end} />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`fill-none ${colorGradient.ringTrack}`}
            strokeWidth={strokeWidth}
          />

          {/* Animated Value Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score & Label Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight drop-shadow-md"
          >
            {rawScore}
          </motion.span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300 mt-0.5">
            WELLNESS SCORE
          </span>
          <span className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colorGradient.badgeBg}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Supporting Indicators Below Ring */}
      <div className="flex items-center justify-center space-x-4 pt-1">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-800">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>⚡ Energy — {energyLevel}/5</span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-800">
          <Heart className="w-3.5 h-3.5 text-amber-600" />
          <span>🧠 Stress — {stressLevel}/5</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-mono text-center">
        ℹ️ Your overall wellness indicator (non-clinical calculation).
      </p>
    </div>
  );
};
