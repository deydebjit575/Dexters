import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Sparkles } from 'lucide-react';

interface WellnessScoreRingProps {
  energyLevel?: number;
  stressLevel?: number;
  symptomsCount?: number;
  scoreOverride?: number;
  size?: number;
  strokeWidth?: number;
  onClickCheckIn?: () => void;
  isPending?: boolean;
}

export const WellnessScoreRing: React.FC<WellnessScoreRingProps> = ({
  energyLevel = 3,
  stressLevel = 2,
  symptomsCount = 0,
  scoreOverride,
  size = 200,
  strokeWidth = 12,
  onClickCheckIn,
  isPending = false,
}) => {
  // Determine if score is pending assessment
  const hasAssessment = !isPending && scoreOverride !== 0;

  // Calculate wellness score (10 - 100)
  const rawScore = hasAssessment
    ? (scoreOverride ??
      Math.min(
        100,
        Math.max(
          10,
          Math.round((energyLevel / 5) * 40 + ((6 - stressLevel) / 5) * 40 + (symptomsCount === 0 ? 20 : 10 - Math.min(10, symptomsCount * 3)))
        )
      ))
    : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = hasAssessment
    ? circumference - (rawScore / 100) * circumference
    : circumference * 0.75; // show partial neutral arc for pending

  // State & colors based on score
  let statusLabel = 'Optimal Wellness';
  let colorGradient = {
    start: '#0D9488', // Teal
    end: '#06B6D4',   // Cyan
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    ringTrack: 'stroke-slate-200',
  };

  if (!hasAssessment) {
    statusLabel = 'Assessment Pending';
    colorGradient = {
      start: '#0D9488',
      end: '#0284C7',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      ringTrack: 'stroke-slate-200',
    };
  } else if (rawScore < 50) {
    statusLabel = 'Needs Attention';
    colorGradient = {
      start: '#E11D48', // Rose
      end: '#F97316',   // Orange
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      ringTrack: 'stroke-slate-200',
    };
  } else if (rawScore < 75) {
    statusLabel = 'Moderate Wellness';
    colorGradient = {
      start: '#0D9488', // Teal
      end: '#F59E0B',   // Amber
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      ringTrack: 'stroke-slate-200',
    };
  }

  const gradientId = `wellness-score-grad-${hasAssessment ? rawScore : 'pending'}`;

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {/* Animated Circular Score Ring */}
      <div
        className="relative flex items-center justify-center cursor-pointer group select-none"
        onClick={onClickCheckIn}
        style={{ width: size, height: size }}
      >
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
            className="fill-none stroke-slate-100 dark:stroke-slate-800"
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
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score & Label Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
          {hasAssessment ? (
            <>
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight"
              >
                {rawScore}
              </motion.span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                WELLNESS SCORE
              </span>
              <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colorGradient.badgeBg}`}>
                {statusLabel}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center px-2">
              <Sparkles className="w-6 h-6 text-teal-600 mb-1 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                WELLNESS STATUS
              </span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                Pending Check
              </span>
              <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Start Check-in
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Supporting Indicators Below Ring */}
      {hasAssessment ? (
        <div className="flex items-center justify-center space-x-2 pt-1">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Energy: {energyLevel}/5</span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <Heart className="w-3.5 h-3.5 text-amber-600" />
            <span>Stress: {stressLevel}/5</span>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500 text-center max-w-[200px]">
          Tap to complete your quick 1-minute AI Health Check
        </p>
      )}
    </div>
  );
};
