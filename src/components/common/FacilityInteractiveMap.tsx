import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  X,
  Maximize2,
  Compass,
  Car,
  Footprints,
  ExternalLink,
  ShieldCheck,
  Building2,
  Pill,
  FlaskConical,
  Radiation,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface FacilityLocation {
  id?: string;
  name: string;
  category?: 'hospital' | 'pharmacy' | 'lab' | 'imaging' | string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  workingHours?: string;
}

interface FacilityInteractiveMapProps {
  facility: FacilityLocation;
  isOpen: boolean;
  onClose: () => void;
}

// Calculate Haversine distance in KM
function getHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function FacilityInteractiveMap({
  facility,
  isOpen,
  onClose,
}: FacilityInteractiveMapProps) {
  const { currentLocation } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default coordinates (Sana'a, Yemen) if geolocation not provided
  const userLat = currentLocation?.lat ?? 15.3694;
  const userLng = currentLocation?.lng ?? 44.191;

  const facLat = facility.latitude;
  const facLng = facility.longitude;

  const distanceKm = getHaversineDistanceKm(userLat, userLng, facLat, facLng);
  const estCarMinutes = Math.max(3, Math.round(distanceKm * 2.8));
  const estWalkMinutes = Math.max(10, Math.round(distanceKm * 14));

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure modal DOM is mounted and sized
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [(userLat + facLat) / 2, (userLng + facLng) / 2],
        zoom: 14,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom control at top-left
      L.control.zoom({ position: 'topleft' }).addTo(map);

      // Custom User Marker Icon
      const userIcon = L.divIcon({
        className: 'user-map-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(14, 165, 233, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 24px; height: 24px; border-radius: 9999px; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Custom Facility Marker Icon
      const facColor =
        facility.category === 'pharmacy'
          ? '#16a34a'
          : facility.category === 'lab'
          ? '#9333ea'
          : facility.category === 'imaging'
          ? '#0d9488'
          : '#ef4444';

      const facilityIcon = L.divIcon({
        className: 'facility-map-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background: ${facColor}; color: white; padding: 6px 10px; border-radius: 12px; font-weight: bold; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff; display: flex; align-items: center; gap: 4px;">
              <span>${facility.name}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${facColor}; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 40],
      });

      // Add user marker
      const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
      userMarker.bindPopup(`
        <div style="text-align: right; font-family: Tajawal, sans-serif; padding: 4px;">
          <b style="color: #0284c7; font-size: 13px;">📍 موقعك الحالي</b>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 11px;">صنعاء، الجمهورية اليمنية</p>
        </div>
      `);

      // Add facility marker
      const facilityMarker = L.marker([facLat, facLng], { icon: facilityIcon }).addTo(map);
      facilityMarker.bindPopup(`
        <div style="text-align: right; font-family: Tajawal, sans-serif; padding: 4px; min-width: 160px;">
          <b style="color: ${facColor}; font-size: 13px;">🏥 ${facility.name}</b>
          <p style="margin: 4px 0 0; color: #475569; font-size: 11px;">${facility.address}</p>
          ${facility.phone ? `<p style="margin: 2px 0 0; color: #0284c7; font-size: 11px;" dir="ltr">📞 ${facility.phone}</p>` : ''}
          <div style="margin-top: 6px; padding: 2px 6px; background: #f1f5f9; border-radius: 6px; font-size: 10px; color: #334155;">
            المسافة: <b>${distanceKm} كم</b>
          </div>
        </div>
      `).openPopup();

      // Add direct route polyline with nice styling
      const polyline = L.polyline(
        [
          [userLat, userLng],
          [facLat, facLng],
        ],
        {
          color: '#0284c7',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }
      ).addTo(map);

      // Fit bounds to show both user and facility comfortably
      const bounds = L.latLngBounds([
        [userLat, userLng],
        [facLat, facLng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60] });

      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, userLat, userLng, facLat, facLng, facility.name, facility.address, facility.phone, facility.category, distanceKm]);

  const handleCenterMap = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [userLat, userLng],
      [facLat, facLng],
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${facLat},${facLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      dir="rtl"
    >
      <div
        className={`relative flex flex-col w-full overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? 'h-full max-h-screen'
            : 'max-h-[92vh] max-w-3xl h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              {facility.category === 'pharmacy' ? (
                <Pill size={22} className="text-green-300" />
              ) : facility.category === 'lab' ? (
                <FlaskConical size={22} className="text-purple-300" />
              ) : facility.category === 'imaging' ? (
                <Radiation size={22} className="text-teal-300" />
              ) : (
                <Heart size={22} className="text-red-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold sm:text-lg">
                  {facility.name}
                </h3>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  خريطة تفاعلية
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-sky-100">
                <MapPin size={13} className="text-sky-300" />
                {facility.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl bg-white/10 p-2 text-white/90 transition hover:bg-white/20"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 p-2 text-white/90 transition hover:bg-white/20"
              title="إغلاق"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 bg-slate-100">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
            style={{ zIndex: 1 }}
          />

          {/* Quick Floating Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={handleCenterMap}
              className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white/95 px-3 py-2 text-xs font-bold text-gray-800 shadow-md backdrop-blur-md transition hover:bg-white active:scale-95"
            >
              <Compass size={16} className="text-sky-600" />
              <span>توسيط المسار</span>
            </button>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-4 right-4 z-10 rounded-2xl border border-gray-100 bg-white/95 p-2.5 shadow-lg backdrop-blur-md">
            <div className="space-y-1.5 text-[11px] font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-sky-600 shadow-sm" />
                <span>موقعك الحالي</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-red-500 shadow-sm" />
                <span>موقع المنشأة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-4 bg-sky-600" />
                <span>المسار التقديري</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Distance & Action Panel */}
        <div className="border-t border-gray-100 bg-gray-50/90 p-4 backdrop-blur-md">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-3">
            {/* Distance */}
            <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-xs">
              <p className="text-[11px] text-gray-500">المسافة الفعلية</p>
              <p className="mt-1 font-black text-sky-600 text-lg sm:text-xl">
                {distanceKm} <span className="text-xs font-semibold">كم</span>
              </p>
            </div>

            {/* Car travel time */}
            <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-xs">
              <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
                <Car size={13} className="text-amber-500" /> بالسيارة
              </p>
              <p className="mt-1 font-black text-gray-800 text-lg sm:text-xl">
                ~{estCarMinutes} <span className="text-xs font-semibold">دقيقة</span>
              </p>
            </div>

            {/* Walking travel time */}
            <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-xs">
              <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
                <Footprints size={13} className="text-emerald-500" /> مشياً
              </p>
              <p className="mt-1 font-black text-gray-800 text-lg sm:text-xl">
                ~{estWalkMinutes} <span className="text-xs font-semibold">دقيقة</span>
              </p>
            </div>

            {/* Working hours or phone */}
            <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-xs">
              <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
                <Clock size={13} className="text-indigo-500" /> أوقات العمل
              </p>
              <p className="mt-1 font-bold text-gray-700 text-xs sm:text-sm truncate">
                {facility.workingHours || '24 ساعة'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleOpenGoogleMaps}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:from-sky-700 hover:to-indigo-700 active:scale-95"
            >
              <Navigation size={18} />
              <span>بدء الملاحة عبر خرائط Google</span>
              <ExternalLink size={15} className="opacity-75" />
            </button>

            {facility.phone && (
              <a
                href={`tel:${facility.phone}`}
                className="flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white py-3 px-5 text-sm font-bold text-gray-700 shadow-xs transition hover:bg-gray-100 active:scale-95"
              >
                <Phone size={17} className="text-emerald-600" />
                <span dir="ltr">{facility.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacilityInteractiveMap;
