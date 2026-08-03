import {
  PatientProfile,
  MedicalRecord,
  AccessGrant,
  AuditLogEntry,
  LoginHistoryEntry,
  GranularPermissions,
} from '../types/medical';

export const EMPTY_PATIENT: PatientProfile = {
  id: '',
  fullName: '',
  age: 0,
  dob: '',
  gender: '',
  bloodType: '',
  email: '',
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
  joinedDate: '',
};

export const INITIAL_PATIENT: PatientProfile = EMPTY_PATIENT;

export const INITIAL_GRANULAR_PERMISSIONS: GranularPermissions = {
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

export const INITIAL_RECORDS: MedicalRecord[] = [];

export const INITIAL_GRANTS: AccessGrant[] = [];

export const INITIAL_LOGIN_HISTORY: LoginHistoryEntry[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
