import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  Plus, 
  Bell, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  BarChart3,
  Receipt,
  AlarmClockCheck
} from 'lucide-react';
import { formatMonthLabel } from '../utils/formatters';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (newMonth: string) => void;
  activeTab: 'dashboard' | 'transactions' | 'bills_budget';
  onTabChange: (tab: 'dashboard' | 'transactions' | 'bills_budget') => void;
  onOpenNewTransaction: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  activeTab,
  onTabChange,
  onOpenNewTransaction,
  unreadCount,
  onOpenNotifications
}) => {
  const { user, logout } = useAuth();

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Navbar */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                รายรับ-รายจ่าย
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                บันทึกบัญชีออนไลน์
              </span>
            </div>
          </div>

          {/* Month Selector Carousel in Center */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs sm:text-sm">
            <button
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 font-semibold text-slate-800 select-none">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
              <span>{formatMonthLabel(currentMonth)}</span>
            </div>
            <button
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Controls: New Transaction, Notification Bell, User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Button */}
            <button
              onClick={onOpenNewTransaction}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">เพิ่มรายการ</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              title="การแจ้งเตือน"
              className="cursor-pointer relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 gap-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ผู้ใช้'}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left text-xs max-w-[120px] truncate">
                <p className="font-semibold text-slate-800 truncate">{user?.displayName || 'ผู้ใช้งาน'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={logout}
                title="ออกจากระบบ"
                className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 sm:gap-2 -mb-px border-t border-slate-100 pt-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`cursor-pointer flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>สรุปยอด & กราฟวิเคราะห์</span>
          </button>

          <button
            onClick={() => onTabChange('transactions')}
            className={`cursor-pointer flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'transactions'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>ประวัติรายการรายรับ-จ่าย</span>
          </button>

          <button
            onClick={() => onTabChange('bills_budget')}
            className={`cursor-pointer flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'bills_budget'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <AlarmClockCheck className="w-4 h-4" />
            <span>แจ้งเตือนบิล & ตั้งงบประมาณ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
