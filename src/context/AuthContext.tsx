import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Doctor, Secretary, UserRole } from '../types';

interface AuthContextType {
  user: User | Doctor | Secretary | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, role?: UserRole) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateLocation: (lat: number, lng: number) => void;
  currentLocation: { lat: number; lng: number } | null;
  switchRole: (role: UserRole) => void;
}

interface RegisterData {
  phone: string;
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers: Record<UserRole, User | Doctor | Secretary> = {
  patient: {
    id: 'demo-patient',
    patient_code: 'YA-777001',
    full_name: 'أحمد محمد الأغبري',
    phone: '777000001',
    date_of_birth: '1990-05-15',
    age: 34,
    gender: 'male',
    blood_type: 'A+',
    chronic_diseases: ['ارتفاع ضغط الدم', 'سكري النوع الثاني'],
    allergies: ['البنسلين'],
    drug_allergies: ['البنسلين'],
    weight: 80,
    height: 175,
    city: 'صنعاء',
  },
  doctor: {
    id: 'demo-doctor',
    full_name: 'د. محمد يحيى العمري',
    phone: '777000002',
    specialty: 'قلب وأوعية دموية',
    license_number: 'DOC-2024-1122',
    clinic_name: 'عيادة القلب والأوعية',
    available: true,
  },
  secretary: {
    id: 'demo-secretary',
    full_name: 'سالم عبدالله المقطري',
    phone: '777000003',
  },
  nurse: {
    id: 'demo-nurse',
    full_name: 'محمد يحيى الأغبري',
    phone: '777000004',
  },
  hospital: {
    id: 'demo-hospital',
    full_name: 'مستشفى الجمهوري',
    phone: '01-234567',
  },
  admin: {
    id: 'demo-admin',
    full_name: 'مدير النظام',
    phone: '777999999',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | Doctor | Secretary | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    checkSession();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCurrentLocation({ lat: 15.3694, lng: 44.1910 })
      );
    } else {
      setCurrentLocation({ lat: 15.3694, lng: 44.1910 });
    }
  };

  const checkSession = async () => {
    try {
      const storedUser = localStorage.getItem('yemenAfiya_user');
      const storedRole = localStorage.getItem('yemenAfiya_role') as UserRole | null;
      if (storedUser && storedRole) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
      }
    } catch (e) {
      console.error('Session error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, userRole: UserRole = 'patient') => {
    setIsLoading(true);
    try {
      const base = demoUsers[userRole] || demoUsers.patient;
      // Generate patient_code from phone for patients
      const profile = userRole === 'patient'
        ? { ...base, phone, patient_code: `YA-${phone.slice(-6)}` }
        : { ...base, phone };
      setUser(profile);
      setRole(userRole);
      localStorage.setItem('yemenAfiya_user', JSON.stringify(profile));
      localStorage.setItem('yemenAfiya_role', userRole);
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: doctorData } = await supabase.from('doctors').select('*').eq('auth_id', data.user.id).maybeSingle();
      if (doctorData) {
        setUser(doctorData); setRole('doctor');
        localStorage.setItem('yemenAfiya_user', JSON.stringify(doctorData));
        localStorage.setItem('yemenAfiya_role', 'doctor');
        return;
      }

      const { data: secretaryData } = await supabase.from('secretaries').select('*').eq('auth_id', data.user.id).maybeSingle();
      if (secretaryData) {
        setUser(secretaryData); setRole('secretary');
        localStorage.setItem('yemenAfiya_user', JSON.stringify(secretaryData));
        localStorage.setItem('yemenAfiya_role', 'secretary');
        return;
      }

      const { data: userData } = await supabase.from('users').select('*').eq('auth_id', data.user.id).maybeSingle();
      const profile = userData || demoUsers.patient;
      setUser(profile as User);
      setRole('patient');
      localStorage.setItem('yemenAfiya_user', JSON.stringify(profile));
      localStorage.setItem('yemenAfiya_role', 'patient');
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const { data: newUser, error } = await supabase.from('users').insert([data]).select().single();
      if (error) throw error;
      setUser(newUser as User);
      setRole('patient');
      localStorage.setItem('yemenAfiya_user', JSON.stringify(newUser));
      localStorage.setItem('yemenAfiya_role', 'patient');
    } catch (e) {
      console.error('Registration error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setUser(null);
    setRole(null);
    localStorage.removeItem('yemenAfiya_user');
    localStorage.removeItem('yemenAfiya_role');
  };

  const updateLocation = (lat: number, lng: number) => setCurrentLocation({ lat, lng });

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('yemenAfiya_role', newRole);
    if (!user || (user as any).role !== newRole) {
      const demoProfile = demoUsers[newRole] || demoUsers.patient;
      setUser(demoProfile);
      localStorage.setItem('yemenAfiya_user', JSON.stringify(demoProfile));
    }
  };

  return (
    <AuthContext.Provider value={{
      user, role,
      isAuthenticated: !!user,
      isLoading,
      login, loginWithEmail, logout, register,
      updateLocation, currentLocation,
      switchRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
