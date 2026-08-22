import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  RefreshCw,
  PhoneCall,
  Info,
  ChevronRight,
  Brain,
  AlertTriangle,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';
import { WellnessRecord } from '../types/energy';

export const WellnessIntelligenceDashboard: React.FC<{ onOpenEmergencyModal?: () => void }> = ({
  onOpenEmergencyModal,
}) => {
  const {
    currentMode,
    openCheckInModal,
    openRecoveryPlayer,
    openTriageModal,
    aiResponse,
    recoveryPlan,
    wellnessHistory,
    activeExplanation,
    active10MinPlan,
    wellnessInsight,
    safetyResources,
  } = useEnergyMode();

  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [completed10MinSteps, setCompleted10MinSteps] = useState<Record<number, boolean>>({});

  const toggle10MinStep = (idx: number) => {
    setCompleted10MinSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Extract last 7 assessments for Weekly Trend charts (sorted chronologically)
  const chartRecords = [...wellnessHistory].reverse().slice(-7);

  const urgentWarningText =
    aiResponse?.urgent_warning ||
    (wellnessHistory[0]?.safetyLevel === 'urgent' ? wellnessHistory[0]?.urgentWarning : null);

  // Helper SVG generator for weekly trend line charts
  const renderTrendChart = (
    dataKey: 'energyLevel' | 'stressLevel',
    colorHex: string,
    gradientId: string,
    label: string
  ) => {
    if (chartRecords.length === 0) {
      return (
        <div className="h-32 flex items-center justify-center text-xs text-slate-400 font-mono">
          No assessment history yet. Complete a check-in to plot trends.
        </div>
      );
    }

    const height = 120;
    const width = 320;
    const padding = 24;

    const points = chartRecords.map((r, i) => {
      const x =
        chartRecords.length === 1
          ? width / 2
          : padding + (i / (chartRecords.length - 1)) * (width - 2 * padding);
      const val = r[dataKey] || 3;
      // y scaled between 1 and 5
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
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2E8F0" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E2E8F0" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#CBD5E1" />

          {/* Area fill */}
          {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

          {/* Smooth Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={colorHex}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#FFFFFF"
                stroke={colorHex}
                strokeWidth="2.5"
                className="transition-transform group-hover:scale-125"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#334155"
              >
                {p.val}
              </text>
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                fontSize="9"
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
    <div className="space-y-8">
      {/* 1. Header Banner & Firestore Sync Indicator */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="ambient-glow-cyan -top-20 -left-20 opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-xs">
                ✨ Wellness Intelligence System
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Firestore Secured ({wellnessHistory.length} Saved)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
              Personalized AI Wellness Hub
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Track energy & stress trends, receive multi-factor personalized recommendations, review 10-minute wellness plans, and access instant emergency escalation.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openCheckInModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Start Wellness Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Emergency Risk Escalation Warning Layer */}
      {urgentWarningText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white shadow-xl space-y-4 border-2 border-rose-300 relative"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <ShieldAlert className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white text-rose-700 tracking-wider">
                Urgent Medical Alert Layer
              </span>
              <h3 className="text-lg font-extrabold font-display">
                Emergency Attention Recommended
              </h3>
              <p className="text-xs font-semibold text-rose-100 leading-relaxed max-w-3xl">
                "{urgentWarningText}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/20">
            <p className="text-[11px] text-rose-100 font-mono">
              ⚠️ MediVault provides wellness support and does not replace emergency medical response.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="tel:112"
                className="px-4 py-2.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-md hover:bg-rose-50 transition-colors flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>Call Emergency (112)</span>
              </a>
              <button
                onClick={openTriageModal}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-black transition-colors"
              >
                Open Emergency Services
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. AI Health Trend Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <span>AI Health Trend Dashboard</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Firestore History ({wellnessHistory.length} check-ins)
          </span>
        </div>

        {/* Dynamic Insight Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 border border-teal-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                Simple Wellness Insight:
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                "{wellnessInsight}"
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Symptoms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Energy Trend Chart */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Weekly Energy Trend
              </span>
              <span className="text-[11px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                1 to 5 Scale
              </span>
            </div>
            {renderTrendChart('energyLevel', '#0D9488', 'energyGrad', 'Energy')}
          </div>

          {/* Stress Trend Chart */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-amber-600" />
                Weekly Stress Trend
              </span>
              <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                1 to 5 Scale
              </span>
            </div>
            {renderTrendChart('stressLevel', '#F59E0B', 'stressGrad', 'Stress')}
          </div>

          {/* Recent Symptoms Frequency */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              Recent Symptoms Summary
            </span>

            {Object.keys(symptomCounts).length === 0 ? (
              <div className="h-28 flex items-center justify-center text-xs text-slate-400 font-mono">
                No physical symptoms recorded.
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {Object.entries(symptomCounts).map(([symp, count]) => (
                  <div
                    key={symp}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-bold text-slate-800">{symp}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-100 text-teal-800">
                      {count} {count === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Smart Personalized Recommendation & Explain Button */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-teal-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-200/60 pb-5">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  Smart Personalized Recommendation
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-100 text-teal-800 border border-teal-300">
                  {aiResponse?.mode || currentMode} Mode
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Generated from energy, stress, symptoms, and recent wellness history.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Explain My Recommendation Button */}
            <button
              onClick={() => setIsExplanationOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-teal-50 border border-teal-300 text-teal-900 font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Explain My Recommendation</span>
            </button>
          </div>
        </div>

        {/* Tailored Micro-Actions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Tailored 3-Minute Guided Session Micro-Actions:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recoveryPlan.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/90 border border-teal-200/80 shadow-xs space-y-1"
              >
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  Step {idx + 1} ({step.duration_seconds}s)
                </span>
                <h5 className="text-xs font-bold text-slate-900 mt-1">{step.title}</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guided Session Launcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={openRecoveryPlayer}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start 3-Minute Guided Activity</span>
          </button>

          <p className="text-[10px] text-slate-400 font-mono">
            ℹ️ Framed strictly as general wellness guidance.
          </p>
        </div>
      </div>

      {/* 5. Personalized 10-Minute Wellness Plan */}
      {active10MinPlan && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  {active10MinPlan.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Adapted specifically for your current energy, stress, and symptoms.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
              {active10MinPlan.totalDurationMinutes} Mins Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {active10MinPlan.steps.map((step, idx) => {
              const isChecked = !!completed10MinSteps[idx];
              return (
                <button
                  key={idx}
                  onClick={() => toggle10MinStep(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                    isChecked
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      ✓ {step.durationMinutes} min {step.type}
                    </span>
                    <h4 className={`text-xs font-bold mt-1 ${isChecked ? 'line-through opacity-80' : ''}`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Interactive Modal: "Explain My Recommendation" */}
      <AnimatePresence>
        {isExplanationOpen && activeExplanation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExplanationOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-teal-100 overflow-hidden z-10 my-8"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base font-display">
                      Explain My Recommendation
                    </h3>
                    <p className="text-[11px] text-teal-100">
                      Understandable, non-diagnostic transparent analysis
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExplanationOpen(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-700 leading-relaxed">
                {/* What You Entered */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                    1. What You Entered
                  </span>
                  <p className="font-semibold text-slate-900">{activeExplanation.userInputsSummary}</p>
                </div>

                {/* Why Selected */}
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-900">
                    2. Why System Selected This Activity
                  </span>
                  <p className="font-medium text-slate-800">{activeExplanation.whySelected}</p>
                </div>

                {/* What It Supports */}
                <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-900">
                    3. What The Activity Is Intended To Support
                  </span>
                  <p className="font-medium text-slate-800">{activeExplanation.whatItSupports}</p>
                </div>

                {/* Medical Help Guidance */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 text-rose-950">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    4. When To Seek Professional Medical Help
                  </span>
                  <p className="font-medium">{activeExplanation.whenToSeekMedicalHelp}</p>
                </div>

                <button
                  onClick={() => setIsExplanationOpen(false)}
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Close Explanation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
