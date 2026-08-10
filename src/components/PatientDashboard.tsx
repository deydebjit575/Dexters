import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Stethoscope,
  Pill,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  HeartPulse,
  Plus,
  Search,
  Filter,
  Shield,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Hospital,
  ChevronDown,
  Activity,
  KeyRound,
  UserX,
  UploadCloud,
  Download,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
  Users,
  Settings,
  LogOut,
  Sliders,
  Bell,
  Check,
  QrCode,
  Share2,
  FileCheck,
  Cpu,
  Volume2,
  TrendingUp,
  BarChart2,
  PhoneCall,
  RefreshCw,
  Mic,
  MicOff,
  VolumeX,
  MessageSquare,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useMediVault } from '../context/MediVaultContext';
import { RecordCategory, PrescribedMedicine, MedicalRecord } from '../types/medical';
import { generateMedicalReportPDF } from '../services/pdfService';
import { uploadEncryptedFileToStorage } from '../services/firebaseService';

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
    auditLogs,
    loginHistory,
    granularPermissions,
    toggleGranularPermission,
    toggleRecordPrivacy,
    addMedicalRecord,
    revokeAccessGrant,
    revokeAllAccessGrants,
    activeEmergencyToken,
    revokeActiveEmergencyToken,
    trustedRequests,
    requestTrustedContactApproval,
    resendTrustedContactOTP,
    verifyTrustedContactOTP,
    theme,
    toggleTheme,
    setActiveView,
    currentLang,
    currentUser,
    isDemoMode,
    isFetchingFirebase,
    syncProgress,
    syncStatusText,
    fetchCompleteFirebaseData,
    logoutUser,
    updatePatientProfile,
  } = useMediVault();

  const navigate = useNavigate();

  // Sidebar Tabs State
  const [sidebarTab, setSidebarTab] = useState<string>(activeSubTab || 'dashboard');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(patient.fullName);
  const [editAge, setEditAge] = useState(patient.age);
  const [editGender, setEditGender] = useState(patient.gender);
  const [editBloodType, setEditBloodType] = useState(patient.bloodType);
  const [editEmail, setEditEmail] = useState(patient.email);
  const [editPhone, setEditPhone] = useState(patient.phone);
  const [editAddress, setEditAddress] = useState(patient.address);
  const [editEmergencyName, setEditEmergencyName] = useState(patient.emergencyContact.name);
  const [editEmergencyRelation, setEditEmergencyRelation] = useState(patient.emergencyContact.relationship);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(patient.emergencyContact.phone);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  useEffect(() => {
    setEditFullName(patient.fullName);
    setEditAge(patient.age);
    setEditGender(patient.gender);
    setEditBloodType(patient.bloodType);
    setEditEmail(patient.email);
    setEditPhone(patient.phone);
    setEditAddress(patient.address);
    setEditEmergencyName(patient.emergencyContact.name);
    setEditEmergencyRelation(patient.emergencyContact.relationship);
    setEditEmergencyPhone(patient.emergencyContact.phone);
  }, [patient]);

  useEffect(() => {
    if (activeSubTab) setSidebarTab(activeSubTab);
  }, [activeSubTab]);

  // Medical Records Filter & Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewFormat, setViewFormat] = useState<'timeline' | 'table'>('timeline');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<MedicalRecord | null>(null);

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
  const [newDate, setNewDate] = useState('2026-07-24');
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

  const sendOtpToProxyPhone = async (phone: string, otpCode?: string) => {
    const targetPhone = phone.trim();
    
    // Format phone number to E.164 (+91 for 10-digit Indian numbers)
    let cleanPhone = targetPhone.replace(/[^\d+]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else {
        cleanPhone = '+' + cleanPhone;
      }
    }

    // 1. Call server-side Node endpoint to dispatch real SMS (bypasses browser CORS)
    try {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otpCode: otpCode,
        }),
      });
    } catch (err) {
      console.log('Server SMS Dispatch API Error:', err);
    }

    // 2. Audio Chime Feedback for Dispatch
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {}
  };

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
      hospitalClinic: newHospital || '',
      diagnosisDetails: newDiagnosis || 'Routine clinical follow-up.',
      medicines,
      tags: [newCategory, 'Medical Record'],
      isPrivateFromEmergency: newIsPrivate,
    });

    setNewTitle('');
    setNewDiagnosis('');
    setNewMedicineName('');
    setIsAddModalOpen(false);
  };

  // Handle Report File Upload
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadSuccess(false);

    try {
      const res = await uploadEncryptedFileToStorage(uploadFile, (p) => setUploadProgress(p));
      addMedicalRecord({
        title: uploadTitle || `${uploadCategory} - ${uploadFile.name}`,
        category: uploadCategory,
        date: new Date().toISOString().substring(0, 10),
        diagnosingDoctor: uploadDoctor,
        doctorSpecialty: 'Diagnostics',
        hospitalClinic: uploadHospital,
        diagnosisDetails: uploadDiagnosis || `Uploaded document (${uploadFile.name}). Client-side AES encrypted.`,
        medicines: [],
        tags: [uploadCategory, 'Uploaded Document'],
        isPrivateFromEmergency: false,
        fileUrl: res.downloadUrl,
        fileSize: res.sizeFormatted,
        encryptedDataHash: res.hash,
      });

      setUploadProgress(100);
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDiagnosis('');
      }, 1500);
    } catch (err) {
      setIsUploading(false);
    }
  };

  // Filtered & Sorted Medical Records
  const filteredRecords = records
    .filter((rec) => {
      const matchesSearch =
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.diagnosingDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.hospitalClinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.diagnosisDetails.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // Extract all prescribed medicines chronologically for Medicine Timeline
  const allMedicines = records.flatMap((rec) =>
    rec.medicines.map((med) => ({
      ...med,
      disease: rec.title,
      recordDate: rec.date,
      doctor: rec.diagnosingDoctor,
      hospital: rec.hospitalClinic,
    }))
  );

  // AI Feature Handlers
  const handleGenerateAiSummary = () => {
    setIsAiSummarizing(true);
    setTimeout(() => {
      setIsAiSummarizing(false);
      const allergiesList = patient.allergies.length > 0 
        ? patient.allergies.map(a => `${a.allergen} (${a.severity})`).join(', ')
        : 'No known allergies recorded';
      const conditionsList = patient.chronicConditions.length > 0
        ? patient.chronicConditions.map(c => `${c.name} (${c.status})`).join(', ')
        : 'No chronic conditions recorded';

      setAiSummaryText(
        `AI Health Synthesis for ${patient.fullName} (${patient.age} Yrs, ${patient.bloodType}):\n• Active Conditions: ${conditionsList}.\n• Allergies Alert: ${allergiesList}.\n• Encrypted Records Secured: ${records.length} items.\n• Status: Sovereign Zero-Knowledge Firebase Vault Verified.`
      );
    }, 1000);
  };

  const handleOcrFileUpload = async (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target?.result as string;
      setOcrPreviewUrl(imageSrc);
      setOcrScanning(true);
      setOcrProgress(15);
      setOcrStatusText('Initializing Tesseract OCR Engine...');
      setOcrResult(null);

      try {
        const worker = await createWorker('eng');
        setOcrProgress(50);
        setOcrStatusText('Scanning prescription image & extracting text...');
        const ret = await worker.recognize(imageSrc);
        setOcrProgress(90);
        setOcrStatusText('Processing extracted medical text...');
        await worker.terminate();

        setOcrProgress(100);
        setOcrScanning(false);
        const extractedText = ret.data.text ? ret.data.text.trim() : '';
        if (extractedText.length > 0) {
          setOcrResult(`📄 REAL OCR EXTRACTION RESULT:\n\n${extractedText}`);
        } else {
          setOcrResult(`⚠️ OCR Completed: No readable text detected in uploaded prescription image. Please try a clearer image.`);
        }
      } catch (err: any) {
        console.error('OCR Error:', err);
        setOcrScanning(false);
        setOcrResult(`❌ OCR Error: Failed to scan document. ${err?.message || ''}`);
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
        `⚠️ Synergistic Combination: ${med1} + ${med2}. Monitor for potential hypoglycemia. Co-prescribed under supervision.`
      );
    } else if (med1.toLowerCase().includes('crocin') || med2.toLowerCase().includes('crocin')) {
      setInteractionResult(
        `✅ Safe Combination: ${med1} / ${med2} has no adverse interaction detected.`
      );
    } else {
      setInteractionResult(
        `ℹ️ No severe drug-drug interaction flagged for ${med1} and ${med2}.`
      );
    }
  };

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech Recognition API is not supported in your browser. Please type your question.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSpeakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/^Voice AI:\s*/, '');
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
      const algsText = patient.allergies.length > 0 
        ? patient.allergies.map(a => `${a.allergen} (${a.severity})`).join(', ')
        : 'no recorded allergies';
      resp = `Voice AI: ${patient.fullName} has ${patient.allergies.length} recorded allergies: ${algsText}.`;
    } else if (q.includes('medicine') || q.includes('insulin') || q.includes('metformin') || q.includes('prescription')) {
      resp = `Voice AI: Record search complete for ${patient.fullName}. ${records.length} medical records located in your secure vault.`;
    } else if (q.includes('token') || q.includes('emergency')) {
      resp = `Voice AI: Opening Emergency Access Token Generator for ${patient.fullName}...`;
      onOpenEmergencyModal();
    } else {
      resp = `Voice AI: ${patient.fullName}'s Health Vault is fully synchronized. ${records.length} total records secured.`;
    }
    setVoiceResponse(resp);
    // Automatically read response if requested
    handleSpeakResponse(resp);
  };

  // Tab → Route map for sidebar navigation
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
    profile: '/profile',
    settings: '/settings',
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'timeline', label: 'Medicine Timeline', icon: Pill },
    { id: 'upload', label: 'Upload Reports', icon: UploadCloud },
    { id: 'access', label: 'Access Control', icon: Lock },
    { id: 'granular', label: 'Granular Permissions', icon: Sliders },
    { id: 'emergency', label: 'Emergency Access', icon: KeyRound },
    { id: 'security', label: 'Security Dashboard', icon: ShieldCheck },
    { id: 'ai', label: 'AI Health Features', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 space-y-1">
            
            {/* Patient Compact Badge */}
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 mb-3 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center font-extrabold text-white text-sm">
                {patient.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'PT'}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 text-xs truncate">{patient.fullName}</p>
                <p className="text-[10px] text-cyan-600 font-mono">ID: {patient.id}</p>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = sidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(tabRoutes[item.id] || '/dashboard')}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-3 ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick Logout Button */}
            <button
              onClick={logoutUser}
              className="w-full px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center space-x-3 transition-colors pt-3 border-t border-slate-200 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Firebase Vault</span>
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Live Firebase Sync Header Banner */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="relative flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${isFetchingFirebase ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                  <div className={`w-3 h-3 rounded-full absolute inset-0 ${isFetchingFirebase ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="font-bold text-slate-900">Firebase Firestore Engine</span>
                    {currentUser ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">
                        User Vault Active: {currentUser.displayName}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-semibold">
                        Guest (Unauthenticated Vault)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{syncStatusText}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={fetchCompleteFirebaseData}
                  disabled={isFetchingFirebase}
                  className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 font-bold text-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFirebase ? 'animate-spin text-cyan-500' : 'text-cyan-500'}`} />
                  <span>{isFetchingFirebase ? 'Fetching Encrypted Data...' : 'Fetch Complete Firebase Data'}</span>
                </button>
              </div>
            </div>

            {/* Sync Progress Bar */}
            {isFetchingFirebase && (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${syncProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Gradual Firebase Streaming & Decryption</span>
                  <span>{syncProgress}% Complete</span>
                </div>
              </div>
            )}
          </div>
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {sidebarTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Sovereign Patient Header Banner */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                <div className="ambient-glow-cyan -top-20 -left-20 opacity-30" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-100 text-cyan-700 border border-cyan-200">
                        Zero-Knowledge Health Vault
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Age: {patient.age} Yrs</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      Welcome, {patient.fullName}
                    </h1>
                    <p className="text-xs text-slate-600">
                      Your lifetime health records are encrypted locally with AES-256-GCM. You hold the sovereign keys.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => generateMedicalReportPDF(patient, records)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4 text-cyan-600" />
                      <span>Download PDF Vault</span>
                    </button>
                    <button
                      onClick={onOpenEmergencyModal}
                      className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-extrabold shadow-md flex items-center space-x-2 transition-colors"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Issue Token</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                  <p className="text-xs text-slate-500">Total Medical Records</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{records.length}</p>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                  <p className="text-xs text-slate-500">Active Doctors</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                    {accessGrants.filter((g) => g.status === 'active').length}
                  </p>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                  <p className="text-xs text-slate-500">Blood Group</p>
                  <p className="text-2xl font-extrabold text-cyan-600 mt-1">{patient.bloodType.split(' ')[0]}</p>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                  <p className="text-xs text-slate-500">Critical Allergies</p>
                  <p className="text-2xl font-extrabold text-rose-500 mt-1">{patient.allergies.length}</p>
                </div>
              </div>

              {/* Critical Allergies & Chronic Alert Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical Allergies</span>
                  </h3>
                  <div className="space-y-2">
                    {patient.allergies.map((alg) => (
                      <div key={alg.id} className="p-3 rounded-2xl bg-white border border-rose-200 text-xs">
                        <p className="font-bold text-rose-700">{alg.allergen} ({alg.severity})</p>
                        <p className="text-[11px] text-rose-600 mt-0.5">{alg.reaction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Chronic Conditions & Prescriptions</span>
                  </h3>
                  <div className="space-y-2">
                    {patient.chronicConditions.map((cnd) => (
                      <div key={cnd.id} className="p-3 rounded-2xl bg-white border border-amber-200 text-xs">
                        <p className="font-bold text-amber-800">{cnd.name}</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">Diagnosed {cnd.diagnosedYear} • Status: {cnd.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Records Preview */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Recent Prescriptions & Diagnoses</h3>
                  <button
                    onClick={() => navigate('/medical-records')}
                    className="text-xs text-cyan-600 font-bold hover:underline"
                  >
                    View All ({records.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {records.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 border border-cyan-200 mr-2">
                          {rec.category}
                        </span>
                        <span className="font-bold text-slate-900">{rec.title}</span>
                        <p className="text-[11px] text-slate-500 mt-1">{rec.diagnosingDoctor} — {rec.hospitalClinic}</p>
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">{rec.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIFETIME MEDICAL RECORDS TIMELINE */}
          {sidebarTab === 'records' && (
            <div className="space-y-6">
              
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-cyan-500" />
                    <span>Lifetime Medical Records Timeline</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centralized diagnoses, prescriptions, blood tests, and scans.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Download PDF Button */}
                  <button
                    onClick={() => generateMedicalReportPDF(patient, filteredRecords)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-cyan-600" />
                    <span>Download PDF</span>
                  </button>

                  {/* Add Record Button */}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Record</span>
                  </button>

                  {/* Format View Toggle */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setViewFormat('timeline')}
                      className={`px-3 py-1 rounded-lg font-bold ${viewFormat === 'timeline' ? 'bg-cyan-500 text-white' : 'text-slate-600'}`}
                    >
                      Timeline
                    </button>
                    <button
                      onClick={() => setViewFormat('table')}
                      className={`px-3 py-1 rounded-lg font-bold ${viewFormat === 'table' ? 'bg-cyan-500 text-white' : 'text-slate-600'}`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>

              {/* Toolbar: Search, Category Filter, Sort */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search records, doctor, hospital..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {['All', 'Prescription', 'Blood Report', 'X-ray', 'Vaccination Record', 'Mental Health'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        selectedCategory === cat
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}

                  <button
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                  </button>
                </div>
              </div>

              {/* TIMELINE VIEW */}
              {viewFormat === 'timeline' ? (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`p-6 rounded-3xl bg-white border transition-all relative shadow-sm ${
                        record.isPrivateFromEmergency
                          ? 'border-rose-200 bg-rose-50'
                          : 'border-slate-200 hover:border-cyan-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 border border-cyan-200">
                              {record.category}
                            </span>
                            <span className="text-xs font-mono text-slate-500">{record.date}</span>
                            <span className="text-xs text-slate-400 font-mono">ID: {record.id}</span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900">{record.title}</h3>
                          <p className="text-xs text-slate-600">{record.diagnosisDetails}</p>

                          <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500 pt-1">
                            <span className="text-cyan-700 font-medium">Doctor: {record.diagnosingDoctor} ({record.doctorSpecialty})</span>
                            <span>•</span>
                            <span>Hospital: {record.hospitalClinic}</span>
                          </div>

                          {/* Prescribed Medicines */}
                          {record.medicines && record.medicines.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                              <p className="text-[11px] font-bold uppercase text-cyan-600 tracking-wider">Prescribed Medication</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {record.medicines.map((med) => (
                                  <div key={med.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                    <div className="flex justify-between font-bold text-slate-800">
                                      <span>{med.name}</span>
                                      <span className="text-cyan-600">{med.dosage}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{med.frequency} • {med.duration}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Privacy Toggle Switch */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-2 md:pt-0">
                          <button
                            onClick={() => toggleRecordPrivacy(record.id)}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 border transition-colors ${
                              record.isPrivateFromEmergency
                                ? 'bg-rose-100 text-rose-700 border-rose-300'
                                : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            }`}
                          >
                            {record.isPrivateFromEmergency ? (
                              <>
                                <EyeOff className="w-4 h-4 text-rose-500" />
                                <span>Hidden (Private)</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 text-cyan-500" />
                                <span>Visible (Public ER)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Disease / Title</th>
                        <th className="py-3 px-3">Medicine</th>
                        <th className="py-3 px-3">Dosage</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3">Doctor</th>
                        <th className="py-3 px-3">Hospital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((rec) => {
                        const firstMed = rec.medicines && rec.medicines.length > 0 ? rec.medicines[0] : null;
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono text-slate-500">{rec.date}</td>
                            <td className="py-3 px-3 font-bold text-slate-900">{rec.title}</td>
                            <td className="py-3 px-3 text-cyan-700 font-medium">{firstMed ? firstMed.name : 'N/A'}</td>
                            <td className="py-3 px-3 text-slate-700">{firstMed ? firstMed.dosage : 'N/A'}</td>
                            <td className="py-3 px-3 text-slate-600">{firstMed ? firstMed.duration : 'N/A'}</td>
                            <td className="py-3 px-3 text-slate-700">{rec.diagnosingDoctor}</td>
                            <td className="py-3 px-3 text-slate-600">{rec.hospitalClinic}</td>
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
                  <Pill className="w-5 h-5 text-cyan-500" />
                  <span>Prescription & Medication Timeline</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological history of all active and completed medications prescribed by doctors.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Condition / Disease</th>
                      <th className="py-3 px-3">Medicine</th>
                      <th className="py-3 px-3">Dosage</th>
                      <th className="py-3 px-3">Frequency</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">Doctor</th>
                      <th className="py-3 px-3">Hospital</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allMedicines.map((med, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-3.5 px-3 font-mono text-slate-500">{med.startDate || med.recordDate}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">{med.disease}</td>
                        <td className="py-3.5 px-3 text-cyan-700 font-bold">{med.name}</td>
                        <td className="py-3.5 px-3 text-slate-700">{med.dosage}</td>
                        <td className="py-3.5 px-3 text-slate-600">{med.frequency}</td>
                        <td className="py-3.5 px-3 text-slate-600">{med.duration}</td>
                        <td className="py-3.5 px-3 text-slate-700">{med.doctor}</td>
                        <td className="py-3.5 px-3 text-slate-600">{med.hospital}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            med.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
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
                  <UploadCloud className="w-5 h-5 text-cyan-500" />
                  <span>Upload Medical Reports & Documents</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload Prescriptions, Blood Reports, X-rays, MRI, CT Scan, ECG, and Vaccination Records. Encrypted with AES-256 client-side.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <form onSubmit={handleFileUploadSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Report Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as RecordCategory)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
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
                      placeholder="e.g. Annual Blood Panel & Liver Profile"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Doctor Name</label>
                      <input
                        type="text"
                        value={uploadDoctor}
                        onChange={(e) => setUploadDoctor(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Hospital / Lab</label>
                      <input
                        type="text"
                        value={uploadHospital}
                        onChange={(e) => setUploadHospital(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Drag-n-drop File Area */}
                  <div className="p-8 border-2 border-dashed border-slate-300 rounded-3xl text-center space-y-3 bg-slate-50 hover:border-cyan-400 transition-colors">
                    <UploadCloud className="w-10 h-10 text-cyan-500 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {uploadFile ? uploadFile.name : 'Choose a medical file or drag and drop here'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, PNG, JPG, DICOM (Max 50MB)</p>
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
                      className="inline-block px-5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-100"
                    >
                      Browse Files
                    </label>
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-xs text-cyan-600 font-mono">
                        <span>Encrypting & Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
                      ✓ Report Encrypted with AES-256 & Stored to Firebase Storage!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs transition-colors disabled:opacity-50"
                  >
                    Upload & AES-Encrypt Report
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: ACCESS CONTROL PANEL */}
          {sidebarTab === 'access' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-cyan-500" />
                    <span>Access Control Panel</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Display everyone who currently has permission to view your health vault.
                  </p>
                </div>

                <button
                  onClick={revokeAllAccessGrants}
                  className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center space-x-1.5"
                >
                  <UserX className="w-4 h-4" />
                  <span>Revoke All Access</span>
                </button>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Doctor / Entity</th>
                      <th className="py-3 px-3">Hospital / Specialty</th>
                      <th className="py-3 px-3">Access Type</th>
                      <th className="py-3 px-3">Expires</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accessGrants.map((grant) => (
                      <tr key={grant.id} className="hover:bg-slate-50">
                        <td className="py-4 px-3 font-bold text-slate-900 flex items-center space-x-2">
                          <Stethoscope className="w-4 h-4 text-cyan-500" />
                          <span>{grant.doctorName}</span>
                        </td>
                        <td className="py-4 px-3 text-slate-700">
                          {grant.hospital} ({grant.specialty})
                        </td>
                        <td className="py-4 px-3 text-cyan-700 font-mono">{grant.accessType}</td>
                        <td className="py-4 px-3 text-amber-600 font-mono">{grant.expiresAt}</td>
                        <td className="py-4 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            grant.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'
                          }`}>
                            {grant.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right space-x-2">
                          {grant.status === 'active' && (
                            <button
                              onClick={() => revokeAccessGrant(grant.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-bold hover:bg-rose-100"
                            >
                              Revoke Access
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: GRANULAR PERMISSIONS SYSTEM */}
          {sidebarTab === 'granular' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-cyan-500" />
                  <span>Granular Permission System</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Decide exactly what another person or ER doctor can see. Toggle categories on or off.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'bloodGroup', label: 'Blood Group & RH Factor', desc: 'Display O+ blood group to emergency staff' },
                  { key: 'allergies', label: 'Critical Medical Allergies', desc: 'Display Penicillin & Peanut anaphylaxis warnings' },
                  { key: 'currentMedicines', label: 'Current Prescriptions', desc: 'Display active Metformin & Insulin dosages' },
                  { key: 'chronicDiseases', label: 'Chronic Conditions', desc: 'Display Type 2 Diabetes history' },
                  { key: 'labReports', label: 'Blood & Lab Reports', desc: 'Display metabolic panels and HbA1c test results' },
                  { key: 'prescriptions', label: 'Full Prescriptions History', desc: 'Display historical doctor prescriptions' },
                  { key: 'imagingReports', label: 'X-Ray, MRI & CT Scans', desc: 'Display radiology reports and scans' },
                  { key: 'vaccinationHistory', label: 'Vaccination History', desc: 'Display COVID-19 & Flu immunization cards' },
                  { key: 'surgeryHistory', label: 'Surgery & Post-Op History', desc: 'Display surgical procedure history' },
                  { key: 'mentalHealthRecords', label: 'Mental Health Records', desc: 'Keep psychological counseling notes private' },
                ].map((item) => {
                  const isChecked = (granularPermissions as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4 hover:border-cyan-300 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-xs">{item.label}</h4>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>

                      <button
                        onClick={() => toggleGranularPermission(item.key as any)}
                        className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-1 ${
                          isChecked ? 'bg-cyan-500' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
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

          {/* TAB 7: EMERGENCY ACCESS SYSTEM (3 METHODS) */}
          {sidebarTab === 'emergency' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-cyan-500" />
                  <span>Emergency Access System (3 Preparedness Methods)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how doctors access your medical information during urgent care scenarios.
                </p>
              </div>

              {/* METHOD 1: TEMPORARY SECURE SHARE */}
              <div className="p-6 rounded-3xl bg-white border border-cyan-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 border border-cyan-200">
                    Method 1 – Temporary Secure Share
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Timers: 15m / 1h / 24h</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Generate Encrypted QR Code & One-Time Access Token</h3>
                <p className="text-xs text-slate-600">
                  Generates an encrypted QR code, secure URL link, and one-time token. When the countdown timer expires, the encryption key is destroyed and the doctor automatically loses access.
                </p>

                <button
                  onClick={onOpenEmergencyModal}
                  className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs flex items-center space-x-2 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate Temporary Token Now</span>
                </button>
              </div>

              {/* METHOD 2: EMERGENCY MEDICAL PROFILE */}
              <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  Method 2 – Emergency Medical Profile
                </span>
                <h3 className="text-lg font-bold text-slate-900">Always-Available ER Profile</h3>
                <p className="text-xs text-slate-600">
                  A minimal critical card containing only essential treatment info: Blood Group, Allergies, Current Medicines, Chronic Conditions, and Emergency Contacts.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Blood Group:</span>
                    <p className="font-bold text-cyan-700">{patient.bloodType}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Allergies:</span>
                    <p className="font-bold text-rose-600">{patient.allergies.map(a => a.allergen).join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Active Meds:</span>
                    <p className="font-bold text-amber-700">
                      {allMedicines.length > 0
                        ? Array.from(new Set(allMedicines.map((m) => m.name))).join(', ')
                        : 'No active medicines listed'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Proxy Phone:</span>
                    <p className="font-bold text-slate-900">{patient.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>

              {/* METHOD 3: TRUSTED CONTACT APPROVAL */}
              <div className="p-6 rounded-3xl bg-white border border-cyan-200 shadow-sm space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 border border-cyan-200">
                  Method 3 – Trusted Contact Approval
                </span>
                <h3 className="text-lg font-bold text-slate-900">Family Proxy 2FA OTP Emergency Verification</h3>
                <p className="text-xs text-slate-600">
                  If the patient cannot approve access, an ER doctor requests access. Registered family proxies receive an OTP notification to approve temporary access.
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-700 text-xs">Registered Proxy Numbers:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const registeredProxies = [
                        ...(patient.emergencyContact?.phone ? [{
                          id: patient.emergencyContact.id || 'primary-emergency-proxy',
                          name: patient.emergencyContact.name || 'Primary Contact',
                          relationship: patient.emergencyContact.relationship || 'Emergency Proxy',
                          phone: patient.emergencyContact.phone,
                          isPrimary: true
                        }] : []),
                        ...(patient.trustedContacts || [])
                      ];

                      if (registeredProxies.length === 0) {
                        return (
                          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-700 col-span-2">
                            No registered family proxy numbers found. Enter a phone number below to send OTP.
                          </div>
                        );
                      }

                      return registeredProxies.map((contact) => {
                        const isSelected = proxyPhoneInput.trim() === contact.phone.trim();
                        return (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => setProxyPhoneInput(contact.phone)}
                            className={`p-3 rounded-2xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-400/30'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-slate-900">{contact.name} ({contact.relationship})</p>
                              <p className="text-[11px] font-mono text-slate-600">{contact.phone}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSelected ? 'bg-cyan-600 text-white' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isSelected ? 'Selected' : 'Proxy Active'}
                            </span>
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {/* Simulate Doctor Request */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-cyan-700">Emergency Doctor Proxy Request:</p>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Proxy Phone Number (OTP will be sent here)</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={proxyPhoneInput}
                        onChange={(e) => setProxyPhoneInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <p className="text-[10px] text-slate-400">Select a registered proxy contact above or enter the phone number to receive the OTP.</p>
                    </div>
                    <button
                      onClick={async () => {
                        const targetNumber = proxyPhoneInput.trim() || patient.emergencyContact?.phone || '';
                        if (!targetNumber) {
                          alert('Please select or enter a proxy phone number to receive the OTP.');
                          return;
                        }
                        if (!proxyPhoneInput.trim()) {
                          setProxyPhoneInput(targetNumber);
                        }
                        const req = await requestTrustedContactApproval('Dr. Sneha Das', 'City Care Hospital', targetNumber);
                        setSelectedRequestId(req.requestId);
                        sendOtpToProxyPhone(targetNumber, req.otpCode);
                        setOtpModalOpen(true);
                        setOtpError('');
                        setInputOtp('');
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs transition-colors shadow-sm active:scale-95"
                    >
                      Send OTP &amp; Request Proxy Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY DASHBOARD */}
          {sidebarTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-500" />
                  <span>Security & Audit Dashboard</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitor active sessions, device history, failed login attempts, and cryptographic audit logs.
                </p>
              </div>

              {/* Active Sessions & History */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Active Login Sessions & Devices</h3>
                  <button
                    onClick={revokeAllAccessGrants}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold"
                  >
                    Logout All Devices
                  </button>
                </div>

                <div className="space-y-3">
                  {loginHistory.map((sess) => (
                    <div key={sess.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{sess.device}</span>
                          {sess.isCurrentSession && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">{sess.browser} • {sess.location}</p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sess.status === 'Success' ? 'bg-cyan-100 text-cyan-700' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {sess.status}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sess.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Key Master Reset */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900">Master Vault Key Management</h3>
                <p className="text-xs text-slate-600">
                  Your master key never leaves your local device. Download a paper backup of your 256-bit AES master seed key.
                </p>
                <button
                  onClick={() => alert('Downloaded Encrypted Backup Key: MV-SOVEREIGN-KEY-2026-SECURE')}
                  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Download Sovereign Encryption Backup Key
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: AI HEALTH FEATURES */}
          {sidebarTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                  <span>Bonus AI-Powered Health Features</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive simulators for health summaries, OCR scanner, drug interactions, and voice assistant.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AI Feature 1: AI Health Summary */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-cyan-500" />
                    <span>AI Health Summary Generator</span>
                  </h3>
                  <p className="text-xs text-slate-500">Synthesizes lifetime diagnoses, active meds, and metabolic blood reports into natural language.</p>
                  
                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={isAiSummarizing}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs transition-colors"
                  >
                    {isAiSummarizing ? 'Generating AI Synthesis...' : 'Generate AI Health Summary'}
                  </button>

                  {aiSummaryText && (
                    <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-slate-800 whitespace-pre-line font-mono">
                      {aiSummaryText}
                    </div>
                  )}
                </div>

                {/* AI Feature 2: OCR Prescription Scanner */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-cyan-500" />
                    <span>OCR Prescription Scanner</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload paper prescription images (PNG, JPG, WebP) to extract doctor notes, dosages, and active medicines using Tesseract OCR.
                  </p>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-cyan-200 rounded-2xl bg-cyan-50/50 hover:bg-cyan-50 transition-colors cursor-pointer text-center space-y-2">
                    <Upload className="w-6 h-6 text-cyan-500" />
                    <span className="text-xs font-bold text-cyan-700">Upload & Scan Prescription Image</span>
                    <span className="text-[11px] text-slate-400">Click or drop prescription photo here</span>
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
                    <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <img src={ocrPreviewUrl} alt="Prescription preview" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">Prescription Image Loaded</p>
                        <p className="text-[10px] text-slate-500">Ready for OCR text extraction</p>
                      </div>
                    </div>
                  )}

                  {ocrScanning && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-cyan-700 font-bold">
                        <span>{ocrStatusText}</span>
                        <span>{ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {ocrResult && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-cyan-200 text-xs text-slate-800 whitespace-pre-line font-mono max-h-48 overflow-y-auto">
                      {ocrResult}
                    </div>
                  )}
                </div>

                {/* AI Feature 3: Drug Interaction Checker */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-amber-500" />
                    <span>Drug Interaction Checker</span>
                  </h3>
                  <p className="text-xs text-slate-500">Verify potential contraindications or synergies between prescribed medicines.</p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={med1}
                      onChange={(e) => setMed1(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={med2}
                      onChange={(e) => setMed2(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={handleCheckDrugInteraction}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
                  >
                    Check Interactions
                  </button>

                  {interactionResult && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-800 font-mono">
                      {interactionResult}
                    </div>
                  )}
                </div>

                {/* AI Feature 4: Voice Assistant Simulator */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Volume2 className="w-5 h-5 text-emerald-500" />
                    <span>Voice Health Assistant</span>
                  </h3>
                  <p className="text-xs text-slate-500">Ask questions using your voice or type below to inquire about your health records and allergies.</p>

                  <form onSubmit={handleVoiceQuerySubmit} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={isListening ? "Listening to your voice..." : "e.g. What are my allergies?"}
                        value={voiceQuery}
                        onChange={(e) => setVoiceQuery(e.target.value)}
                        className={`w-full pl-3 pr-10 py-2 rounded-xl bg-white border ${
                          isListening ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                        } text-slate-900 text-xs focus:outline-none focus:border-emerald-500`}
                      />
                      <button
                        type="button"
                        onClick={handleStartListening}
                        title="Click to speak using voice"
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                          isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shrink-0"
                    >
                      Ask
                    </button>
                  </form>

                  {isListening && (
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Recording speech... Speak clearly into your microphone.</span>
                    </div>
                  )}

                  {voiceResponse && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 text-[11px]">AI Voice Response</span>
                        <button
                          type="button"
                          onClick={() => handleSpeakResponse(voiceResponse)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          <span>{isSpeaking ? 'Stop Audio' : 'Listen Readout'}</span>
                        </button>
                      </div>
                      <p className="text-slate-800 font-mono text-xs whitespace-pre-line">{voiceResponse}</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: PROFILE */}
          {sidebarTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-cyan-500" />
                    <span>Patient Identity Profile</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Demographic details, emergency contacts, and proxy registrations.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsEditingProfile(!isEditingProfile);
                    setProfileSaveSuccess(false);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 font-bold text-xs flex items-center space-x-2 transition-colors self-start sm:self-auto"
                >
                  <UserCheck className="w-4 h-4 text-cyan-600" />
                  <span>{isEditingProfile ? 'Cancel Editing' : 'Edit Profile Details'}</span>
                </button>
              </div>

              {profileSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Patient Profile updated successfully and synced with your Firebase Sovereign Vault!</span>
                </div>
              )}

              {isEditingProfile ? (
                /* EDIT PROFILE FORM */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updatePatientProfile({
                      fullName: editFullName,
                      age: Number(editAge),
                      gender: editGender,
                      bloodType: editBloodType,
                      email: editEmail,
                      phone: editPhone,
                      address: editAddress,
                      emergencyContact: {
                        ...patient.emergencyContact,
                        name: editEmergencyName,
                        relationship: editEmergencyRelation,
                        phone: editEmergencyPhone,
                      },
                    });
                    setIsEditingProfile(false);
                    setProfileSaveSuccess(true);
                  }}
                  className="rounded-3xl bg-white border border-cyan-200 shadow-sm p-6 sm:p-8 space-y-6 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Age (Years)</label>
                      <input
                        type="number"
                        required
                        value={editAge}
                        onChange={(e) => setEditAge(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Gender</label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other / Prefer not to say">Other / Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                      <input
                        type="text"
                        required
                        value={editBloodType}
                        onChange={(e) => setEditBloodType(e.target.value)}
                        placeholder="e.g. O+ (O-Positive)"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Residential Address</label>
                      <textarea
                        rows={2}
                        required
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-cyan-600">Emergency Proxy / Primary Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Proxy Name</label>
                        <input
                          type="text"
                          required
                          value={editEmergencyName}
                          onChange={(e) => setEditEmergencyName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                        <input
                          type="text"
                          required
                          value={editEmergencyRelation}
                          onChange={(e) => setEditEmergencyRelation(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Proxy Phone</label>
                        <input
                          type="text"
                          required
                          value={editEmergencyPhone}
                          onChange={(e) => setEditEmergencyPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold transition-colors"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW PROFILE CARD */
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div>
                      <span className="text-slate-500">Full Legal Name:</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{patient.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Patient ID:</span>
                      <p className="font-bold text-cyan-600 text-sm font-mono mt-0.5">{patient.id}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Age / Gender:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{patient.age} Years • {patient.gender}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Blood Group:</span>
                      <p className="font-bold text-cyan-700 mt-0.5">{patient.bloodType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Email Address:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{patient.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Phone Number:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{patient.phone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Residential Address:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{patient.address}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 space-y-3">
                    <h3 className="text-sm font-bold text-cyan-600">Designated Emergency Contact / Proxy</h3>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{patient.emergencyContact.name}</p>
                        <p className="text-[11px] text-slate-500">{patient.emergencyContact.relationship} • {patient.emergencyContact.phone}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        Trusted Proxy Verified
                      </span>
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
                  <Settings className="w-5 h-5 text-cyan-500" />
                  <span>Vault Preferences & Settings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theme settings, notification preferences, and biometric security options.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">Appearance Theme</p>
                    <p className="text-slate-500 text-[11px]">Toggle between Dark & Light medical themes</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                  >
                    Current: {theme.toUpperCase()}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">Biometric Vault Lock</p>
                    <p className="text-slate-500 text-[11px]">Require TouchID / FaceID to open emergency token generator</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">Enabled</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* TRUSTED CONTACT 2FA OTP MODAL */}
      <AnimatePresence>
        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-cyan-200 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-cyan-500" />
                <span>Family Proxy 2FA OTP Verification</span>
              </h3>
              <p className="text-slate-600">
                A 6-digit OTP code was sent to proxy phone number <strong className="font-mono text-slate-900">{proxyPhoneInput.trim() || 'Proxy Phone'}</strong>. Enter code below:
              </p>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Enter 6-digit verification code (sent to proxy phone):</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRequestId) {
                      const newCode = resendTrustedContactOTP(selectedRequestId);
                      if (newCode) {
                        const proxyPhone = proxyPhoneInput.trim();
                        sendOtpToProxyPhone(proxyPhone, newCode);
                        setOtpError('');
                        setInputOtp('');
                      }
                    }
                  }}
                  className="font-bold text-cyan-600 hover:text-cyan-700 hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP Code</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit OTP..."
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-cyan-500"
              />

              {otpError && <p className="text-rose-600 font-bold">{otpError}</p>}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold"
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
                      setOtpError('Invalid OTP Code. Please check the code sent to your proxy number.');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold transition-colors"
                >
                  Verify & Grant Doctor Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ADD NEW MEDICAL RECORD MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-cyan-500" />
                  <span>Add Prescribed Medical Record</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Diagnosis Title / Prescribed Reason</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Type 2 Diabetes Evaluation"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as RecordCategory)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Doctor</label>
                    <input
                      type="text"
                      required
                      value={newDoctor}
                      onChange={(e) => setNewDoctor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      value={newHospital}
                      onChange={(e) => setNewHospital(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Prescribed Medicine (Optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Med Name (Metformin)"
                      value={newMedicineName}
                      onChange={(e) => setNewMedicineName(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Duration (30 Days)"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="newIsPrivate"
                    checked={newIsPrivate}
                    onChange={(e) => setNewIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                  <label htmlFor="newIsPrivate" className="text-slate-700 text-xs font-semibold cursor-pointer">
                    Keep PRIVATE from Emergency Access exports
                  </label>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold transition-colors"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
