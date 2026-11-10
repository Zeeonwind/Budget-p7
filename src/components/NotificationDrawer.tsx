import React from 'react';
import { AppNotification } from '../types';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  Info,
  Clock
} from 'lucide-react';
import { formatThaiDate } from '../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">ศูนย์การแจ้งเตือน</h3>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `ยังไม่อ่าน ${unreadCount} รายการ` : 'อ่านครบทั้งหมดแล้ว'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
                className="cursor-pointer p-1.5 text-xs text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                title="ลบการแจ้งเตือนทั้งหมด"
                className="cursor-pointer p-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
              <Bell className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">ไม่มีการแจ้งเตือนใหม่</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                เมื่อมีบิลใกล้ถึงกำหนด หรือค่าใช้จ่ายใกล้เกินงบประมาณ ระบบจะแจ้งเตือนคุณที่นี่
              </p>
            </div>
          ) : (
            notifications.map(notif => {
              const isBudget = notif.type === 'budget_alert';
              const isBill = notif.type === 'bill_reminder';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition relative ${
                    !notif.isRead
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Type Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isBudget
                        ? 'bg-amber-100 text-amber-700'
                        : isBill
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isBudget ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isBill ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-800">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatThaiDate(notif.createdAt.slice(0, 10))}</span>
                        {!notif.isRead && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            className="cursor-pointer text-emerald-600 hover:underline font-semibold ml-auto"
                          >
                            ทำเครื่องหมายว่าอ่านแล้ว
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteNotification(notif.id)}
                    className="cursor-pointer absolute top-3 right-3 text-slate-300 hover:text-rose-500 p-1 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 text-center text-[11px] text-slate-400 bg-slate-50">
          ระบบตรวจสอบบิลและงบประมาณอัตโนมัติแบบเรียลไทม์
        </div>
      </div>
    </div>
  );
};
