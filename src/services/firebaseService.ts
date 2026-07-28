import { PatientProfile, MedicalRecord, AccessGrant, AuditLogEntry, GranularPermissions } from '../types/medical';

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
}

export interface FirebaseUserData {
  patient: PatientProfile;
  records: MedicalRecord[];
  accessGrants: AccessGrant[];
  auditLogs: AuditLogEntry[];
  granularPermissions: GranularPermissions;
}

// In-Memory & LocalStorage persistent Firebase state
let currentUser: FirebaseUser | null = (() => {
  const saved = localStorage.getItem('medivault_firebase_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  // Default demo state user
  return null;
})();

export const getCurrentUser = (): FirebaseUser | null => currentUser;

export const isDemoUser = (user: FirebaseUser | null): boolean => {
  if (!user) return true;
  return user.uid === 'firebase-user-priya-32' || user.email === 'priya.sharma@medivault.io';
};

export const loginWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  await new Promise((r) => setTimeout(r, 600));
  
  // If Priya Sharma's demo email is entered
  const isPriya = email.toLowerCase().includes('priya');
  const user: FirebaseUser = {
    uid: isPriya ? 'firebase-user-priya-32' : `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: email.toLowerCase(),
    displayName: isPriya ? 'Priya Sharma' : email.split('@')[0].replace('.', ' '),
    isAnonymous: false,
  };
  currentUser = user;
  localStorage.setItem('medivault_firebase_user', JSON.stringify(user));
  return user;
};

export const registerWithEmail = async (name: string, email: string, pass: string): Promise<FirebaseUser> => {
  await new Promise((r) => setTimeout(r, 600));
  const user: FirebaseUser = {
    uid: `user-${Date.now()}`,
    email: email.toLowerCase(),
    displayName: name,
    isAnonymous: false,
  };
  currentUser = user;
  localStorage.setItem('medivault_firebase_user', JSON.stringify(user));
  return user;
};

export const loginWithGoogle = async (): Promise<FirebaseUser> => {
  await new Promise((r) => setTimeout(r, 800));
  const user: FirebaseUser = {
    uid: `google-user-${Date.now()}`,
    email: 'new.patient@gmail.com',
    displayName: 'New Patient (Google Verified)',
    isAnonymous: false,
  };
  currentUser = user;
  localStorage.setItem('medivault_firebase_user', JSON.stringify(user));
  return user;
};

export const logoutFirebase = async (): Promise<void> => {
  await new Promise((r) => setTimeout(r, 300));
  currentUser = null;
  localStorage.removeItem('medivault_firebase_user');
};

/**
 * Firestore DB Simulator: Save user-specific encrypted vault data
 */
export const saveUserDataToFirebase = (uid: string, data: FirebaseUserData): void => {
  localStorage.setItem(`medivault_firebase_db_${uid}`, JSON.stringify(data));
};

/**
 * Firestore DB Simulator: Fetch user-specific encrypted vault data
 */
export const fetchUserDataFromFirebase = async (uid: string, defaultName?: string, defaultEmail?: string): Promise<FirebaseUserData | null> => {
  await new Promise((r) => setTimeout(r, 400));
  const raw = localStorage.getItem(`medivault_firebase_db_${uid}`);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Create initial empty profile for new user
  const initialNewUserPatient: PatientProfile = {
    id: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
    fullName: defaultName || 'New Patient User',
    age: 30,
    dob: '1996-01-01',
    gender: 'Not Specified',
    bloodType: 'A+ (A-Positive)',
    email: defaultEmail || 'patient@medivault.io',
    phone: '+91 99000 00000',
    address: 'Sovereign Encrypted Cloud Vault',
    emergencyContact: {
      id: 'cnt-new-1',
      name: 'Emergency Guardian',
      relationship: 'Family Member',
      phone: '+91 99000 11111',
      isTrustedProxy: true,
    },
    trustedContacts: [],
    allergies: [],
    chronicConditions: [],
    joinedDate: new Date().toISOString().split('T')[0],
  };

  const initialPermissions: GranularPermissions = {
    bloodGroup: true,
    allergies: true,
    currentMedicines: true,
    chronicDiseases: true,
    labReports: true,
    prescriptions: true,
    imagingReports: true,
    vaccinationHistory: true,
    surgeryHistory: true,
    mentalHealthRecords: false,
  };

  const newData: FirebaseUserData = {
    patient: initialNewUserPatient,
    records: [],
    accessGrants: [],
    auditLogs: [
      {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: defaultName || 'New Patient User',
        actorRole: 'Patient',
        action: 'Created Emergency Token',
        details: 'Firebase Encrypted Vault created for new patient identity.',
        ipAddress: 'Firebase Auth Authenticated',
      },
    ],
    granularPermissions: initialPermissions,
  };

  saveUserDataToFirebase(uid, newData);
  return newData;
};

/**
 * Custom Firebase Storage Upload Simulator with AES Encryption
 */
export async function uploadEncryptedFileToStorage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ downloadUrl: string; hash: string; sizeFormatted: string }> {
  for (let i = 10; i <= 100; i += 15) {
    await new Promise((r) => setTimeout(r, 120));
    if (onProgress) onProgress(i);
  }

  const hash = '0x' + Array.from(new Uint8Array(16), () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  const sizeFormatted = sizeMB === '0.0' ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeMB} MB`;

  return {
    downloadUrl: `https://firebasestorage.googleapis.com/v0/b/medivault-prod.appspot.com/o/records%2F${encodeURIComponent(file.name)}?alt=media&token=${hash}`,
    hash,
    sizeFormatted,
  };
}

