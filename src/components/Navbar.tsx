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
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand */}
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
                <div className="flex items-center space-x-2">
                  <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900">
                    Medi<span className="gradient-text-cyan">Vault</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                    AES-256
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Sovereign Medical Infrastructure</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80">
              <button
                onClick={() => setActiveView('landing')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeView === 'landing'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-200/60'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('patient')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'patient'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Patient Dashboard</span>
              </button>
              <button
                onClick={() => setActiveView('access')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'access'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-200/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Access Control</span>
              </button>
              <button
                onClick={() => setActiveView('doctor')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'doctor'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 font-bold'
                    : 'text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
              </button>
            </nav>

            {/* Action CTAs */}
            <div className="hidden lg:flex items-center space-x-2">
              
              {/* Language Switcher Selector */}
              <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-2xl px-2 py-1.5 text-xs text-slate-700">
                <Globe className="w-3.5 h-3.5 text-cyan-600 mr-1" />
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="EN" className="bg-white text-slate-800">EN</option>
                  <option value="HI" className="bg-white text-slate-800">HI</option>
                  <option value="ES" className="bg-white text-slate-800">ES</option>
                  <option value="FR" className="bg-white text-slate-800">FR</option>
                  <option value="DE" className="bg-white text-slate-800">DE</option>
                </select>
              </div>

              {/* User Session Badge & Controls */}
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  {/* Fetch / Sync Button */}
                  <button
                    onClick={fetchCompleteFirebaseData}
                    disabled={isFetchingFirebase}
                    className="px-2.5 py-2 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-xs font-bold text-cyan-700 flex items-center space-x-1.5 transition-colors"
                    title="Fetch Complete Firebase Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFirebase ? 'animate-spin text-cyan-600' : ''}`} />
                    <span className="hidden xl:inline">{isFetchingFirebase ? 'Fetching...' : 'Fetch Firebase Data'}</span>
                  </button>

                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-semibold text-slate-800 max-w-[110px] truncate">
                      {currentUser.displayName || 'Authenticated User'}
                    </span>
                    <button
                      onClick={logoutUser}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Logout User"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveView('login')}
                    className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => openAuth('register')}
                    className="px-3 py-2 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-xs font-bold text-cyan-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-cyan-600" />
                    <span>New User</span>
                  </button>
                </div>
              )}

              {/* Emergency Token Trigger Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenEmergencyModal}
                className="relative overflow-hidden px-3.5 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-extrabold shadow-md shadow-cyan-500/25 flex items-center space-x-1.5 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Emergency Token</span>
                {activeEmergencyToken && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </motion.button>

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-300 transition-all"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-600" />}
              </button>

            </div>

            {/* Mobile Hamburger & Controls */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-600" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-cyan-600"
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
              className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-3 shadow-lg"
            >
              <button
                onClick={() => {
                  setActiveView('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold flex items-center space-x-3 hover:bg-cyan-50 hover:text-cyan-600"
              >
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>Landing Page Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('patient');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold flex items-center space-x-3 hover:bg-cyan-50 hover:text-cyan-600"
              >
                <UserCheck className="w-4 h-4 text-cyan-600" />
                <span>Patient Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('doctor');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold flex items-center space-x-3"
              >
                <Stethoscope className="w-4 h-4 text-cyan-600" />
                <span>Emergency Doctor Portal</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveView('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    openAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 flex items-center justify-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Register</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onOpenEmergencyModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center justify-center space-x-2"
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
