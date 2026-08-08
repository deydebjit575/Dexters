import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MediVaultProvider, useMediVault } from './context/MediVaultContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorEmergencyView } from './components/DoctorEmergencyView';
import { EmergencyTokenModal } from './components/EmergencyTokenModal';
import { ShieldCheck, Lock } from 'lucide-react';

// Protected route wrapper — redirects to /login if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useMediVault();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  const { currentUser } = useMediVault();
  const location = useLocation();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';
  const isDoctorPortal = location.pathname === '/doctor-portal';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white bg-[#F8FAFC]">
      <div>
        {!isLoginPage && (
          <Navbar onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />
        )}

        <main>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={<LandingPage onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />}
            />
            <Route
              path="/login"
              element={
                currentUser ? <Navigate to="/dashboard" replace /> : (
                  <LoginPage onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />
                )
              }
            />
            <Route path="/doctor-portal" element={<DoctorEmergencyView />} />

            {/* Protected patient routes — all render PatientDashboard with different tab */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="dashboard"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="records"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records/timeline"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="timeline"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-records"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="upload"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="profile"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="settings"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/permissions"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="granular"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/access"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="access"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/emergency"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="emergency"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/security"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="security"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai"
              element={
                <ProtectedRoute>
                  <PatientDashboard
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    activeSubTab="ai"
                  />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Emergency Token Modal */}
      <EmergencyTokenModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Footer (hidden on login and doctor portal pages) */}
      {!isLoginPage && !isDoctorPortal && (
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
    <BrowserRouter>
      <MediVaultProvider>
        <AppLayout />
      </MediVaultProvider>
    </BrowserRouter>
  );
}

export default App;
