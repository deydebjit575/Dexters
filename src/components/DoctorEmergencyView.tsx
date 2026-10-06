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
  FileText,
  Hospital,
  CheckCircle2,
  Search,
  Plus,
  UserCheck,
  Send,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';
import { generateMedicalReportPDF } from '../services/pdfService';
import { PrescribedMedicine, RecordCategory } from '../types/medical';

export const DoctorEmergencyView: React.FC = () => {
  const {
    doctorTokenState,
    loadDoctorEmergencyToken,
    simulateSelfDestructKey,
    activeEmergencyToken,
    patient,
    records,
    addMedicalRecord,
  } = useMediVault();

  const [inputToken, setInputToken] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [recordSearch, setRecordSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // New Doctor Consultation / Prescription Note Form State
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [consultTitle, setConsultTitle] = useState('');
  const [consultCategory, setConsultCategory] = useState<RecordCategory>('Diagnosis');
  const [consultDoctor, setConsultDoctor] = useState('Dr. Sneha Das, MD');
  const [consultSpecialty, setConsultSpecialty] = useState('Emergency Medicine');
  const [consultHospital, setConsultHospital] = useState('Apollo Emergency Care Center');
  const [consultDiagnosis, setConsultDiagnosis] = useState('');
  const [prescribedMedName, setPrescribedMedName] = useState('');
  const [prescribedDosage, setPrescribedDosage] = useState('');
  const [prescribedFreq, setPrescribedFreq] = useState('Twice Daily');
  const [prescribedDuration, setPrescribedDuration] = useState('5 Days');
  const [consultSuccess, setConsultSuccess] = useState(false);

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
      loadDoctorEmergencyToken(inputToken, inputKey);
    }
  };

  const handleAddConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultTitle || !consultDiagnosis) return;

    const medicines: PrescribedMedicine[] = [];
    if (prescribedMedName) {
      medicines.push({
        id: `med-${Date.now()}`,
        name: prescribedMedName,
        dosage: prescribedDosage || '500mg',
        frequency: prescribedFreq,
        duration: prescribedDuration,
        instructions: 'Take after meals as instructed.',
        doctor: consultDoctor,
        hospital: consultHospital,
        startDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }

    addMedicalRecord({
      title: consultTitle,
      category: consultCategory,
      date: new Date().toISOString().split('T')[0],
      diagnosingDoctor: consultDoctor,
      doctorSpecialty: consultSpecialty,
      hospitalClinic: consultHospital,
      diagnosisDetails: consultDiagnosis,
      medicines,
      tags: [consultCategory, 'Doctor Consultation'],
      isPrivateFromEmergency: false,
    });

    setConsultTitle('');
    setConsultDiagnosis('');
    setPrescribedMedName('');
    setPrescribedDosage('');
    setShowConsultForm(false);
    setConsultSuccess(true);
    setTimeout(() => setConsultSuccess(false), 4000);
  };

  const {
    tokenString,
    isExpiredOrRevoked,
    remainingSeconds,
    decryptedPatient,
    decryptedRecords,
    errorMessage,
  } = doctorTokenState;

  // Filter decrypted or active records
  const displayPatient = decryptedPatient || (patient?.fullName ? patient : null);
  const displayRecords = (decryptedRecords || records).filter((rec) => {
    const matchesCat = selectedCategory === 'All' || rec.category === selectedCategory;
    const matchesQuery =
      recordSearch === '' ||
      rec.title.toLowerCase().includes(recordSearch.toLowerCase()) ||
      rec.diagnosingDoctor.toLowerCase().includes(recordSearch.toLowerCase()) ||
      rec.diagnosisDetails.toLowerCase().includes(recordSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Doctor Portal Header */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-teal-50 text-teal-700">
                <Stethoscope className="w-5 h-5" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                Clinical Provider Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              Doctor Clinical Portal
            </h1>
            <p className="text-xs text-slate-500">
              Review emergency patient records, verify clinical parameters, and document consultation notes.
            </p>
          </div>

          {/* Access Timer (if active) */}
          {tokenString && !isExpiredOrRevoked && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1 min-w-[200px]">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Session Time Remaining</span>
              </p>
              <p className="text-2xl font-mono font-extrabold text-amber-900">
                {formatCountdown(remainingSeconds)}
              </p>
              <button
                onClick={simulateSelfDestructKey}
                className="text-[10px] text-rose-600 hover:underline font-semibold block mx-auto"
              >
                [Simulate Key Self-Destruct]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Token Decryption Input (when not decrypted or when manual entry needed) */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-teal-600" />
            <span>Emergency Record Decryption</span>
          </h2>
          <p className="text-xs text-slate-500">
            Enter the patient's temporary emergency token or decrypt directly if a token is active.
          </p>
        </div>

        <form onSubmit={handleManualDecrypt} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Token</label>
            <input
              type="text"
              placeholder="e.g. MV-9482-EMERGENCY"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">AES Key (Optional)</label>
            <input
              type="password"
              placeholder="Auto-parsed if using QR link"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Decrypt Records
            </button>
          </div>
        </form>

        {/* Quick 1-click load for active token */}
        {activeEmergencyToken && (
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-teal-800 font-semibold">
              Active Patient Token Found: <strong className="font-mono text-slate-900">{activeEmergencyToken.token}</strong>
            </span>
            <button
              onClick={() => loadDoctorEmergencyToken(activeEmergencyToken.token, activeEmergencyToken.secretKey)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Load Active Token
            </button>
          </div>
        )}
      </div>

      {/* Expired / Revoked Notice */}
      {isExpiredOrRevoked && errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-2 text-center"
        >
          <div className="inline-flex p-2.5 rounded-2xl bg-rose-100 text-rose-600 mb-0.5">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-rose-800">Session Key Self-Destructed</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{errorMessage}</p>
        </motion.div>
      )}

      {/* Patient Clinical Overview */}
      {displayPatient && (
        <div className="space-y-6">
          
          {/* Patient Overview Cards (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Identification & Vitals */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2 text-teal-700 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>PATIENT IDENTIFICATION</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{displayPatient.fullName || 'Patient Verified'}</h3>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p>Age: <strong className="text-slate-900">{displayPatient.age || 26} Yrs ({displayPatient.gender || 'Not specified'})</strong></p>
                <p>Blood Group: <strong className="text-teal-800">{displayPatient.bloodType || 'O+'}</strong></p>
                <p className="text-[11px] text-slate-500 font-mono">Patient ID: {displayPatient.id || 'MV-••••82'}</p>
              </div>
            </div>

            {/* Critical Allergies */}
            <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>ALLERGIES ({displayPatient.allergies?.length || 0})</span>
              </div>
              <div className="space-y-1.5">
                {displayPatient.allergies && displayPatient.allergies.length > 0 ? (
                  displayPatient.allergies.map((alg) => (
                    <div key={alg.id} className="p-2 rounded-xl bg-white border border-rose-200 text-xs">
                      <p className="font-bold text-rose-700">{alg.allergen} ({alg.severity})</p>
                      <p className="text-[11px] text-rose-600">{alg.reaction}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No critical allergies documented.</p>
                )}
              </div>
            </div>

            {/* Chronic Conditions & Emergency Proxy */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-700 font-bold">
                <HeartPulse className="w-4 h-4" />
                <span>CHRONIC CONDITIONS & PROXY</span>
              </div>
              <div className="space-y-1">
                {displayPatient.chronicConditions && displayPatient.chronicConditions.length > 0 ? (
                  displayPatient.chronicConditions.map((cnd) => (
                    <p key={cnd.id} className="font-bold text-slate-800">• {cnd.name} ({cnd.status})</p>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No chronic conditions listed.</p>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-500 font-semibold text-[11px]">Emergency Proxy Contact:</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {displayPatient.emergencyContact?.name || 'Primary Contact'} ({displayPatient.emergencyContact?.relationship || 'Family'}) — {displayPatient.emergencyContact?.phone || '+91 98765 43210'}
                </p>
              </div>
            </div>

          </div>

          {/* Consultation Note & Prescription Addition Bar */}
          <div className="p-5 rounded-3xl bg-teal-50/60 border border-teal-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Doctor Clinical Consultation & Prescriptions</h3>
                <p className="text-xs text-slate-500">Attending doctor can document clinical findings and prescribe medication.</p>
              </div>
              <button
                onClick={() => setShowConsultForm(!showConsultForm)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{showConsultForm ? 'Cancel Note' : 'Add Consultation Note'}</span>
              </button>
            </div>

            {consultSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                ✓ Consultation note & prescribed medicines successfully saved to patient records!
              </div>
            )}

            {showConsultForm && (
              <form onSubmit={handleAddConsultation} className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Consultation Title / Diagnosis</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute Bronchitis Evaluation"
                      value={consultTitle}
                      onChange={(e) => setConsultTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={consultCategory}
                      onChange={(e) => setConsultCategory(e.target.value as RecordCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Diagnosis">Diagnosis</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Blood Report">Blood Report</option>
                      <option value="X-ray">X-ray</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Doctor Name & Specialty</label>
                    <input
                      type="text"
                      required
                      value={consultDoctor}
                      onChange={(e) => setConsultDoctor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Clinical Diagnosis & Findings</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Patient presented with mild fever and persistent cough. Advised hydration and rest..."
                    value={consultDiagnosis}
                    onChange={(e) => setConsultDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Prescribed Med</label>
                    <input
                      type="text"
                      placeholder="e.g. Amoxicillin"
                      value={prescribedMedName}
                      onChange={(e) => setPrescribedMedName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="500mg"
                      value={prescribedDosage}
                      onChange={(e) => setPrescribedDosage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Frequency</label>
                    <input
                      type="text"
                      placeholder="Twice Daily"
                      value={prescribedFreq}
                      onChange={(e) => setPrescribedFreq(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="5 Days"
                      value={prescribedDuration}
                      onChange={(e) => setPrescribedDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConsultForm(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                  >
                    Save Consultation
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Medical Records & Prescriptions Feed */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Permitted Medical Records & Prescriptions
                </h3>
                <p className="text-xs text-slate-500">
                  Decrypted clinical records authorized for medical consultation.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  onClick={() => generateMedicalReportPDF(displayPatient, displayRecords)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {displayRecords.length > 0 ? (
                displayRecords.map((record) => (
                  <div key={record.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {record.category}
                        </span>
                        <span className="font-bold text-slate-900">{record.title}</span>
                      </div>
                      <span className="text-slate-500">{record.date}</span>
                    </div>

                    <p className="text-slate-600">{record.diagnosisDetails}</p>
                    <p className="text-[11px] text-slate-500">Physician: {record.diagnosingDoctor} • {record.hospitalClinic}</p>

                    {record.medicines && record.medicines.length > 0 && (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {record.medicines.map((med) => (
                          <div key={med.id} className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <div className="flex justify-between font-bold text-teal-800">
                              <span>{med.name}</span>
                              <span>{med.dosage}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{med.frequency} • {med.duration}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">No matching records found.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Connected Specialists Directory */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center space-x-2">
          <Hospital className="w-4 h-4 text-teal-600" />
          <span>Connected Hospital Department Specialists</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Dr. Sneha Das', specialty: 'Cardiologist', hospital: 'Apollo Heart Institute', status: 'On Duty' },
            { name: 'Dr. Rajesh Sharma', specialty: 'Endocrinologist', hospital: 'City Care Hospital', status: 'Available' },
            { name: 'Dr. Ananya Roy', specialty: 'General Physician', hospital: 'Fortis Clinic', status: 'Available' },
          ].map((doc, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{doc.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {doc.status}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{doc.specialty} • {doc.hospital}</p>
              <button
                onClick={() => alert(`Initiating direct clinical consultation request with ${doc.name}...`)}
                className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
              >
                Request Consult
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
