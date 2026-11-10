import React from 'react';
import { BillReminder, Budget } from '../types';
import { formatCurrency, formatThaiDate, getDaysDifference } from '../utils/formatters';
import { 
  Bell, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  SlidersHorizontal,
  BellRing,
  RotateCcw
} from 'lucide-react';

interface BillRemindersProps {
  bills: BillReminder[];
  budget: Budget | null;
  onOpenNewBill: () => void;
  onEditBill: (bill: BillReminder) => void;
  onDeleteBill: (id: string) => void;
  onTogglePaidBill: (bill: BillReminder, recordExpense: boolean) => void;
  onOpenBudgetModal: () => void;
  isBrowserNotificationGranted: boolean;
  onRequestBrowserNotification: () => void;
}

export const BillReminders: React.FC<BillRemindersProps> = ({
  bills,
  budget,
  onOpenNewBill,
  onEditBill,
  onDeleteBill,
  onTogglePaidBill,
  onOpenBudgetModal,
  isBrowserNotificationGranted,
  onRequestBrowserNotification,
}) => {
  // Sort bills: unpaid first, then by dueDate ascending
  const sortedBills = [...bills].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const unpaidCount = bills.filter(b => !b.isPaid).length;
  const totalUnpaidAmount = bills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Web Notification Permission */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              ระบบแจ้งเตือนบิลค้างชำระและงบประมาณ (Smart Alerts)
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              รับการแจ้งเตือนทันทีก่อนถึงกำหนดชำระบิลค่าน้ำ ค่าไฟ ค่าเน็ต บัตรเครดิต และเตือนเมื่อใช้จ่ายใกล้เกินงบ
            </p>
          </div>
        </div>

        <div>
          {isBrowserNotificationGranted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              เปิดการแจ้งเตือนผ่านเบราว์เซอร์แล้ว
            </span>
          ) : (
            <button
              onClick={onRequestBrowserNotification}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold shadow-md transition active:scale-95"
            >
              <Bell className="w-4 h-4" />
              <span>เปิดการแจ้งเตือนเบราว์เซอร์</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Budget Card + Bill Reminders List */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Budget Settings Summary */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">การตั้งค่างบประมาณ</h3>
            </div>
            <button
              onClick={onOpenBudgetModal}
              className="cursor-pointer text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              แก้ไข
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">งบประมาณรายจ่ายต่อเดือน</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {budget?.totalBudget ? formatCurrency(budget.totalBudget) : 'ยังไม่ได้ระบุ'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">ระดับการเตือนล่วงหน้า</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                แจ้งเตือนเมื่อใช้ถึง {budget?.alertThreshold || 80}% ของงบ
              </p>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-emerald-900">
              💡 เมื่อบันทึกรายจ่ายแล้วยอดรวมในเดือนเกิน {budget?.alertThreshold || 80}% ระบบจะสร้างการแจ้งเตือนในระบบทันที
            </div>
          </div>
        </div>

        {/* Right Column: Bills Management */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  รายการบิลและค่าใช้จ่ายประจำ (Bill Reminders)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ค้างชำระ {unpaidCount} รายการ รวม {formatCurrency(totalUnpaidAmount)}
              </p>
            </div>

            <button
              onClick={onOpenNewBill}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มรายการบิล</span>
            </button>
          </div>

          {/* Bills List */}
          {sortedBills.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">ยังไม่มีรายการแจ้งเตือนบิล</p>
              <p className="text-xs text-slate-400 mt-1">
                เช่น บิลค่าไฟ, ค่าน้ำ, ค่าผ่อนบ้าน/รถ, บัตรเครดิต, Netflix, ค่าเน็ต
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBills.map(bill => {
                const daysDiff = getDaysDifference(bill.dueDate);
                const isOverdue = !bill.isPaid && daysDiff < 0;
                const isDueToday = !bill.isPaid && daysDiff === 0;
                const isDueSoon = !bill.isPaid && daysDiff > 0 && daysDiff <= (bill.remindDaysBefore || 3);

                return (
                  <div
                    key={bill.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      bill.isPaid
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-70'
                        : isOverdue
                        ? 'bg-red-50/70 border-red-200'
                        : isDueToday
                        ? 'bg-amber-50/70 border-amber-200'
                        : isDueSoon
                        ? 'bg-yellow-50/70 border-yellow-200'
                        : 'bg-white border-slate-200/80 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        bill.isPaid
                          ? 'bg-emerald-100 text-emerald-600'
                          : isOverdue
                          ? 'bg-red-100 text-red-600'
                          : isDueToday
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {bill.isPaid ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <Calendar className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{bill.title}</h4>
                          {bill.category && (
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                              {bill.category}
                            </span>
                          )}

                          {/* Status Badge */}
                          {bill.isPaid ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                              ชำระแล้ว
                            </span>
                          ) : isOverdue ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full animate-pulse">
                              เลยกำหนด {Math.abs(daysDiff)} วัน
                            </span>
                          ) : isDueToday ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
                              ครบกำหนดวันนี้!
                            </span>
                          ) : isDueSoon ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                              อีก {daysDiff} วัน
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                              อีก {daysDiff} วัน
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          กำหนดชำระ: <span className="font-semibold">{formatThaiDate(bill.dueDate)}</span> •{' '}
                          ความถี่: {bill.frequency === 'monthly' ? 'รายเดือน' : bill.frequency === 'weekly' ? 'รายสัปดาห์' : bill.frequency === 'yearly' ? 'รายปี' : 'ครั้งเดียว'}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {formatCurrency(bill.amount)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Mark as paid / Unmark */}
                        <button
                          onClick={() => {
                            if (!bill.isPaid) {
                              const record = window.confirm(
                                `ต้องการบันทึก "${bill.title}" จำนวน ${formatCurrency(bill.amount)} ลงในรายการรายจ่ายอัตโนมัติด้วยหรือไม่?`
                              );
                              onTogglePaidBill(bill, record);
                            } else {
                              onTogglePaidBill(bill, false);
                            }
                          }}
                          className={`cursor-pointer px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
                            bill.isPaid
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {bill.isPaid ? (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>ยกเลิกชำระ</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ชำระเงินแล้ว</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onEditBill(bill)}
                          title="แก้ไขบิล"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`ต้องการลบรายการบิล "${bill.title}" หรือไม่?`)) {
                              onDeleteBill(bill.id);
                            }
                          }}
                          title="ลบบิล"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
