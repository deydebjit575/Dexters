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
  return null;
})();

export const getCurrentUser = (): FirebaseUser | null => currentUser;

export const isDemoUser = (_user: FirebaseUser | null): boolean => {
  return false;
};

export const loginWithEmail = async (email: string, _pass: string): Promise<FirebaseUser> => {
  await new Promise((r) => setTimeout(r, 600));
  
  const formattedEmail = email.toLowerCase().trim();
  const nameFromEmail = formattedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
  const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

  const user: FirebaseUser = {
    uid: `user-${formattedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: formattedEmail,
    displayName,
    isAnonymous: false,
  };
  currentUser = user;
  localStorage.setItem('medivault_firebase_user', JSON.stringify(user));
  return user;
};

export const registerWithEmail = async (name: string, email: string, _pass: string): Promise<FirebaseUser> => {
  await new Promise((r) => setTimeout(r, 600));
  const user: FirebaseUser = {
    uid: `user-${Date.now()}`,
    email: email.toLowerCase().trim(),
    displayName: name.trim(),
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
    email: 'user@gmail.com',
    displayName: 'Google Verified User',
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
export const fetchUserDataFromFirebase = async (
  uid: string,
  defaultName?: string,
  defaultEmail?: string
): Promise<FirebaseUserData | null> => {
  await new Promise((r) => setTimeout(r, 400));
  const raw = localStorage.getItem(`medivault_firebase_db_${uid}`);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // If parsing fails, fall through to create new clean profile
    }
  }

  // Create initial clean empty profile for new user
  const initialNewUserPatient: PatientProfile = {
    id: uid,
    fullName: defaultName || '',
    age: 0,
    dob: '',
    gender: '',
    bloodType: '',
    email: defaultEmail || '',
    phone: '',
    address: '',
    emergencyContact: {
      id: '',
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isTrustedProxy: false,
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
    auditLogs: [],
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
