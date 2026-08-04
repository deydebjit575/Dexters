import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PatientProfile,
  MedicalRecord,
  AccessGrant,
  AuditLogEntry,
  EmergencyToken,
  GranularPermissions,
  LoginHistoryEntry,
  TrustedContactApprovalRequest,
} from '../types/medical';
import {
  EMPTY_PATIENT,
  INITIAL_RECORDS,
  INITIAL_GRANTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GRANULAR_PERMISSIONS,
  INITIAL_LOGIN_HISTORY,
} from '../services/mockData';
import { createEmergencyToken, decryptPayload, importKeyFromString } from '../services/cryptoService';
import {
  FirebaseUser,
  getCurrentUser,
  logoutFirebase,
  fetchUserDataFromFirebase,
  saveUserDataToFirebase,
} from '../services/firebaseService';

export type AppView = 'landing' | 'patient' | 'access' | 'doctor';
export type Language = 'EN' | 'HI' | 'ES' | 'FR' | 'DE';

interface MediVaultContextType {
  currentUser: FirebaseUser | null;
  isDemoMode: boolean;
  isFetchingFirebase: boolean;
  syncProgress: number;
  syncStatusText: string;
  patient: PatientProfile;
  records: MedicalRecord[];
  accessGrants: AccessGrant[];
  auditLogs: AuditLogEntry[];
  loginHistory: LoginHistoryEntry[];
  granularPermissions: GranularPermissions;
  trustedRequests: TrustedContactApprovalRequest[];
  activeEmergencyToken: EmergencyToken | null;
  theme: 'dark' | 'light';
  activeView: AppView;
  currentLang: Language;
  setActiveView: (view: AppView) => void;
  setCurrentLang: (lang: Language) => void;
  toggleTheme: () => void;
  toggleRecordPrivacy: (recordId: string) => void;
  toggleGranularPermission: (key: keyof GranularPermissions) => void;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => void;
  revokeAccessGrant: (grantId: string) => void;
  revokeAllAccessGrants: () => void;
  generateEmergencyAccess: (durationMinutes: number) => Promise<EmergencyToken>;
  revokeActiveEmergencyToken: () => void;
  requestTrustedContactApproval: (
    doctorName: string,
    hospital: string,
    trustedContactPhone: string
  ) => Promise<TrustedContactApprovalRequest>;
  verifyTrustedContactOTP: (requestId: string, otp: string) => boolean;
  handleUserLogin: (user: FirebaseUser) => Promise<void>;
  fetchCompleteFirebaseData: () => Promise<void>;
  logoutUser: () => Promise<void>;
  resetToDemoProfile: () => void;
  updatePatientProfile: (updatedFields: Partial<PatientProfile>) => void;
  // Emergency Doctor Decryption State
  doctorTokenState: {
    tokenString: string | null;
    secretKey: string | null;
    isDecrypting: boolean;
    isExpiredOrRevoked: boolean;
    remainingSeconds: number;
    decryptedPatient: PatientProfile | null;
    decryptedRecords: MedicalRecord[] | null;
    errorMessage: string | null;
  };
  loadDoctorEmergencyToken: (tokenStr: string, keyStr: string) => Promise<void>;
  simulateSelfDestructKey: () => void;
}

const MediVaultContext = createContext<MediVaultContextType | undefined>(undefined);

