import React, { useState, useEffect } from 'react';
import { BillReminder, BillFrequency } from '../types';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { getTodayString } from '../utils/formatters';
import { X, Check, Bell } from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<BillReminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  editingBill?: BillReminder | null;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBill
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[3].name); // Default Utilities
  const [dueDate, setDueDate] = useState(getTodayString());
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [remindDaysBefore, setRemindDaysBefore] = useState<number>(3);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingBill) {
      setTitle(editingBill.title);
      setAmount(editingBill.amount.toString());
      setCategory(editingBill.category || EXPENSE_CATEGORIES[3].name);
      setDueDate(editingBill.dueDate);
      setFrequency(editingBill.frequency);
      setRemindDaysBefore(editingBill.remindDaysBefore || 3);
    } else {
      setTitle('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[3].name);
      setDueDate(getTodayString());
      setFrequency('monthly');
      setRemindDaysBefore(3);
    }
    setError('');
  }, [editingBill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุชื่อบิลหรือรายการ');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }
    if (!dueDate) {
      setError('กรุณาเลือกวันครบกำหนดชำระ');
      return;
    }

    onSave({
      title: title.trim(),
      amount: numAmount,
      category,
      dueDate,
      frequency,
      isPaid: editingBill?.isPaid || false,
      remindDaysBefore
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-800">
              {editingBill ? 'แก้ไขรายการแจ้งเตือนบิล' : 'เพิ่มรายการแจ้งเตือนบิล'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ชื่อบิล / ค่าใช้จ่าย *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ค่าน้ำ-ค่าไฟ, เน็ตบ้าน AIS, บัตรเครดิต KBank"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                จำนวนเงิน (บาท) *
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                วันครบกำหนดชำระ *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ความถี่
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
              >
                <option value="monthly">รายเดือน (Monthly)</option>
                <option value="once">ครั้งเดียว (Once)</option>
                <option value="weekly">รายสัปดาห์ (Weekly)</option>
                <option value="yearly">รายปี (Yearly)</option>
              </select>
            </div>
          </div>

          {/* Remind Days Before */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              แจ้งเตือนล่วงหน้า
            </label>
            <select
              value={remindDaysBefore}
              onChange={(e) => setRemindDaysBefore(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              <option value={1}>1 วันก่อนครบกำหนด</option>
              <option value={3}>3 วันก่อนครบกำหนด (แนะนำ)</option>
              <option value={5}>5 วันก่อนครบกำหนด</option>
              <option value={7}>7 วันก่อนครบกำหนด (1 สัปดาห์)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="cursor-pointer inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{editingBill ? 'บันทึกการแก้ไข' : 'บันทึกบิล'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
