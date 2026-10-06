import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Stethoscope,
  Pill,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Hospital,
  Activity,
  KeyRound,
  UserX,
  UploadCloud,
  Download,
  ShieldCheck,
  Sparkles,
  Settings,
  LogOut,
  Sliders,
  QrCode,
  FileCheck,
  Cpu,
  Volume2,
  PhoneCall,
  RefreshCw,
  Mic,
  MicOff,
  VolumeX,
  Upload,
  ArrowRight,
  ChevronRight,
  LayoutDashboard,
  Play,
  Heart,
  User,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Droplet,
  Users,
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useMediVault } from '../context/MediVaultContext';
import { RecordCategory, PrescribedMedicine, MedicalRecord, Allergy, ChronicCondition } from '../types/medical';
import { generateMedicalReportPDF } from '../services/pdfService';
import { useEnergyMode } from '../context/EnergyModeContext';
import { RecoveryPlanCard, DeferredTasksAccordion } from './GentleModeComponents';
import { ThreeMinuteRecoveryPlayer } from './ThreeMinuteRecoveryPlayer';
import { SafetyTriageModal } from './SafetyTriageModal';
import { CoachAdminRecoveryTrends } from './CoachAdminRecoveryTrends';
import { WellnessIntelligenceDashboard } from './WellnessIntelligenceDashboard';
import { WellnessScoreRing } from './WellnessScoreRing';

