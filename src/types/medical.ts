export type RecordCategory = 
  | 'Prescription' 
  | 'Blood Report' 
  | 'X-ray' 
  | 'MRI' 
  | 'CT Scan' 
  | 'ECG' 
  | 'Vaccination Record' 
  | 'Diagnosis' 
  | 'Lab Result' 
  | 'Surgery' 
  | 'Mental Health';

export interface PrescribedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  doctor: string;
  hospital: string;
  startDate: string;
  status: 'Active' | 'Completed' | 'Discontinued';
}

export interface MedicalRecord {
  id: string;
  title: string;
  category: RecordCategory;
  date: string;
  diagnosingDoctor: string;
  doctorSpecialty: string;
  hospitalClinic: string;
  diagnosisDetails: string;
  medicines: PrescribedMedicine[];
  notes?: string;
  tags: string[];
  isPrivateFromEmergency: boolean; // Granular permission toggle per record
  fileUrl?: string;
  fileSize?: string;
  encryptedDataHash?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
  reaction: string;
}

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedYear: string;
  status: 'Active' | 'Managed' | 'In Remission';
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isTrustedProxy: boolean;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  age: number;
  dob: string;
  gender: string;
  bloodType: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: EmergencyContact;
  trustedContacts: EmergencyContact[];
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  joinedDate: string;
}

export interface GranularPermissions {
  bloodGroup: boolean;
  allergies: boolean;
  currentMedicines: boolean;
  chronicDiseases: boolean;
  labReports: boolean;
  prescriptions: boolean;
  imagingReports: boolean;
  vaccinationHistory: boolean;
  surgeryHistory: boolean;
  mentalHealthRecords: boolean;
}

export interface AccessGrant {
  id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  grantedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  accessType: 'Emergency Token' | 'Direct Doctor Access' | 'Hospital Portal' | 'Trusted Proxy Grant';
  tokenString?: string;
}

export interface EmergencyToken {
  token: string;
  secretKey: string;
  createdAt: number; // Unix timestamp ms
  expiresAt: number; // Unix timestamp ms
  durationMinutes: number;
  patientId: string;
  permittedRecordIds: string[];
  payload: string; // Encrypted JSON payload (AES-256-GCM)
  iv: string; // Initialization vector base64
  isRevoked: boolean;
}

export interface TrustedContactApprovalRequest {
  requestId: string;
  doctorName: string;
  hospital: string;
  requestTimestamp: string;
  trustedContactPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  otpCode: string;
  durationMinutes: number;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  status: 'Success' | 'Failed Warning';
  isCurrentSession: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: 'Patient' | 'Emergency Doctor' | 'Cardiologist' | 'Primary Care Physician' | 'Trusted Contact Proxy';
  action: 'Created Emergency Token' | 'Viewed Records' | 'Revoked Doctor Access' | 'Updated Privacy Toggles' | 'Added Record' | 'Trusted Proxy Approved Access' | 'Revoked All Access' | 'Updated Profile';
  details: string;
  ipAddress: string;
}
