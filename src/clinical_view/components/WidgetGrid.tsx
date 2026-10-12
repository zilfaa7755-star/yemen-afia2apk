import {
  Pill,
  Stethoscope,
  AlertTriangle,
  TestTube,
  ScanLine,
  Syringe,
  ChevronLeft,
  CircleDot,
  Eye,
  Plus,
} from 'lucide-react';
import type { Medication, Problem, Allergy, LabResult, RadiologyStudy, Surgery } from '../types';
import { facilities } from '../data/clinicalData';

interface WidgetGridProps {
  medications: Medication[];
  problems: Problem[];
  allergies: Allergy[];
  labResults: LabResult[];
  radiologyStudies: RadiologyStudy[];
  surgeries: Surgery[];
  facilityFilter: Set<string>;
  onOpenMeds: () => void;
  onOpenProblems: () => void;
  onOpenAllergies: () => void;
  onOpenLabs: () => void;
  onOpenRadiology: () => void;
  onOpenSurgeries: () => void;
  onOpenDICOM: () => void;
}

const facilityName = (id: string) => facilities.find((f) => f.id === id)?.shortName || '';
const facilityColor = (id: string) => facilities.find((f) => f.id === id)?.color || '#94A3B8';

function isFiltered(facilityId: string, filter: Set<string>) {
  return filter.size === 0 || filter.has(facilityId);
}

export function WidgetGrid(props: WidgetGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Card 1: Active Meds */}
      <MedsCard {...props} />
      {/* Card 2: Problems */}
      <ProblemsCard {...props} />
      {/* Card 3: Allergies */}
      <AllergiesCard {...props} />
      {/* Card 4: Recent Labs */}
      <LabsCard {...props} />
      {/* Card 5: Radiology */}
      <RadiologyCard {...props} />
      {/* Card 6: Surgeries */}
      <SurgeriesCard {...props} />
    </div>
  );
}

function CardShell({
  title,
  icon: Icon,
  count,
  total,
  iconColor,
  children,
  onClick,
  footer,
}: {
  title: string;
  icon: typeof Pill;
  count?: string;
  total?: string;
  iconColor: string;
  children: React.ReactNode;
  onClick?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {count && (
              <p className="text-xs text-slate-400 font-medium">
                {count} {total && <span className="text-slate-300">/ {total}</span>}
              </p>
            )}
          </div>
        </div>
        <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:-translate-x-1 transition-all" />
      </div>
      <div className="px-4 pb-2 flex-1">{children}</div>
      {footer && <div className="px-4 pb-3">{footer}</div>}
    </div>
  );
}

function FacilityChip({ facilityId }: { facilityId: string }) {
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-white"
      style={{ backgroundColor: facilityColor(facilityId) }}
    >
      {facilityName(facilityId)}
    </span>
  );
}

