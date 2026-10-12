import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Doctor, LabOrder, Patient, Prescription, QueueEntry, ScreenId, Toast, ToastType, Vitals } from './types';
import { playAlert, playCall, playSuccess } from './utils/sound';
import { uuid } from './utils/format';

const now = Date.now();

export const initialDoctors: Doctor[] = [
  { id: 'd1', name: 'د. سامي النجار', specialty: 'أمراض القلب والباطنية', badge: 'استشاري معتمد', status: 'active' },
  { id: 'd2', name: 'د. نجيب المتوكل', specialty: 'جراحة العظام والمفاصل', badge: 'أخصائي', status: 'active' },
  { id: 'd3', name: 'د. إلهام الشامي', specialty: 'النساء والولادة', badge: 'استراحة مؤقتة', status: 'break' },
];

const patients: Patient[] = [
  { id: 'p1', mrn: '10-0942-882', name: 'عبدالكريم ناصر الحيمي', phone: '777 421 906', age: 54, gender: 'male', paymentMethod: 'wallet', createdAt: now - 5 * 60000 },
  { id: 'p2', mrn: '10-1178-431', name: 'فاطمة علي القاسمي', phone: '733 882 145', age: 31, gender: 'female', paymentMethod: 'cash', createdAt: now - 11 * 60000 },
  { id: 'p3', mrn: '10-2041-627', name: 'محمد يحيى المقطري', phone: '771 309 622', age: 42, gender: 'male', paymentMethod: 'wallet', createdAt: now - 18 * 60000 },
  { id: 'p4', mrn: '10-3389-106', name: 'سمية أحمد الجوفي', phone: '739 114 508', age: 28, gender: 'female', paymentMethod: 'wallet', createdAt: now - 23 * 60000 },
  { id: 'p5', mrn: '10-4412-790', name: 'أحمد صالح باحارثة', phone: '775 663 412', age: 67, gender: 'male', paymentMethod: 'cash', createdAt: now - 29 * 60000 },
  { id: 'p6', mrn: '10-5098-334', name: 'نورهان عبدالسلام', phone: '738 209 775', age: 25, gender: 'female', paymentMethod: 'cash', createdAt: now - 35 * 60000 },
  { id: 'p7', mrn: '10-6720-881', name: 'حسن عبدالله الوادعي', phone: '777 812 004', age: 59, gender: 'male', paymentMethod: 'wallet', createdAt: now - 42 * 60000 },
];

const queue: QueueEntry[] = [
  { id: 'q1', patientId: 'p1', patientName: patients[0].name, mrn: patients[0].mrn, token: 142, doctorId: 'd1', status: 'waiting', paymentMethod: 'wallet', createdAt: now - 5 * 60000 },
  { id: 'q2', patientId: 'p3', patientName: patients[2].name, mrn: patients[2].mrn, token: 144, doctorId: 'd1', status: 'waiting', paymentMethod: 'wallet', createdAt: now - 18 * 60000 },
  { id: 'q3', patientId: 'p5', patientName: patients[4].name, mrn: patients[4].mrn, token: 146, doctorId: 'd1', status: 'waiting', paymentMethod: 'cash', createdAt: now - 29 * 60000 },
  { id: 'q4', patientId: 'p2', patientName: patients[1].name, mrn: patients[1].mrn, token: 89, doctorId: 'd2', status: 'waiting', paymentMethod: 'cash', createdAt: now - 11 * 60000 },
  { id: 'q5', patientId: 'p7', patientName: patients[6].name, mrn: patients[6].mrn, token: 91, doctorId: 'd2', status: 'waiting', paymentMethod: 'wallet', createdAt: now - 42 * 60000 },
  { id: 'q6', patientId: 'p4', patientName: patients[3].name, mrn: patients[3].mrn, token: 57, doctorId: 'd3', status: 'waiting', paymentMethod: 'wallet', createdAt: now - 23 * 60000 },
  { id: 'q7', patientId: 'p6', patientName: patients[5].name, mrn: patients[5].mrn, token: 59, doctorId: 'd3', status: 'waiting', paymentMethod: 'cash', createdAt: now - 35 * 60000 },
];

