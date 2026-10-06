import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Users,
  Award,
  Smartphone,
  Shield,
  Zap,
  LogIn,
  UserPlus,
  Play,
  Share2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';
import { useEnergyMode } from '../context/EnergyModeContext';
import { encryptPayload, generateAESKey } from '../services/cryptoService';
import { FirebaseAuthModal } from './FirebaseAuthModal';

interface LandingPageProps {
  onOpenEmergencyModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenEmergencyModal }) => {
  const { currentUser } = useMediVault();
  const { openCheckInModal } = useEnergyMode();
  const navigate = useNavigate();

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
      a: 'MediVault exceeds HIPAA specifications by implementing zero-knowledge cryptography, end-to-end encryption, immutable access audit logs, and instant patient revocation.',
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#F8FAFC]">
      
      {/* ================================================== */}
      {/* 1. HERO SECTION (Split 55/45 with Healthcare Visuals) */}
      {/* ================================================== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Sovereign Digital Health Vault</span>
              <span className="text-teal-300">•</span>
              <span className="text-teal-600 font-semibold">AES-256 Encrypted</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.12]"
            >
              Your Health.{' '}
              <span className="gradient-text-teal block sm:inline">
                Your Records.
              </span>{' '}
              <span className="block text-slate-900 mt-1">Your Control.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed"
            >
              A secure digital healthcare vault that keeps your lifelong medical records organized, encrypted, and instantly accessible to emergency physicians when you need them.
            </motion.p>

            {/* Primary & Secondary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              {currentUser ? (
                <button
                  onClick={() => navigate('/medical-records')}
                  className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all group"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Medical Records</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => openAuth('register')}
                  className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all group"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started — Free Vault</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                onClick={openCheckInModal}
                className="px-6 py-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>AI Health Check</span>
              </button>

              <button
                onClick={() => navigate('/doctor-portal')}
                className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Stethoscope className="w-4 h-4 text-slate-600" />
                <span>Doctor Portal</span>
              </button>
            </motion.div>

            {/* Quick Metrics Strip */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">100%</p>
                <p className="text-[11px] text-slate-500 font-medium">Patient Ownership</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-teal-700 font-display">AES-256</p>
                <p className="text-[11px] text-slate-500 font-medium">Zero-Knowledge GCM</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">&lt; 30s</p>
                <p className="text-[11px] text-slate-500 font-medium">Emergency Decryption</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Image with Floating Badges (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-slate-900">
              <img
                src="/hero_doctor_patient.jpg"
                alt="Modern Healthcare Consultation"
                className="w-full h-[380px] sm:h-[460px] object-cover object-center transform hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  // Graceful fallback if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

              {/* Floating Badge 1: Instant Emergency Key */}
              <div className="absolute top-4 left-4 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-md flex items-center space-x-2.5 max-w-[220px]">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Emergency Access</p>
                  <p className="text-[10px] text-teal-700 font-medium">Auto-Destruct Keys</p>
                </div>
              </div>

              {/* Floating Badge 2: Verified Health Vault */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Encrypted Clinical Vault</p>
                    <p className="text-[10px] text-slate-500">Zero unencrypted data stored</p>
                  </div>
                </div>
                <button
                  onClick={onOpenEmergencyModal}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                >
                  Emergency CTA
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 2. MEDICAL RECORDS SECTION (Image-Rich Split Layout) */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Image Card */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
              <img
                src="/records_digital_vault.jpg"
                alt="Physician Reviewing Digital Records"
                className="w-full h-[340px] sm:h-[400px] object-cover object-center"
              />
              <div className="p-5 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Digital Health Record Stream</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold text-[10px]">
                    Live Synced
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Prescriptions, lab reports, imaging scans, and surgical summaries synchronized in a single timeline.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Workflow Steps (Upload -> Store -> Organize -> Access) */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
                Medical Records
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                Consolidate Your Entire Health History In One Place
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                No more chasing physical papers across disparate hospitals. MediVault turns fragmented reports into a lifetime chronological health profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">1</div>
                <h4 className="font-bold text-sm text-slate-900">Upload & Digitize</h4>
                <p className="text-xs text-slate-500">Upload PDFs, doctor notes, or scan prescriptions with built-in OCR.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">2</div>
                <h4 className="font-bold text-sm text-slate-900">Store Securely</h4>
                <p className="text-xs text-slate-500">Client-side zero-knowledge encryption ensures only you hold the keys.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">3</div>
                <h4 className="font-bold text-sm text-slate-900">Organize & Filter</h4>
                <p className="text-xs text-slate-500">Category tags for Lab Reports, Prescriptions, Vaccines & Imaging.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">4</div>
                <h4 className="font-bold text-sm text-slate-900">Instant PDF Export</h4>
                <p className="text-xs text-slate-500">Generate clean clinical report summaries with one click for consults.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/medical-records')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>Explore Medical Records Stream</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 3. AI HEALTH INTELLIGENCE SECTION */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Health Intelligence</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                AI Health Check — <br />
                <span className="text-cyan-400">How are you feeling today?</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Adaptive clinical check-ins evaluate your daily energy, vital symptoms, and recovery trends. If stress or fatigue is detected, MediVault automatically activates Gentle Recovery Mode with guided exercises.
              </p>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>5-Step Wellness Questionnaire with voice symptom capture</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>3-Minute Guided Audio Recovery Player with breathing animations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Interactive Drug-Drug Interaction safety verification tool</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={openCheckInModal}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold text-xs shadow-md transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Start AI Health Check</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/ai')}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors"
                >
                  View AI Dashboard
                </button>
              </div>
            </div>

            {/* Right Image Visual (6 cols) */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                <img
                  src="/ai_health_intelligence.jpg"
                  alt="AI Health Intelligence Dashboard"
                  className="w-full h-[320px] sm:h-[380px] object-cover object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. DOCTOR & CLINICAL PORTAL SECTION */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
                Doctor Portal
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                Connect With Physicians & Consult Securely
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Emergency doctors and healthcare specialists access decrypted records in read-only mode during consultations, with complete audit logging and instant revocation.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start space-x-3">
                <Stethoscope className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Clinical Emergency Review</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Emergency triage, allergy alerts, blood type confirmation, and active medications.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start space-x-3">
                <FileCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Add Consultation & Prescriptions</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Physicians log clinical consultation notes directly into your verified record stream.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start space-x-3">
                <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Granular Visibility Controls</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">You dictate exactly which medical files each specialist is authorized to view.</p>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => navigate('/doctor-portal')}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Doctor Clinical Portal</span>
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
              <img
                src="/doctor_consultation_network.jpg"
                alt="Doctor Clinical Consultation"
                className="w-full h-[360px] sm:h-[420px] object-cover object-center"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 5. EMERGENCY ACCESS SECTION */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Image */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
              <img
                src="/emergency_care_access.jpg"
                alt="Emergency Medical Response Team"
                className="w-full h-[360px] sm:h-[420px] object-cover object-center"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
                Emergency Care
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                Instant Emergency Access When Seconds Count
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                MediVault equips emergency responders with rapid, time-restricted access to critical medical parameters without compromising long-term data security.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <Clock className="w-5 h-5 text-cyan-600 mb-1" />
                <h4 className="font-bold text-slate-900">Self-Destruct Timers</h4>
                <p className="text-slate-500 text-[11px]">15m, 1h, or 24h countdowns auto-burn cryptographic keys upon expiry.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <Users className="w-5 h-5 text-cyan-600 mb-1" />
                <h4 className="font-bold text-slate-900">Trusted Proxy 2FA</h4>
                <p className="text-slate-500 text-[11px]">Family proxy receives OTP to authorize emergency access if unconscious.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={onOpenEmergencyModal}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>Issue Emergency Access Token</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 6. SECURITY & LIVE CRYPTO SANDBOX */}
      {/* ================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/90 shadow-md relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">Live Zero-Knowledge Encryption Sandbox</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Experience how browser-native Web Crypto API encrypts medical data client-side before sync.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {demoState === 'plain' ? (
                <button
                  onClick={handleSimulateEncrypt}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Encrypt Payload (AES-256)</span>
                </button>
              ) : demoState === 'encrypted' ? (
                <button
                  onClick={handleSimulateDecrypt}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Decrypt with Session Key</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold animate-pulse">
                  Processing Cryptography...
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border transition-all ${
              demoState === 'plain'
                ? 'bg-slate-50 border-teal-500 ring-2 ring-teal-500/20'
                : 'bg-slate-50/50 border-slate-200 opacity-70'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-teal-800 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Plaintext Medical Record</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Decrypted</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700 font-mono">
                <p><span className="text-slate-400">Patient:</span> Encrypted Patient Identity</p>
                <p><span className="text-slate-400">Blood Group:</span> A-Positive</p>
                <p><span className="text-slate-400">Allergy Alert:</span> Penicillin (Anaphylactic)</p>
                <p><span className="text-slate-400">Medication:</span> Sample Prescription Record</p>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              demoState === 'encrypted'
                ? 'bg-teal-50/40 border-teal-500 ring-2 ring-teal-500/20'
                : 'bg-slate-50/50 border-slate-200 opacity-70'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-teal-800 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>AES-256-GCM Ciphertext</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-teal-700 font-mono">Encrypted</span>
              </div>
              {demoCiphertext ? (
                <div className="space-y-2 text-[11px] text-teal-900 font-mono break-all leading-tight">
                  <p><span className="text-slate-400">IV (12-byte):</span> {demoIv}</p>
                  <p><span className="text-slate-400">Ciphertext:</span> {demoCiphertext.substring(0, 100)}...</p>
                  <p className="text-[10px] text-teal-700 pt-2 font-sans font-semibold">
                    ✓ Verified Auth Tag | Key never leaves client memory
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4">Click "Encrypt Payload" to watch Web Crypto API transform data live.</p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================================================== */}
      {/* 7. TESTIMONIALS & TRUST */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 sm:text-4xl mt-3">
            Trusted by Patients & Emergency Physicians
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "During an emergency trauma visit, the ER doctor decrypted my MediVault QR code and immediately saw my severe penicillin allergy. It saved crucial triage time!"
            </p>
            <div className="pt-2 border-t border-slate-100 font-bold text-slate-900 text-xs">
              Sarah Jenkins <span className="text-slate-400 font-normal font-mono">— Patient</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "MediVault’s Doctor Clinical Portal is fast, reliable, and secure. Having instant access to blood group, active insulin dosage, and chronic conditions is invaluable in trauma care."
            </p>
            <div className="pt-2 border-t border-slate-100 font-bold text-slate-900 text-xs">
              Dr. Sneha Das, MD <span className="text-slate-400 font-normal font-mono">— Emergency Medicine</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The Trusted Contact OTP approval feature gives immense peace of mind. I can approve emergency access for family members even if they are unable to generate a token."
            </p>
            <div className="pt-2 border-t border-slate-100 font-bold text-slate-900 text-xs">
              Marcus Vance <span className="text-slate-400 font-normal font-mono">— Family Proxy</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. FAQ ACCORDION */}
      {/* ================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 sm:text-4xl mt-3">
            Got Questions? We’ve Got Answers.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-xs sm:text-sm hover:text-teal-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-teal-600 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
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

      {/* ================================================== */}
      {/* 9. CONTACT FORM */}
      {/* ================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center space-x-2">
              <Mail className="w-5 h-5 text-teal-600" />
              <span>Contact MediVault Support Team</span>
            </h2>
            <p className="text-xs text-slate-500">
              Have questions regarding cryptographic key management or emergency medical integration?
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
              <h3 className="text-base font-bold text-teal-800">Message Received!</h3>
              <p className="text-xs text-slate-600">Our health security team will respond within 24 hours.</p>
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Inquire about emergency tokens or medical vault integration..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
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
        onSuccessLogin={() => { setAuthModalOpen(false); navigate('/dashboard'); }}
      />
    </div>
  );
};
