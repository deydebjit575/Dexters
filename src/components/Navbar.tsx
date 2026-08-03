import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Stethoscope,
  KeyRound,
  Sun,
  Moon,
  Menu,
  X,
  Lock,
  UserCheck,
  Activity,
  Globe,
  LogIn,
  UserPlus,
  RefreshCw,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';
import { FirebaseAuthModal } from './FirebaseAuthModal';

interface NavbarProps {
  onOpenEmergencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEmergencyModal }) => {
  const {
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    activeEmergencyToken,
    currentLang,
    setCurrentLang,
    currentUser,
    isDemoMode,
    isFetchingFirebase,
    fetchCompleteFirebaseData,
    logoutUser,
  } = useMediVault();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthTab(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 dark:bg-slate-950/85 border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand */}
            <div 
              onClick={() => setActiveView('landing')} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-500 p-0.5 shadow-glow-teal group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-teal-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                    Medi<span className="gradient-text-teal">Vault</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    AES-256
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block font-medium">Sovereign Medical Infrastructure</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
              <button
                onClick={() => setActiveView('landing')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeView === 'landing'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('patient')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'patient'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Patient Dashboard</span>
              </button>
              <button
                onClick={() => setActiveView('access')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'access'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Access Control</span>
              </button>
              <button
                onClick={() => setActiveView('doctor')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'doctor'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
              </button>
            </nav>

            {/* Action CTAs */}
            <div className="hidden lg:flex items-center space-x-2">
              
              {/* Language Switcher Selector */}
              <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-2 py-1.5 text-xs text-slate-300">
                <Globe className="w-3.5 h-3.5 text-teal-400 mr-1" />
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value as any)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="EN" className="bg-slate-900">EN</option>
                  <option value="HI" className="bg-slate-900">HI</option>
                  <option value="ES" className="bg-slate-900">ES</option>
                  <option value="FR" className="bg-slate-900">FR</option>
                  <option value="DE" className="bg-slate-900">DE</option>
                </select>
              </div>

              {/* User Session Badge & Controls */}
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  {/* Fetch / Sync Button */}
                  <button
                    onClick={fetchCompleteFirebaseData}
                    disabled={isFetchingFirebase}
                    className="px-2.5 py-2 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-xs font-bold text-teal-300 flex items-center space-x-1.5 transition-colors"
                    title="Fetch Complete Firebase Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFirebase ? 'animate-spin text-teal-400' : ''}`} />
                    <span className="hidden xl:inline">{isFetchingFirebase ? 'Fetching...' : 'Fetch Firebase Data'}</span>
                  </button>

                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-semibold text-white max-w-[110px] truncate">
                      {currentUser.displayName || 'Authenticated User'}
                    </span>
                    <button
                      onClick={logoutUser}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Logout User"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAuth('login')}
                    className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-teal-400" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => openAuth('register')}
                    className="px-3 py-2 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-xs font-bold text-teal-300 flex items-center space-x-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                    <span>New User</span>
                  </button>
                </div>
              )}

              {/* Emergency Token Trigger Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenEmergencyModal}
                className="relative overflow-hidden px-3.5 py-2 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-slate-950 text-xs font-extrabold shadow-glow-teal flex items-center space-x-1.5"
              >
                <KeyRound className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">Emergency Token</span>
                {activeEmergencyToken && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </motion.button>

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/30 transition-all"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

            </div>

            {/* Mobile Hamburger & Controls */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-3"
            >
              <button
                onClick={() => {
                  setActiveView('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 text-slate-200 text-xs font-semibold flex items-center space-x-3"
              >
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Landing Page Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('patient');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 text-slate-200 text-xs font-semibold flex items-center space-x-3"
              >
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span>Patient Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('doctor');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center space-x-3"
              >
                <Stethoscope className="w-4 h-4 text-amber-400" />
                <span>Emergency Doctor Portal</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    openAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-400" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    openAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-xs font-bold text-teal-300 flex items-center justify-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                  <span>Register</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onOpenEmergencyModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-glow-teal flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Generate Emergency Token</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Firebase Auth Modal */}
      <FirebaseAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authTab}
        onSuccessLogin={() => setActiveView('patient')}
      />
    </>
  );
};