const labOrders: LabOrder[] = [
  { id: 'l1', patientId: 'p1', patientName: patients[0].name, mrn: patients[0].mrn, age: 54, referringDoctor: initialDoctors[0].name, clinic: 'عيادة الباطنية والقلب', priority: 'stat', status: 'pending', createdAt: now - 5 * 60000, tests: [
    { id: 't1', name: 'Serum Creatinine', arabicName: 'كرياتينين المصل', loinc: '2160-0', unit: 'mg/dL', normalMin: .7, normalMax: 1.3, status: 'pending' },
    { id: 't2', name: 'Blood Urea Nitrogen (BUN)', arabicName: 'نيتروجين اليوريا في الدم', unit: 'mg/dL', normalMin: 7, normalMax: 20, status: 'pending' },
    { id: 't3', name: 'Potassium (K+)', arabicName: 'البوتاسيوم', loinc: '2823-3', unit: 'mmol/L', normalMin: 3.5, normalMax: 5.1, panicHigh: 6.2, status: 'pending' },
    { id: 't4', name: 'Sodium (Na+)', arabicName: 'الصوديوم', unit: 'mmol/L', normalMin: 135, normalMax: 145, status: 'pending' },
  ] },
  { id: 'l2', patientId: 'p3', patientName: patients[2].name, mrn: patients[2].mrn, age: 42, referringDoctor: initialDoctors[0].name, clinic: 'عيادة الباطنية والقلب', priority: 'normal', status: 'pending', createdAt: now - 18 * 60000, tests: [
    { id: 't5', name: 'Complete Blood Count', arabicName: 'صورة الدم الكاملة', unit: 'cells/µL', normalMin: 4, normalMax: 11, status: 'pending' },
    { id: 't6', name: 'Fasting Glucose', arabicName: 'سكر الدم الصائم', unit: 'mg/dL', normalMin: 70, normalMax: 100, status: 'pending' },
  ] },
  { id: 'l3', patientId: 'p5', patientName: patients[4].name, mrn: patients[4].mrn, age: 67, referringDoctor: initialDoctors[1].name, clinic: 'عيادة العظام والمفاصل', priority: 'normal', status: 'pending', createdAt: now - 29 * 60000, tests: [
    { id: 't7', name: 'Vitamin D', arabicName: 'فيتامين د', unit: 'ng/mL', normalMin: 30, normalMax: 100, status: 'pending' },
  ] },
];

const prescriptions: Prescription[] = [{
  id: 'rx1', patientId: 'p1', patientName: patients[0].name, mrn: patients[0].mrn, age: 54, prescribingDoctor: initialDoctors[0].name, doctorLicense: '1408-ص', createdAt: now - 12 * 60000, status: 'pending', interactionCheck: true, allergyCheck: true, drugs: [
    { id: 'drug1', genericName: 'Amoxicillin/Clavulanic Acid', brandName: 'Augmentin', arabicName: 'أوجمنتين', form: 'Tab', strength: '1g', dose: 'قرص كل 12 ساعة لمدة 7 أيام', brandOptions: [{ name: 'Augmentin 1g', manufacturer: 'GSK' }, { name: 'Curam 1g', manufacturer: 'Sandoz' }, { name: 'Klavox 1g', manufacturer: 'Spimaco' }], selectedBrand: 'Augmentin 1g', dispensed: false },
    { id: 'drug2', genericName: 'Paracetamol', brandName: 'Panadol', arabicName: 'بنادول', form: 'Tab', strength: '500mg', dose: 'قرصين عند اللزوم / الحرارة', brandOptions: [{ name: 'Panadol Blue', manufacturer: 'GSK' }, { name: 'Fevadol', manufacturer: 'Jamjoom' }], selectedBrand: 'Panadol Blue', dispensed: false },
    { id: 'drug3', genericName: 'Omeprazole', brandName: 'Omez', arabicName: 'أوميبرازول', form: 'Cap', strength: '20mg', dose: 'كبسولة واحدة قبل الإفطار بنصف ساعة', brandOptions: [{ name: 'Omez 20mg', manufacturer: 'Dr. Reddy\'s' }, { name: 'Losec 20mg', manufacturer: 'AstraZeneca' }], selectedBrand: 'Omez 20mg', dispensed: false },
  ],
}];

