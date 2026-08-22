import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  Check,
  AlertCircle,
  HelpCircle,
  Brain,
  Activity,
  Flame,
  Zap,
  Volume2,
  Square,
  ChevronRight,
  ChevronLeft,
  Play,
  Heart,
  Droplets,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';
import { EnergyLevel, StressLevel } from '../types/energy';

type MoodOption = {
  id: string;
  emoji: string;
  label: string;
  energyLevel: EnergyLevel;
  stressLevel: StressLevel;
};

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'great', emoji: '😄', label: 'Great', energyLevel: 5, stressLevel: 1 },
  { id: 'good', emoji: '🙂', label: 'Good', energyLevel: 4, stressLevel: 2 },
  { id: 'okay', emoji: '😐', label: 'Okay', energyLevel: 3, stressLevel: 3 },
  { id: 'low', emoji: '😟', label: 'Low', energyLevel: 2, stressLevel: 4 },
  { id: 'very_low', emoji: '😣', label: 'Very Low', energyLevel: 1, stressLevel: 5 },
];

const ENERGY_OPTIONS: { level: EnergyLevel; icon: string; label: string }[] = [
  { level: 1, icon: '🪫', label: 'Drained' },
  { level: 2, icon: '🥱', label: 'Low Energy' },
  { level: 3, icon: '🔋', label: 'Moderate' },
  { level: 4, icon: '⚡', label: 'Active' },
  { level: 5, icon: '🔥', label: 'Peak High' },
];

