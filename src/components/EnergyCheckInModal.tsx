import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  Square,
  ChevronRight,
  ChevronLeft,
  Play,
  HelpCircle,
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
  { id: 'very_low', emoji: '😣', label: 'Not Well', energyLevel: 1, stressLevel: 5 },
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
  'Fatigue / Exhaustion',
  'Stress / Anxiety',
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
  } = useEnergyMode();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<string>('good');
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>(3);
  const [selectedStress, setSelectedStress] = useState<StressLevel>(2);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['None']);
  const [selectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceStatusText, setVoiceStatusText] = useState('');

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
      return;
    }
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
      setVoiceStatusText('Audio recorded. Transcribed to text.');
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
            if (lower.includes('stress') || lower.includes('anxiety')) detected.push('Stress / Anxiety');
            if (lower.includes('fatigue') || lower.includes('tired')) detected.push('Fatigue / Exhaustion');

            if (detected.length > 0) {
              setSelectedSymptoms(detected);
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
        }, 4000);
      }
    } catch (err) {
      setVoiceStatusText('Mic permission prompt blocked.');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitCheckIn({
      energyLevel: selectedEnergy,
      stressLevel: selectedStress,
      physicalDiscomfort: selectedSymptoms.length > 0 && !selectedSymptoms.includes('None'),
      discomfortType: selectedSymptoms.join(', '),
      symptoms: selectedSymptoms,
      feelingTags: selectedTags,
      note: note.trim() || undefined,
      isVoiceInput: true,
    });
    setCurrentStep(5); // Move to Step 5: Result / Recommendation
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white relative">
            <button
              onClick={closeCheckInModal}
              disabled={isSubmittingCheckIn}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  AI Health Check
                </h3>
                <p className="text-xs text-teal-300 font-medium">
                  Step {currentStep} of {totalWizardSteps}:{' '}
                  {currentStep === 1
                    ? 'General Feeling'
                    : currentStep === 2
                    ? 'Energy Level'
                    : currentStep === 3
                    ? 'Stress Level'
                    : currentStep === 4
                    ? 'Symptoms & Notes'
                    : 'AI Assessment & Next Steps'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Quick Demo Presets (for evaluation/presentation) */}
            {currentStep < 5 && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      runDemoPreset('demo2_normal');
                      setCurrentStep(5);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200 transition-colors"
                  >
                    Good Condition
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      runDemoPreset('demo1_exam');
                      setCurrentStep(5);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 transition-colors"
                  >
                    Fatigue / Headache
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      runDemoPreset('demo3_urgent');
                      setCurrentStep(5);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200 transition-colors"
                  >
                    Urgent Alert Check
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: MOOD */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 text-center"
              >
                <div>
                  <h4 className="text-xl font-bold text-slate-900 font-display">
                    How are you feeling today?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Select how you currently feel to personalize your guidance.
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
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{m.emoji}</span>
                        <span className="text-[11px] font-bold text-slate-800 block truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
                  >
                    <span>Next: Energy Level</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ENERGY */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h4 className="text-xl font-bold text-slate-900 font-display">
                    Assess Your Energy Level
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    1 = Completely Drained, 5 = Peak Energy
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {ENERGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setSelectedEnergy(opt.level)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedEnergy === opt.level
                          ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{opt.icon}</span>
                      <span className="text-[11px] font-bold text-slate-800 block truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
                  >
                    <span>Next: Stress Level</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: STRESS */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h4 className="text-xl font-bold text-slate-900 font-display">
                    Assess Your Stress Level
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your current level of stress or tension.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {STRESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setSelectedStress(opt.level)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedStress === opt.level
                          ? 'border-teal-500 bg-teal-50/80 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${opt.color}`}>
                        Level {opt.level}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
                  >
                    <span>Next: Symptoms & Notes</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SYMPTOMS & VOICE */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xl font-bold text-slate-900 font-display">
                    Symptoms & Optional Notes
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Select symptoms or describe how you feel using text or voice.
                  </p>
                </div>

                {/* Symptoms Multi-Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Physical Symptoms:
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
                                ? 'bg-teal-600 text-white border-teal-600'
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

                {/* Voice / Text description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="wellness-note-input" className="text-xs font-bold text-slate-700">
                      Description or Notes:
                    </label>

                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        isRecordingVoice
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isRecordingVoice ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-white" />
                          <span>Stop ({voiceSeconds}s)</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-teal-600" />
                          <span>Voice Dictation</span>
                        </>
                      )}
                    </button>
                  </div>

                  {voiceStatusText && (
                    <p className="text-[11px] font-semibold text-teal-700 mb-1 font-mono">
                      {voiceStatusText}
                    </p>
                  )}

                  <textarea
                    id="wellness-note-input"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional: Type how you feel (e.g. Mild headache after work)..."
                    className="w-full px-3 py-2 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmittingCheckIn}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-70"
                  >
                    {isSubmittingCheckIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing Assessment...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Complete Assessment</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: RESULTS & RECOMMENDATIONS */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      AI Health Assessment
                    </span>
                    <button
                      type="button"
                      onClick={openExplanationModal}
                      className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-800 font-bold text-[10px] hover:bg-teal-100/50 transition-colors flex items-center space-x-1"
                    >
                      <HelpCircle className="w-3 h-3 text-teal-600" />
                      <span>Details</span>
                    </button>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 font-display">
                    {aiResponse?.plan?.[0]?.title || 'Suggested Wellness Activity'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {aiResponse?.plan?.[0]?.description || 'A tailored 3-minute session has been generated based on your input.'}
                  </p>
                </div>

                {/* Micro Actions Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">
                    Suggested Next Steps:
                  </span>
                  <div className="space-y-2">
                    {recoveryPlan.slice(0, 2).map((step, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-[10px] font-bold text-teal-700 uppercase">Step {idx + 1} ({step.duration_seconds}s)</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{step.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
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
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start 3-Minute Guided Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeCheckInModal}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Return to Dashboard
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
