export type Gender = 'male' | 'female';

export type PaymentMethod = 'wallet' | 'cash';

export type PatientStatus = 'waiting' | 'in_consultation' | 'done' | 'postponed';

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  paymentMethod: PaymentMethod;
  vitals?: Vitals;
  createdAt: number;
}

export interface Vitals {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulse?: number;
  glucose?: number;
  temp?: number;
  weight?: number;
  takenAt: number;
}

export type DoctorStatus = 'active' | 'break';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  badge: string;
  status: DoctorStatus;
}

export interface QueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  token: number;
  doctorId: string;
  status: PatientStatus;
  paymentMethod: PaymentMethod;
  createdAt: number;
  consultationStartedAt?: number;
  completedAt?: number;
}

export type LabPriority = 'normal' | 'stat';

export type LabOrderStatus = 'pending' | 'in_progress' | 'completed';

export interface LabTest {
  id: string;
  name: string;
  arabicName: string;
  loinc?: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  panicHigh?: number;
  panicLow?: number;
  result?: string;
  status: 'pending' | 'entered' | 'completed';
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  referringDoctor: string;
  clinic: string;
  priority: LabPriority;
  status: LabOrderStatus;
  tests: LabTest[];
  createdAt: number;
  completedAt?: number;
  reportAttached?: boolean;
}

export type PrescriptionStatus = 'pending' | 'partial' | 'dispensed';

export interface DrugItem {
  id: string;
  genericName: string;
  brandName: string;
  arabicName: string;
  form: string;
  strength: string;
  dose: string;
  brandOptions: { name: string; manufacturer: string }[];
  selectedBrand?: string;
  dispensed: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  prescribingDoctor: string;
  doctorLicense: string;
  createdAt: number;
  status: PrescriptionStatus;
  drugs: DrugItem[];
  interactionCheck: boolean;
  allergyCheck: boolean;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export type ScreenId = 'reception' | 'lab' | 'pharmacy';

export interface ModalState {
  type: 'new-patient' | 'vitals' | 'stickers' | null;
  payload?: unknown;
}
