export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  status: 'active' | 'stopped' | 'completed';
  facility: string;
  prescriber: string;
  category: string;
}

export interface Problem {
  id: string;
  name: string;
  icd11: string;
  status: 'active' | 'resolved' | 'chronic';
  diagnosedDate: string;
  facility: string;
  severity: string;
}

export interface Allergy {
  id: string;
  substance: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  reaction: string;
  documentedDate: string;
  facility: string;
}

export interface LabResult {
  id: string;
  name: string;
  loinc: string;
  value: string;
  unit: string;
  refRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
  date: string;
  facility: string;
  category: string;
}

export interface RadiologyStudy {
  id: string;
  modality: string;
  bodyPart: string;
  studyDate: string;
  facility: string;
  findings: string;
  impression: string;
  radiologist: string;
  status: 'preliminary' | 'final' | 'verified';
}

export interface PrescribedMed {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
}

export interface VitalSigns {
  bp: string;
  hr: string;
  temp: string;
  rr: string;
  spo2: string;
}

export interface Surgery {
  id: string;
  name: string;
  date: string;
  facility: string;
  surgeon: string;
  outcome: string;
  notes: string;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  anesthesia: string;
  procedureDetails: string;
  dischargeSummary: string;
  dischargeMeds: PrescribedMed[];
  complications: string;
  followUp: string;
}

export interface Visit {
  id: string;
  date: string;
  facility: string;
  department: string;
  reason: string;
  diagnosis: string;
  type: 'outpatient' | 'inpatient' | 'emergency' | 'icu';
  complaint: string;
  vitalSigns: VitalSigns;
  examination: string;
  prescribedMeds: PrescribedMed[];
  investigation: string;
  plan: string;
  admissionDate?: string;
  dischargeDate?: string;
  dischargeSummary?: string;
  dischargeMeds?: PrescribedMed[];
  duration?: string;
  attendingPhysician: string;
}

export interface Facility {
  id: string;
  name: string;
  shortName: string;
  recordCount: number;
  color: string;
}

export interface TimelineEra {
  year: string;
  visits: number;
  label: string;
  summary: string;
  isSpike: boolean;
  hba1c: number;
}

export interface AllergyFormData {
  substance: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  reaction: string;
}
