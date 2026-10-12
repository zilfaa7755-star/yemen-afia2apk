import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { BottomNav } from './components/common/BottomNav';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { DoctorSearchPage } from './pages/DoctorSearchPage';
import { BookingPage } from './pages/BookingPage';
import { QueueTrackingPage } from './pages/QueueTrackingPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { MessagesPage } from './pages/MessagesPage';
import { HealthRecordPage } from './pages/HealthRecordPage';
import { MorePage } from './pages/MorePage';
import { EmergencyPage } from './pages/EmergencyPage';
import { NursingPage } from './pages/NursingPage';
import { PharmacyPage } from './pages/PharmacyPage';
import { MedicationGuidePage } from './pages/MedicationGuidePage';
import { MedicationRemindersPage } from './pages/MedicationRemindersPage';
import { SecretaryDashboard } from './pages/SecretaryDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ClinicsPage } from './pages/ClinicsPage';
import { MedicalNewsPage } from './pages/MedicalNewsPage';

import { ElectronicPrescriptionPage } from './pages/ElectronicPrescriptionPage';
import { MedicalFacilitiesApp } from './pages/MedicalFacilitiesApp';
import { BloodDonationPage } from './pages/BloodDonationPage';
import { FamilyPage } from './pages/FamilyPage';
import { ChronicDiseasePage } from './pages/ChronicDiseasePage';
import { TrackingPage } from './pages/TrackingPage';
import { VisualGuidePage } from './pages/visual-guide/VisualGuidePage';
import { NurseDashboard } from './pages/NurseDashboard';
import { MedicalFacilityDashboard } from './pages/MedicalFacilityDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import FacilityApp from './facility_modules/FacilityApp';
import { useQueueNotifications } from './hooks/useQueueNotifications';
import type { Doctor, Appointment } from './types';

type Page =
  | 'home'
  | 'ai-assistant'
  | 'clinics'
  | 'doctor-search'
  | 'booking'
  | 'appointments'
  | 'messages'
  | 'health-record'
  | 'more'
  | 'emergency'
  | 'nursing'
  | 'pharmacy'
  | 'medication-guide'
  | 'medication-reminders'
  | 'medical-news'
  | 'secretary-dashboard'
  | 'doctor-dashboard'
  | 'blood-search'
  | 'family'
  | 'electronic-prescription'
  | 'medical-facilities'
  | 'queue-tracking'
  | 'visual-guide'
  | 'chronic-disease'
  | 'tracking';

interface QueueBookingInfo {
  queueNumber: number;
  estimatedWaitMinutes: number;
  estimatedArrivalTime: string;
}

interface ActiveQueueData {
  appointmentId: string;
  doctorId: string;
  queueNumber: number;
  avgConsultationTime: number;
  clinicLat?: number;
  clinicLng?: number;
  patientLat?: number;
  patientLng?: number;
}

function QueueSubscriber({ data }: { data: ActiveQueueData | null }) {
  useQueueNotifications(data);
  return null;
}

