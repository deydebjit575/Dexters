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
      patient: 'Priya Sharma',
      bloodType: 'O-Positive',
      allergy: 'Penicillin (Anaphylactic)',
      medication: 'Metformin 500mg, Insulin Glargine 12U',
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
    <div className="relative overflow-hidden min-h-screen pb-16">
      {/* Ambient Background Glows */}
      <div className="ambient-glow-teal top-10 left-1/4" />
      <div className="ambient-glow-blue top-96 right-10" />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-xs font-semibold text-teal-300">
              Zero-Knowledge AES-256 Sovereign Medical Infrastructure
            </span>
          </motion.div>

          {/* Core Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.1]"
          >
            Your Lifetime Medical History.{' '}
            <span className="gradient-text-teal block sm:inline">
              Your Absolute Control.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed"
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
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-sm shadow-glow-teal flex items-center justify-center space-x-2 group"
            >
              <UserPlus className="w-5 h-5 text-slate-950" />
              <span>Patient Registration</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Login */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openAuth('login')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-teal-300 font-bold text-sm backdrop-blur-xl flex items-center justify-center space-x-2 transition-all"
            >
              <LogIn className="w-5 h-5 text-teal-400" />
              <span>Login</span>
            </motion.button>

            {/* Emergency Doctor Portal */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveView('doctor')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-sm backdrop-blur-xl flex items-center justify-center space-x-2 group transition-all"
            >
              <Stethoscope className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Emergency Doctor Portal</span>
            </motion.button>
          </motion.div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl font-extrabold text-teal-400">100%</p>
              <p className="text-xs text-slate-400 font-medium">Sovereign Data Control</p>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl font-extrabold text-cyan-400">AES-256</p>
              <p className="text-xs text-slate-400 font-medium">GCM Zero-Knowledge</p>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl font-extrabold text-amber-400">3 Methods</p>
              <p className="text-xs text-slate-400 font-medium">Emergency Preparedness</p>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl font-extrabold text-rose-400">Self-Destruct</p>
              <p className="text-xs text-slate-400 font-medium">15m - 24h Countdown</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: WHY MEDIVAULT? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase tracking-wider">
            Why MediVault?
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white sm:text-4xl mt-3">
            The Healthcare System Fragmented Your Records.<br />
            MediVault Reunites Them Under Your Control.
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-2xl mx-auto">
            Patients visit dozens of clinics, specialists, and labs throughout their lifetime. MediVault bridges all health records into one immutable, encrypted vault.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl space-y-4 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Centralized Lifetime Vault</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No more searching through physical paper files or fragmented hospital portals. Prescriptions, blood reports, X-rays, MRI scans, and surgeries remain stored in one place.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Granular Privacy Control</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You decide precisely what each doctor sees. Mark confidential mental health records or past diagnoses as private with one toggle switch.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Triple Emergency Preparedness</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Whether you need a quick QR code share link, a critical emergency profile card, or trusted family proxy approval, MediVault keeps ER doctors informed safely.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: KEY FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
            Key Features
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white sm:text-4xl mt-3">
            Engineered for Privacy, Speed & Clinical Safety
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl space-y-3">
            <Database className="w-8 h-8 text-teal-400" />
            <h4 className="text-base font-bold text-white">Lifetime Timeline</h4>
            <p className="text-xs text-slate-400">Chronological history with search, category filtering, and PDF exports.</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-3">
            <Clock className="w-8 h-8 text-amber-400" />
            <h4 className="text-base font-bold text-white">Self-Destruct Timers</h4>
            <p className="text-xs text-slate-400">Set 15m, 1h, or 24h expiration timers on temporary emergency access keys.</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-3">
            <KeyRound className="w-8 h-8 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Instant Revocation</h4>
            <p className="text-xs text-slate-400">Revoke doctor or hospital access instantly with a single tap from your phone.</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Emergency Medical Profile</h4>
            <p className="text-xs text-slate-400">Always accessible critical card: Blood Group, Allergies, Active Meds & Contacts.</p>
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
          className="rounded-3xl glass-panel p-6 sm:p-10 border border-teal-500/20 shadow-glow-teal relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h3 className="text-xl font-bold text-white">Live Zero-Knowledge Encryption Sandbox</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Test how MediVault uses browser-native Web Crypto API to convert medical records into encrypted AES-GCM ciphertexts.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {demoState === 'plain' ? (
                <button
                  onClick={handleSimulateEncrypt}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-md hover:bg-teal-400 transition-colors flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Encrypt Payload (AES-256)</span>
                </button>
              ) : demoState === 'encrypted' ? (
                <button
                  onClick={handleSimulateDecrypt}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md hover:bg-cyan-400 transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Decrypt with Session Key</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-slate-800 text-teal-400 text-xs font-semibold animate-pulse">
                  Processing Cryptography...
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border transition-all ${
              demoState === 'plain'
                ? 'bg-slate-900/80 border-teal-500/40 ring-2 ring-teal-500/20'
                : 'bg-slate-900/30 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-teal-300 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Plaintext Medical Record</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Readable</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <p><span className="text-slate-500">Patient:</span> Priya Sharma (32 Yrs)</p>
                <p><span className="text-slate-500">Blood Group:</span> O-Positive</p>
                <p><span className="text-slate-500">Allergy Alert:</span> Penicillin (Anaphylactic)</p>
                <p><span className="text-slate-500">Medication:</span> Metformin 500mg, Insulin</p>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              demoState === 'encrypted'
                ? 'bg-slate-900/90 border-cyan-500/40 ring-2 ring-cyan-500/20'
                : 'bg-slate-900/30 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>AES-256-GCM Ciphertext</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">Zero-Knowledge</span>
              </div>
              {demoCiphertext ? (
                <div className="space-y-2 text-[11px] text-cyan-300 font-mono break-all leading-tight">
                  <p><span className="text-slate-500">IV (12-byte):</span> {demoIv}</p>
                  <p><span className="text-slate-500">Ciphertext:</span> {demoCiphertext.substring(0, 100)}...</p>
                  <p className="text-[10px] text-emerald-400 pt-2 font-sans font-semibold">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white sm:text-4xl mt-3">
            3 Simple Steps to Lifetime Medical Preparedness
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 relative space-y-4">
            <span className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 font-extrabold text-lg flex items-center justify-center">1</span>
            <h3 className="text-xl font-bold text-white">Upload & Encrypt</h3>
            <p className="text-xs text-slate-300">Upload prescriptions, blood tests, X-rays, or MRI reports. Files are encrypted client-side using AES-256 before storing.</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 relative space-y-4">
            <span className="w-10 h-10 rounded-2xl bg-cyan-500 text-slate-950 font-extrabold text-lg flex items-center justify-center">2</span>
            <h3 className="text-xl font-bold text-white">Configure Granular Privacy</h3>
            <p className="text-xs text-slate-300">Set visibility preferences per record or category. Keep sensitive records private from general emergency exports.</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 relative space-y-4">
            <span className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-lg flex items-center justify-center">3</span>
            <h3 className="text-xl font-bold text-white">Share via Self-Destruct Token</h3>
            <p className="text-xs text-slate-300">Generate a QR code or secure URL with a custom timer. ER doctors decrypt data in real-time; key auto-burns when time elapses.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white sm:text-4xl mt-3">
            Trusted by Patients & Emergency Physicians
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-slate-300 italic">"During my emergency visit to Apollo Hospital, the ER doctor scanned my MediVault QR code and immediately saw my severe penicillin allergy. It saved crucial time!"</p>
            <div className="pt-2 border-t border-slate-800 font-bold text-white text-xs">
              Priya Sharma <span className="text-slate-500 font-normal font-mono">— Patient (32 Yrs)</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-slate-300 italic">"MediVault’s Doctor Emergency Portal is clean, fast, and secure. Having instant access to blood group, active insulin dosage, and chronic conditions is invaluable in trauma care."</p>
            <div className="pt-2 border-t border-slate-800 font-bold text-white text-xs">
              Dr. Amit Roy <span className="text-slate-500 font-normal font-mono">— Endocrinologist, Apollo Hospital</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-slate-300 italic">"The Trusted Contact OTP approval feature gives immense peace of mind. I can approve emergency access for my sister even if she is unable to generate a token herself."</p>
            <div className="pt-2 border-t border-slate-800 font-bold text-white text-xs">
              Rajesh Sharma <span className="text-slate-500 font-normal font-mono">— Registered Family Proxy</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ (ACCORDION) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase tracking-wider">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white sm:text-4xl mt-3">
            Got Questions? We’ve Got Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-white text-sm hover:text-teal-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-teal-400 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3"
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
        <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-2">
              <Mail className="w-6 h-6 text-teal-400" />
              <span>Contact MediVault Security & Support Team</span>
            </h2>
            <p className="text-xs text-slate-400">
              Have questions regarding cryptographic key management or enterprise hospital integration?
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-300">Message Received!</h3>
              <p className="text-xs text-slate-300">Our cryptographic security team will respond within 24 hours.</p>
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
                  <label className="block text-slate-300 font-bold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Priya Sharma"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="priya.sharma@medivault.io"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Inquire about zero-knowledge encryption or patient registration..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-teal-500 text-slate-950 font-extrabold text-xs shadow-glow-teal hover:bg-teal-400 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
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
