import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  KeyRound,
  Clock,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Flame,
  Eye,
  EyeOff,
  AlertTriangle,
  ExternalLink,
  X,
  Stethoscope,
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';
import { EmergencyToken } from '../types/medical';
import { buildEmergencyAccessUrl } from '../services/cryptoService';

interface EmergencyTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyTokenModal: React.FC<EmergencyTokenModalProps> = ({ isOpen, onClose }) => {
  const { records, generateEmergencyAccess, setActiveView, activeEmergencyToken } = useMediVault();

  const [duration, setDuration] = useState<number>(60); // Default 1 hour (60 mins)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<EmergencyToken | null>(activeEmergencyToken);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const allowedRecords = records.filter((r) => !r.isPrivateFromEmergency);
  const hiddenRecords = records.filter((r) => r.isPrivateFromEmergency);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = await generateEmergencyAccess(duration);
      setGeneratedToken(token);
    } catch (err) {
      console.error('Failed to generate token', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = generatedToken ? buildEmergencyAccessUrl(generatedToken) : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyTokenStr = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken.token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleLaunchDoctorPortal = () => {
    onClose();
    if (shareUrl) {
      window.location.hash = shareUrl.split('#')[1] || '';
      setActiveView('doctor');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-cyan-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-xl relative space-y-6 my-8"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-500">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900">
                  Emergency Cryptographic Access Token
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate a temporary, self-destructing access key for emergency responders or doctors.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!generatedToken ? (
            /* TOKEN GENERATION FORM */
            <div className="space-y-6 relative z-10">
              
              {/* Duration Timer Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  <span>Configure Token Countdown Expiry Duration</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: '15 Minutes', mins: 15, desc: 'Fast Responders' },
                    { label: '1 Hour', mins: 60, desc: 'ER Evaluation' },
                    { label: '6 Hours', mins: 360, desc: 'Outpatient Visit' },
                    { label: '24 Hours', mins: 1440, desc: 'Hospital Admission' },
                  ].map((opt) => (
                    <button
                      key={opt.mins}
                      type="button"
                      onClick={() => setDuration(opt.mins)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        duration === opt.mins
                          ? 'bg-cyan-50 border-cyan-500 text-slate-900 ring-2 ring-cyan-500/30'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <p className="font-bold text-xs text-cyan-600">{opt.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permission Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-500" />
                    <span>Payload Encryption Preview</span>
                  </span>
                  <span className="text-[11px] font-mono text-cyan-600">AES-256-GCM</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center space-x-2 text-xs">
                    <Eye className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-cyan-700">{allowedRecords.length} Records Included</p>
                      <p className="text-[10px] text-slate-500">Public for ER View</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs">
                    <EyeOff className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-rose-600">{hiddenRecords.length} Records Excluded</p>
                      <p className="text-[10px] text-slate-500">Patient Private</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Action Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-5 h-5" />
                <span>{isGenerating ? 'Encrypting Payload & Key...' : `Generate ${duration}-Min Emergency Token`}</span>
              </button>

            </div>
          ) : (
            /* GENERATED TOKEN DISPLAY VIEW */
            <div className="space-y-6 relative z-10">
              
              {/* Security Success Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Token Generated & AES-256 Encrypted</span>
                </div>
                <span className="flex items-center space-x-1 text-amber-600 font-mono text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                  <span>Expires in {generatedToken.durationMinutes}m</span>
                </span>
              </div>

              {/* QR Code & Link Sharing Grid */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                
                {/* QR Code Box */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
                  <QRCodeSVG
                    value={shareUrl}
                    size={150}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Token Strings & Actions */}
                <div className="space-y-4 w-full">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Emergency Doctor Access Token
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedToken.token}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-cyan-700 font-mono text-xs font-bold"
                      />
                      <button
                        onClick={handleCopyTokenStr}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Copy Token"
                      >
                        {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Shareable Secure Doctor URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono text-[11px] truncate"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="p-2.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-colors"
                        title="Copy URL"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleLaunchDoctorPortal}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Open Doctor ER Portal View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setGeneratedToken(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Generate New Token
                </button>
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