type Store = {
  patients: Patient[]; queue: QueueEntry[]; labOrders: LabOrder[]; prescriptions: Prescription[]; activeScreen: ScreenId; toasts: Toast[];
  doctors: Doctor[]; activeDoctorId: string | null;
  setActiveScreen: (screen: ScreenId) => void; addToast: (message: string, type?: ToastType) => void; removeToast: (id: string) => void;
  addPatient: (data: Pick<Patient, 'name' | 'phone' | 'age' | 'gender'>, doctorId?: string) => Patient; callPatient: (id: string) => void; postponePatient: (id: string) => void; saveVitals: (patientId: string, vitals: Vitals) => void;
  updateLabResult: (orderId: string, testId: string, value: string) => void; completeLab: (orderId: string) => void; updateDrugBrand: (rxId: string, drugId: string, brand: string) => void; dispensePrescription: (rxId: string, partial: boolean) => void;
  addDoctor: (data: Pick<Doctor, 'name' | 'specialty'>) => void; removeDoctor: (id: string) => void; setActiveDoctorId: (id: string | null) => void; toggleDoctorBreak: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, initialScreen }: { children: ReactNode; initialScreen?: ScreenId }) {
  const [patientData, setPatientData] = useState(patients);
  const [queueData, setQueueData] = useState(queue);
  const [labData, setLabData] = useState(labOrders);
  const [rxData, setRxData] = useState(prescriptions);
  const [doctorData, setDoctorData] = useState<Doctor[]>(initialDoctors);
  const [activeDoctorId, setActiveDoctorId] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenId>(initialScreen ?? 'reception');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = uuid();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const addPatient = useCallback((data: Pick<Patient, 'name' | 'phone' | 'age' | 'gender'>, doctorId?: string) => {
    const patient: Patient = { ...data, id: uuid(), mrn: `10-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(100 + Math.random() * 899)}`, paymentMethod: 'cash', createdAt: Date.now() };
    setPatientData((prev) => [patient, ...prev]);
    setQueueData((prev) => [...prev, { id: uuid(), patientId: patient.id, patientName: patient.name, mrn: patient.mrn, token: 150 + prev.length, doctorId: doctorId || 'd1', status: 'waiting', paymentMethod: 'cash', createdAt: Date.now() }]);
    playSuccess();
    addToast(`تم تسجيل ${patient.name} بنجاح`, 'success');
    return patient;
  }, [addToast]);

  const callPatient = useCallback((id: string) => {
    setQueueData((prev) => prev.map((q) => q.id === id ? { ...q, status: 'in_consultation', consultationStartedAt: Date.now() } : q));
    playCall();
    addToast('تم نداء المريض — يرجى التوجه إلى غرفة الطبيب', 'info');
  }, [addToast]);

  const postponePatient = useCallback((id: string) => {
    setQueueData((prev) => prev.map((q) => q.id === id ? { ...q, status: 'postponed' } : q));
    addToast('تم تأجيل الحالة وإعادة ترتيب الدور', 'warning');
  }, [addToast]);

  const saveVitals = useCallback((patientId: string, vitals: Vitals) => {
    setPatientData((prev) => prev.map((p) => p.id === patientId ? { ...p, vitals } : p));
    if ((vitals.bpSystolic ?? 0) > 180 || (vitals.bpDiastolic ?? 0) > 110) {
      playAlert();
      addToast('تنبيه: مؤشرات ضغط حرجة تتطلب تدخلاً فورياً', 'error');
    } else {
      addToast('تم حفظ المؤشرات الحيوية بنجاح', 'success');
    }
  }, [addToast]);

  const updateLabResult = useCallback((orderId: string, testId: string, value: string) =>
    setLabData((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'in_progress', tests: o.tests.map((t) => t.id === testId ? { ...t, result: value, status: 'entered' } : t) } : o)), []);

  const completeLab = useCallback((orderId: string) => {
    setLabData((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'completed', completedAt: Date.now(), tests: o.tests.map((t) => ({ ...t, status: 'completed' as const })) } : o));
    playSuccess();
    addToast('تم اعتماد النتائج ورفعها فورياً إلى ملف المريض', 'success');
  }, [addToast]);

  const updateDrugBrand = useCallback((rxId: string, drugId: string, brand: string) =>
    setRxData((prev) => prev.map((r) => r.id === rxId ? { ...r, drugs: r.drugs.map((d) => d.id === drugId ? { ...d, selectedBrand: brand } : d) } : r)), []);

  const dispensePrescription = useCallback((rxId: string, partial: boolean) => {
    setRxData((prev) => prev.map((r) => r.id === rxId ? { ...r, status: partial ? 'partial' : 'dispensed', drugs: r.drugs.map((d, i) => ({ ...d, dispensed: partial ? i === 0 : true })) } : r));
    playSuccess();
    addToast(partial ? 'تم تسجيل الصرف الجزئي بنجاح' : 'تم تأكيد الصرف وحرق الروشتة نهائياً', 'success');
  }, [addToast]);

  const addDoctor = useCallback((data: Pick<Doctor, 'name' | 'specialty'>) => {
    const doctor: Doctor = { id: `d${Date.now()}`, name: data.name, specialty: data.specialty, badge: 'أخصائي', status: 'active' };
    setDoctorData((prev) => [...prev, doctor]);
    addToast(`تمت إضافة ${data.name} إلى الأطباء`, 'success');
  }, [addToast]);

  const removeDoctor = useCallback((id: string) => {
    setDoctorData((prev) => prev.filter((d) => d.id !== id));
    if (activeDoctorId === id) setActiveDoctorId(null);
    addToast('تم حذف الطبيب من القائمة', 'info');
  }, [addToast, activeDoctorId]);

  const toggleDoctorBreak = useCallback((id: string) => {
    setDoctorData((prev) => prev.map((d) => d.id === id ? { ...d, status: d.status === 'break' ? 'active' : 'break', badge: d.status === 'break' ? 'أخصائي' : 'استراحة مؤقتة' } : d));
  }, []);

  const value = useMemo(() => ({
    patients: patientData, queue: queueData, labOrders: labData, prescriptions: rxData, activeScreen, toasts,
    doctors: doctorData, activeDoctorId,
    setActiveScreen, addToast, removeToast, addPatient, callPatient, postponePatient, saveVitals, updateLabResult, completeLab, updateDrugBrand, dispensePrescription,
    addDoctor, removeDoctor, setActiveDoctorId, toggleDoctorBreak,
  }), [patientData, queueData, labData, rxData, activeScreen, toasts, doctorData, activeDoctorId, addToast, removeToast, addPatient, callPatient, postponePatient, saveVitals, updateLabResult, completeLab, updateDrugBrand, dispensePrescription, addDoctor, removeDoctor, toggleDoctorBreak]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
