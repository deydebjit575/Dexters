import React, { useState } from 'react';
import { MediVaultProvider, useMediVault } from './context/MediVaultContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorEmergencyView } from './components/DoctorEmergencyView';
import { EmergencyTokenModal } from './components/EmergencyTokenModal';
import { ShieldCheck, HeartPulse, Lock, Github } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView } = useMediVault();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white bg-[#F8FAFC]">
      <div>
        {activeView !== 'login' && (
          <Navbar onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />
        )}

        <main>
          {activeView === 'landing' && (
            <LandingPage onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />
          )}

          {activeView === 'login' && (
            <LoginPage onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />
          )}

          {activeView === 'patient' && (
            <PatientDashboard onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} activeSubTab="records" />
          )}

          {activeView === 'access' && (
            <PatientDashboard onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} activeSubTab="access" />
          )}

          {activeView === 'doctor' && <DoctorEmergencyView />}
        </main>
      </div>

      {/* Emergency Token Modal */}
      <EmergencyTokenModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Footer (Hidden on login page) */}
      {activeView !== 'login' && (
        <footer className="border-t border-slate-200/80 bg-white py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-slate-600 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span className="font-display font-bold text-slate-900">MediVault Cryptographic Health Platform</span>
              <span className="text-slate-500">— Zero-Knowledge Lifetime Records</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 text-cyan-700 font-semibold">
                <Lock className="w-3.5 h-3.5 text-cyan-600" />
                <span>AES-256-GCM Sovereign Encryption</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono">v1.0.0</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export function App() {
  return (
    <MediVaultProvider>
      <MainContent />
    </MediVaultProvider>
  );
}

export default App;
