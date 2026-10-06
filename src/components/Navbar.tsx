import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Stethoscope,
  KeyRound,
  Sun,
  Moon,
  Menu,
  X,
  Lock,
  Globe,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  FileText,
  LayoutDashboard,
  User,
} from 'lucide-react';
import { useMediVault } from '../context/MediVaultContext';
import { FirebaseAuthModal } from './FirebaseAuthModal';
import { useEnergyMode } from '../context/EnergyModeContext';
import { HeaderPill } from './GentleModeComponents';

interface NavbarProps {
  onOpenEmergencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEmergencyModal }) => {
  const {
    theme,
    toggleTheme,
    activeEmergencyToken,
    currentLang,
    setCurrentLang,
    currentUser,
    patient,
    logoutUser,
  } = useMediVault();

  const { openCheckInModal, isGentleMode, needsReCheck } = useEnergyMode();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthTab(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  // Determine active nav state
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return (
        location.pathname === '/dashboard' ||
        location.pathname === '/profile' ||
        location.pathname === '/settings' ||
        location.pathname === '/dashboard/security' ||
        location.pathname === '/dashboard/ai'
      );
    }
    if (path === '/medical-records') {
      return (
        location.pathname.startsWith('/medical-records') ||
        location.pathname === '/upload-records'
      );
    }
    if (path === '/doctor-portal') {
      return location.pathname === '/doctor-portal';
    }
    if (path === '/dashboard/access') {
      return (
        location.pathname === '/dashboard/access' ||
        location.pathname === '/settings/permissions'
      );
    }
    return location.pathname === path;
  };

  const displayName = patient?.fullName?.trim() || currentUser?.displayName?.trim() || 'Patient';
  const displayInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PT';

  return (
    <>
      {/* Gentle Mode / Recovery Status Banner */}
      {(isGentleMode || needsReCheck) && <HeaderPill />}

      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Logo & Brand */}
            <div
              onClick={() => navigate(currentUser ? '/dashboard' : '/')}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-cyan-400 p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                    Medi<span className="text-teal-600">Vault</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    Secure
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Healthcare Record Platform</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-white text-teal-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/medical-records')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive('/medical-records')
                    ? 'bg-white text-teal-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Medical Records</span>
              </button>

              <button
                onClick={() => navigate('/doctor-portal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive('/doctor-portal')
                    ? 'bg-white text-teal-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>Doctors</span>
              </button>

              <button
                onClick={() => navigate('/dashboard/access')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive('/dashboard/access')
                    ? 'bg-white text-teal-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Access</span>
              </button>
            </nav>

            {/* Action CTAs */}
            <div className="hidden lg:flex items-center space-x-2.5">
              {/* AI Health Check CTA */}
              <button
                onClick={openCheckInModal}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-bold text-teal-800 flex items-center space-x-1.5 transition-all shadow-2xs"
                title="AI Health Check"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI Health Check</span>
              </button>

              {/* Emergency Access CTA */}
              <button
                onClick={onOpenEmergencyModal}
                className="relative px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
                title="Emergency Access Token"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Emergency</span>
                {activeEmergencyToken && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                )}
              </button>

              {/* Language Selector */}
              <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-500 mr-1" />
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="EN" className="bg-white text-slate-800">EN</option>
                  <option value="HI" className="bg-white text-slate-800">HI</option>
                  <option value="ES" className="bg-white text-slate-800">ES</option>
                  <option value="FR" className="bg-white text-slate-800">FR</option>
                  <option value="DE" className="bg-white text-slate-800">DE</option>
                </select>
              </div>

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* User Session / Profile */}
              {currentUser ? (
                <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
                    title="View Profile"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-[10px]">
                      {displayInitials}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 leading-tight max-w-[90px] truncate">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-500">Patient</p>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-200">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-600" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => openAuth('register')}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-bold text-teal-800 flex items-center space-x-1 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                    <span>Register</span>
                  </button>
                </div>
              )}

            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={onOpenEmergencyModal}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center space-x-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Emergency</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg"
            >
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold flex items-center space-x-2.5 hover:bg-teal-50"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  navigate('/medical-records');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold flex items-center space-x-2.5 hover:bg-teal-50"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Medical Records</span>
              </button>

              <button
                onClick={() => {
                  navigate('/doctor-portal');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold flex items-center space-x-2.5 hover:bg-teal-50"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Portal</span>
              </button>

              <button
                onClick={() => {
                  navigate('/dashboard/access');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold flex items-center space-x-2.5 hover:bg-teal-50"
              >
                <Lock className="w-4 h-4 text-teal-600" />
                <span>Access Control</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCheckInModal();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold flex items-center space-x-2.5"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>AI Health Check</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEmergencyModal();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center space-x-2.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>Emergency Access Token</span>
              </button>

              {currentUser ? (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">{displayName}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => {
                      openAuth('register');
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 rounded-xl bg-teal-600 text-xs font-bold text-white flex items-center justify-center space-x-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Firebase Auth Modal */}
      <FirebaseAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authTab}
        onSuccessLogin={() => navigate('/dashboard')}
      />
    </>
  );
};
