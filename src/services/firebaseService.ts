import { PatientProfile, MedicalRecord, AccessGrant, AuditLogEntry, GranularPermissions } from '../types/medical';
import { WellnessRecord } from '../types/energy';

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
  wellnessRecords?: WellnessRecord[];
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

// User Accounts Registry Simulator (Stores registered user accounts persistently across logins)
const getUserAccountsRegistry = (): Record<string, FirebaseUser> => {
  try {
    const raw = localStorage.getItem('medivault_user_accounts');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveUserToRegistry = (user: FirebaseUser): void => {
  try {
    const registry = getUserAccountsRegistry();
    registry[user.email.toLowerCase().trim()] = user;
    localStorage.setItem('medivault_user_accounts', JSON.stringify(registry));
  } catch {}
};

export const getCurrentUser = (): FirebaseUser | null => currentUser;

export const isDemoUser = (_user: FirebaseUser | null): boolean => {
  return false;
};

export const loginWithEmail = async (email: string, _pass: string): Promise<FirebaseUser> => {
  await new Promise((r) => setTimeout(r, 600));

  const formattedEmail = email.toLowerCase().trim();
  const uid = `user-${formattedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

  let displayName = '';

  // 1. Check active session user
  const savedUser = localStorage.getItem('medivault_firebase_user');
  if (savedUser) {
    try {
      const parsed: FirebaseUser = JSON.parse(savedUser);
      if (parsed.email === formattedEmail && parsed.displayName) {
        displayName = parsed.displayName;
      }
    } catch {}
  }

  // 2. Check persistent user accounts registry
  if (!displayName) {
    const registry = getUserAccountsRegistry();
    if (registry[formattedEmail]?.displayName) {
      displayName = registry[formattedEmail].displayName;
    }
  }

  // 3. Check Firestore DB for saved patient profile full name
  const rawDb = localStorage.getItem(`medivault_firebase_db_${uid}`);
  if (rawDb) {
    try {
      const parsedDb: FirebaseUserData = JSON.parse(rawDb);
      if (parsedDb.patient?.fullName && parsedDb.patient.fullName.trim() !== '') {
        displayName = parsedDb.patient.fullName.trim();
      }
    } catch {}
  }

  // 4. Fallback: derive from email prefix only if no registered name exists anywhere
  if (!displayName) {
    const nameFromEmail = formattedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
  }

  const user: FirebaseUser = {
    uid,
    email: formattedEmail,
    displayName,
    isAnonymous: false,
  };
  currentUser = user;
  saveUserToRegistry(user);
  localStorage.setItem('medivault_firebase_user', JSON.stringify(user));
  return user;
};

export const registerWithEmail = async (name: string, email: string, _pass: string): Promise<FirebaseUser> => {
  await new Promise((r) => setTimeout(r, 600));
  const formattedEmail = email.toLowerCase().trim();
  const displayName = name.trim();
  const uid = `user-${formattedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const user: FirebaseUser = {
    uid,
    email: formattedEmail,
    displayName,
    isAnonymous: false,
  };
  currentUser = user;
  saveUserToRegistry(user);
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
      const data: FirebaseUserData = JSON.parse(raw);
      if (!data.patient.id) data.patient.id = uid;
      if (defaultEmail && !data.patient.email) data.patient.email = defaultEmail;
      if (defaultName && (!data.patient.fullName || data.patient.fullName.trim() === '')) {
        data.patient.fullName = defaultName;
      }
      return data;
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

/**
 * Firestore DB Simulator: Save user-specific wellness assessment record
 */
export const saveWellnessRecordToFirestore = async (uid: string, record: WellnessRecord): Promise<void> => {
  try {
    const raw = localStorage.getItem(`medivault_firebase_db_${uid}`);
    let dbData: FirebaseUserData;
    if (raw) {
      dbData = JSON.parse(raw);
    } else {
      const fetched = await fetchUserDataFromFirebase(uid);
      dbData = fetched || {
        patient: { id: uid } as any,
        records: [],
        accessGrants: [],
        auditLogs: [],
        granularPermissions: {} as any,
      };
    }

    const currentRecords = dbData.wellnessRecords || [];
    // Keep most recent first, prevent duplicates
    const updated = [record, ...currentRecords.filter((r) => r.id !== record.id)];
    dbData.wellnessRecords = updated;

    saveUserDataToFirebase(uid, dbData);
    // Also save to dedicated key for fallback fast retrieval
    localStorage.setItem(`medivault_wellness_history_${uid}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save wellness record to Firestore simulator:', err);
  }
};

/**
 * Firestore DB Simulator: Fetch user-specific wellness assessment history
 */
export const fetchWellnessHistoryFromFirestore = async (uid: string): Promise<WellnessRecord[]> => {
  try {
    const rawDb = localStorage.getItem(`medivault_firebase_db_${uid}`);
    if (rawDb) {
      const dbData: FirebaseUserData = JSON.parse(rawDb);
      if (Array.isArray(dbData.wellnessRecords) && dbData.wellnessRecords.length > 0) {
        return dbData.wellnessRecords;
      }
    }
    const rawFallback = localStorage.getItem(`medivault_wellness_history_${uid}`);
    if (rawFallback) {
      return JSON.parse(rawFallback);
    }
  } catch (err) {
    console.error('Failed to fetch wellness history from Firestore simulator:', err);
  }
  return [];
};