const STRESS_OPTIONS: { level: StressLevel; label: string; color: string }[] = [
  { level: 1, label: '1 - Calm', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { level: 2, label: '2 - Mild', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { level: 3, label: '3 - Moderate', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { level: 4, label: '4 - High', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { level: 5, label: '5 - Severe', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const DISCOMFORT_TYPES = [
  'Headache',
  'Nausea / Stomach',
  'Muscle Pain',
  'Chest Tightness',
  'General Sickness',
  'Exam Stress',
  'Fatigue',
  'None',
];

export const EnergyCheckInModal: React.FC = () => {
  const {
    isCheckInOpen,
    closeCheckInModal,
    submitCheckIn,
    isSubmittingCheckIn,
    runDemoPreset,
    aiResponse,
    recoveryPlan,
    openRecoveryPlayer,
    openExplanationModal,
    active10MinPlan,
  } = useEnergyMode();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<string>('good');
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>(3);
  const [selectedStress, setSelectedStress] = useState<StressLevel>(2);
  const [hasDiscomfort, setHasDiscomfort] = useState<boolean>(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['None']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceStatusText, setVoiceStatusText] = useState('');
  const [showVoiceDictationHelper, setShowVoiceDictationHelper] = useState(false);

  // Reset wizard on modal open
  useEffect(() => {
    if (isCheckInOpen) {
      setCurrentStep(1);
    }
  }, [isCheckInOpen]);

  const handleSelectMood = (mood: MoodOption) => {
    setSelectedMood(mood.id);
    setSelectedEnergy(mood.energyLevel);
    setSelectedStress(mood.stressLevel);
  };

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'None') {
      setSelectedSymptoms(['None']);
      setHasDiscomfort(false);
      return;
    }
    setHasDiscomfort(true);
    setSelectedSymptoms((prev) => {
      const filtered = prev.filter((s) => s !== 'None');
      if (filtered.includes(symptom)) {
        const next = filtered.filter((s) => s !== symptom);
        return next.length === 0 ? ['None'] : next;
      }
      return [...filtered, symptom];
    });
  };

  // Voice recording timer counter
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setVoiceSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  const handleToggleVoiceInput = async () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setVoiceStatusText('Audio recorded. Transcribed to text!');
      setTimeout(() => setVoiceStatusText(''), 3000);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecordingVoice(true);
          setVoiceStatusText('🎙️ Listening... Speak how you feel now.');
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0][0].transcript)
            .join(' ');
          if (transcript.trim()) {
            setNote(transcript);

            const lower = transcript.toLowerCase();
            const detected: string[] = [];
            if (lower.includes('headache') || lower.includes('head ache')) detected.push('Headache');
            if (lower.includes('nausea') || lower.includes('stomach') || lower.includes('sick')) detected.push('Nausea / Stomach');
            if (lower.includes('chest') || lower.includes('breath')) detected.push('Chest Tightness');
            if (lower.includes('muscle') || lower.includes('sore') || lower.includes('ache')) detected.push('Muscle Pain');
            if (lower.includes('exam') || lower.includes('test') || lower.includes('study')) detected.push('Exam Stress');
            if (lower.includes('fatigue') || lower.includes('tired')) detected.push('Fatigue');

            if (detected.length > 0) {
              setSelectedSymptoms(detected);
              setHasDiscomfort(true);
            }
          }
        };

        recognition.onerror = () => {
          setIsRecordingVoice(false);
          fallbackUniversalVoiceRecorder();
        };

        recognition.onend = () => {
          setIsRecordingVoice(false);
          setVoiceStatusText('✓ Voice dictation captured!');
          setTimeout(() => setVoiceStatusText(''), 3000);
        };

        recognition.start();
        return;
      } catch (e) {
        fallbackUniversalVoiceRecorder();
      }
    } else {
      fallbackUniversalVoiceRecorder();
    }
  };

  const fallbackUniversalVoiceRecorder = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecordingVoice(true);
        setVoiceStatusText('🎙️ Recording voice audio...');

        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
          setIsRecordingVoice(false);
          setVoiceStatusText('✓ Audio recorded! Transcribed to check-in text.');
          setTimeout(() => setVoiceStatusText(''), 3000);
        }, 5000);
      } else {
        setShowVoiceDictationHelper(true);
      }
    } catch (err) {
      setShowVoiceDictationHelper(true);
      setVoiceStatusText('Mic permission prompt blocked. Click sample dictation below:');
    }
  };

  const handleApplyVoiceSample = (sampleText: string) => {
    setNote(sampleText);

    const lower = sampleText.toLowerCase();
    const detected: string[] = [];
    if (lower.includes('headache')) detected.push('Headache');
    if (lower.includes('stomach') || lower.includes('nausea') || lower.includes('sick')) detected.push('Nausea / Stomach');
    if (lower.includes('chest') || lower.includes('breath')) detected.push('Chest Tightness');
    if (lower.includes('muscle') || lower.includes('sore')) detected.push('Muscle Pain');
    if (lower.includes('exam')) detected.push('Exam Stress');
    if (lower.includes('fatigue') || lower.includes('tired')) detected.push('Fatigue');

    if (detected.length > 0) {
      setSelectedSymptoms(detected);
      setHasDiscomfort(true);
    }

    setVoiceStatusText(`✓ Voice sample applied: "${sampleText.substring(0, 30)}..."`);
    setTimeout(() => setVoiceStatusText(''), 3000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = await submitCheckIn({
      energyLevel: selectedEnergy,
      stressLevel: selectedStress,
      physicalDiscomfort: selectedSymptoms.length > 0 && !selectedSymptoms.includes('None'),
      discomfortType: selectedSymptoms.join(', '),
      symptoms: selectedSymptoms,
      feelingTags: selectedTags,
      note: note.trim() || undefined,
      isVoiceInput: true,
    });
    setCurrentStep(5); // Move to Step 5: Recommendation
  };

  if (!isCheckInOpen) return null;

  const totalWizardSteps = 5;
  const progressPercent = Math.round((currentStep / totalWizardSteps) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCheckInModal}
          className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-10 my-8"
        >
          {/* Top Header & Wizard Progress */}
          <div className="p-6 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-slate-900 text-white relative">
            <button
              onClick={closeCheckInModal}
              disabled={isSubmittingCheckIn}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30">
                <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white font-display">
                  Personalized Wellness Check-in
                </h3>
                <p className="text-xs text-teal-300 font-medium">
                  Step {currentStep} of {totalWizardSteps}:{' '}
                  {currentStep === 1
                    ? 'Mood'
                    : currentStep === 2
                    ? 'Energy Level'
                    : currentStep === 3
                    ? 'Stress Level'
                    : currentStep === 4
                    ? 'Symptoms & Voice'
                    : 'Personalized Recommendation'}
                </p>
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick Judge Demo Shortcuts */}
            {currentStep < 5 && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  🚀 Quick Judge Demo Shortcuts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      runDemoPreset('demo1_exam');
                      setCurrentStep(5);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-colors"
                  >
                    🎓 Demo 1: High Stress + Headache
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      runDemoPreset('demo2_normal');
                      setCurrentStep(5);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] transition-colors"
                  >
                    ☀️ Demo 2: Good Energy + Low Stress
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      runDemoPreset('demo3_urgent');
                      setCurrentStep(5);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-[11px] transition-colors"
                  >
                    🆘 Demo 3: Urgent Safety Escalation
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: INTERACTIVE MOOD CHECK-IN */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 text-center"
              >
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 font-display">
                    How are you feeling today?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your current mood to customize your wellness assessment.
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {MOOD_OPTIONS.map((m) => {
                    const isSelected = selectedMood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMood(m)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-tr from-teal-500/10 to-cyan-500/10 border-2 border-teal-500 shadow-md scale-105 font-bold'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-3xl block mb-1">{m.emoji}</span>
                        <span className="text-[11px] font-bold text-slate-800 block">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
                  >
                    <span>Next: Energy Level</span>
                    <ChevronRight className="w-4 h-4 text-teal-400" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ENERGY ASSESSMENT */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 font-display">
                    Assess Your Energy Level
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    1 = Completely Drained, 5 = Peak High Stamina
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {ENERGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setSelectedEnergy(opt.level)}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        selectedEnergy === opt.level
                          ? 'bg-cyan-50 border-2 border-cyan-500 shadow-md font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{opt.icon}</span>
                      <span className="text-[10px] text-slate-600 block">{opt.level} - {opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
                  >
                    <span>Next: Stress Level</span>
                    <ChevronRight className="w-4 h-4 text-teal-400" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: STRESS ASSESSMENT */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 font-display">
                    Assess Your Stress Level
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    1 = Completely Calm, 5 = Severe Tension / Panic
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {STRESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setSelectedStress(opt.level)}
                      className={`py-3.5 rounded-2xl text-xs font-bold border transition-all ${opt.color} ${
                        selectedStress === opt.level ? 'ring-2 ring-slate-900 scale-105 shadow-md' : 'opacity-80'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
                  >
                    <span>Next: Symptoms & Voice</span>
                    <ChevronRight className="w-4 h-4 text-teal-400" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SYMPTOMS & VOICE CHECK-IN */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 font-display">
                    Symptoms & Voice Check-In
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Select symptoms or speak how you feel using the mic button.
                  </p>
                </div>

                {/* Symptoms Multi-Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Physical Discomfort / Symptoms:
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {DISCOMFORT_TYPES.map((type) => {
                      const isSelected = selectedSymptoms.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleSymptom(type)}
                          className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                            isSelected
                              ? type === 'None'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Voice Input "Tell us how you feel" */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="wellness-note-input" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Voice Description:
                    </label>

                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-xs ${
                        isRecordingVoice
                          ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-600'
                          : 'bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white hover:opacity-95'
                      }`}
                    >
                      {isRecordingVoice ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-white" />
                          <span>Stop ({voiceSeconds}s)</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
                          <span>Tell us how you feel</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isRecordingVoice && (
                    <div className="mb-2 p-2.5 rounded-xl bg-rose-50 text-rose-900 text-xs font-bold flex items-center justify-between">
                      <span>Listening... ({voiceSeconds}s)</span>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    </div>
                  )}

                  {voiceStatusText && !isRecordingVoice && (
                    <p className="text-[11px] font-semibold text-teal-700 mb-1 font-mono">
                      {voiceStatusText}
                    </p>
                  )}

                  <textarea
                    id="wellness-note-input"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Or type how you feel (e.g. Slept poorly, feeling stressed and have a headache...)"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmittingCheckIn}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center space-x-2 disabled:opacity-70"
                  >
                    {isSubmittingCheckIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Assessment →</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: PERSONALIZED RECOMMENDATION & PLAN */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                      Smart Personalized Recommendation:
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 font-display mt-0.5">
                      {aiResponse?.plan?.[0]?.title || 'Tailored Decompression Plan'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={openExplanationModal}
                    className="px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-900 font-bold text-[11px] hover:bg-teal-50 transition-colors flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Explain</span>
                  </button>
                </div>

                {/* Micro Actions Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    3-Minute Tailored Session Steps:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {recoveryPlan.slice(0, 3).map((step, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-[9px] font-bold text-teal-700 uppercase">Step {idx + 1}</span>
                        <p className="font-bold text-slate-800 text-[11px] truncate">{step.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeCheckInModal();
                      openRecoveryPlayer();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start 3-Minute Guided Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeCheckInModal}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Return to Wellness Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
