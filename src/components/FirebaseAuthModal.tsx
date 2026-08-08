import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, User, Key, X, CheckCircle2, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle, FirebaseUser } from '../services/firebaseService';
import { useMediVault } from '../context/MediVaultContext';
import { useNavigate } from 'react-router-dom';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
  initialTab?: 'login' | 'register';
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialTab = 'login',
}) => {
  const { handleUserLogin } = useMediVault();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user: FirebaseUser;
      if (tab === 'login') {
        user = await loginWithEmail(email, password);
      } else {
        user = await registerWithEmail(name, email, password);
      }
      setLoading(false);
      await handleUserLogin(user);
      onClose();
      navigate('/dashboard');
      if (onSuccessLogin) onSuccessLogin();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication error');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      setLoading(false);
      await handleUserLogin(user);
      onClose();
      navigate('/dashboard');
      if (onSuccessLogin) onSuccessLogin();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Google Auth error');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-cyan-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl relative overflow-hidden space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-500">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Firebase Authentication</h3>
                <p className="text-[11px] text-slate-500">Encrypted Patient Vault Access</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Switch Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
                tab === 'login'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
                tab === 'register'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Patient Registration</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {tab === 'register' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Master Vault Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md transition-colors"
            >
              {loading ? 'Authenticating with Firebase...' : tab === 'login' ? 'Login to MediVault' : 'Register Patient Identity'}
            </button>
          </form>

          {/* Social Auth */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <button
              onClick={handleGoogleAuth}
              type="button"
              className="w-full py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google Firebase Auth</span>
            </button>
          </div>

          <div className="text-[10px] text-center text-slate-500 font-mono">
            Firebase Auth • Sovereign Zero-Knowledge Identity Protection
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
