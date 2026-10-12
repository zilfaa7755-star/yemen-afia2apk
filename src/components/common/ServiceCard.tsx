import React from 'react';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  icon: string;
  title: string;
  description?: string;
  color?: string;
  onClick?: () => void;
  badge?: string;
  disabled?: boolean;
}

const colorMap: Record<string, string> = {
  'primary': 'bg-primary-50 text-primary-600 border-primary-200',
  'secondary': 'bg-secondary-50 text-secondary-600 border-secondary-200',
  'accent': 'bg-accent-50 text-accent-600 border-accent-200',
  'warning': 'bg-warning-50 text-warning-600 border-warning-200',
  'error': 'bg-error-50 text-error-600 border-error-200',
  'heart': 'bg-red-50 text-red-600 border-red-200',
  'bone': 'bg-amber-50 text-amber-600 border-amber-200',
  'brain': 'bg-violet-50 text-violet-600 border-violet-200',
  'eye': 'bg-teal-50 text-teal-600 border-teal-200',
  'emergency': 'bg-red-50 text-red-700 border-red-200',
  'success': 'bg-green-50 text-green-600 border-green-200',
};

const iconColorMap: Record<string, string> = {
  'primary': 'primary-600',
  'secondary': 'secondary-600',
  'accent': 'accent-600',
  'warning': 'warning-600',
  'error': 'error-600',
  'heart': 'red-600',
  'bone': 'amber-600',
  'brain': 'violet-600',
  'eye': 'teal-600',
  'emergency': 'red-700',
  'success': 'green-600',
};

export function ServiceCard({
  icon,
  title,
  description,
  color = 'primary',
  onClick,
  badge,
  disabled = false,
}: ServiceCardProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[icon] || Icons.Activity;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full p-5 rounded-2xl text-right transition-all duration-300
        ${colorMap[color] || colorMap.primary}
        border
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'}
      `}
    >
      {badge && (
        <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium bg-white rounded-full">
          {badge}
        </span>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`
            p-3 rounded-xl bg-white shadow-sm
            text-${iconColorMap[color] || 'primary-600'}
          `}
          style={{ color: iconColorMap[color]?.includes('-') ? undefined : undefined }}
        >
          <IconComponent size={28} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-base">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          اضغط للدخول
          <Icons.ChevronLeft size={14} />
        </span>
      </div>
    </button>
  );
}
