export type UserRole = 'patient' | 'doctor' | 'secretary' | 'nurse' | 'hospital' | 'admin';

export interface User {
  id: string;
  patient_code?: string;
  full_name: string;
  phone: string;
  date_of_birth?: string;
  age?: number;
  gender?: 'male' | 'female';
  blood_type?: string;
  chronic_diseases?: string[];
  allergies?: string[];
  drug_allergies?: string[];
  weight?: number;
  height?: number;
  city?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  auth_id?: string;
  created_at?: string;
}

export interface Doctor {
  id: string;
  full_name: string;
  phone?: string;
  specialty?: string;
  license_number?: string;
  clinic_name?: string;
  clinic_id?: string;
  available?: boolean;
  is_available?: boolean;
  is_active?: boolean;
  auth_id?: string;
  created_at?: string;
  specialization_id?: string;
  specialization?: { id?: string; name_ar?: string; name_en?: string };
  // Extended fields used in booking/search
  average_consultation_time?: number;
  rating?: number;
  price?: number;
  consultation_fee?: number;
  total_reviews?: number;
  working_days?: string[];
  working_hours?: any;
  bio?: string;
  experience_years?: number;
  education?: string;
  about?: string;
  clinic?: {
    id?: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    working_hours?: any;
    is_active?: boolean;
  };
  queue_info?: {
    current_queue: number;
    estimated_wait: number;
  };
}

export interface Specialization {
  id: string;
  name_ar: string;
  name_en?: string;
  icon?: string;
}

export interface Secretary {
  id: string;
  full_name: string;
  phone: string;
  doctor_id?: string;
  auth_id?: string;
  created_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  emergency_phone?: string;
  latitude: number;
  longitude: number;
  services?: string[];
  is_active?: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  working_hours?: { start: string; end: string } | string;
  delivery_available?: boolean;
  is_active?: boolean;
}

export interface NursingService {
  id: string;
  nurse_name: string;
  phone: string;
  service_type: string;
  service_name: string;
  description?: string;
  price: number;
  latitude: number;
  longitude: number;
  service_radius_km?: number;
  is_available?: boolean;
}

export interface Medication {
  id: string;
  name_ar: string;
  name_en: string;
  generic_name?: string;
  description?: string;
  indications?: string[];
  contraindications?: string[];
  side_effects?: string[];
  dosage_adult?: string;
  dosage_pediatric?: string;
  dosage_elderly?: string;
  pregnancy_safe?: boolean;
  breastfeeding_safe?: boolean;
  controlled?: boolean;
  requires_prescription?: boolean;
  drug_interactions?: string[];
}

export interface MedicationReminder {
  id: string;
  patient_id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  days_of_week?: number[];
  notes?: string;
  is_active?: boolean;
}

export interface Conversation {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  status?: string;
  expires_at?: string;
  closed_at?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_id: string;
  message?: string;
  content?: string;
  attachments?: any[];
  is_read?: boolean;
  created_at?: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  profile: User | Doctor | Secretary;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id?: string;
  appointment_date: string;
  estimated_time: string;
  type?: string;
  status: string;
  symptoms?: string;
  notes?: string;
  queue_number?: number;
  is_emergency?: boolean;
  payment_status?: string;
  payment_amount?: number;
  completed_at?: string;
  created_at: string;
  doctor?: Doctor;
  clinic?: any;
}

export interface QueueItem {
  id: string;
  patient_id: string;
  doctor_id?: string;
  clinic_id?: string;
  queue_number: number;
  status: string;
  patient_name?: string;
  patient_phone?: string;
  symptoms?: string;
  is_emergency?: boolean;
  estimated_time?: string;
  created_at: string;
}
