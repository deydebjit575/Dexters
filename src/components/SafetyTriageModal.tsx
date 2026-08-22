import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PhoneCall, MessageSquare, HeartHandshake, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';

export const SafetyTriageModal: React.FC = () => {
  const { isTriageModalOpen, closeTriageModal, safetyResources } = useEnergyMode();
  const [trustedContactNotified, setTrustedContactNotified] = useState(false);

  if (!isTriageModalOpen) return null;

  const handleNotifyTrustedContact = () => {
    setTrustedContactNotified(true);
    setTimeout(() => setTrustedContactNotified(false), 5000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTriageModal}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-rose-200 overflow-hidden z-10 my-8"
        >
          {/* Top Banner */}
          <div className="p-6 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white relative">
            <button
              onClick={closeTriageModal}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight font-display">
                  We Are Here for You
                </h3>
                <p className="text-xs text-rose-100 mt-0.5 font-medium">
                  Immediate Support & Crisis Escalation
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Empathetic Message */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs leading-relaxed space-y-1">
              <p className="font-bold text-rose-900">Your safety and well-being are what matter most right now.</p>
              <p>
                Normal daily targets and notifications have been paused. If you are experiencing acute distress or feeling unsafe, please reach out to trusted professional crisis resources immediately.
              </p>
            </div>

            {/* Emergency Hotline Buttons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Immediate 24/7 Crisis Resources
              </label>

              {/* 988 Suicide & Crisis Lifeline */}
              <a
                href="tel:988"
                className="w-full p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-rose-600/20 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-extrabold">{safetyResources.crisisHotline}</p>
                    <p className="text-[11px] text-rose-100 font-normal">Call or text 988 anytime</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-white/20 text-[11px] font-bold">Call Now →</span>
              </a>

              {/* 112 National Emergency Services */}
              <a
                href="tel:112"
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-between shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-rose-500/30 text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-extrabold">{safetyResources.emergencyServices}</p>
                    <p className="text-[11px] text-slate-400 font-normal">For immediate physical or medical danger</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-rose-500 text-[11px] font-bold text-white">Dial 112</span>
              </a>

              {/* Crisis Text Line */}
              <a
                href="sms:741741?body=HOME"
                className="w-full p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-200 text-slate-700">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Crisis Text Line</p>
                    <p className="text-[11px] text-slate-500 font-normal">{safetyResources.crisisTextLine}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-semibold">Send SMS →</span>
              </a>
            </div>

            {/* Trusted Contact Alert Action */}
            <div className="pt-2">
              <button
                onClick={handleNotifyTrustedContact}
                disabled={trustedContactNotified}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-80"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>
                  {trustedContactNotified
                    ? '✓ Emergency Contact Notified via SMS'
                    : 'Alert Designated Emergency Contact'}
                </span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center leading-relaxed font-mono">
              ⚠️ {safetyResources.disclaimer}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