interface PatientDashboardProps {
  onOpenEmergencyModal: () => void;
  activeSubTab?: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onOpenEmergencyModal,
  activeSubTab = 'dashboard',
}) => {
  const {
    patient,
    records,
    accessGrants,
    loginHistory,
    granularPermissions,
    toggleGranularPermission,
    toggleRecordPrivacy,
    addMedicalRecord,
    revokeAccessGrant,
    revokeAllAccessGrants,
    activeEmergencyToken,
    requestTrustedContactApproval,
    resendTrustedContactOTP,
    verifyTrustedContactOTP,
    theme,
    toggleTheme,
    currentUser,
    isFetchingFirebase,
    syncProgress,
    syncStatusText,
    fetchCompleteFirebaseData,
    logoutUser,
    updatePatientProfile,
  } = useMediVault();

  const {
    isGentleMode,
    openCheckInModal,
    hasCompletedCheckIn,
    wellnessInsight,
    recoveryPlan,
    openRecoveryPlayer,
    runDemoPreset,
  } = useEnergyMode();

  const navigate = useNavigate();

  // Sidebar Tab State
  const [sidebarTab, setSidebarTab] = useState<string>(activeSubTab || 'dashboard');
  const [accessSubTab, setAccessSubTab] = useState<'grants' | 'permissions'>('grants');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(patient?.fullName || currentUser?.displayName || '');
  const [editAge, setEditAge] = useState<number | string>(patient?.age && patient.age > 0 ? patient.age : '');
  const [editDob, setEditDob] = useState(patient?.dob || '');
  const [editGender, setEditGender] = useState(patient?.gender || '');
  const [editBloodType, setEditBloodType] = useState(patient?.bloodType || '');
  const [editEmail, setEditEmail] = useState(patient?.email && patient.email.includes('@') ? patient.email : (currentUser?.email && currentUser.email.includes('@') ? currentUser.email : ''));
  const [editPhone, setEditPhone] = useState(patient?.phone || '');
  const [editAddress, setEditAddress] = useState(patient?.address || '');
  const [editEmergencyName, setEditEmergencyName] = useState(patient?.emergencyContact?.name || '');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState(patient?.emergencyContact?.relationship || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(patient?.emergencyContact?.phone || '');
  const [editAllergies, setEditAllergies] = useState<Allergy[]>(patient?.allergies || []);
  const [editChronicConditions, setEditChronicConditions] = useState<ChronicCondition[]>(patient?.chronicConditions || []);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // New allergy input state
  const [newAllergen, setNewAllergen] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening'>('Moderate');
  const [newReaction, setNewReaction] = useState('');

  // New chronic condition input state
  const [newConditionName, setNewConditionName] = useState('');
  const [newDiagnosedYear, setNewDiagnosedYear] = useState('');
  const [newConditionStatus, setNewConditionStatus] = useState<'Active' | 'Managed' | 'In Remission'>('Managed');

  useEffect(() => {
    setEditFullName(patient?.fullName || currentUser?.displayName || '');
    setEditAge(patient?.age && patient.age > 0 ? patient.age : '');
    setEditDob(patient?.dob || '');
    setEditGender(patient?.gender || '');
    setEditBloodType(patient?.bloodType || '');
    setEditEmail(patient?.email && patient.email.includes('@') ? patient.email : (currentUser?.email && currentUser.email.includes('@') ? currentUser.email : ''));
    setEditPhone(patient?.phone || '');
    setEditAddress(patient?.address || '');
    setEditEmergencyName(patient?.emergencyContact?.name || '');
    setEditEmergencyRelation(patient?.emergencyContact?.relationship || '');
    setEditEmergencyPhone(patient?.emergencyContact?.phone || '');
    setEditAllergies(patient?.allergies || []);
    setEditChronicConditions(patient?.chronicConditions || []);
  }, [patient, currentUser]);

  useEffect(() => {
    if (activeSubTab) setSidebarTab(activeSubTab);
  }, [activeSubTab]);

  // Medical Records Filter & Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewFormat, setViewFormat] = useState<'timeline' | 'table'>('timeline');

  // Upload Reports Form State
  const [uploadCategory, setUploadCategory] = useState<RecordCategory>('Prescription');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDoctor, setUploadDoctor] = useState('');
  const [uploadHospital, setUploadHospital] = useState('');
  const [uploadDiagnosis, setUploadDiagnosis] = useState('');

  // Add Record Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RecordCategory>('Prescription');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDoctor, setNewDoctor] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newHospital, setNewHospital] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);

  // Trusted Contact OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [proxyPhoneInput, setProxyPhoneInput] = useState('');

  // AI Feature States
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);

  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);

  const [med1, setMed1] = useState('Metformin');
  const [med2, setMed2] = useState('Insulin');
  const [interactionResult, setInteractionResult] = useState<string | null>(null);

  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Computed metrics
  const patientDisplayName = patient?.fullName?.trim() || currentUser?.displayName?.trim() || 'Patient';
  const displayInitials = patientDisplayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PT';

  // Masked Patient ID for privacy
  const maskedPatientId = useMemo(() => {
    const raw = patient?.id || currentUser?.uid || 'MV82';
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '');
    const last2 = clean.slice(-2) || '82';
    return `MV-••••${last2.toUpperCase()}`;
  }, [patient?.id, currentUser?.uid]);

  // Aggregate medicines
  const allMedicines = useMemo(() => {
    const list: (PrescribedMedicine & { disease?: string; recordDate?: string })[] = [];
    records.forEach((rec) => {
      if (rec.medicines && rec.medicines.length > 0) {
        rec.medicines.forEach((med) => {
          list.push({
            ...med,
            disease: rec.title,
            recordDate: rec.date,
          });
        });
      }
    });
    return list;
  }, [records]);

  const activeMedicinesCount = useMemo(() => {
    const active = allMedicines.filter((m) => m.status === 'Active');
    return active.length > 0 ? active.length : allMedicines.length;
  }, [allMedicines]);

  const connectedDoctorsCount = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.diagnosingDoctor) set.add(r.diagnosingDoctor.trim());
    });
    accessGrants.forEach((g) => {
      if (g.doctorName) set.add(g.doctorName.trim());
    });
    return Math.max(set.size, accessGrants.filter((g) => g.status === 'active').length || 0);
  }, [records, accessGrants]);

  const activeGrantsCount = useMemo(() => {
    return accessGrants.filter((g) => g.status === 'active').length;
  }, [accessGrants]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;
        const matchesQuery =
          searchQuery === '' ||
          rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.diagnosingDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.hospitalClinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.diagnosisDetails.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [records, selectedCategory, searchQuery, sortOrder]);

  // Handle Add Record Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDoctor) return;

    const medicines: PrescribedMedicine[] = [];
    if (newMedicineName) {
      medicines.push({
        id: `med-${Date.now()}`,
        name: newMedicineName,
        dosage: newDosage || '500mg',
        frequency: 'Twice Daily',
        duration: newDuration || '30 Days',
        instructions: 'Take as prescribed by doctor.',
        doctor: newDoctor,
        hospital: newHospital,
        startDate: newDate,
        status: 'Active',
      });
    }

    addMedicalRecord({
      title: newTitle,
      category: newCategory,
      date: newDate,
      diagnosingDoctor: newDoctor,
      doctorSpecialty: newSpecialty || 'General Medicine',
      hospitalClinic: newHospital || 'Clinical Center',
      diagnosisDetails: newDiagnosis || 'Routine medical consultation.',
      medicines,
      tags: [newCategory, 'Medical Record'],
      isPrivateFromEmergency: newIsPrivate,
    });

    setNewTitle('');
    setNewDiagnosis('');
    setNewMedicineName('');
    setIsAddModalOpen(false);
  };

  // Handle File Upload
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadSuccess(false);

    try {
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 90) {
            clearInterval(interval);
            return 90;
          }
          return p + 20;
        });
      }, 150);

      await new Promise((r) => setTimeout(r, 800));
      clearInterval(interval);
      setUploadProgress(100);

      addMedicalRecord({
        title: uploadTitle || `${uploadCategory} File Upload`,
        category: uploadCategory,
        date: new Date().toISOString().split('T')[0],
        diagnosingDoctor: uploadDoctor || 'Attending Physician',
        doctorSpecialty: 'Diagnostics',
        hospitalClinic: uploadHospital || 'Diagnostic Center',
        diagnosisDetails: uploadDiagnosis || `Uploaded verified ${uploadCategory} document.`,
        medicines: [],
        tags: [uploadCategory, 'Uploaded Document'],
        isPrivateFromEmergency: false,
        fileUrl: URL.createObjectURL(uploadFile),
        fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
      });

      setIsUploading(false);
      setUploadSuccess(true);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDoctor('');
      setUploadHospital('');
      setUploadDiagnosis('');
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch {
      setIsUploading(false);
    }
  };

  // AI Feature Handlers
  const handleGenerateAiSummary = async () => {
    setIsAiSummarizing(true);
    await new Promise((r) => setTimeout(r, 700));

    const totalRecords = records.length;
    const activeMeds = allMedicines.filter((m) => m.status === 'Active').map((m) => m.name);
    const allergiesList = (patient?.allergies || []).map((a) => a.allergen).join(', ');

    const summary = `📋 AI Comprehensive Health Synthesis for ${patientDisplayName}:
• Total Medical Records: ${totalRecords} documented consultations & diagnostic reports.
• Active Prescriptions: ${activeMeds.length > 0 ? activeMeds.join(', ') : 'No active prescription medicines flagged'}.
• Critical Allergies: ${allergiesList || 'No documented critical allergies'}.
• Chronic Conditions: ${(patient?.chronicConditions || []).map((c) => c.name).join(', ') || 'None recorded'}.
• Overview: Health parameters are documented and synchronized in your secure vault.`;

    setAiSummaryText(summary);
    setIsAiSummarizing(false);
  };

  const handleOcrFileUpload = async (file: File) => {
    setOcrPreviewUrl(URL.createObjectURL(file));
    setOcrScanning(true);
    setOcrProgress(10);
    setOcrStatusText('Loading OCR engine...');
    setOcrResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imgData = e.target?.result as string;
        const worker = await createWorker('eng');
        setOcrProgress(40);
        setOcrStatusText('Processing prescription text...');

        const ret = await worker.recognize(imgData);
        setOcrProgress(100);
        await worker.terminate();

        setOcrScanning(false);
        const extracted = ret.data.text ? ret.data.text.trim() : '';
        if (extracted.length > 0) {
          setOcrResult(`📄 OCR Extraction Result:\n\n${extracted}`);
        } else {
          setOcrResult('⚠️ OCR Complete: No legible text detected. Please upload a clear prescription image.');
        }
      } catch (err: any) {
        setOcrScanning(false);
        setOcrResult(`❌ OCR Error: ${err?.message || 'Failed to scan image.'}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCheckDrugInteraction = () => {
    if (
      (med1.toLowerCase().includes('metformin') && med2.toLowerCase().includes('insulin')) ||
      (med1.toLowerCase().includes('insulin') && med2.toLowerCase().includes('metformin'))
    ) {
      setInteractionResult(
        `⚠️ Co-administration Note: ${med1} + ${med2}. Monitor blood glucose levels carefully. Taken under physician guidance.`
      );
    } else if (med1.toLowerCase().includes('crocin') || med2.toLowerCase().includes('crocin')) {
      setInteractionResult(`✅ Safe Combination: ${med1} and ${med2} have no adverse interactions detected.`);
    } else {
      setInteractionResult(`ℹ️ No major adverse interactions flagged for ${med1} and ${med2}.`);
    }
  };

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceQuery(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSpeakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/^Voice Assistant:\s*/, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery) return;
    const q = voiceQuery.toLowerCase();
    let resp = '';
    if (q.includes('allergy') || q.includes('allergies')) {
      const algsText =
        (patient?.allergies || []).length > 0
          ? patient.allergies.map((a) => `${a.allergen} (${a.severity})`).join(', ')
          : 'no recorded allergies';
      resp = `Voice Assistant: ${patientDisplayName} has recorded allergies: ${algsText}.`;
    } else if (q.includes('medicine') || q.includes('prescription')) {
      resp = `Voice Assistant: You currently have ${records.length} medical records and ${allMedicines.length} prescriptions in your vault.`;
    } else if (q.includes('emergency') || q.includes('token')) {
      resp = `Voice Assistant: Opening the Emergency Access Token generator...`;
      onOpenEmergencyModal();
    } else {
      resp = `Voice Assistant: Your health records are securely stored. ${records.length} total records available.`;
    }
    setVoiceResponse(resp);
    handleSpeakResponse(resp);
  };

  // Navigation route mapping
  const tabRoutes: Record<string, string> = {
    dashboard: '/dashboard',
    records: '/medical-records',
    timeline: '/medical-records/timeline',
    upload: '/upload-records',
    access: '/dashboard/access',
    granular: '/settings/permissions',
    emergency: '/dashboard/emergency',
    security: '/dashboard/security',
    ai: '/dashboard/ai',
    trends: '/dashboard/trends',
    profile: '/profile',
    settings: '/settings',
  };

  // Grouped Navigation Structure
  const navSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'records', label: 'Medical Records', icon: FileText, path: '/medical-records' },
        { id: 'timeline', label: 'Medicines', icon: Pill, path: '/medical-records/timeline' },
      ],
    },
    {
      title: 'CARE',
      items: [
        { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/doctor-portal' },
        { id: 'ai', label: 'AI Health Check', icon: Sparkles, path: '/dashboard/ai' },
      ],
    },
    {
      title: 'SHARING',
      items: [
        { id: 'access', label: 'Access Control', icon: Lock, path: '/dashboard/access' },
        { id: 'emergency', label: 'Emergency Access', icon: KeyRound, path: '/dashboard/emergency' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'security', label: 'Security', icon: ShieldCheck, path: '/dashboard/security' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ================================================== */}
        {/* 1. SIDEBAR NAVIGATION */}
        {/* ================================================== */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs p-4 space-y-4">
            
            {/* Patient Badge Card */}
            <div
              onClick={() => navigate('/profile')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-white text-sm shadow-xs flex-shrink-0">
                {displayInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-xs truncate">{patientDisplayName}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Patient</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-teal-700 font-medium">{maskedPatientId}</span>
                </div>
              </div>
            </div>

            {/* Grouped Navigation Links */}
            <nav className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </span>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isItemActive =
                      sidebarTab === item.id ||
                      (item.id === 'records' && (sidebarTab === 'records' || sidebarTab === 'upload')) ||
                      (item.id === 'access' && (sidebarTab === 'access' || sidebarTab === 'granular'));

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.path === '/doctor-portal') {
                            navigate('/doctor-portal');
                          } else {
                            navigate(tabRoutes[item.id] || '/dashboard');
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          isItemActive
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isItemActive ? 'text-white' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.id === 'emergency' && activeEmergencyToken && (
                          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Quick Logout Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={logoutUser}
                className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ================================================== */}
        {/* 2. MAIN CONTENT AREA */}
        {/* ================================================== */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {sidebarTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Patient Welcome Hero */}
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-teal-700 font-semibold">Patient Dashboard</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{patient?.bloodType ? `Blood Group: ${patient.bloodType.split(' ')[0]}` : 'Secure Vault'}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                      Welcome, {patientDisplayName.split(' ')[0]} 👋
                    </h1>
                    <p className="text-xs text-slate-500">
                      Your medical records, connected doctors, and permissions are up to date.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Record</span>
                    </button>

                    <button
                      onClick={onOpenEmergencyModal}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center space-x-1.5 transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-cyan-700" />
                      <span>Emergency Token</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Gentle Mode Recovery Banner (if active) */}
              {isGentleMode && (
                <>
                  <RecoveryPlanCard />
                  <DeferredTasksAccordion />
                </>
              )}

              {/* Health Overview Metric Cards (4 Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div
                  onClick={() => navigate('/medical-records')}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Medical Records</span>
                    <FileText className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{records.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Verified Documents</p>
                </div>

                <div
                  onClick={() => navigate('/medical-records/timeline')}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Medicines</span>
                    <Pill className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{activeMedicinesCount}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active Prescriptions</p>
                </div>

                <div
                  onClick={() => navigate('/dashboard/access')}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Active Access</span>
                    <Lock className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-extrabold text-teal-700">{activeGrantsCount}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active Permissions</p>
                </div>

                <div
                  onClick={() => navigate('/doctor-portal')}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Doctors</span>
                    <Stethoscope className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{connectedDoctorsCount}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Connected Doctors</p>
                </div>
              </div>

              {/* Recent Medical Records Card */}
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">
                      Recent Medical Records
                    </h2>
                    <p className="text-xs text-slate-500">
                      Your latest prescriptions, diagnoses, and lab reports.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/medical-records')}
                    className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center space-x-1"
                  >
                    <span>View All Records</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {records.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {rec.category}
                          </span>
                          <span className="font-bold text-slate-900">{rec.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {rec.diagnosingDoctor} • {rec.hospitalClinic}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                        <span className="font-medium">{rec.date}</span>
                        <button
                          onClick={() => generateMedicalReportPDF(patient, [rec])}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-white transition-colors"
                          title="Download Record PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {records.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No records uploaded yet. Click "Upload Record" above to add your first medical record.
                    </div>
                  )}
                </div>
              </div>

              {/* AI Health Check & Wellness Status Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* AI Health Check Card */}
                <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900 font-display">
                        AI Health Check
                      </h2>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Assisted Guidance
                    </span>
                  </div>

                  {hasCompletedCheckIn ? (
                    /* Completed State */
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                          AI Assessment
                        </span>
                        <p className="text-xs text-slate-700">
                          Your responses indicate: <strong className="text-slate-900">{wellnessInsight || 'Stable wellness condition with manageable stress.'}</strong>
                        </p>
                        <p className="text-xs text-slate-700 mt-1">
                          Suggested next step: <strong className="text-teal-900">{recoveryPlan[0]?.title || 'Follow standard daily wellness routine.'}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={openRecoveryPlayer}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start 3-Min Activity</span>
                        </button>
                        <button
                          onClick={openCheckInModal}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                        >
                          Re-take Check
                        </button>
                        <button
                          onClick={() => navigate('/doctor-portal')}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                        >
                          Contact Doctor
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Initial Pending State */
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 font-medium">
                        How are you feeling today?
                      </p>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            runDemoPreset('demo2_normal');
                          }}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-800 transition-all text-center"
                        >
                          <span className="text-lg block mb-0.5">🙂</span>
                          <span>Good</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openCheckInModal();
                          }}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-800 transition-all text-center"
                        >
                          <span className="text-lg block mb-0.5">😐</span>
                          <span>Okay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            runDemoPreset('demo1_exam');
                          }}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-800 transition-all text-center"
                        >
                          <span className="text-lg block mb-0.5">😣</span>
                          <span>Not Well</span>
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={openCheckInModal}
                          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Start Health Check</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wellness Status Card (NO 0 SCORE WHEN PENDING) */}
                <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 flex flex-col items-center justify-center text-center">
                  <WellnessScoreRing
                    energyLevel={hasCompletedCheckIn ? 4 : 0}
                    stressLevel={hasCompletedCheckIn ? 2 : 0}
                    symptomsCount={0}
                    isPending={!hasCompletedCheckIn}
                    onClickCheckIn={openCheckInModal}
                  />

                  {!hasCompletedCheckIn ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-slate-500">
                        Complete your AI Health Check to generate your wellness assessment.
                      </p>
                      <button
                        onClick={openCheckInModal}
                        className="px-4 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors"
                      >
                        Start Assessment
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Secure Health Vault & Emergency Access Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Secure Health Vault Card */}
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      SECURE HEALTH VAULT
                    </span>
                    <span className="flex items-center space-x-1 text-xs font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Secure</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your medical records are securely stored and available only to authorized healthcare providers.
                  </p>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Access controls: Active
                    </span>
                    <button
                      onClick={() => navigate('/dashboard/security')}
                      className="text-teal-700 hover:text-teal-800 font-bold flex items-center space-x-1"
                    >
                      <span>Security Settings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Emergency Access Card */}
                <div className="rounded-3xl bg-white border border-cyan-200 shadow-xs p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-cyan-600" />
                      EMERGENCY ACCESS
                    </span>
                    {activeEmergencyToken ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        Token Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Ready
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generate temporary emergency QR codes or OTP verification for ER responders during urgent care.
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={onOpenEmergencyModal}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Issue Emergency Token</span>
                    </button>

                    <button
                      onClick={() => navigate('/dashboard/emergency')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Manage Methods →
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MEDICAL RECORDS */}
          {sidebarTab === 'records' && (
            <div className="space-y-6">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <span>Medical Records</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centralized diagnoses, prescriptions, blood tests, and scans.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => generateMedicalReportPDF(patient, filteredRecords)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-teal-600" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Record</span>
                  </button>

                  {/* Format Toggle */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setViewFormat('timeline')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        viewFormat === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Timeline
                    </button>
                    <button
                      onClick={() => setViewFormat('table')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        viewFormat === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>

              {/* Toolbar: Search, Filters, Sort */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search records, doctors, clinics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  {['All', 'Prescription', 'Blood Report', 'X-ray', 'Vaccination Record', 'Mental Health'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        selectedCategory === cat
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}

                  <button
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                  </button>
                </div>
              </div>

              {/* View Rendering */}
              {viewFormat === 'timeline' ? (
                <div className="space-y-3">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`p-5 rounded-3xl bg-white border transition-all shadow-xs ${
                        record.isPrivateFromEmergency
                          ? 'border-rose-200 bg-rose-50/40'
                          : 'border-slate-200/90 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1.5 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                              {record.category}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{record.date}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">{record.title}</h3>
                          <p className="text-xs text-slate-600">{record.diagnosisDetails}</p>

                          <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 pt-1">
                            <span className="text-teal-800 font-semibold">{record.diagnosingDoctor} ({record.doctorSpecialty})</span>
                            <span>•</span>
                            <span>{record.hospitalClinic}</span>
                          </div>

                          {/* Prescribed Medicines */}
                          {record.medicines && record.medicines.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                              <p className="text-[10px] font-bold uppercase text-teal-700 tracking-wider">Prescriptions</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {record.medicines.map((med) => (
                                  <div key={med.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                    <div className="flex justify-between font-bold text-slate-800">
                                      <span>{med.name}</span>
                                      <span className="text-teal-700">{med.dosage}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{med.frequency} • {med.duration}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Privacy Toggle */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 pt-2 md:pt-0">
                          <button
                            onClick={() => toggleRecordPrivacy(record.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-colors ${
                              record.isPrivateFromEmergency
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {record.isPrivateFromEmergency ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                                <span>Private in ER</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-teal-600" />
                                <span>Visible in ER</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Table View */
                <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Title / Condition</th>
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3">Dosage</th>
                        <th className="py-2.5 px-3">Doctor</th>
                        <th className="py-2.5 px-3">Hospital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((rec) => {
                        const firstMed = rec.medicines && rec.medicines.length > 0 ? rec.medicines[0] : null;
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-500 font-medium">{rec.date}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{rec.title}</td>
                            <td className="py-2.5 px-3 text-teal-700 font-semibold">{firstMed ? firstMed.name : 'N/A'}</td>
                            <td className="py-2.5 px-3 text-slate-700">{firstMed ? firstMed.dosage : 'N/A'}</td>
                            <td className="py-2.5 px-3 text-slate-700">{rec.diagnosingDoctor}</td>
                            <td className="py-2.5 px-3 text-slate-600">{rec.hospitalClinic}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDICINE TIMELINE */}
          {sidebarTab === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <span>Prescription & Medicine Timeline</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological record of all prescribed medications and dosages.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Condition</th>
                      <th className="py-3 px-3">Medicine</th>
                      <th className="py-3 px-3">Dosage</th>
                      <th className="py-3 px-3">Frequency</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">Doctor</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allMedicines.map((med, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-500 font-medium">{med.startDate || med.recordDate}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{med.disease}</td>
                        <td className="py-3 px-3 text-teal-800 font-bold">{med.name}</td>
                        <td className="py-3 px-3 text-slate-700">{med.dosage}</td>
                        <td className="py-3 px-3 text-slate-600">{med.frequency}</td>
                        <td className="py-3 px-3 text-slate-600">{med.duration}</td>
                        <td className="py-3 px-3 text-slate-700">{med.doctor}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            med.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {med.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD REPORTS */}
          {sidebarTab === 'upload' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <UploadCloud className="w-5 h-5 text-teal-600" />
                  <span>Upload Medical Reports</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload Prescriptions, Blood Reports, X-rays, MRI, CT Scans, ECG, and Vaccination Records.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                <form onSubmit={handleFileUploadSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as RecordCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Prescription">Prescriptions</option>
                      <option value="Blood Report">Blood Reports</option>
                      <option value="X-ray">X-rays</option>
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="ECG">ECG</option>
                      <option value="Vaccination Record">Vaccination Records</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Report Title / Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Blood Panel & Metabolic Profile"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Doctor Name</label>
                      <input
                        type="text"
                        value={uploadDoctor}
                        onChange={(e) => setUploadDoctor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Hospital / Lab</label>
                      <input
                        type="text"
                        value={uploadHospital}
                        onChange={(e) => setUploadHospital(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* File selector */}
                  <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 bg-slate-50 hover:bg-slate-100/60 transition-colors">
                    <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        {uploadFile ? uploadFile.name : 'Choose a file or drag and drop here'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, PNG, JPG (Max 50MB)</p>
                    </div>
                    <input
                      type="file"
                      id="reportFile"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor="reportFile"
                      className="inline-block px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50"
                    >
                      Browse Files
                    </label>
                  </div>

                  {isUploading && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs text-teal-700 font-semibold">
                        <span>Uploading file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
                      ✓ Medical Report stored successfully in your secure vault!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors disabled:opacity-50 shadow-xs"
                  >
                    Save & Store Report
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: ACCESS CONTROL PANEL */}
          {sidebarTab === 'access' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-teal-600" />
                    <span>Access Control</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage active doctor permissions and customize granular data sharing.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setAccessSubTab('grants')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        accessSubTab === 'grants' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Active Grants ({accessGrants.length})
                    </button>
                    <button
                      onClick={() => setAccessSubTab('permissions')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        accessSubTab === 'permissions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Granular Settings
                    </button>
                  </div>

                  <button
                    onClick={revokeAllAccessGrants}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center space-x-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Revoke All</span>
                  </button>
                </div>
              </div>

              {accessSubTab === 'grants' ? (
                <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                        <th className="py-3 px-3">Doctor / Entity</th>
                        <th className="py-3 px-3">Hospital / Specialty</th>
                        <th className="py-3 px-3">Access Level</th>
                        <th className="py-3 px-3">Expires</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accessGrants.map((grant) => (
                        <tr key={grant.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            <span>{grant.doctorName}</span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {grant.hospital} ({grant.specialty})
                          </td>
                          <td className="py-3.5 px-3 text-teal-700 font-medium">{grant.accessType}</td>
                          <td className="py-3.5 px-3 text-amber-700 font-medium">{grant.expiresAt}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              grant.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}>
                              {grant.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            {grant.status === 'active' && (
                              <button
                                onClick={() => revokeAccessGrant(grant.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 font-bold hover:bg-rose-100"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Granular Permissions Controls */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'bloodGroup', label: 'Blood Group & RH Factor', desc: 'Display blood group to emergency staff' },
                    { key: 'allergies', label: 'Critical Medical Allergies', desc: 'Display allergy & anaphylaxis warnings' },
                    { key: 'currentMedicines', label: 'Current Prescriptions', desc: 'Display active prescribed medicines' },
                    { key: 'chronicDiseases', label: 'Chronic Conditions', desc: 'Display chronic conditions and history' },
                    { key: 'labReports', label: 'Blood & Lab Reports', desc: 'Display metabolic panels and test reports' },
                    { key: 'prescriptions', label: 'Full Prescriptions History', desc: 'Display past doctor prescriptions' },
                    { key: 'imagingReports', label: 'X-Ray, MRI & CT Scans', desc: 'Display radiology reports and scans' },
                    { key: 'vaccinationHistory', label: 'Vaccination History', desc: 'Display immunization records' },
                    { key: 'surgeryHistory', label: 'Surgery & Procedures', desc: 'Display surgical procedure history' },
                    { key: 'mentalHealthRecords', label: 'Mental Health Records', desc: 'Keep mental health notes private' },
                  ].map((item) => {
                    const isChecked = (granularPermissions as any)[item.key];
                    return (
                      <div
                        key={item.key}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 text-xs">{item.label}</h4>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>

                        <button
                          onClick={() => toggleGranularPermission(item.key as any)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                            isChecked ? 'bg-teal-600' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GRANULAR PERMISSIONS ROUTE */}
          {sidebarTab === 'granular' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-teal-600" />
                  <span>Granular Permissions</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which health categories are shared with doctors and emergency responders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'bloodGroup', label: 'Blood Group & RH Factor', desc: 'Display blood group to emergency staff' },
                  { key: 'allergies', label: 'Critical Medical Allergies', desc: 'Display allergy & anaphylaxis warnings' },
                  { key: 'currentMedicines', label: 'Current Prescriptions', desc: 'Display active prescribed medicines' },
                  { key: 'chronicDiseases', label: 'Chronic Conditions', desc: 'Display chronic conditions and history' },
                  { key: 'labReports', label: 'Blood & Lab Reports', desc: 'Display metabolic panels and test reports' },
                  { key: 'prescriptions', label: 'Full Prescriptions History', desc: 'Display past doctor prescriptions' },
                  { key: 'imagingReports', label: 'X-Ray, MRI & CT Scans', desc: 'Display radiology reports and scans' },
                  { key: 'vaccinationHistory', label: 'Vaccination History', desc: 'Display immunization records' },
                  { key: 'surgeryHistory', label: 'Surgery & Procedures', desc: 'Display surgical procedure history' },
                  { key: 'mentalHealthRecords', label: 'Mental Health Records', desc: 'Keep mental health notes private' },
                ].map((item) => {
                  const isChecked = (granularPermissions as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-xs">{item.label}</h4>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>

                      <button
                        onClick={() => toggleGranularPermission(item.key as any)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                          isChecked ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            isChecked ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: EMERGENCY ACCESS */}
          {sidebarTab === 'emergency' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-teal-600" />
                  <span>Emergency Access System</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Three secure preparedness methods for medical responders and emergency doctors.
                </p>
              </div>

              {/* Method 1: QR & One-Time Token */}
              <div className="p-6 rounded-3xl bg-white border border-cyan-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    Method 1 — Temporary Secure Share
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Timers: 15m / 1h / 24h</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Encrypted QR Code & One-Time Token</h3>
                <p className="text-xs text-slate-600">
                  Generate a time-limited token or QR link. When the countdown expires, access automatically self-destructs.
                </p>

                <button
                  onClick={onOpenEmergencyModal}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate Emergency Token Now</span>
                </button>
              </div>

              {/* Method 2: Always-available ER profile */}
              <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Method 2 — Emergency Medical Card
                </span>
                <h3 className="text-base font-bold text-slate-900">Critical Medical Information</h3>
                <p className="text-xs text-slate-600">
                  Essential parameters for triage and emergency treatment.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Blood Group:</span>
                    <p className="font-bold text-teal-800">{patient?.bloodType || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Allergies:</span>
                    <p className="font-bold text-rose-600">
                      {(patient?.allergies || []).length > 0
                        ? patient.allergies.map((a) => a.allergen).join(', ')
                        : 'None recorded'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Active Meds:</span>
                    <p className="font-bold text-amber-800">{activeMedicinesCount} Active</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Proxy Phone:</span>
                    <p className="font-bold text-slate-900">{patient?.emergencyContact?.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Method 3: Family Proxy 2FA OTP */}
              <div className="p-6 rounded-3xl bg-white border border-teal-200 shadow-xs space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Method 3 — Trusted Family Proxy 2FA
                </span>
                <h3 className="text-base font-bold text-slate-900">Proxy Emergency Verification</h3>
                <p className="text-xs text-slate-600">
                  If you cannot grant access yourself, ER doctors can send an OTP verification to your designated family proxy.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <p className="font-bold text-teal-800">Simulate Doctor Request to Family Proxy:</p>
                  <input
                    type="tel"
                    placeholder="Enter proxy phone (e.g. +91 98765 43210)"
                    value={proxyPhoneInput}
                    onChange={(e) => setProxyPhoneInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    onClick={async () => {
                      const targetNumber = proxyPhoneInput.trim() || patient?.emergencyContact?.phone || '+919876543210';
                      setProxyPhoneInput(targetNumber);
                      const req = await requestTrustedContactApproval('Dr. Sneha Das', 'City Hospital', targetNumber);
                      setSelectedRequestId(req.requestId);
                      setOtpModalOpen(true);
                      setOtpError('');
                      setInputOtp('');
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Send OTP to Proxy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY & AUDIT */}
          {sidebarTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>Security & Audit Dashboard</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitor active sessions, cryptographic audit logs, and cloud vault synchronization.
                </p>
              </div>

              {/* Cloud Sync Status Card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-900">Encrypted Cloud Storage Engine</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{syncStatusText}</p>
                    </div>
                  </div>

                  <button
                    onClick={fetchCompleteFirebaseData}
                    disabled={isFetchingFirebase}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFirebase ? 'animate-spin text-teal-600' : 'text-slate-600'}`} />
                    <span>{isFetchingFirebase ? 'Syncing...' : 'Sync Cloud Vault'}</span>
                  </button>
                </div>

                {isFetchingFirebase && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${syncProgress}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Synchronizing records</span>
                      <span>{syncProgress}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Sessions & History */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Active Login Sessions & Devices</h3>
                  <button
                    onClick={revokeAllAccessGrants}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Log Out Other Devices
                  </button>
                </div>

                <div className="space-y-2">
                  {loginHistory.map((sess) => (
                    <div key={sess.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{sess.device}</span>
                          {sess.isCurrentSession && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">{sess.browser} • {sess.location}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-teal-700">{sess.status}</span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sess.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Key Backup */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Encrypted Storage Master Key</h3>
                <p className="text-slate-600">
                  Export a secure backup seed for offline record restoration.
                </p>
                <button
                  onClick={() => alert('Downloaded Encrypted Backup Key: MV-KEY-2026-SECURE')}
                  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Download Encryption Key Backup
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: AI HEALTH FEATURES */}
          {sidebarTab === 'ai' && (
            <div className="space-y-6">
              <WellnessIntelligenceDashboard onOpenEmergencyModal={onOpenEmergencyModal} />

              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>AI Health Tools</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prescription OCR scanner, summary synthesizer, drug interaction check, and voice assistant.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* AI Feature 1: Health Summary */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-teal-600" />
                    <span>AI Health Summary Generator</span>
                  </h3>
                  <p className="text-xs text-slate-500">Synthesize lifetime medical records and active prescriptions into clear natural language.</p>
                  
                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={isAiSummarizing}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    {isAiSummarizing ? 'Generating...' : 'Generate Health Summary'}
                  </button>

                  {aiSummaryText && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-slate-800 whitespace-pre-line font-mono">
                      {aiSummaryText}
                    </div>
                  )}
                </div>

                {/* AI Feature 2: OCR Prescription Scanner */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-teal-600" />
                    <span>OCR Prescription Scanner</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload prescription photos to extract dosages, doctor notes, and medicines via OCR.
                  </p>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-teal-200 rounded-2xl bg-teal-50/30 hover:bg-teal-50 transition-colors cursor-pointer text-center space-y-1">
                    <Upload className="w-5 h-5 text-teal-600" />
                    <span className="text-xs font-bold text-teal-800">Scan Prescription Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleOcrFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {ocrPreviewUrl && (
                    <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <img src={ocrPreviewUrl} alt="Prescription" className="w-10 h-10 object-cover rounded-lg" />
                      <span className="text-slate-700 font-medium">Image Loaded</span>
                    </div>
                  )}

                  {ocrScanning && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-teal-700 font-bold">
                        <span>{ocrStatusText}</span>
                        <span>{ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal-600 h-full transition-all" style={{ width: `${ocrProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {ocrResult && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-line font-mono max-h-40 overflow-y-auto">
                      {ocrResult}
                    </div>
                  )}
                </div>

                {/* AI Feature 3: Drug Interaction Checker */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-amber-600" />
                    <span>Drug Interaction Checker</span>
                  </h3>
                  <p className="text-xs text-slate-500">Check interactions between prescribed medicines.</p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={med1}
                      onChange={(e) => setMed1(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={med2}
                      onChange={(e) => setMed2(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    onClick={handleCheckDrugInteraction}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
                  >
                    Check Interactions
                  </button>

                  {interactionResult && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-800 font-medium">
                      {interactionResult}
                    </div>
                  )}
                </div>

                {/* AI Feature 4: Voice Assistant */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-teal-600" />
                    <span>Voice Health Assistant</span>
                  </h3>
                  <p className="text-xs text-slate-500">Ask questions using your voice regarding your health history and allergies.</p>

                  <form onSubmit={handleVoiceQuerySubmit} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={isListening ? "Listening to voice..." : "e.g. What are my allergies?"}
                        value={voiceQuery}
                        onChange={(e) => setVoiceQuery(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={handleStartListening}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg ${
                          isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-teal-600'
                        }`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shrink-0"
                    >
                      Ask
                    </button>
                  </form>

                  {voiceResponse && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-800 text-[10px]">Response</span>
                        <button
                          type="button"
                          onClick={() => handleSpeakResponse(voiceResponse)}
                          className="text-[10px] font-bold text-teal-700 hover:underline flex items-center space-x-1"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          <span>{isSpeaking ? 'Stop' : 'Audio'}</span>
                        </button>
                      </div>
                      <p className="text-slate-800">{voiceResponse}</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: PROFILE (PATIENT PROFILE VIEW & EDITING) */}
          {sidebarTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-teal-600" />
                    <span>Patient Profile</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your personal medical profile, emergency contacts, allergies, and chronic conditions.
                  </p>
                </div>

                {!isEditingProfile && (
                  <button
                    onClick={() => {
                      setIsEditingProfile(true);
                      setProfileSaveSuccess(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {profileSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Patient Profile updated successfully and saved!</span>
                </div>
              )}

              {isEditingProfile ? (
                /* EDIT PROFILE FORM */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updatePatientProfile({
                      fullName: editFullName.trim(),
                      age: editAge ? Number(editAge) : 0,
                      dob: editDob,
                      gender: editGender,
                      bloodType: editBloodType.trim(),
                      email: editEmail.trim(),
                      phone: editPhone.trim(),
                      address: editAddress.trim(),
                      emergencyContact: {
                        id: patient?.emergencyContact?.id || 'contact-1',
                        name: editEmergencyName.trim(),
                        relationship: editEmergencyRelation.trim(),
                        phone: editEmergencyPhone.trim(),
                        isTrustedProxy: true,
                      },
                      allergies: editAllergies,
                      chronicConditions: editChronicConditions,
                    });
                    setIsEditingProfile(false);
                    setProfileSaveSuccess(true);
                  }}
                  className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 text-xs"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <Edit3 className="w-4 h-4 text-teal-600" />
                      <span>Edit Patient Profile</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Fill in or update your personal details</span>
                  </div>

                  {/* 1. Basic Information */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Basic Information</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            id="profile-input-fullname"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            placeholder="Full Legal Name"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Age</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="number"
                            id="profile-input-age"
                            value={editAge}
                            onChange={(e) => setEditAge(e.target.value)}
                            placeholder="Enter age"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Gender</label>
                        <div className="relative">
                          <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                          <select
                            id="profile-input-gender"
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="">Select gender ▼</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                        <div className="relative">
                          <Droplet className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                          <select
                            id="profile-input-blood"
                            value={editBloodType}
                            onChange={(e) => setEditBloodType(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="">Select blood group ▼</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Contact Information */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      <span>Contact Information</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            id="profile-input-email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            id="profile-input-phone"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Address */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>Address</span>
                    </h4>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Residential Address</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <textarea
                          rows={3}
                          id="profile-input-address"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Enter residential address"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Emergency Proxy Contact */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                      <span>Emergency Proxy Contact</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Proxy Name</label>
                        <input
                          type="text"
                          id="profile-input-emergency"
                          value={editEmergencyName}
                          onChange={(e) => setEditEmergencyName(e.target.value)}
                          placeholder="Contact Name"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                        <input
                          type="text"
                          value={editEmergencyRelation}
                          onChange={(e) => setEditEmergencyRelation(e.target.value)}
                          placeholder="e.g. Spouse, Parent, Sibling"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Proxy Phone</label>
                        <input
                          type="text"
                          value={editEmergencyPhone}
                          onChange={(e) => setEditEmergencyPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Allergies Management */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                        Known Allergies ({editAllergies.length})
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {editAllergies.map((alg, index) => (
                        <div key={alg.id || index} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{alg.allergen}</span>
                            <span className="text-slate-500 ml-2">({alg.severity})</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">{alg.reaction}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditAllergies((prev) => prev.filter((_, i) => i !== index))}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add allergy form */}
                      <div className="p-3 rounded-xl bg-slate-50/50 border border-dashed border-slate-300 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Allergen (e.g. Penicillin, Peanuts)"
                            value={newAllergen}
                            onChange={(e) => setNewAllergen(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                          />
                          <select
                            value={newSeverity}
                            onChange={(e) => setNewSeverity(e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                          >
                            <option value="Mild">Mild</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Severe">Severe</option>
                            <option value="Life-Threatening">Life-Threatening</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Reaction (e.g. Skin Rash, Anaphylaxis)"
                            value={newReaction}
                            onChange={(e) => setNewReaction(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newAllergen.trim()) {
                              setEditAllergies((prev) => [
                                ...prev,
                                {
                                  id: `alg-${Date.now()}`,
                                  allergen: newAllergen.trim(),
                                  severity: newSeverity,
                                  reaction: newReaction.trim() || 'Allergic reaction',
                                },
                              ]);
                              setNewAllergen('');
                              setNewReaction('');
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px]"
                        >
                          + Add Allergy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 6. Chronic Conditions Management */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                        Chronic Conditions ({editChronicConditions.length})
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {editChronicConditions.map((cnd, index) => (
                        <div key={cnd.id || index} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{cnd.name}</span>
                            <span className="text-slate-500 ml-2">({cnd.status})</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Diagnosed: {cnd.diagnosedYear}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditChronicConditions((prev) => prev.filter((_, i) => i !== index))}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add condition form */}
                      <div className="p-3 rounded-xl bg-slate-50/50 border border-dashed border-slate-300 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Condition (e.g. Type 2 Diabetes, Asthma)"
                            value={newConditionName}
                            onChange={(e) => setNewConditionName(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Year (e.g. 2021)"
                            value={newDiagnosedYear}
                            onChange={(e) => setNewDiagnosedYear(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                          />
                          <select
                            value={newConditionStatus}
                            onChange={(e) => setNewConditionStatus(e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                          >
                            <option value="Active">Active</option>
                            <option value="Managed">Managed</option>
                            <option value="In Remission">In Remission</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newConditionName.trim()) {
                              setEditChronicConditions((prev) => [
                                ...prev,
                                {
                                  id: `cnd-${Date.now()}`,
                                  name: newConditionName.trim(),
                                  diagnosedYear: newDiagnosedYear.trim() || new Date().getFullYear().toString(),
                                  status: newConditionStatus,
                                },
                              ]);
                              setNewConditionName('');
                              setNewDiagnosedYear('');
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px]"
                        >
                          + Add Condition
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons: Save Changes & Cancel */}
                  <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW PROFILE CARD */
                <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                  
                  {/* Section 1: Basic Information */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Basic Information</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold">Full Legal Name:</span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">
                          {patient?.fullName?.trim() || currentUser?.displayName?.trim() || (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(true);
                                setTimeout(() => document.getElementById('profile-input-fullname')?.focus(), 50);
                              }}
                              className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add information</span>
                            </button>
                          )}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Patient ID:</span>
                        <p className="font-bold text-teal-700 text-sm font-mono mt-0.5">
                          {maskedPatientId}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Age:</span>
                        {patient?.age && Number(patient.age) > 0 ? (
                          <p className="font-bold text-slate-900 mt-0.5">{patient.age} Years</p>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(true);
                                setTimeout(() => document.getElementById('profile-input-age')?.focus(), 50);
                              }}
                              className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline mt-0.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add information</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Gender:</span>
                        {patient?.gender && patient.gender.trim() !== '' ? (
                          <p className="font-bold text-slate-900 mt-0.5">{patient.gender}</p>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(true);
                                setTimeout(() => document.getElementById('profile-input-gender')?.focus(), 50);
                              }}
                              className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline mt-0.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add information</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Blood Group:</span>
                        {patient?.bloodType && patient.bloodType.trim() !== '' ? (
                          <p className="font-bold text-teal-800 mt-0.5">{patient.bloodType}</p>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(true);
                                setTimeout(() => document.getElementById('profile-input-blood')?.focus(), 50);
                              }}
                              className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline mt-0.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add information</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact Information */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold">Email Address:</span>
                        {patient?.email && patient.email.includes('@') ? (
                          <p className="font-bold text-slate-900 mt-0.5">{patient.email}</p>
                        ) : currentUser?.email && currentUser.email.includes('@') ? (
                          <p className="font-bold text-slate-900 mt-0.5">{currentUser.email}</p>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(true);
                                setTimeout(() => document.getElementById('profile-input-email')?.focus(), 50);
                              }}
                              className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline mt-0.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add information</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Phone Number:</span>
                        {patient?.phone && patient.phone.trim() !== '' ? (
                          <p className="font-bold text-slate-900 mt-0.5">{patient.phone}</p>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(true);
                                setTimeout(() => document.getElementById('profile-input-phone')?.focus(), 50);
                              }}
                              className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline mt-0.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add information</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Address */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>Address</span>
                    </h3>
                    <div className="text-xs">
                      <span className="text-slate-500 font-semibold">Residential Address:</span>
                      {patient?.address && patient.address.trim() !== '' ? (
                        <p className="font-bold text-slate-900 mt-0.5">{patient.address}</p>
                      ) : (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(true);
                              setTimeout(() => document.getElementById('profile-input-address')?.focus(), 50);
                            }}
                            className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline mt-0.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add information</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 4: Emergency Proxy Contact */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h3 className="text-xs font-bold text-teal-800 uppercase flex items-center space-x-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                      <span>Designated Emergency Proxy</span>
                    </h3>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        {patient?.emergencyContact?.name ? (
                          <>
                            <p className="font-bold text-slate-900">{patient.emergencyContact.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {patient.emergencyContact.relationship || ''} {patient.emergencyContact.phone ? `• ${patient.emergencyContact.phone}` : ''}
                            </p>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(true);
                              setTimeout(() => document.getElementById('profile-input-emergency')?.focus(), 50);
                            }}
                            className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add emergency contact</span>
                          </button>
                        )}
                      </div>
                      {patient?.emergencyContact?.name && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section 5: Allergies Summary */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h3 className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Documented Allergies ({(patient?.allergies || []).length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(patient?.allergies || []).length > 0 ? (
                        patient.allergies.map((alg) => (
                          <div key={alg.id} className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                            <span className="font-bold text-rose-800">{alg.allergen}</span>
                            <span className="text-rose-600 text-[11px] ml-1.5">({alg.severity})</span>
                            <p className="text-[11px] text-rose-700 mt-0.5">{alg.reaction}</p>
                          </div>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add allergy information</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section 6: Chronic Conditions */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h3 className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Chronic Conditions ({(patient?.chronicConditions || []).length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(patient?.chronicConditions || []).length > 0 ? (
                        patient.chronicConditions.map((cnd) => (
                          <div key={cnd.id} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                            <span className="font-bold text-amber-900">{cnd.name}</span>
                            <span className="text-amber-700 text-[11px] ml-1.5">({cnd.status})</span>
                            <p className="text-[11px] text-amber-700 mt-0.5">Diagnosed: {cnd.diagnosedYear}</p>
                          </div>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="inline-flex items-center space-x-1 text-xs text-amber-700 hover:text-amber-800 font-semibold hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add chronic condition</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {sidebarTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-teal-600" />
                  <span>Settings & Preferences</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theme controls, notification preferences, and privacy toggles.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900">Theme Appearance</p>
                    <p className="text-slate-500 text-[11px]">Toggle between Light and Dark interface modes</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                  >
                    {theme.toUpperCase()}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900">Emergency Quick Actions</p>
                    <p className="text-slate-500 text-[11px]">Keep Emergency Token button visible in navigation</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: RECOVERY TRENDS */}
          {sidebarTab === 'trends' && <CoachAdminRecoveryTrends />}

        </main>
      </div>

      {/* OTP MODAL */}
      <AnimatePresence>
        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs shadow-xl"
            >
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>Family Proxy 2FA OTP Verification</span>
              </h3>
              <p className="text-slate-600">
                A 6-digit OTP code was sent to proxy phone <strong className="text-slate-900 font-mono">{proxyPhoneInput || 'Proxy Phone'}</strong>.
              </p>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Enter 6-digit code:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRequestId) {
                      const newCode = resendTrustedContactOTP(selectedRequestId);
                      if (newCode) {
                        setOtpError('');
                        setInputOtp('');
                      }
                    }
                  }}
                  className="font-bold text-teal-700 hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit OTP..."
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />

              {otpError && <p className="text-rose-600 font-bold">{otpError}</p>}

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const success = verifyTrustedContactOTP(selectedRequestId, inputOtp);
                    if (success) {
                      setOtpModalOpen(false);
                      setInputOtp('');
                      setOtpError('');
                      alert('Trusted Proxy Access Approved! Emergency token granted.');
                    } else {
                      setOtpError('Invalid OTP Code. Please verify the code.');
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors"
                >
                  Verify Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW MEDICAL RECORD MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>Add Medical Record</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Diagnosis / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Routine Health Checkup"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as RecordCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Prescription">Prescription</option>
                      <option value="Blood Report">Blood Report</option>
                      <option value="X-ray">X-ray</option>
                      <option value="Diagnosis">Diagnosis</option>
                      <option value="Vaccination Record">Vaccination Record</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Doctor</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Sneha Das"
                      value={newDoctor}
                      onChange={(e) => setNewDoctor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      placeholder="City Health Center"
                      value={newHospital}
                      onChange={(e) => setNewHospital(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Prescribed Medicine (Optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine"
                      value={newMedicineName}
                      onChange={(e) => setNewMedicineName(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="newIsPrivate"
                    checked={newIsPrivate}
                    onChange={(e) => setNewIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                  <label htmlFor="newIsPrivate" className="text-slate-700 text-xs font-medium cursor-pointer">
                    Keep Private from Emergency Access exports
                  </label>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-xs"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3-Minute Guided Recovery Activity Player */}
      <ThreeMinuteRecoveryPlayer />

      {/* Safety Triage Escalation Modal */}
      <SafetyTriageModal />
    </div>
  );
};
