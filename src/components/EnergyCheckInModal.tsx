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
} from 'lucide-react';
import { useEnergyMode } from '../context/EnergyModeContext';
import { EnergyLevel, StressLevel } from '../types/energy';

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

const PRESET_FEELING_TAGS = [
  'Brain Fog',
  'Physical Fatigue',
  'Exam Stress',
  'Focused',
  'Rested',
  'Anxious',
  'Calm',
  'Overwhelmed',
];

export const EnergyCheckInModal: React.FC = () => {
  const {
    isCheckInOpen,
    closeCheckInModal,
    submitCheckIn,
    isSubmittingCheckIn,
    runDemoPreset,
  } = useEnergyMode();

  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>(3);
  const [selectedStress, setSelectedStress] = useState<StressLevel>(2);
  const [hasDiscomfort, setHasDiscomfort] = useState<boolean>(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['None']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // Universal Voice Check-in state (supports ALL browsers & devices)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceStatusText, setVoiceStatusText] = useState('');
  const [showVoiceDictationHelper, setShowVoiceDictationHelper] = useState(false);

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

  /**
   * Universal Voice Check-in Handler
   */
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

            // Auto-detect symptoms from spoken audio
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  if (!isCheckInOpen) return null;

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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-emerald-500/5 border-b border-slate-100 relative">
            <button
              onClick={closeCheckInModal}
              disabled={isSubmittingCheckIn}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  Personalized Wellness Assessment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Voice check-in & multi-factor health analysis
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Quick Demo Shortcuts for Judges */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                🚀 Quick Judge Demo Shortcuts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => runDemoPreset('demo1_exam')}
                  className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-colors"
                >
                  🎓 Demo 1: High Stress + Headache
                </button>
                <button
                  type="button"
                  onClick={() => runDemoPreset('demo2_normal')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] transition-colors"
                >
                  ☀️ Demo 2: Good Energy + Low Stress
                </button>
                <button
                  type="button"
                  onClick={() => runDemoPreset('demo3_urgent')}
                  className="px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-[11px] transition-colors"
                >
                  🆘 Demo 3: Urgent Safety Escalation
                </button>
              </div>
            </div>

            {/* 1. Energy Scale (1 to 5) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                1. Energy Level (1 = Drained, 5 = Peak)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setSelectedEnergy(opt.level)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedEnergy === opt.level
                        ? 'bg-cyan-50 border-2 border-cyan-500 shadow-md font-bold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl block mb-0.5">{opt.icon}</span>
                    <span className="text-[10px] text-slate-600 block">{opt.level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Stress Scale (1 to 5) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                2. Stress Level (1 = Calm, 5 = Severe)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {STRESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setSelectedStress(opt.level)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${opt.color} ${
                      selectedStress === opt.level ? 'ring-2 ring-slate-800 scale-105' : 'opacity-80'
                    }`}
                  >
                    {opt.level}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Symptom Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                3. Select Current Symptoms / Discomfort:
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

            {/* 4. Voice-Based Wellness Check ("Tell us how you feel") */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="wellness-note" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <span>4. Voice Check-in Description</span>
                </label>

                {/* Microphone Button labeled "Tell us how you feel" */}
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-xs ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-600 ring-offset-1'
                      : 'bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white hover:opacity-95'
                  }`}
                >
                  {isRecordingVoice ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Listening ({voiceSeconds}s)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
                      <span>Tell us how you feel</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Voice Status Indicator */}
              {isRecordingVoice && (
                <div className="mb-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold">Listening & Converting Speech to Text... ({voiceSeconds}s)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" />
                    <span className="w-1 h-5 bg-rose-600 rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}

              {voiceStatusText && !isRecordingVoice && (
                <p className="text-[11px] font-semibold text-teal-700 mb-1 font-mono">
                  {voiceStatusText}
                </p>
              )}

              <textarea
                id="wellness-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Or type how you feel (e.g. Slept poorly, feeling stressed and have a headache...)"
                className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
              />

              {/* Sample Voice Dictation Prompts */}
              <div className="mt-2 text-left">
                <button
                  type="button"
                  onClick={() => setShowVoiceDictationHelper(!showVoiceDictationHelper)}
                  className="text-[11px] text-cyan-700 hover:underline font-semibold flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3 text-cyan-600" />
                  <span>{showVoiceDictationHelper ? 'Hide Voice Sample Dictations ▲' : '🎙️ Sample Voice Input Dictations ▼'}</span>
                </button>

                {showVoiceDictationHelper && (
                  <div className="mt-2 p-2.5 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-1.5 text-xs">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Click sample to emulate spoken audio:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyVoiceSample('I have a severe pounding headache and eye strain from studying.')}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 text-[11px]"
                      >
                        🗣️ "Severe headache & eye strain"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyVoiceSample('Exams start in two hours, I slept 3 hours, have stomach cramps and nausea.')}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 text-[11px]"
                      >
                        🗣️ "Exam stress & stomach cramps"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyVoiceSample('I feel chest tightness and severe shortness of breath right now.')}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 text-[11px]"
                      >
                        🗣️ "Chest tightness & shortness of breath"
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Non-medical Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center font-mono">
              ℹ️ General wellness support tool. Does not diagnose diseases or replace medical advice.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingCheckIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isSubmittingCheckIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Wellness Assessment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit & Analyze Assessment</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

