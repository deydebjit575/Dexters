import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
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
    verifyTrustedContactOTP,
    theme,
    toggleTheme,
    setActiveView,
    currentLang,
  } = useMediVault();

  // Sidebar Tabs State
  const [sidebarTab, setSidebarTab] = useState<string>(activeSubTab || 'dashboard');

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
  const [uploadDoctor, setUploadDoctor] = useState('Dr. Amit Roy');
  const [uploadHospital, setUploadHospital] = useState('Apollo Hospital');
  const [uploadDiagnosis, setUploadDiagnosis] = useState('');

  // Add Record Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RecordCategory>('Prescription');
  const [newDate, setNewDate] = useState('2026-07-24');
  const [newDoctor, setNewDoctor] = useState('Dr. Amit Roy');
  const [newSpecialty, setNewSpecialty] = useState('Endocrinology');
  const [newHospital, setNewHospital] = useState('Apollo Hospital');
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

  // AI Feature Simulator States
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);

  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  const [med1, setMed1] = useState('Metformin');
  const [med2, setMed2] = useState('Insulin');
  const [interactionResult, setInteractionResult] = useState<string | null>(null);

  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);

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
      hospitalClinic: newHospital || 'Apollo Hospital',
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
      setAiSummaryText(
        `AI Health Synthesis for Priya Sharma (32 Yrs, O+):\n• Active Conditions: Type 2 Diabetes Mellitus (Managed) & Vitamin D Deficiency.\n• Active Medication: Metformin 500mg (BD), Insulin Glargine 12U (HS), Vitamin D3 60,000 IU.\n• Allergies Alert: Life-threatening Penicillin allergy, Moderate Peanut allergy.\n• Metabolic Status: Fasting Glucose 118 mg/dL, HbA1c 6.8% (Target Range). Blood pressure & kidney markers normal.`
      );
    }, 1000);
  };

  const handleSimulateOcr = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setOcrResult(
        `OCR Extraction Success:\n• Doctor: Dr. Sneha Das (City Care Hospital)\n• Diagnosis: Acute Viral Pyrexia\n• Prescribed: Crocin 650mg (Q6H x 5 Days)\n• Status: Ready to auto-populate record!`
      );
    }, 1200);
  };

  const handleCheckDrugInteraction = () => {
    if (
      (med1.toLowerCase().includes('metformin') && med2.toLowerCase().includes('insulin')) ||
      (med1.toLowerCase().includes('insulin') && med2.toLowerCase().includes('metformin'))
    ) {
      setInteractionResult(
        `⚠️ Synergistic Combination: Metformin + Insulin Glargine. Monitor for potential hypoglycemia. Co-prescribed under Dr. Amit Roy supervision.`
      );
    } else if (med1.toLowerCase().includes('crocin') || med2.toLowerCase().includes('crocin')) {
      setInteractionResult(
        `✅ Safe Combination: Crocin (Paracetamol) has no adverse interaction with daily Metformin/Insulin.`
      );
    } else {
      setInteractionResult(
        `ℹ️ No severe drug-drug interaction flagged for ${med1} and ${med2}.`
      );
    }
  };

  const handleVoiceQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery) return;
    const q = voiceQuery.toLowerCase();
    if (q.includes('allergy') || q.includes('allergies')) {
      setVoiceResponse(`Voice AI: Priya Sharma has 2 recorded allergies: Penicillin (Life-Threatening) and Peanuts (Moderate).`);
    } else if (q.includes('medicine') || q.includes('insulin') || q.includes('metformin')) {
      setVoiceResponse(`Voice AI: Active medications are Metformin 500mg twice daily and Insulin Glargine 12 Units at bedtime.`);
    } else if (q.includes('token') || q.includes('emergency')) {
      setVoiceResponse(`Voice AI: Opening Emergency Access Token Generator with AES-256 key encryption...`);
      onOpenEmergencyModal();
    } else {
      setVoiceResponse(`Voice AI: Health Vault is fully synchronized. ${records.length} total records secured.`);
    }
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
          <div className="rounded-3xl glass-panel p-4 border border-slate-800 space-y-1">
            
            {/* Patient Compact Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/20 mb-3 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300">
                PS
              </div>
              <div className="truncate">
                <p className="font-bold text-white text-xs truncate">{patient.fullName}</p>
                <p className="text-[10px] text-teal-400 font-mono">ID: {patient.id}</p>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = sidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSidebarTab(item.id)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-3 ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-glow-teal'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick Logout Button */}
            <button
              onClick={() => setActiveView('landing')}
              className="w-full px-4 py-3 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center space-x-3 transition-colors pt-3 border-t border-slate-800/60 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Vault</span>
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {sidebarTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Sovereign Patient Header Banner */}
              <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-teal-500/20 relative overflow-hidden">
                <div className="ambient-glow-teal -top-20 -left-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        Zero-Knowledge Health Vault
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Age: {patient.age} Yrs</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                      Welcome, {patient.fullName}
                    </h1>
                    <p className="text-xs text-slate-300">
                      Your lifetime health records are encrypted locally with AES-256-GCM. You hold the sovereign keys.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => generateMedicalReportPDF(patient, records)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-teal-300 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4 text-teal-400" />
                      <span>Download PDF Vault</span>
                    </button>
                    <button
                      onClick={onOpenEmergencyModal}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-xs font-extrabold shadow-glow-teal flex items-center space-x-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Issue Token</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl glass-card text-center border border-slate-800">
                  <p className="text-xs text-slate-400">Total Medical Records</p>
                  <p className="text-2xl font-extrabold text-white mt-1">{records.length}</p>
                </div>
                <div className="p-5 rounded-3xl glass-card text-center border border-slate-800">
                  <p className="text-xs text-slate-400">Active Doctors</p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {accessGrants.filter((g) => g.status === 'active').length}
                  </p>
                </div>
                <div className="p-5 rounded-3xl glass-card text-center border border-slate-800">
                  <p className="text-xs text-slate-400">Blood Group</p>
                  <p className="text-2xl font-extrabold text-teal-300 mt-1">{patient.bloodType.split(' ')[0]}</p>
                </div>
                <div className="p-5 rounded-3xl glass-card text-center border border-slate-800">
                  <p className="text-xs text-slate-400">Critical Allergies</p>
                  <p className="text-2xl font-extrabold text-rose-400 mt-1">{patient.allergies.length}</p>
                </div>
              </div>

              {/* Critical Allergies & Chronic Alert Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-rose-950/10 border border-rose-500/30 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical Allergies</span>
                  </h3>
                  <div className="space-y-2">
                    {patient.allergies.map((alg) => (
                      <div key={alg.id} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                        <p className="font-bold text-rose-200">{alg.allergen} ({alg.severity})</p>
                        <p className="text-[11px] text-rose-300 mt-0.5">{alg.reaction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-amber-950/10 border border-amber-500/30 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Chronic Conditions & Prescriptions</span>
                  </h3>
                  <div className="space-y-2">
                    {patient.chronicConditions.map((cnd) => (
                      <div key={cnd.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <p className="font-bold text-amber-200">{cnd.name}</p>
                        <p className="text-[11px] text-amber-300 mt-0.5">Diagnosed {cnd.diagnosedYear} • Status: {cnd.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Records Preview */}
              <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Recent Prescriptions & Diagnoses</h3>
                  <button
                    onClick={() => setSidebarTab('records')}
                    className="text-xs text-teal-400 font-bold hover:underline"
                  >
                    View All ({records.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {records.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 mr-2">
                          {rec.category}
                        </span>
                        <span className="font-bold text-white">{rec.title}</span>
                        <p className="text-[11px] text-slate-400 mt-1">{rec.diagnosingDoctor} — {rec.hospitalClinic}</p>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{rec.date}</span>
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
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <span>Lifetime Medical Records Timeline</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Centralized diagnoses, prescriptions, blood tests, and scans.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Download PDF Button */}
                  <button
                    onClick={() => generateMedicalReportPDF(patient, filteredRecords)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-teal-400" />
                    <span>Download PDF</span>
                  </button>

                  {/* Add Record Button */}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-glow-teal flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Record</span>
                  </button>

                  {/* Format View Toggle */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setViewFormat('timeline')}
                      className={`px-3 py-1 rounded-lg font-bold ${viewFormat === 'timeline' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Timeline
                    </button>
                    <button
                      onClick={() => setViewFormat('table')}
                      className={`px-3 py-1 rounded-lg font-bold ${viewFormat === 'table' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {['All', 'Prescription', 'Blood Report', 'X-ray', 'Vaccination Record', 'Mental Health'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        selectedCategory === cat
                          ? 'bg-slate-800 text-teal-300 border border-teal-500/40'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}

                  <button
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
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
                      className={`p-6 rounded-3xl glass-card border transition-all relative ${
                        record.isPrivateFromEmergency
                          ? 'border-rose-500/30 bg-rose-950/10'
                          : 'border-slate-800 hover:border-teal-500/30'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              {record.category}
                            </span>
                            <span className="text-xs font-mono text-slate-400">{record.date}</span>
                            <span className="text-xs text-slate-500 font-mono">ID: {record.id}</span>
                          </div>

                          <h3 className="text-lg font-bold text-white">{record.title}</h3>
                          <p className="text-xs text-slate-300">{record.diagnosisDetails}</p>

                          <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-400 pt-1">
                            <span className="text-teal-300 font-medium">Doctor: {record.diagnosingDoctor} ({record.doctorSpecialty})</span>
                            <span>•</span>
                            <span>Hospital: {record.hospitalClinic}</span>
                          </div>

                          {/* Prescribed Medicines */}
                          {record.medicines && record.medicines.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                              <p className="text-[11px] font-bold uppercase text-teal-400 tracking-wider">Prescribed Medication</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {record.medicines.map((med) => (
                                  <div key={med.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                                    <div className="flex justify-between font-bold text-slate-200">
                                      <span>{med.name}</span>
                                      <span className="text-teal-400">{med.dosage}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">{med.frequency} • {med.duration}</p>
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
                            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 border ${
                              record.isPrivateFromEmergency
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            }`}
                          >
                            {record.isPrivateFromEmergency ? (
                              <>
                                <EyeOff className="w-4 h-4 text-rose-400" />
                                <span>Hidden (Private)</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 text-teal-400" />
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
                /* TABLE VIEW (Columns: Date, Disease, Medicine, Dosage, Duration, Doctor, Hospital) */
                <div className="rounded-3xl glass-panel p-6 border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Disease / Title</th>
                        <th className="py-3 px-3">Medicine</th>
                        <th className="py-3 px-3">Dosage</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3">Doctor</th>
                        <th className="py-3 px-3">Hospital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredRecords.map((rec) => {
                        const firstMed = rec.medicines && rec.medicines.length > 0 ? rec.medicines[0] : null;
                        return (
                          <tr key={rec.id} className="hover:bg-slate-900/50">
                            <td className="py-3 px-3 font-mono text-slate-400">{rec.date}</td>
                            <td className="py-3 px-3 font-bold text-white">{rec.title}</td>
                            <td className="py-3 px-3 text-teal-300 font-medium">{firstMed ? firstMed.name : 'N/A'}</td>
                            <td className="py-3 px-3 text-slate-300">{firstMed ? firstMed.dosage : 'N/A'}</td>
                            <td className="py-3 px-3 text-slate-400">{firstMed ? firstMed.duration : 'N/A'}</td>
                            <td className="py-3 px-3 text-slate-300">{rec.diagnosingDoctor}</td>
                            <td className="py-3 px-3 text-slate-400">{rec.hospitalClinic}</td>
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
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-teal-400" />
                  <span>Prescription & Medication Timeline</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological history of all active and completed medications prescribed by doctors.
                </p>
              </div>

              <div className="rounded-3xl glass-panel p-6 border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
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
                  <tbody className="divide-y divide-slate-800/60">
                    {allMedicines.map((med, index) => (
                      <tr key={index} className="hover:bg-slate-900/50">
                        <td className="py-3.5 px-3 font-mono text-slate-400">{med.startDate || med.recordDate}</td>
                        <td className="py-3.5 px-3 font-bold text-white">{med.disease}</td>
                        <td className="py-3.5 px-3 text-teal-300 font-bold">{med.name}</td>
                        <td className="py-3.5 px-3 text-slate-300">{med.dosage}</td>
                        <td className="py-3.5 px-3 text-slate-400">{med.frequency}</td>
                        <td className="py-3.5 px-3 text-slate-400">{med.duration}</td>
                        <td className="py-3.5 px-3 text-slate-300">{med.doctor}</td>
                        <td className="py-3.5 px-3 text-slate-400">{med.hospital}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            med.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
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
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <UploadCloud className="w-5 h-5 text-teal-400" />
                  <span>Upload Medical Reports & Documents</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload Prescriptions, Blood Reports, X-rays, MRI, CT Scan, ECG, and Vaccination Records. Encrypted with AES-256 client-side.
                </p>
              </div>

              <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
                <form onSubmit={handleFileUploadSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Select Report Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as RecordCategory)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white bg-slate-900 focus:outline-none focus:border-teal-500"
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
                    <label className="block text-slate-300 font-bold mb-1">Report Title / Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Blood Panel & Liver Profile"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Doctor Name</label>
                      <input
                        type="text"
                        value={uploadDoctor}
                        onChange={(e) => setUploadDoctor(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Hospital / Lab</label>
                      <input
                        type="text"
                        value={uploadHospital}
                        onChange={(e) => setUploadHospital(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Drag-n-drop File Area */}
                  <div className="p-8 border-2 border-dashed border-slate-700 rounded-3xl text-center space-y-3 bg-slate-950/60 hover:border-teal-500/50 transition-colors">
                    <UploadCloud className="w-10 h-10 text-teal-400 mx-auto" />
                    <div>
                      <p className="font-bold text-white text-xs">
                        {uploadFile ? uploadFile.name : 'Choose a medical file or drag and drop here'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG, DICOM (Max 50MB)</p>
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
                      className="inline-block px-5 py-2 rounded-xl bg-slate-800 text-teal-300 font-bold text-xs cursor-pointer hover:bg-slate-700"
                    >
                      Browse Files
                    </label>
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-xs text-teal-300 font-mono">
                        <span>Encrypting & Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-500 h-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
                      ✓ Report Encrypted with AES-256 & Stored to Firebase Storage!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="w-full py-3.5 rounded-2xl bg-teal-500 text-slate-950 font-extrabold text-xs shadow-glow-teal hover:bg-teal-400 transition-colors disabled:opacity-50"
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
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-teal-400" />
                    <span>Access Control Panel</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Display everyone who currently has permission to view your health vault.
                  </p>
                </div>

                <button
                  onClick={revokeAllAccessGrants}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition-colors flex items-center space-x-1.5"
                >
                  <UserX className="w-4 h-4" />
                  <span>Revoke All Access</span>
                </button>
              </div>

              <div className="rounded-3xl glass-panel p-6 border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Doctor / Entity</th>
                      <th className="py-3 px-3">Hospital / Specialty</th>
                      <th className="py-3 px-3">Access Type</th>
                      <th className="py-3 px-3">Expires</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {accessGrants.map((grant) => (
                      <tr key={grant.id} className="hover:bg-slate-900/50">
                        <td className="py-4 px-3 font-bold text-white flex items-center space-x-2">
                          <Stethoscope className="w-4 h-4 text-teal-400" />
                          <span>{grant.doctorName}</span>
                        </td>
                        <td className="py-4 px-3 text-slate-300">
                          {grant.hospital} ({grant.specialty})
                        </td>
                        <td className="py-4 px-3 text-teal-300 font-mono">{grant.accessType}</td>
                        <td className="py-4 px-3 text-amber-300 font-mono">{grant.expiresAt}</td>
                        <td className="py-4 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            grant.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {grant.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right space-x-2">
                          {grant.status === 'active' && (
                            <button
                              onClick={() => revokeAccessGrant(grant.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold hover:bg-rose-500/30"
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
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-teal-400" />
                  <span>Granular Permission System</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
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
                      className="p-5 rounded-3xl glass-card border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white text-xs">{item.label}</h4>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>

                      <button
                        onClick={() => toggleGranularPermission(item.key as any)}
                        className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-1 ${
                          isChecked ? 'bg-teal-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transition-transform ${
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
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-teal-400" />
                  <span>Emergency Access System (3 Preparedness Methods)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose how doctors access your medical information during urgent care scenarios.
                </p>
              </div>

              {/* METHOD 1: TEMPORARY SECURE SHARE */}
              <div className="p-6 rounded-3xl glass-panel border border-teal-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Method 1 – Temporary Secure Share
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Timers: 15m / 1h / 24h</span>
                </div>
                <h3 className="text-lg font-bold text-white">Generate Encrypted QR Code & One-Time Access Token</h3>
                <p className="text-xs text-slate-300">
                  Generates an encrypted QR code, secure URL link, and one-time token. When the countdown timer expires, the encryption key is destroyed and the doctor automatically loses access.
                </p>

                <button
                  onClick={onOpenEmergencyModal}
                  className="px-6 py-3 rounded-2xl bg-teal-500 text-slate-950 font-extrabold text-xs shadow-glow-teal flex items-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate Temporary Token Now</span>
                </button>
              </div>

              {/* METHOD 2: EMERGENCY MEDICAL PROFILE */}
              <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Method 2 – Emergency Medical Profile
                </span>
                <h3 className="text-lg font-bold text-white">Always-Available ER Profile</h3>
                <p className="text-xs text-slate-300">
                  A minimal critical card containing only essential treatment info: Blood Group, Allergies, Current Medicines, Chronic Conditions, and Emergency Contacts.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Blood Group:</span>
                    <p className="font-bold text-teal-300">{patient.bloodType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Allergies:</span>
                    <p className="font-bold text-rose-400">{patient.allergies.map(a => a.allergen).join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Active Meds:</span>
                    <p className="font-bold text-amber-300">Metformin, Insulin</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Proxy Phone:</span>
                    <p className="font-bold text-white">{patient.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>

              {/* METHOD 3: TRUSTED CONTACT APPROVAL */}
              <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Method 3 – Trusted Contact Approval
                </span>
                <h3 className="text-lg font-bold text-white">Family Proxy 2FA OTP Emergency Verification</h3>
                <p className="text-xs text-slate-300">
                  If the patient cannot approve access, an ER doctor requests access. Registered family proxies (e.g. Rajesh Sharma) receive an OTP notification to approve temporary access.
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-200 text-xs">Registered Trusted Contacts:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patient.trustedContacts.map((contact) => (
                      <div key={contact.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{contact.name} ({contact.relationship})</p>
                          <p className="text-[11px] text-slate-400">{contact.phone}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Proxy Active
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Simulate Doctor Request */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-cyan-300">Simulate Emergency Doctor Proxy Request:</p>
                    <button
                      onClick={async () => {
                        const req = await requestTrustedContactApproval('Dr. Sneha Das', 'City Care Hospital', patient.emergencyContact.phone);
                        setSelectedRequestId(req.requestId);
                        setOtpModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Trigger Doctor Proxy Access Request
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
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <span>Security & Audit Dashboard</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitor active sessions, device history, failed login attempts, and cryptographic audit logs.
                </p>
              </div>

              {/* Active Sessions & History */}
              <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Active Login Sessions & Devices</h3>
                  <button
                    onClick={revokeAllAccessGrants}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold"
                  >
                    Logout All Devices
                  </button>
                </div>

                <div className="space-y-3">
                  {loginHistory.map((sess) => (
                    <div key={sess.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{sess.device}</span>
                          {sess.isCurrentSession && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{sess.browser} • {sess.location}</p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sess.status === 'Success' ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {sess.status}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{sess.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Key Master Reset */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white">Master Vault Key Management</h3>
                <p className="text-xs text-slate-400">
                  Your master key never leaves your local device. Download a paper backup of your 256-bit AES master seed key.
                </p>
                <button
                  onClick={() => alert('Downloaded Encrypted Backup Key: MV-SOVEREIGN-KEY-2026-PRIYA')}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-teal-300 text-xs font-bold"
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
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                  <span>Bonus AI-Powered Health Features</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive simulators for health summaries, OCR scanner, drug interactions, and voice assistant.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AI Feature 1: AI Health Summary */}
                <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-teal-400" />
                    <span>AI Health Summary Generator</span>
                  </h3>
                  <p className="text-xs text-slate-400">Synthesizes lifetime diagnoses, active meds, and metabolic blood reports into natural language.</p>
                  
                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={isAiSummarizing}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
                  >
                    {isAiSummarizing ? 'Generating AI Synthesis...' : 'Generate AI Health Summary'}
                  </button>

                  {aiSummaryText && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 text-xs text-teal-200 whitespace-pre-line font-mono">
                      {aiSummaryText}
                    </div>
                  )}
                </div>

                {/* AI Feature 2: OCR Prescription Scanner */}
                <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-cyan-400" />
                    <span>OCR Prescription Scanner</span>
                  </h3>
                  <p className="text-xs text-slate-400">Scan physical paper prescriptions and auto-extract doctor, medication, dosage, and frequency.</p>

                  <button
                    onClick={handleSimulateOcr}
                    disabled={ocrScanning}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    {ocrScanning ? 'Scanning Document OCR...' : 'Scan Sample Prescription'}
                  </button>

                  {ocrResult && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 text-xs text-cyan-200 whitespace-pre-line font-mono">
                      {ocrResult}
                    </div>
                  )}
                </div>

                {/* AI Feature 3: Drug Interaction Checker */}
                <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-amber-400" />
                    <span>Drug Interaction Checker</span>
                  </h3>
                  <p className="text-xs text-slate-400">Verify potential contraindications or synergies between prescribed medicines.</p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={med1}
                      onChange={(e) => setMed1(e.target.value)}
                      className="px-3 py-2 rounded-xl glass-input text-white text-xs"
                    />
                    <input
                      type="text"
                      value={med2}
                      onChange={(e) => setMed2(e.target.value)}
                      className="px-3 py-2 rounded-xl glass-input text-white text-xs"
                    />
                  </div>

                  <button
                    onClick={handleCheckDrugInteraction}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Check Interactions
                  </button>

                  {interactionResult && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200 font-mono">
                      {interactionResult}
                    </div>
                  )}
                </div>

                {/* AI Feature 4: Voice Assistant Simulator */}
                <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                    <span>Voice Health Assistant</span>
                  </h3>
                  <p className="text-xs text-slate-400">Ask MediVault AI natural language questions about your records or emergency access.</p>

                  <form onSubmit={handleVoiceQuerySubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. What are my allergies?"
                      value={voiceQuery}
                      onChange={(e) => setVoiceQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Ask
                    </button>
                  </form>

                  {voiceResponse && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs text-emerald-200 font-mono">
                      {voiceResponse}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: PROFILE */}
          {sidebarTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-teal-400" />
                  <span>Patient Identity Profile</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Demographic details, emergency contacts, and proxy registrations.
                </p>
              </div>

              <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-slate-400">Full Legal Name:</span>
                    <p className="font-bold text-white text-sm">{patient.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Patient ID:</span>
                    <p className="font-bold text-teal-400 text-sm font-mono">{patient.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Age / Gender:</span>
                    <p className="font-bold text-white">{patient.age} Years • {patient.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Blood Group:</span>
                    <p className="font-bold text-teal-300">{patient.bloodType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email Address:</span>
                    <p className="font-bold text-white">{patient.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone Number:</span>
                    <p className="font-bold text-white">{patient.phone}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Residential Address:</span>
                    <p className="font-bold text-white">{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {sidebarTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-teal-400" />
                  <span>Vault Preferences & Settings</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Theme settings, notification preferences, and biometric security options.
                </p>
              </div>

              <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <p className="font-bold text-white">Appearance Theme</p>
                    <p className="text-slate-400 text-[11px]">Toggle between Dark & Light medical themes</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-teal-300 font-bold"
                  >
                    Current: {theme.toUpperCase()}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <p className="font-bold text-white">Biometric Vault Lock</p>
                    <p className="text-slate-400 text-[11px]">Require TouchID / FaceID to open emergency token generator</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Enabled</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* TRUSTED CONTACT 2FA OTP MODAL */}
      <AnimatePresence>
        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs"
            >
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-cyan-400" />
                <span>Family Proxy 2FA OTP Verification</span>
              </h3>
              <p className="text-slate-300">
                A 6-digit OTP code was sent to registered proxy <strong className="text-white">Rajesh Sharma ({patient.emergencyContact.phone})</strong>. Enter code below:
              </p>
              
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono font-bold text-center">
                Simulated OTP Code: 948201
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit OTP..."
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />

              {otpError && <p className="text-rose-400 font-bold">{otpError}</p>}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const success = verifyTrustedContactOTP(selectedRequestId, inputOtp);
                    if (success) {
                      setOtpModalOpen(false);
                      setInputOtp('');
                      alert('Trusted Proxy Access Approved! Emergency token granted.');
                    } else {
                      setOtpError('Invalid OTP Code. Please try 948201.');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-glass relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-teal-400" />
                  <span>Add Prescribed Medical Record</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Diagnosis Title / Prescribed Reason</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Type 2 Diabetes Evaluation"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as RecordCategory)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white bg-slate-900 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Prescription">Prescription</option>
                      <option value="Blood Report">Blood Report</option>
                      <option value="X-ray">X-ray</option>
                      <option value="Diagnosis">Diagnosis</option>
                      <option value="Vaccination Record">Vaccination Record</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Doctor</label>
                    <input
                      type="text"
                      required
                      value={newDoctor}
                      onChange={(e) => setNewDoctor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      value={newHospital}
                      onChange={(e) => setNewHospital(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Prescribed Medicine (Optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Med Name (Metformin)"
                      value={newMedicineName}
                      onChange={(e) => setNewMedicineName(e.target.value)}
                      className="px-3 py-2 rounded-xl glass-input text-white"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      className="px-3 py-2 rounded-xl glass-input text-white"
                    />
                    <input
                      type="text"
                      placeholder="Duration (30 Days)"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="px-3 py-2 rounded-xl glass-input text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <input
                    type="checkbox"
                    id="newIsPrivate"
                    checked={newIsPrivate}
                    onChange={(e) => setNewIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 rounded"
                  />
                  <label htmlFor="newIsPrivate" className="text-slate-300 text-xs font-semibold cursor-pointer">
                    Keep PRIVATE from Emergency Access exports
                  </label>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold shadow-glow-teal"
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