function AppContent() {
  const { isAuthenticated, isLoading, role, currentLocation, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [queueBookingInfo, setQueueBookingInfo] = useState<QueueBookingInfo | null>(null);
  const [activeQueueData, setActiveQueueData] = useState<ActiveQueueData | null>(null);
  const [navigationStack, setNavigationStack] = useState<Page[]>([]);

  React.useEffect(() => {
    const handleNavToMain = () => {
      logout();
    };
    window.addEventListener('nav-to-main', handleNavToMain);
    return () => window.removeEventListener('nav-to-main', handleNavToMain);
  }, [logout]);

  const navigateTo = (page: Page, addToStack = true) => {
    if (addToStack && currentPage !== page) {
      setNavigationStack((prev) => [...prev, currentPage]);
    }
    setCurrentPage(page);
  };

  const handleSelectDoctor = (doctor: Doctor, queueInfo?: QueueBookingInfo) => {
    setSelectedDoctor(doctor);
    setQueueBookingInfo(queueInfo || null);
    navigateTo('booking');
  };

  const handleBookingComplete = (appointment: Appointment) => {
    if (selectedDoctor) {
      setActiveQueueData({
        appointmentId: appointment.id,
        doctorId: selectedDoctor.id,
        queueNumber: queueBookingInfo?.queueNumber ?? 1,
        avgConsultationTime: selectedDoctor.average_consultation_time ?? 15,
        clinicLat: selectedDoctor.clinic?.latitude,
        clinicLng: selectedDoctor.clinic?.longitude,
        patientLat: currentLocation?.lat,
        patientLng: currentLocation?.lng,
      });
    }
    navigateTo('queue-tracking');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2196F3] to-[#1976D2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-[#2196F3] font-black text-3xl">ع</span>
          </div>
          <p className="text-white/80">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {}} />;
  }

  if (role === 'secretary') {
    return <FacilityApp initialScreen="reception" singleScreen title="الاستقبال والفرز — لوحة السكرتارية" onBack={logout} />;
  }

  if (role === 'doctor') {
    return <DoctorDashboard />;
  }

  if (role === 'nurse') {
    return <NurseDashboard />;
  }

  if (role === 'hospital') {
    return <MedicalFacilityDashboard />;
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  const shouldShowBottomNav = ['home', 'appointments', 'ai-assistant', 'medical-facilities', 'more'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={(page) => navigateTo(page as Page)} />;

      case 'ai-assistant':
        return (
          <AIAssistantPage
            onBack={() => navigateTo('home', false)}
            onBookDoctor={() => navigateTo('clinics')}
          />
        );

      case 'clinics':
        return (
          <ClinicsPage
            onBack={() => navigateTo('home')}
            onSelectDoctor={handleSelectDoctor}
          />
        );

      case 'doctor-search':
        return (
          <DoctorSearchPage
            onBack={() => navigateTo('home')}
            onSelectDoctor={handleSelectDoctor}
          />
        );

      case 'booking':
        return selectedDoctor ? (
          <BookingPage
            doctor={selectedDoctor}
            queueNumber={queueBookingInfo?.queueNumber ?? 1}
            estimatedWaitMinutes={queueBookingInfo?.estimatedWaitMinutes ?? 30}
            estimatedArrivalTime={queueBookingInfo?.estimatedArrivalTime ?? '--:--'}
            onBack={() => navigateTo('clinics')}
            onComplete={handleBookingComplete}
          />
        ) : (
          <ClinicsPage onSelectDoctor={handleSelectDoctor} />
        );

      case 'queue-tracking':
        return selectedDoctor ? (
          <QueueTrackingPage
            doctor={selectedDoctor}
            queueNumber={queueBookingInfo?.queueNumber ?? 1}
            estimatedWaitMinutes={queueBookingInfo?.estimatedWaitMinutes ?? 30}
            onBack={() => navigateTo('appointments', false)}
          />
        ) : (
          <AppointmentsPage onBack={() => navigateTo('home')} />
        );

      case 'appointments':
        return <AppointmentsPage onBack={() => navigateTo('home')} />;

      case 'messages':
        return <MessagesPage onBack={() => navigateTo('home')} />;

      case 'health-record':
        return <HealthRecordPage onBack={() => navigateTo('home')} />;

      case 'more':
        return <MorePage onNavigate={(page) => navigateTo(page as Page)} />;

      case 'medical-news':
        return <MedicalNewsPage onBack={() => navigateTo('home')} />;

      case 'emergency':
        return <EmergencyPage onBack={() => navigateTo('home')} />;

      case 'blood-search':
        return <BloodDonationPage onBack={() => navigateTo('home')} />;

      case 'nursing':
        return <NursingPage onBack={() => navigateTo('home')} />;

      case 'pharmacy':
        return <PharmacyPage onBack={() => navigateTo('home')} />;

      case 'medication-guide':
        return <MedicationGuidePage onBack={() => navigateTo('home')} />;

      case 'medication-reminders':
        return <MedicationRemindersPage onBack={() => navigateTo('home')} />;

      case 'family':
        return <FamilyPage onBack={() => navigateTo('home')} onBookForMember={() => navigateTo('clinics')} />;

      case 'electronic-prescription':
        return <ElectronicPrescriptionPage onBack={() => navigateTo('home')} />;

      case 'medical-facilities':
        return <MedicalFacilitiesApp onExit={() => navigateTo('home')} />;

      case 'visual-guide':
        return <VisualGuidePage onExit={() => navigateTo('home')} />;

      case 'chronic-disease':
        return <ChronicDiseasePage onBack={() => navigateTo('home')} />;

      case 'tracking':
        return <TrackingPage onBack={() => navigateTo('home')} />;

      default:
        return <HomePage onNavigate={(page) => navigateTo(page as Page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <QueueSubscriber data={activeQueueData} />
      {renderPage()}
      {shouldShowBottomNav && (
        <BottomNav
          activeTab={currentPage}
          onTabChange={(tab) => navigateTo(tab as Page, false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
