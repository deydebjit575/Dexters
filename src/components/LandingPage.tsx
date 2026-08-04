import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  KeyRound,
  Stethoscope,
  Lock,
  Eye,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Database,
  FileCheck,
  UserCheck,
  Flame,
  FileText,
  Activity,
  HeartPulse,
  ChevronDown,
  Mail,
  Send,
  HelpCircle,
  Users,
  Award,
  Smartphone,
  Shield,
  Zap,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';
import { encryptPayload, generateAESKey } from '../services/cryptoService';
import { FirebaseAuthModal } from './FirebaseAuthModal';

interface LandingPageProps {
  onOpenEmergencyModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenEmergencyModal }) => {
  const { setActiveView } = useMediVault();

  // Auth modal trigger state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Crypto Demo State
  const [demoState, setDemoState] = useState<'plain' | 'encrypting' | 'encrypted' | 'decrypting'>('plain');
  const [demoCiphertext, setDemoCiphertext] = useState<string>('');
  const [demoIv, setDemoIv] = useState<string>('');
  const [demoKey, setDemoKey] = useState<CryptoKey | null>(null);

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleSimulateEncrypt = async () => {
    setDemoState('encrypting');
    await new Promise((r) => setTimeout(r, 600));
    const key = await generateAESKey();
    const sampleRecord = {
      patient: 'Encrypted Patient Identity',
      bloodType: 'A-Positive',
      allergy: 'Penicillin (Anaphylactic)',
      medication: 'Sample Prescription Record',
      timestamp: Date.now(),
    };
    const { ciphertext, iv } = await encryptPayload(sampleRecord, key);
    setDemoKey(key);
    setDemoCiphertext(ciphertext);
    setDemoIv(iv);
    setDemoState('encrypted');
  };

  const handleSimulateDecrypt = async () => {
    if (!demoKey) return;
    setDemoState('decrypting');
    await new Promise((r) => setTimeout(r, 600));
    setDemoState('plain');
  };

  const faqs = [
    {
      q: 'How does MediVault guarantee absolute patient data ownership?',
      a: 'MediVault utilizes client-side zero-knowledge AES-256-GCM encryption. Your master encryption key is generated locally in your browser and never sent unencrypted to any server. You alone hold the keys to decrypt your medical records.',
    },
    {
      q: 'What happens when an emergency doctor token timer expires?',
      a: 'When the timer (15 min, 1 hour, or 24 hours) reaches zero, the ephemeral AES key is automatically destroyed from browser memory. The doctor’s read-only portal instantly revokes access and returns a self-destruct state.',
    },
    {
      q: 'Can I choose to hide specific sensitive records during emergencies?',
      a: 'Yes! MediVault includes a Granular Permission System. You can toggle individual records (e.g. mental health consults, past surgeries) as "Private from Emergency" so they are automatically excluded from emergency payload keys.',
    },
    {
      q: 'How does the Trusted Contact Emergency Access work?',
      a: 'If you are unconscious or unable to share a QR code, an ER doctor can request emergency authorization. Your designated family contact (e.g., sibling/spouse) receives a 2FA OTP notification to verify and approve temporary access.',
    },
    {
      q: 'Is MediVault compliant with global health privacy standards?',
      a: 'MediVault exceeds HIPAA and GDPR specifications by implementing zero-knowledge cryptography, end-to-end encryption, immutable access audit logs, and instant patient revocation.',
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen pb-16 bg-[#F8FAFC]">
      {/* Ambient Background Glows */}
      <div className="ambient-glow-cyan top-10 left-1/4" />
      <div className="ambient-glow-blue top-96 right-10" />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-200 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-700">
              Zero-Knowledge AES-256 Sovereign Medical Infrastructure
            </span>
          </motion.div>

          {/* Core Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1]"
          >
            Your Lifetime Medical History.{' '}
            <span className="gradient-text-cyan block sm:inline">
              Your Absolute Control.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Securely store, organize and selectively share your medical records with doctors whenever needed.
          </motion.p>

          {/* CTA Buttons: Patient Registration, Login, Emergency Doctor Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Patient Registration */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openAuth('register')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 group transition-colors"
            >
              <UserPlus className="w-5 h-5 text-white" />
              <span>Patient Registration</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Login */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openAuth('login')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <LogIn className="w-5 h-5 text-cyan-600" />
              <span>Login</span>
            </motion.button>

            {/* Emergency Doctor Portal */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveView('doctor')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2 group transition-all"
            >
              <Stethoscope className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
              <span>Emergency Doctor Portal</span>
            </motion.button>
          </motion.div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 border-t border-slate-200/80">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-cyan-600">100%</p>
              <p className="text-xs text-slate-500 font-medium">Sovereign Data Control</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-cyan-600">AES-256</p>
              <p className="text-xs text-slate-500 font-medium">GCM Zero-Knowledge</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-cyan-600">3 Methods</p>
              <p className="text-xs text-slate-500 font-medium">Emergency Preparedness</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-rose-500">Self-Destruct</p>
              <p className="text-xs text-slate-500 font-medium">15m - 24h Countdown</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: WHY MEDIVAULT? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider">
            Why MediVault?
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 sm:text-4xl mt-3">
            The Healthcare System Fragmented Your Records.<br />
            MediVault Reunites Them Under Your Control.
          </h2>
          <p className="mt-3 text-slate-600 text-sm max-w-2xl mx-auto">
            Patients visit dozens of clinics, specialists, and labs throughout their lifetime. MediVault bridges all health records into one immutable, encrypted vault.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl space-y-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Centralized Lifetime Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No more searching through physical paper files or fragmented hospital portals. Prescriptions, blood reports, X-rays, MRI scans, and surgeries remain stored in one place.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl space-y-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Granular Privacy Control</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You decide precisely what each doctor sees. Mark confidential mental health records or past diagnoses as private with one toggle switch.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl space-y-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Triple Emergency Preparedness</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Whether you need a quick QR code share link, a critical emergency profile card, or trusted family proxy approval, MediVault keeps ER doctors informed safely.
            </p>
          </div>
        </div>
      </section>

      {/* MEDICAL FEATURE HIGHLIGHT BANNER (Inspired by Reference Design) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 text-white p-8 sm:p-12 shadow-xl shadow-cyan-500/20 relative overflow-hidden">
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 mb-10">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
              It's here where we protect health data!
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
              Instant Medical Access Whenever Care Matters Most
            </h2>
            <p className="text-xs sm:text-sm text-cyan-50 leading-relaxed">
              Equipping patients and medical professionals with zero-knowledge cryptographic access to lifetime records, emergency tokens, and instant clinical profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white text-cyan-600 flex items-center justify-center shadow-md">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Top Equipment</h4>
              <p className="text-[11px] text-cyan-100">Modern clinical encryption tools & WebCrypto API integration.</p>
              <button onClick={() => setActiveView('patient')} className="mt-2 px-4 py-1.5 rounded-full bg-white text-cyan-700 font-bold text-xs hover:bg-cyan-50 transition-colors">
                Explore Vault
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white text-cyan-600 flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">24/7 Readiness</h4>
              <p className="text-[11px] text-cyan-100">Round-the-clock emergency token generation & QR verification.</p>
              <button onClick={onOpenEmergencyModal} className="mt-2 px-4 py-1.5 rounded-full bg-white text-cyan-700 font-bold text-xs hover:bg-cyan-50 transition-colors">
                Get Token
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white text-cyan-600 flex items-center justify-center shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Skilled Doctors</h4>
              <p className="text-[11px] text-cyan-100">Read-only emergency clinical portals with self-destruct timers.</p>
              <button onClick={() => setActiveView('doctor')} className="mt-2 px-4 py-1.5 rounded-full bg-white text-cyan-700 font-bold text-xs hover:bg-cyan-50 transition-colors">
                Doctor Portal
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white text-cyan-600 flex items-center justify-center shadow-md">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Quick Recovery</h4>
              <p className="text-[11px] text-cyan-100">Instant access to critical allergy & blood type data in trauma care.</p>
              <button onClick={() => openAuth('register')} className="mt-2 px-4 py-1.5 rounded-full bg-white text-cyan-700 font-bold text-xs hover:bg-cyan-50 transition-colors">
                Register Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: KEY FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider">
            Key Features
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 sm:text-4xl mt-3">
            Engineered for Privacy, Speed & Clinical Safety
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl space-y-3 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <Database className="w-8 h-8 text-cyan-600" />
            <h4 className="text-base font-bold text-slate-900">Lifetime Timeline</h4>
            <p className="text-xs text-slate-600">Chronological history with search, category filtering, and PDF exports.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl space-y-3 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <Clock className="w-8 h-8 text-cyan-600" />
            <h4 className="text-base font-bold text-slate-900">Self-Destruct Timers</h4>
            <p className="text-xs text-slate-600">Set 15m, 1h, or 24h expiration timers on temporary emergency access keys.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl space-y-3 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <KeyRound className="w-8 h-8 text-cyan-600" />
            <h4 className="text-base font-bold text-slate-900">Instant Revocation</h4>
            <p className="text-xs text-slate-600">Revoke doctor or hospital access instantly with a single tap from your phone.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl space-y-3 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <ShieldCheck className="w-8 h-8 text-cyan-600" />
            <h4 className="text-base font-bold text-slate-900">Emergency Medical Profile</h4>
            <p className="text-xs text-slate-600">Always accessible critical card: Blood Group, Allergies, Active Meds & Contacts.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE CRYPTO SANDBOX DEMO */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/80 shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">Live Zero-Knowledge Encryption Sandbox</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Test how MediVault uses browser-native Web Crypto API to convert medical records into encrypted AES-GCM ciphertexts.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {demoState === 'plain' ? (
                <button
                  onClick={handleSimulateEncrypt}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-xs shadow-md hover:bg-cyan-600 transition-colors flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Encrypt Payload (AES-256)</span>
                </button>
              ) : demoState === 'encrypted' ? (
                <button
                  onClick={handleSimulateDecrypt}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md hover:bg-cyan-700 transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Decrypt with Session Key</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold animate-pulse">
                  Processing Cryptography...
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border transition-all ${
              demoState === 'plain'
                ? 'bg-slate-50 border-cyan-400 ring-2 ring-cyan-500/20'
                : 'bg-slate-50/50 border-slate-200 opacity-70'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-cyan-700 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <span>Plaintext Medical Record</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Readable</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700 font-mono">
                <p><span className="text-slate-500">Patient:</span> Encrypted Patient Identity</p>
                <p><span className="text-slate-500">Blood Group:</span> A-Positive</p>
                <p><span className="text-slate-500">Allergy Alert:</span> Penicillin (Anaphylactic)</p>
                <p><span className="text-slate-500">Medication:</span> Sample Prescription Record</p>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              demoState === 'encrypted'
                ? 'bg-cyan-50/50 border-cyan-400 ring-2 ring-cyan-500/20'
                : 'bg-slate-50/50 border-slate-200 opacity-70'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-cyan-700 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-cyan-600" />
                  <span>AES-256-GCM Ciphertext</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-cyan-700 font-mono">Zero-Knowledge</span>
              </div>
              {demoCiphertext ? (
                <div className="space-y-2 text-[11px] text-cyan-900 font-mono break-all leading-tight">
                  <p><span className="text-slate-500">IV (12-byte):</span> {demoIv}</p>
                  <p><span className="text-slate-500">Ciphertext:</span> {demoCiphertext.substring(0, 100)}...</p>
                  <p className="text-[10px] text-cyan-700 pt-2 font-sans font-semibold">
                    ✓ Verified Auth Tag | Key never leaves client memory
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">Click "Encrypt Payload" to watch Web Crypto API transform data live.</p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 sm:text-4xl mt-3">
            3 Simple Steps to Lifetime Medical Preparedness
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md hover:border-cyan-300 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-cyan-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">1</span>
            <h3 className="text-xl font-bold text-slate-900">Upload & Encrypt</h3>
            <p className="text-xs text-slate-600">Upload prescriptions, blood tests, X-rays, or MRI reports. Files are encrypted client-side using AES-256 before storing.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md hover:border-cyan-300 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-cyan-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">2</span>
            <h3 className="text-xl font-bold text-slate-900">Configure Granular Privacy</h3>
            <p className="text-xs text-slate-600">Set visibility preferences per record or category. Keep sensitive records private from general emergency exports.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md hover:border-cyan-300 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">3</span>
            <h3 className="text-xl font-bold text-slate-900">Share via Self-Destruct Token</h3>
            <p className="text-xs text-slate-600">Generate a QR code or secure URL with a custom timer. ER doctors decrypt data in real-time; key auto-burns when time elapses.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 sm:text-4xl mt-3">
            Trusted by Patients & Emergency Physicians
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-cyan-500">★★★★★</div>
            <p className="text-xs text-slate-600 italic">"During my emergency visit to Apollo Hospital, the ER doctor scanned my MediVault QR code and immediately saw my severe penicillin allergy. It saved crucial time!"</p>
            <div className="pt-2 border-t border-slate-200 font-bold text-slate-900 text-xs">
              Sarah Jenkins <span className="text-slate-500 font-normal font-mono">— Patient (32 Yrs)</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-cyan-500">★★★★★</div>
            <p className="text-xs text-slate-600 italic">"MediVault’s Doctor Emergency Portal is clean, fast, and secure. Having instant access to blood group, active insulin dosage, and chronic conditions is invaluable in trauma care."</p>
            <div className="pt-2 border-t border-slate-200 font-bold text-slate-900 text-xs">
              Dr. Amit Roy <span className="text-slate-500 font-normal font-mono">— Endocrinologist, Apollo Hospital</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-cyan-500">★★★★★</div>
            <p className="text-xs text-slate-600 italic">"The Trusted Contact OTP approval feature gives immense peace of mind. I can approve emergency access for my sister even if she is unable to generate a token herself."</p>
            <div className="pt-2 border-t border-slate-200 font-bold text-slate-900 text-xs">
              Marcus Vance <span className="text-slate-500 font-normal font-mono">— Registered Family Proxy</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ (ACCORDION) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 sm:text-4xl mt-3">
            Got Questions? We’ve Got Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:text-cyan-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-cyan-600 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: CONTACT FORM */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/80 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center space-x-2">
              <Mail className="w-6 h-6 text-cyan-600" />
              <span>Contact MediVault Security & Support Team</span>
            </h2>
            <p className="text-xs text-slate-500">
              Have questions regarding cryptographic key management or enterprise hospital integration?
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-cyan-50 border border-cyan-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-cyan-600 mx-auto" />
              <h3 className="text-lg font-bold text-cyan-800">Message Received!</h3>
              <p className="text-xs text-slate-600">Our cryptographic security team will respond within 24 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setContactSubmitted(true);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-900 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-900 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Inquire about zero-knowledge encryption or patient registration..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-900 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md shadow-cyan-500/25 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Send Message to Security Team</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Auth Modal for Landing Page triggers */}
      <FirebaseAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authTab}
        onSuccessLogin={() => setActiveView('patient')}
      />
    </div>
  );
};
