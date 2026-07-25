import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  AlertTriangle,
  Clock,
  KeyRound,
  ShieldCheck,
  Flame,
  Pill,
  HeartPulse,
  PhoneCall,
  Activity,
  Lock,
  Ban,
  Download,
  Edit,
  Trash2,
  FileText,
  Hospital,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';

export const DoctorEmergencyView: React.FC = () => {
  const {
    doctorTokenState,
    loadDoctorEmergencyToken,
    simulateSelfDestructKey,
    activeEmergencyToken,
  } = useMediVault();

  const [inputToken, setInputToken] = useState('MV-9482-EMERGENCY');
  const [inputKey, setInputKey] = useState('');

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const handleManualDecrypt = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken) {
      loadDoctorEmergencyToken(inputToken, inputKey || 'demo-aes-key-priya');
    }
  };

  const {
    tokenString,
    isDecrypting,
    isExpiredOrRevoked,
    remainingSeconds,
    decryptedPatient,
    decryptedRecords,
    errorMessage,
  } = doctorTokenState;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Emergency Responder Banner */}
      <div className="rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 relative overflow-hidden shadow-glow-rose">
        <div className="ambient-glow-blue -top-20 -right-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Stethoscope className="w-6 h-6" />
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Doctor Emergency Portal (Read-Only Interface)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Zero-Knowledge Emergency Clinical Access
            </h1>
            <p className="text-xs text-slate-300">
              Encrypted patient medical records unlocked via temporary single-use token or QR code link.
            </p>
          </div>

          {/* Real-time Countdown Timer Display */}
          {tokenString && !isExpiredOrRevoked && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 text-center space-y-1 min-w-[220px]">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Access Time Remaining</span>
              </p>
              <p className="text-3xl font-mono font-extrabold text-amber-300 tracking-wider">
                {formatCountdown(remainingSeconds)}
              </p>
              <button
                onClick={simulateSelfDestructKey}
                className="text-[10px] text-rose-400 hover:underline font-semibold pt-1 block mx-auto"
              >
                [Simulate Key Self-Destruct]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STRICT READ-ONLY PRIVILEGE WARNING BAR */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Lock className="w-4 h-4 text-amber-400" />
          <span><strong>Doctor Privilege Policy:</strong> Read-Only Access Active.</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-slate-500 border border-slate-800 flex items-center space-x-1 cursor-not-allowed">
            <Ban className="w-3 h-3 text-rose-500" />
            <span>Cannot Edit Records</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-slate-500 border border-slate-800 flex items-center space-x-1 cursor-not-allowed">
            <Ban className="w-3 h-3 text-rose-500" />
            <span>Cannot Delete Records</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-slate-500 border border-slate-800 flex items-center space-x-1 cursor-not-allowed">
            <Ban className="w-3 h-3 text-rose-500" />
            <span>Cannot Download Restricted Data</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-slate-500 border border-slate-800 flex items-center space-x-1 cursor-not-allowed">
            <Ban className="w-3 h-3 text-rose-500" />
            <span>Cannot Extend Access Time</span>
          </span>
        </div>
      </div>

      {/* INPUT FORM FOR DOCTOR (TOKEN / QR LINK / CODE) */}
      {(!decryptedPatient || isExpiredOrRevoked) && (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-teal-400" />
              <span>Enter Secure Link, Scanned QR Code, or One-Time Token</span>
            </h2>
            <p className="text-xs text-slate-400">
              Input the token string generated by the patient (e.g. MV-9482-EMERGENCY) to decrypt emergency medical info.
            </p>
          </div>

          <form onSubmit={handleManualDecrypt} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">One-Time Token / Link</label>
              <input
                type="text"
                required
                placeholder="e.g. MV-9482-EMERGENCY"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">AES Key (Auto-parsed if link)</label>
              <input
                type="password"
                placeholder="AES-256 Key string..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-glow-teal hover:bg-teal-400 transition-colors"
              >
                Decrypt Emergency Vault Payload
              </button>
            </div>
          </form>

          {activeEmergencyToken && (
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-teal-300 font-semibold">
                Active Patient Emergency Token Found ({activeEmergencyToken.token})
              </span>
              <button
                onClick={() => loadDoctorEmergencyToken(activeEmergencyToken.token, activeEmergencyToken.secretKey)}
                className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Decrypt Priya Sharma's Active Token
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXPIRED OR REVOKED ALERT */}
      {isExpiredOrRevoked && errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/50 space-y-3 text-center"
        >
          <div className="inline-flex p-3 rounded-2xl bg-rose-500/20 text-rose-400 mb-1">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-rose-200">Session Encryption Key Burned</h2>
          <p className="text-xs text-rose-300 max-w-md mx-auto">{errorMessage}</p>
          <p className="text-[11px] text-slate-400 pt-2 font-mono">
            Doctor automatically lost access. AES decryption keys purged from memory.
          </p>
        </motion.div>
      )}

      {/* DECRYPTED DOCTOR VIEW DATA */}
      {decryptedPatient && !isExpiredOrRevoked && (
        <div className="space-y-8">
          
          {/* CRITICAL PATIENT PROFILE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Blood Group & Identity */}
            <div className="p-6 rounded-3xl glass-card border border-teal-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>PATIENT IDENTIFICATION</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">{decryptedPatient.fullName}</h3>
              <div className="text-xs text-slate-300 space-y-1 font-medium">
                <p>Age / Gender: <strong className="text-white">{decryptedPatient.age} Yrs ({decryptedPatient.gender})</strong></p>
                <p>DOB: <strong className="text-white">{decryptedPatient.dob}</strong></p>
                <p className="text-lg text-teal-300 font-bold pt-1">
                  Blood Group: {decryptedPatient.bloodType}
                </p>
              </div>
            </div>

            {/* Critical Allergies */}
            <div className="p-6 rounded-3xl glass-card border border-rose-500/40 bg-rose-950/10 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>CRITICAL ALLERGIES ({decryptedPatient.allergies.length})</span>
              </div>
              <div className="space-y-2">
                {decryptedPatient.allergies.map((alg) => (
                  <div key={alg.id} className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-xs">
                    <p className="font-bold text-rose-200">{alg.allergen} ({alg.severity})</p>
                    <p className="text-[11px] text-rose-300">{alg.reaction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronic Diseases & Emergency Contacts */}
            <div className="p-6 rounded-3xl glass-card border border-amber-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <HeartPulse className="w-4 h-4" />
                <span>CHRONIC CONDITIONS & PROXY</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Chronic Diseases:</p>
                  {decryptedPatient.chronicConditions.map((cnd) => (
                    <p key={cnd.id} className="font-bold text-amber-300">• {cnd.name} ({cnd.status})</p>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-slate-400 font-medium">Registered Emergency Contact:</p>
                  <p className="font-bold text-white flex items-center space-x-1 pt-0.5">
                    <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                    <span>{decryptedPatient.emergencyContact.name} ({decryptedPatient.emergencyContact.relationship}) — {decryptedPatient.emergencyContact.phone}</span>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RECENT PRESCRIPTIONS & PERMITTED MEDICAL RECORDS */}
          <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-teal-400" />
                  <span>Current Medicines & Recent Prescriptions</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decrypted records permitted under Priya Sharma's granular visibility toggles.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {decryptedRecords?.length || 0} Records Decrypted
              </span>
            </div>

            <div className="space-y-4">
              {decryptedRecords && decryptedRecords.length > 0 ? (
                decryptedRecords.map((record) => (
                  <div key={record.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {record.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{record.date}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Doctor: {record.diagnosingDoctor} ({record.hospitalClinic})</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{record.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{record.diagnosisDetails}</p>

                    {record.medicines && record.medicines.length > 0 && (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {record.medicines.map((med) => (
                          <div key={med.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                            <div className="flex justify-between font-bold text-teal-300">
                              <span>{med.name}</span>
                              <span>{med.dosage}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Frequency: {med.frequency} | Duration: {med.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No public records permitted by patient configuration.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
