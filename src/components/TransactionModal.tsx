import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { getTodayString } from '../utils/formatters';
import { X, ArrowDownLeft, ArrowUpRight, Check, Tag } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<string>('โอนเงิน / พร้อมเพย์ (PromptPay)');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod || 'โอนเงิน / พร้อมเพย์ (PromptPay)');
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setDate(getTodayString());
      setPaymentMethod('โอนเงิน / พร้อมเพย์ (PromptPay)');
      setNote('');
    }
    setError('');
  }, [editingTransaction, isOpen]);

  // When type changes, select default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  if (!isOpen) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!category.trim()) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setError('กรุณาระบุวันที่');
      return;
    }

    onSave({
      type,
      amount: numAmount,
      category,
      date,
      paymentMethod,
      note: note.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-base sm:text-lg text-slate-800">
            {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Type Toggle: Expense / Income */}
          <div className="flex p-1 bg-slate-100 rounded-2xl text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>รายจ่าย (Expense)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">฿</span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 text-xl font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>
            {/* Quick Amount Helper Chips */}
            <div className="flex items-center gap-2 mt-2">
              {[50, 100, 300, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(amount) || 0;
                    setAmount((current + val).toString());
                  }}
                  className="cursor-pointer px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  +{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600 ml-auto"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Category Grid Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span>หมวดหมู่ *</span>
              <span className="text-[11px] text-emerald-600 font-normal">เลือกตามรายการ</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`cursor-pointer p-2 rounded-xl border text-left text-xs transition flex items-center gap-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                วันที่ทำรายการ *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ช่องทางการชำระ
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              บันทึกช่วยจำ (Note)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ซื้อที่ 7-Eleven, ข้าวเที่ยง..."
              maxLength={300}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="cursor-pointer inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
