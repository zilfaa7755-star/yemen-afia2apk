import React from 'react';
import {
  ChevronLeft,
  Gift,
  Star,
  Clock,
  Award,
  ShoppingBag,
  Heart,
  Sparkles,
} from 'lucide-react';

export function PointsPage({ onBack }: { onBack?: () => void }) {
  const userPoints = 3450;
  const level = 'ذهبي';

  const rewards = [
    { id: '1', title: 'حجز مجاني', points: 500, icon: Heart, available: true },
    { id: '2', title: 'خصم 20% على الكشف', points: 300, icon: Star, available: true },
    { id: '3', title: 'استشارة مجانية', points: 800, icon: Sparkles, available: userPoints >= 800 },
    { id: '4', title: 'توصيل أدوية مجاني', points: 200, icon: ShoppingBag, available: true },
    { id: '5', title: 'فحص شامل مجاني', points: 1500, icon: Award, available: userPoints >= 1500 },
  ];

  const recentActivity = [
    { id: '1', action: 'حجز كشف', points: '+50', date: 'اليوم' },
    { id: '2', action: 'استبدال خصم 20%', points: '-300', date: 'أمس' },
    { id: '3', action: 'إحالة صديق', points: '+200', date: 'منذ 3 أيام' },
    { id: '4', action: 'تقييم طبيب', points: '+10', date: 'منذ 5 أيام' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#F59E0B] to-[#D97706] pt-3 pb-20 px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white">نقاطي ومكافآتي</h1>
          <div className="w-10" />
        </div>

        {/* Points Card */}
        <div className="bg-white rounded-2xl p-5 text-center shadow-lg">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift size={32} className="text-amber-500" />
          </div>
          <p className="text-gray-500 text-sm">رصيدك الحالي</p>
          <p className="text-4xl font-black text-gray-900 mt-1">{userPoints.toLocaleString('ar-YE')}</p>
          <p className="text-xs text-gray-400 mt-1">نقطة يمن عافية</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold rounded-full text-sm">
            <Award size={16} />
            مستوى {level}
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="px-4 -mt-10 relative z-30 mb-6">
        <p className="font-bold text-gray-800 text-base mb-3 text-right">استبدل نقاطك</p>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((reward) => {
            const Icon = reward.icon;
            const canRedeem = userPoints >= reward.points;
            return (
              <button
                key={reward.id}
                disabled={!canRedeem}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  canRedeem
                    ? 'bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                    : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  canRedeem ? 'bg-amber-100' : 'bg-gray-200'
                }`}>
                  <Icon size={18} className={canRedeem ? 'text-amber-600' : 'text-gray-400'} />
                </div>
                <p className="font-bold text-gray-800 text-sm text-center">{reward.title}</p>
                <p className={`text-xs font-semibold ${canRedeem ? 'text-amber-600' : 'text-gray-400'}`}>
                  {reward.points} نقطة
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* How to Earn */}
      <div className="px-4 mb-6">
        <p className="font-bold text-gray-800 text-base mb-3 text-right">كيف تكسب النقاط؟</p>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-amber-600 font-bold">+50 نقطة</span>
            <span className="text-gray-700 text-sm">حجز موعد جديد</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-amber-600 font-bold">+10 نقاط</span>
            <span className="text-gray-700 text-sm">تقييم طبيب بعد الزيارة</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-amber-600 font-bold">+200 نقطة</span>
            <span className="text-gray-700 text-sm">إحالة صديق للتطبيق</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-amber-600 font-bold">+100 نقطة</span>
            <span className="text-gray-700 text-sm">إكمال الملف الصحي</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <p className="font-bold text-gray-800 text-base mb-3 text-right">آخر النشاطات</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {recentActivity.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 ${index !== recentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${item.points.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                  {item.points}
                </span>
                <span className="text-gray-700 text-sm">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
