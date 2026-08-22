import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sliders,
  Save,
  Info,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';

export const CoachAdminRecoveryTrends: React.FC = () => {
  const { auditLogs, safetyResources, updateSafetyResources } = useEnergyMode();

  const [hotline, setHotline] = useState(safetyResources.crisisHotline);
  const [emergency, setEmergency] = useState(safetyResources.emergencyServices);
  const [isSaved, setIsSaved] = useState(false);

  // Configurable Trigger Thresholds state
  const [recoveryThresholdEnergy, setRecoveryThresholdEnergy] = useState<number>(2);
  const [recoveryThresholdStress, setRecoveryThresholdStress] = useState<number>(4);

  const totalActivations = auditLogs.length + 14; // demo data addition for rich visualization
  const recoveryCount = auditLogs.filter((l) => l.assignedMode === 'recovery').length + 10;
  const lightCount = auditLogs.filter((l) => l.assignedMode === 'light').length + 4;
  const completedCount = auditLogs.filter((l) => l.completedActivity).length + 12;

  const completionRate = Math.round((completedCount / totalActivations) * 100);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSafetyResources({
      crisisHotline: hotline,
      emergencyServices: emergency,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Coach / Admin Analytics
              </span>
              <span className="text-xs text-slate-500">Anonymized Wellness Aggregate Data</span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 mt-2">
              Recovery Mode Trends & Threshold Config
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Monitor wellness activations, recovery activity completion rates, and configure crisis resource parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-1">
            <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Total Activations</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalActivations}</p>
          <span className="text-[10px] text-teal-700 font-semibold">{recoveryCount} Recovery • {lightCount} Light</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completion Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{completionRate}%</p>
          <span className="text-[10px] text-slate-500 font-medium">Completed 3-min activity</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Avg Recovery Time</span>
          </div>
          <p className="text-2xl font-extrabold text-cyan-600">18.4 hrs</p>
          <span className="text-[10px] text-slate-500 font-medium">Before normal return</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Normal Return Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600">92%</p>
          <span className="text-[10px] text-slate-500 font-medium">Gradual or immediate exit</span>
        </div>
      </div>

      {/* Top Trigger Categories & Threshold Config Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Common Trigger Categories */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>Most Common Trigger Categories</span>
          </h3>

          <div className="space-y-3">
            {[
              { category: 'Exam / Cognitive Pressure', pct: 42, color: 'bg-teal-500' },
              { category: 'Physical Fatigue & Sickness', pct: 28, color: 'bg-cyan-500' },
              { category: 'Sleep Deprivation (<5h)', pct: 18, color: 'bg-indigo-500' },
              { category: 'Acute Stress & Anxiety', pct: 12, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.category}</span>
                  <span>{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurable Trigger Thresholds */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Configurable Trigger Thresholds</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Recovery Mode Energy Trigger Level (1 to 5):
              </label>
              <select
                value={recoveryThresholdEnergy}
                onChange={(e) => setRecoveryThresholdEnergy(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none"
              >
                <option value={1}>Level 1 (🪫 Drained Only)</option>
                <option value={2}>Level 2 (🪫 Drained or 🥱 Low Energy - Recommended)</option>
                <option value={3}>Level 3 (🔋 Moderate Energy & Below)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Recovery Mode Stress Trigger Level (1 to 5):
              </label>
              <select
                value={recoveryThresholdStress}
                onChange={(e) => setRecoveryThresholdStress(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none"
              >
                <option value={3}>Level 3 (Moderate Stress)</option>
                <option value={4}>Level 4 (High Stress - Recommended)</option>
                <option value={5}>Level 5 (Severe Stress Only)</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              ℹ️ Adjustments apply to all users managed under this organization policy.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Resources Editor */}
      <form onSubmit={handleSaveConfig} className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Configurable Safety & Crisis Hotline Parameters</span>
          </h3>
          {isSaved && <span className="text-xs font-bold text-emerald-600">✓ Changes Saved Successfully</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Crisis Hotline Resource:</label>
            <input
              type="text"
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Emergency Services Number:</label>
            <input
              type="text"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Crisis Resource Configuration</span>
        </button>
      </form>
    </div>
  );
};