function MedsCard({ medications, facilityFilter, onOpenMeds }: WidgetGridProps) {
  const active = medications.filter((m) => m.status === 'active' && isFiltered(m.facility, facilityFilter));
  const preview = active.slice(0, 3);
  return (
    <CardShell
      title="الأدوية النشطة"
      icon={Pill}
      count={`${active.length} نشط`}
      total="60"
      iconColor="bg-primary-50 text-primary-600"
      onClick={onOpenMeds}
    >
      <div className="space-y-1.5">
        {preview.map((med) => (
          <div
            key={med.id}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
              isFiltered(med.facility, facilityFilter)
                ? 'bg-slate-50 hover:bg-primary-50'
                : 'opacity-30'
            }`}
          >
            <CircleDot className="w-3 h-3 text-primary-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{med.name}</p>
              <p className="text-[10px] text-slate-400">{med.dosage} - {med.frequency}</p>
            </div>
            <FacilityChip facilityId={med.facility} />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function ProblemsCard({ problems, facilityFilter, onOpenProblems }: WidgetGridProps) {
  const active = problems.filter((p) => p.status !== 'resolved' && isFiltered(p.facility, facilityFilter));
  const preview = active.slice(0, 3);
  return (
    <CardShell
      title="المشاكل والتشخيصات"
      icon={Stethoscope}
      count={`${active.length} نشط`}
      iconColor="bg-amber-50 text-amber-600"
      onClick={onOpenProblems}
    >
      <div className="space-y-1.5">
        {preview.map((prob) => (
          <div
            key={prob.id}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
              isFiltered(prob.facility, facilityFilter)
                ? 'bg-slate-50 hover:bg-amber-50'
                : 'opacity-30'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{prob.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">ICD-11: {prob.icd11}</p>
            </div>
            <FacilityChip facilityId={prob.facility} />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function AllergiesCard({ allergies, facilityFilter, onOpenAllergies }: WidgetGridProps) {
  const preview = allergies.slice(0, 3);
  return (
    <CardShell
      title="الحساسيات والتنبيهات"
      icon={AlertTriangle}
      count={`${allergies.length} إجمالي`}
      iconColor="bg-danger-50 text-danger-600"
      onClick={onOpenAllergies}
    >
      <div className="space-y-1.5">
        {preview.map((allergy) => (
          <div
            key={allergy.id}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
              isFiltered(allergy.facility, facilityFilter)
                ? allergy.severity === 'anaphylaxis'
                  ? 'bg-danger-50 border border-danger-200'
                  : 'bg-slate-50 hover:bg-danger-50'
                : 'opacity-30'
            }`}
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 shrink-0 ${
                allergy.severity === 'anaphylaxis'
                  ? 'text-danger-600 fill-danger-100'
                  : allergy.severity === 'severe'
                  ? 'text-danger-500'
                  : 'text-amber-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{allergy.substance}</p>
              <p className="text-[10px] text-slate-400 truncate">{allergy.reaction}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-primary-600 font-semibold">
        <Plus className="w-3 h-3" />
        إضافة حساسية جديدة
      </div>
    </CardShell>
  );
}

function LabsCard({ labResults, facilityFilter, onOpenLabs }: WidgetGridProps) {
  const filtered = labResults.filter((l) => isFiltered(l.facility, facilityFilter));
  const preview = filtered.slice(0, 5);
  return (
    <CardShell
      title="أحدث التحاليل"
      icon={TestTube}
      count={`${filtered.length}`}
      total="23"
      iconColor="bg-emerald-50 text-emerald-600"
      onClick={onOpenLabs}
    >
      <div className="space-y-1">
        {preview.map((lab) => (
          <div
            key={lab.id}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all ${
              isFiltered(lab.facility, facilityFilter) ? 'bg-slate-50' : 'opacity-30'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{lab.name}</p>
            </div>
            <div className="text-left shrink-0">
              <p
                className={`text-sm font-bold ${
                  lab.flag === 'critical'
                    ? 'text-danger-600'
                    : lab.flag === 'high'
                    ? 'text-amber-600'
                    : lab.flag === 'low'
                    ? 'text-amber-600'
                    : 'text-success-600'
                }`}
              >
                {lab.value} {lab.unit}
                {(lab.flag === 'critical' || lab.flag === 'high') && ' ⚠️'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function RadiologyCard({ radiologyStudies, facilityFilter, onOpenRadiology, onOpenDICOM }: WidgetGridProps) {
  const filtered = radiologyStudies.filter((r) => isFiltered(r.facility, facilityFilter));
  const preview = filtered.slice(0, 2);
  return (
    <CardShell
      title="دراسات الأشعة"
      icon={ScanLine}
      count={`${filtered.length}`}
      total="4"
      iconColor="bg-indigo-50 text-indigo-600"
      onClick={onOpenRadiology}
      footer={
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDICOM();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4" />
          فتح عارض الأشعة DICOM المباشر
        </button>
      }
    >
      <div className="space-y-1.5">
        {preview.map((study) => (
          <div
            key={study.id}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
              isFiltered(study.facility, facilityFilter) ? 'bg-slate-50' : 'opacity-30'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <ScanLine className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">
                {study.modality} - {study.bodyPart}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{study.impression}</p>
            </div>
            <FacilityChip facilityId={study.facility} />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function SurgeriesCard({ surgeries, facilityFilter, onOpenSurgeries }: WidgetGridProps) {
  const filtered = surgeries.filter((s) => isFiltered(s.facility, facilityFilter));
  const preview = filtered.slice(0, 3);
  return (
    <CardShell
      title="العمليات والإجراءات"
      icon={Syringe}
      count={`${filtered.length}`}
      total="6"
      iconColor="bg-slate-100 text-slate-600"
      onClick={onOpenSurgeries}
    >
      <div className="space-y-1.5">
        {preview.map((surg) => (
          <div
            key={surg.id}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
              isFiltered(surg.facility, facilityFilter) ? 'bg-slate-50' : 'opacity-30'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{surg.name}</p>
              <p className="text-[10px] text-slate-400">{surg.date}</p>
            </div>
            <FacilityChip facilityId={surg.facility} />
          </div>
        ))}
      </div>
    </CardShell>
  );
}
