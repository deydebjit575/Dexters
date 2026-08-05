import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';
import { loginWithEmail, loginWithGoogle } from '../services/firebaseService';

interface LoginPageProps {
  onOpenEmergencyModal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenEmergencyModal }) => {
  const { setActiveView, handleUserLogin } = useMediVault();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithEmail(emailOrPhone, password);
      setLoading(false);
      await handleUserLogin(user);
      setActiveView('patient');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication error. Please check your credentials.');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      setLoading(false);
      await handleUserLogin(user);
      setActiveView('patient');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Google Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-cyan-500 selection:text-white">
      {/* Left Container - Form & Branding */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-2xl mx-auto lg:max-w-none min-h-screen">
        {/* Top Header & Logo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setActiveView('landing')} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 p-0.5 shadow-glow-cyan group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-600 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div>
                <div className="font-display font-extrabold text-xl text-slate-900 tracking-tight flex items-center space-x-1">
                  <span>Medi</span>
                  <span className="text-cyan-600">Vault</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                  AES-256 Sovereign Medical Infrastructure
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home Link */}
          <div>
            <button
              onClick={() => setActiveView('landing')}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-cyan-600 transition-colors py-1.5 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-8 space-y-7 max-w-md w-full mx-auto">
          {/* Main Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Welcome
            </h1>
            <p className="text-slate-600 text-sm sm:text-base font-normal">
              Securely access your lifetime medical records.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter your email or phone number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Password reset instruction sent.'); }}
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold text-sm shadow-md hover:shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Login Securely'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 font-medium absolute">or</span>
          </div>

          {/* Emergency Doctor Portal Button */}
          <div>
            <button
              type="button"
              onClick={onOpenEmergencyModal}
              className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-colors"
            >
              <Shield className="w-4 h-4 text-cyan-600" />
              <span>Emergency Doctor Portal</span>
            </button>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500 space-x-1.5 font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-cyan-600 flex-shrink-0" />
          <span>Your health data is protected with AES-256 encryption</span>
        </div>
      </div>

      {/* Right Container - Medical Illustration & Glass Card (Desktop view only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-end justify-center p-8 lg:p-12">
        {/* Background Image */}
        <img
          src="/medical_login_illustration.png"
          alt="MediVault Cyber Medical Technology"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 filter contrast-105"
        />

        {/* Ambient Dark/Cyan Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Bottom Semi-transparent Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 w-full max-w-lg mx-auto backdrop-blur-xl bg-white/75 border border-white/50 shadow-2xl rounded-2xl p-5 text-center transition-transform hover:scale-[1.01]"
        >
          <div className="text-cyan-800 font-bold text-sm tracking-wider uppercase flex items-center justify-center space-x-2">
            <span>Secure</span>
            <span className="text-cyan-500">•</span>
            <span>Encrypted</span>
            <span className="text-cyan-500">•</span>
            <span>Private</span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
            Your medical data, your control.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
