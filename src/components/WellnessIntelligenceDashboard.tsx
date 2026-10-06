import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Activity,
  Heart,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  PhoneCall,
  Brain,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';
import { useMediVault } from '../context/MediVaultContext';
import { WellnessScoreRing } from './WellnessScoreRing';

export const WellnessIntelligenceDashboard: React.FC<{ onOpenEmergencyModal?: () => void }> = () => {
  const {
    currentMode,
    setMode,
    openCheckInModal,
    openRecoveryPlayer,
    openTriageModal,
    aiResponse,
    recoveryPlan,
    wellnessHistory,
    activeExplanation,
    active10MinPlan,
    wellnessInsight,
    hasCompletedCheckIn,
  } = useEnergyMode();

  const { patient, currentUser } = useMediVault();

  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [completed10MinSteps, setCompleted10MinSteps] = useState<Record<number, boolean>>({});

  const toggle10MinStep = (idx: number) => {
    setCompleted10MinSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const patientName = patient?.fullName?.trim() || currentUser?.displayName?.trim() || 'Patient';

  const latestRecord = wellnessHistory[0];
  const latestEnergy = hasCompletedCheckIn ? (latestRecord?.energyLevel || (aiResponse?.energy_level || 3)) : 0;
  const latestStress = hasCompletedCheckIn ? (latestRecord?.stressLevel || (aiResponse?.stress_level || 2)) : 0;
  const latestSymptomsCount = hasCompletedCheckIn ? (latestRecord?.symptoms || []).filter((s) => s !== 'None').length : 0;

  // Extract last 7 assessments for Weekly Trend charts (sorted chronologically)
  const chartRecords = [...wellnessHistory].reverse().slice(-7);

  const urgentWarningText =
    aiResponse?.urgent_warning ||
    (wellnessHistory[0]?.safetyLevel === 'urgent' ? wellnessHistory[0]?.urgentWarning : null);

  // Helper SVG generator for weekly trend line charts
  const renderTrendChart = (
    dataKey: 'energyLevel' | 'stressLevel',
    colorHex: string,
    gradientId: string
  ) => {
    if (chartRecords.length === 0) {
      return (
        <div className="h-28 flex items-center justify-center text-xs text-slate-400 font-medium">
          No assessment history yet. Complete an AI Health Check to plot trends.
        </div>
      );
    }

    const height = 110;
    const width = 300;
    const padding = 20;

    const points = chartRecords.map((r, i) => {
      const x =
        chartRecords.length === 1
          ? width / 2
          : padding + (i / (chartRecords.length - 1)) * (width - 2 * padding);
      const val = r[dataKey] || 3;
      const y = height - padding - ((val - 1) / 4) * (height - 2 * padding);
      return { x, y, val, date: new Date(r.timestamp).toLocaleDateString(undefined, { weekday: 'short' }) };
    });

    const pathD = points.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ''
    );

    const areaD =
      points.length > 1
        ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${
            height - padding
          } Z`
        : '';

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="1">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.25" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#F1F5F9" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#F1F5F9" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2E8F0" />

          {/* Area fill */}
          {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

          {/* Smooth Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={colorHex}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#FFFFFF"
                stroke={colorHex}
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 7}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#334155"
              >
                {p.val}
              </text>
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                fontSize="8"
                fill="#94A3B8"
                fontWeight="500"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Recent symptoms count breakdown
  const symptomCounts: Record<string, number> = {};
  wellnessHistory.forEach((r) => {
    (r.symptoms || []).forEach((s) => {
      if (s && s !== 'None') {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* 1. Health Status & Score Summary Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Greeting & Check-in Prompt */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                AI Health Assistant
              </span>
              {hasCompletedCheckIn && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Assessment Complete</span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900">
                Health & Wellness Status
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {hasCompletedCheckIn
                  ? `Assessment updated for ${patientName}. Review your health indicators and personalized next steps below.`
                  : 'Complete your 1-minute AI Health Check to generate your wellness assessment and guidance.'}
              </p>
            </div>

            {/* Assessment results or prompt */}
            {hasCompletedCheckIn ? (
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  AI Assessment Summary:
                </span>
                <p className="font-semibold text-slate-900">
                  {wellnessInsight || 'Stable condition. Maintain routine hydration and scheduled rest.'}
                </p>
              </div>
            ) : null}

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                onClick={openCheckInModal}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hasCompletedCheckIn ? 'Re-take Health Check' : 'Start Health Check'}</span>
              </button>

              {currentMode !== 'normal' && (
                <button
                  onClick={() => setMode('normal')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Normal Mode</span>
                </button>
              )}
            </div>
          </div>

          {/* Wellness Score Ring / Status */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 w-full max-w-xs flex flex-col items-center">
              <WellnessScoreRing
                energyLevel={latestEnergy}
                stressLevel={latestStress}
                symptomsCount={latestSymptomsCount}
                isPending={!hasCompletedCheckIn}
                onClickCheckIn={openCheckInModal}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Emergency Risk Escalation Warning Layer (if triggered) */}
      {urgentWarningText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 sm:p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 shadow-xs space-y-3"
        >
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-200 text-rose-800">
                Medical Alert Notice
              </span>
              <h3 className="text-base font-bold text-rose-900 font-display">
                Emergency Attention Recommended
              </h3>
              <p className="text-xs font-medium text-rose-800 leading-relaxed max-w-3xl">
                "{urgentWarningText}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rose-200">
            <p className="text-[11px] text-rose-700">
              MediVault AI provides wellness guidance and does not replace emergency clinical care.
            </p>
            <div className="flex items-center space-x-2">
              <a
                href="tel:112"
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency (112)</span>
              </a>
              <button
                onClick={openTriageModal}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors"
              >
                Emergency Services
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. AI Health Trend Charts */}
      {hasCompletedCheckIn && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Weekly Health Trends</span>
            </h3>
            <span className="text-xs text-slate-500">
              {wellnessHistory.length} check-in{wellnessHistory.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {/* Charts & Symptoms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Energy Trend */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  Energy Trend
                </span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  1–5 Scale
                </span>
              </div>
              {renderTrendChart('energyLevel', '#0D9488', 'energyGrad')}
            </div>

            {/* Stress Trend */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-amber-600" />
                  Stress Trend
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  1–5 Scale
                </span>
              </div>
              {renderTrendChart('stressLevel', '#F59E0B', 'stressGrad')}
            </div>

            {/* Symptoms Summary */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Reported Symptoms
              </span>

              {Object.keys(symptomCounts).length === 0 ? (
                <div className="h-28 flex items-center justify-center text-xs text-slate-400">
                  No physical symptoms reported.
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {Object.entries(symptomCounts).map(([symp, count]) => (
                    <div
                      key={symp}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="font-medium text-slate-800">{symp}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800">
                        {count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Tailored Recommendation Card */}
      {hasCompletedCheckIn && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 font-display">
                  Recommended Health Actions
                </h4>
                <p className="text-xs text-slate-500">
                  Personalized based on your latest energy, stress, and symptom responses.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExplanationOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>Explain Recommendation</span>
            </button>
          </div>

          {/* Micro-Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recoveryPlan.slice(0, 3).map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
              >
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Step {idx + 1} ({step.duration_seconds}s)
                </span>
                <h5 className="text-xs font-bold text-slate-900 mt-1">{step.title}</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={openRecoveryPlayer}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start 3-Minute Guided Session</span>
            </button>
            <span className="text-[10px] text-slate-400">
              General wellness guidance • Non-clinical
            </span>
          </div>
        </div>
      )}

      {/* 5. 10-Minute Wellness Plan (if present) */}
      {hasCompletedCheckIn && active10MinPlan && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">
                {active10MinPlan.title}
              </h4>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {active10MinPlan.totalDurationMinutes} Mins
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {active10MinPlan.steps.map((step, idx) => {
              const isChecked = !!completed10MinSteps[idx];
              return (
                <button
                  key={idx}
                  onClick={() => toggle10MinStep(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start space-x-2.5 ${
                    isChecked
                      ? 'bg-teal-50/60 border-teal-300 text-teal-950'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {step.durationMinutes} min {step.type}
                    </span>
                    <h5 className={`text-xs font-bold ${isChecked ? 'line-through opacity-75' : ''}`}>
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      <AnimatePresence>
        {isExplanationOpen && activeExplanation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden z-10 my-8"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <HelpCircle className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="font-bold text-sm">
                      Recommendation Details
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Transparent non-diagnostic breakdown
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExplanationOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">1. User Inputs Summary</span>
                  <p className="font-semibold text-slate-900">{activeExplanation.userInputsSummary}</p>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-teal-800">2. Rationale</span>
                  <p className="font-medium text-slate-800">{activeExplanation.whySelected}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">3. Expected Benefit</span>
                  <p className="font-medium text-slate-800">{activeExplanation.whatItSupports}</p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-rose-950">
                  <span className="text-[10px] font-bold uppercase text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    4. When To Seek Professional Medical Care
                  </span>
                  <p className="font-medium">{activeExplanation.whenToSeekMedicalHelp}</p>
                </div>

                <button
                  onClick={() => setIsExplanationOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