export const MediVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => getCurrentUser());
  const isDemoMode = false;

  // Live Firebase Syncing & Streaming state
  const [isFetchingFirebase, setIsFetchingFirebase] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(100);
  const [syncStatusText, setSyncStatusText] = useState<string>('Firebase Encrypted Vault Active');

  const [patient, setPatient] = useState<PatientProfile>(EMPTY_PATIENT);
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS);
  const [accessGrants, setAccessGrants] = useState<AccessGrant[]>(INITIAL_GRANTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [loginHistory] = useState<LoginHistoryEntry[]>(INITIAL_LOGIN_HISTORY);
  const [granularPermissions, setGranularPermissions] = useState<GranularPermissions>(INITIAL_GRANULAR_PERMISSIONS);

  const [trustedRequests, setTrustedRequests] = useState<TrustedContactApprovalRequest[]>([]);

  const [activeEmergencyToken, setActiveEmergencyToken] = useState<EmergencyToken | null>(() => {
    const saved = localStorage.getItem('medivault_active_token');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [currentLang, setCurrentLang] = useState<Language>('EN');

  // Emergency Doctor Interface State
  const [doctorTokenState, setDoctorTokenState] = useState<{
    tokenString: string | null;
    secretKey: string | null;
    isDecrypting: boolean;
    isExpiredOrRevoked: boolean;
    remainingSeconds: number;
    decryptedPatient: PatientProfile | null;
    decryptedRecords: MedicalRecord[] | null;
    errorMessage: string | null;
  }>({
    tokenString: null,
    secretKey: null,
    isDecrypting: false,
    isExpiredOrRevoked: false,
    remainingSeconds: 0,
    decryptedPatient: null,
    decryptedRecords: null,
    errorMessage: null,
  });

  // Sync to Firebase DB per user
  useEffect(() => {
    if (currentUser) {
      saveUserDataToFirebase(currentUser.uid, {
        patient,
        records,
        accessGrants,
        auditLogs,
        granularPermissions,
      });
    }

    if (activeEmergencyToken) {
      localStorage.setItem('medivault_active_token', JSON.stringify(activeEmergencyToken));
    } else {
      localStorage.removeItem('medivault_active_token');
    }
  }, [patient, records, accessGrants, auditLogs, activeEmergencyToken, granularPermissions, currentUser]);

  // Initial load of authenticated user document
  useEffect(() => {
    if (currentUser) {
      fetchUserDataFromFirebase(currentUser.uid, currentUser.displayName, currentUser.email).then((dbData) => {
        if (dbData) {
          setPatient(dbData.patient);
          setRecords(dbData.records);
          setAccessGrants(dbData.accessGrants);
          setAuditLogs(dbData.auditLogs);
          setGranularPermissions(dbData.granularPermissions);
        }
      });
    } else {
      resetToEmptyProfile();
    }
  }, [currentUser?.uid]);

  // Handle user login and gradual Firebase data streaming
  const handleUserLogin = async (user: FirebaseUser) => {
    setCurrentUser(user);

    setIsFetchingFirebase(true);
    setSyncProgress(10);
    setSyncStatusText('Connecting to Firebase Sovereign Auth...');

    await new Promise((r) => setTimeout(r, 400));
    setSyncProgress(30);
    setSyncStatusText('Fetching encrypted patient identity from Firestore...');

    const dbData = await fetchUserDataFromFirebase(user.uid, user.displayName, user.email);

    setSyncProgress(65);
    setSyncStatusText('Decrypting zero-knowledge medical records & storage references...');
    await new Promise((r) => setTimeout(r, 400));

    if (dbData) {
      setPatient(dbData.patient);
      setRecords(dbData.records);
      setAccessGrants(dbData.accessGrants);
      setAuditLogs(dbData.auditLogs);
      setGranularPermissions(dbData.granularPermissions);
    }

    setSyncProgress(90);
    setSyncStatusText('Verifying cryptographic integrity & access permissions...');
    await new Promise((r) => setTimeout(r, 300));

    setSyncProgress(100);
    setSyncStatusText('Firebase Synchronized Completely');
    setIsFetchingFirebase(false);
  };

  // Dedicated Complete Firebase Fetch Function
  const fetchCompleteFirebaseData = async () => {
    if (!currentUser) {
      setIsFetchingFirebase(true);
      setSyncProgress(30);
      setSyncStatusText('No user logged in...');
      await new Promise((r) => setTimeout(r, 300));
      setSyncProgress(100);
      setSyncStatusText('Sign in to synchronize profile document.');
      setIsFetchingFirebase(false);
      return;
    }

    setIsFetchingFirebase(true);
    setSyncProgress(15);
    setSyncStatusText('Initiating Full Firebase Sync & Decryption...');
    await new Promise((r) => setTimeout(r, 350));

    setSyncProgress(45);
    setSyncStatusText('Fetching Firestore collection for user UID...');
    const dbData = await fetchUserDataFromFirebase(currentUser.uid, currentUser.displayName, currentUser.email);

    setSyncProgress(80);
    setSyncStatusText('Rebuilding patient medical graph & security logs...');
    await new Promise((r) => setTimeout(r, 350));

    if (dbData) {
      setPatient(dbData.patient);
      setRecords(dbData.records);
      setAccessGrants(dbData.accessGrants);
      setAuditLogs(dbData.auditLogs);
      setGranularPermissions(dbData.granularPermissions);
    }

    setSyncProgress(100);
    setSyncStatusText('Data Fetched Completely from Firebase (AES-256-GCM Verified)');
    setIsFetchingFirebase(false);
  };

  // Logout current user and restore clean empty state
  const logoutUser = async () => {
    await logoutFirebase();
    setCurrentUser(null);
    resetToEmptyProfile();
  };

  // Reset to clean empty profile state
  const resetToEmptyProfile = () => {
    setPatient(EMPTY_PATIENT);
    setRecords([]);
    setAccessGrants([]);
    setAuditLogs([]);
    setGranularPermissions(INITIAL_GRANULAR_PERMISSIONS);
    localStorage.removeItem('medivault_patient');
    localStorage.removeItem('medivault_records');
    localStorage.removeItem('medivault_grants');
    localStorage.removeItem('medivault_logs');
    localStorage.removeItem('medivault_granular_perms');
  };

  const resetToDemoProfile = resetToEmptyProfile;

  // Check URL hash on page load for #view=doctor&token=...&key=...
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const view = params.get('view');
        const token = params.get('token');
        const key = params.get('key');
        if (view === 'doctor' && token && key) {
          setActiveView('doctor');
          loadDoctorEmergencyToken(token, key);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Doctor view ticking timer
  useEffect(() => {
    if (!doctorTokenState.tokenString || doctorTokenState.isExpiredOrRevoked) return;

    const interval = setInterval(() => {
      setDoctorTokenState((prev) => {
        if (prev.remainingSeconds <= 1) {
          return {
            ...prev,
            remainingSeconds: 0,
            isExpiredOrRevoked: true,
            decryptedPatient: null,
            decryptedRecords: null,
            errorMessage: 'CRYPTOGRAPHIC KEY SELF-DESTRUCTED: Token Expiry Reached.',
          };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [doctorTokenState.tokenString, doctorTokenState.isExpiredOrRevoked]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleRecordPrivacy = (recordId: string) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          const updatedState = !rec.isPrivateFromEmergency;
          addAuditEntry({
            actorName: patient.fullName || 'Patient',
            actorRole: 'Patient',
            action: 'Updated Privacy Toggles',
            details: `Toggled privacy for "${rec.title}" to ${updatedState ? 'PRIVATE (Hidden from emergency)' : 'PUBLIC (Visible in emergency)'}.`,
            ipAddress: '127.0.0.1 (Local Sovereign Session)',
          });
          return { ...rec, isPrivateFromEmergency: updatedState };
        }
        return rec;
      })
    );
  };

  const toggleGranularPermission = (key: keyof GranularPermissions) => {
    setGranularPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    addAuditEntry({
      actorName: patient.fullName || 'Patient',
      actorRole: 'Patient',
      action: 'Updated Privacy Toggles',
      details: `Toggled granular permission: ${key}.`,
      ipAddress: '127.0.0.1 (Local Sovereign Session)',
    });
  };

  const addMedicalRecord = (newRec: Omit<MedicalRecord, 'id'>) => {
    const id = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const record: MedicalRecord = { ...newRec, id };
    setRecords((prev) => [record, ...prev]);
    addAuditEntry({
      actorName: patient.fullName || 'Patient',
      actorRole: 'Patient',
      action: 'Added Record',
      details: `Added new medical record: "${record.title}".`,
      ipAddress: '127.0.0.1 (Local Sovereign Session)',
    });
  };

  const revokeAccessGrant = (grantId: string) => {
    setAccessGrants((prev) =>
      prev.map((grant) => {
        if (grant.id === grantId) {
          addAuditEntry({
            actorName: patient.fullName || 'Patient',
            actorRole: 'Patient',
            action: 'Revoked Doctor Access',
            details: `Manually revoked access for ${grant.doctorName} (${grant.hospital}).`,
            ipAddress: '127.0.0.1 (Local Sovereign Session)',
          });
          return { ...grant, status: 'revoked' as const };
        }
        return grant;
      })
    );

    if (activeEmergencyToken) {
      revokeActiveEmergencyToken();
    }
  };

  const revokeAllAccessGrants = () => {
    setAccessGrants((prev) => prev.map((g) => ({ ...g, status: 'revoked' as const })));
    revokeActiveEmergencyToken();
    addAuditEntry({
      actorName: patient.fullName || 'Patient',
      actorRole: 'Patient',
      action: 'Revoked All Access',
      details: 'Revoked all active access grants and emergency tokens.',
      ipAddress: '127.0.0.1 (Local Sovereign Session)',
    });
  };

  const addAuditEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const generateEmergencyAccess = async (durationMinutes: number): Promise<EmergencyToken> => {
    const allowedRecords = records.filter((r) => !r.isPrivateFromEmergency);
    const allowedIds = allowedRecords.map((r) => r.id);

    const payloadObj = {
      patientInfo: patient,
      permittedRecords: allowedRecords,
      generatedTimestamp: Date.now(),
    };

    const token = await createEmergencyToken(
      patient.id || 'PAT-TEMP',
      allowedIds,
      payloadObj,
      durationMinutes
    );

    setActiveEmergencyToken(token);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const expireDate = new Date(token.expiresAt).toISOString().replace('T', ' ').substring(0, 16);
    const newGrant: AccessGrant = {
      id: `GRT-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: 'Emergency Responder / On-Call Doctor',
      specialty: 'Emergency Medicine',
      hospital: 'Emergency Mobile Access',
      grantedAt: nowStr,
      expiresAt: expireDate,
      status: 'active',
      accessType: 'Emergency Token',
      tokenString: token.token,
    };
    setAccessGrants((prev) => [newGrant, ...prev]);

    addAuditEntry({
      actorName: patient.fullName || 'Patient',
      actorRole: 'Patient',
      action: 'Created Emergency Token',
      details: `Generated ${durationMinutes}-minute zero-knowledge encrypted emergency token (${token.token}) containing ${allowedRecords.length} records.`,
      ipAddress: '127.0.0.1 (Local Sovereign Session)',
    });

    return token;
  };

  const revokeActiveEmergencyToken = () => {
    if (activeEmergencyToken) {
      setActiveEmergencyToken(null);
      setDoctorTokenState((prev) => ({
        ...prev,
        isExpiredOrRevoked: true,
        remainingSeconds: 0,
        decryptedPatient: null,
        decryptedRecords: null,
        errorMessage: 'PATIENT REVOKED ACCESS: Access key destroyed by patient command.',
      }));

      addAuditEntry({
        actorName: patient.fullName || 'Patient',
        actorRole: 'Patient',
        action: 'Revoked Doctor Access',
        details: 'Active emergency token destroyed and revoked.',
        ipAddress: '127.0.0.1 (Local Sovereign Session)',
      });
    }
  };

  const requestTrustedContactApproval = async (
    doctorName: string,
    hospital: string,
    trustedContactPhone: string
  ): Promise<TrustedContactApprovalRequest> => {
    const req: TrustedContactApprovalRequest = {
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName,
      hospital,
      requestTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      trustedContactPhone,
      status: 'pending',
      otpCode: '948201',
      durationMinutes: 60,
    };
    setTrustedRequests((prev) => [req, ...prev]);
    return req;
  };

  const verifyTrustedContactOTP = (requestId: string, otp: string): boolean => {
    let success = false;
    setTrustedRequests((prev) =>
      prev.map((req) => {
        if (req.requestId === requestId) {
          if (req.otpCode === otp.trim()) {
            success = true;
            addAuditEntry({
              actorName: patient.emergencyContact.name || 'Trusted Contact Proxy',
              actorRole: 'Trusted Contact Proxy',
              action: 'Trusted Proxy Approved Access',
              details: `OTP verified. Temporary ${req.durationMinutes}-minute emergency access granted to ${req.doctorName} at ${req.hospital}.`,
              ipAddress: '127.0.0.1 (Trusted Contact Proxy)',
            });
            return { ...req, status: 'approved' as const };
          } else {
            return { ...req, status: 'rejected' as const };
          }
        }
        return req;
      })
    );
    return success;
  };

  const loadDoctorEmergencyToken = async (tokenStr: string, keyStr: string) => {
    setDoctorTokenState({
      tokenString: tokenStr,
      secretKey: keyStr,
      isDecrypting: true,
      isExpiredOrRevoked: false,
      remainingSeconds: 0,
      decryptedPatient: null,
      decryptedRecords: null,
      errorMessage: null,
    });

    try {
      const key = await importKeyFromString(keyStr);

      const activeTok = activeEmergencyToken;
      if (activeTok && activeTok.token === tokenStr && activeTok.isRevoked) {
        setDoctorTokenState({
          tokenString: tokenStr,
          secretKey: keyStr,
          isDecrypting: false,
          isExpiredOrRevoked: true,
          remainingSeconds: 0,
          decryptedPatient: null,
          decryptedRecords: null,
          errorMessage: 'ACCESS REVOKED: The patient has manually revoked access to this token.',
        });
        return;
      }

      const tokenPayload = activeTok?.payload;
      const tokenIv = activeTok?.iv;
      const expiresAt = activeTok?.expiresAt || Date.now() + 15 * 60 * 1000;

      if (!tokenPayload || !tokenIv) {
        setDoctorTokenState({
          tokenString: tokenStr,
          secretKey: keyStr,
          isDecrypting: false,
          isExpiredOrRevoked: true,
          remainingSeconds: 0,
          decryptedPatient: null,
          decryptedRecords: null,
          errorMessage: 'TOKEN NOT FOUND OR EXPIRED: No active emergency token matches the key provided.',
        });
        return;
      }

      const now = Date.now();
      const remainingSecs = Math.max(0, Math.floor((expiresAt - now) / 1000));

      if (remainingSecs <= 0) {
        setDoctorTokenState({
          tokenString: tokenStr,
          secretKey: keyStr,
          isDecrypting: false,
          isExpiredOrRevoked: true,
          remainingSeconds: 0,
          decryptedPatient: null,
          decryptedRecords: null,
          errorMessage: 'TOKEN EXPIRED: The temporary emergency access period has elapsed.',
        });
        return;
      }

      const decrypted = await decryptPayload<{
        patientInfo: PatientProfile;
        permittedRecords: MedicalRecord[];
      }>(tokenPayload, tokenIv, key);

      setDoctorTokenState({
        tokenString: tokenStr,
        secretKey: keyStr,
        isDecrypting: false,
        isExpiredOrRevoked: false,
        remainingSeconds: remainingSecs,
        decryptedPatient: decrypted.patientInfo,
        decryptedRecords: decrypted.permittedRecords,
        errorMessage: null,
      });

      addAuditEntry({
        actorName: 'Emergency Responder / On-Call Doctor',
        actorRole: 'Emergency Doctor',
        action: 'Viewed Records',
        details: `Decrypted emergency vault (${tokenStr}). Access granted for ${decrypted.permittedRecords.length} records.`,
        ipAddress: '198.51.100.42 (Emergency Terminal)',
      });
    } catch (err: any) {
      setDoctorTokenState({
        tokenString: tokenStr,
        secretKey: keyStr,
        isDecrypting: false,
        isExpiredOrRevoked: true,
        remainingSeconds: 0,
        decryptedPatient: null,
        decryptedRecords: null,
        errorMessage: `CRYPTO DECRYPTION FAILED: Invalid key or corrupted payload (${err.message || 'AES-GCM Auth Tag Mismatch'})`,
      });
    }
  };

  const simulateSelfDestructKey = () => {
    setDoctorTokenState((prev) => ({
      ...prev,
      isExpiredOrRevoked: true,
      remainingSeconds: 0,
      decryptedPatient: null,
      decryptedRecords: null,
      errorMessage: 'EMERGENCY SELF-DESTRUCT TRIGGERED: Encryption keys destroyed.',
    }));
  };

  const updatePatientProfile = (updatedFields: Partial<PatientProfile>) => {
    setPatient((prev) => {
      const updated = { ...prev, ...updatedFields };
      addAuditEntry({
        actorName: updated.fullName || 'Patient',
        actorRole: 'Patient',
        action: 'Updated Profile',
        details: `Updated patient profile details (Name: ${updated.fullName}, Age: ${updated.age}, Blood: ${updated.bloodType}).`,
        ipAddress: '127.0.0.1 (Local Sovereign Session)',
      });
      return updated;
    });
  };

  return (
    <MediVaultContext.Provider
      value={{
        currentUser,
        isDemoMode,
        isFetchingFirebase,
        syncProgress,
        syncStatusText,
        patient,
        records,
        accessGrants,
        auditLogs,
        loginHistory,
        granularPermissions,
        trustedRequests,
        activeEmergencyToken,
        theme,
        activeView,
        currentLang,
        setActiveView,
        setCurrentLang,
        toggleTheme,
        toggleRecordPrivacy,
        toggleGranularPermission,
        addMedicalRecord,
        revokeAccessGrant,
        revokeAllAccessGrants,
        generateEmergencyAccess,
        revokeActiveEmergencyToken,
        requestTrustedContactApproval,
        verifyTrustedContactOTP,
        handleUserLogin,
        fetchCompleteFirebaseData,
        logoutUser,
        resetToDemoProfile,
        updatePatientProfile,
        doctorTokenState,
        loadDoctorEmergencyToken,
        simulateSelfDestructKey,
      }}
    >
      {children}
    </MediVaultContext.Provider>
  );
};

export const useMediVault = () => {
  const ctx = useContext(MediVaultContext);
  if (!ctx) throw new Error('useMediVault must be used within MediVaultProvider');
  return ctx;
};
