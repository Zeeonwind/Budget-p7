import React, { useState, useEffect } from 'react';
import { Budget } from '../types';
import { X, Check, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { formatMonthLabel } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (totalBudget: number, alertThreshold: number) => void;
  currentBudget: Budget | null;
  currentMonth: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentBudget,
  currentMonth
}) => {
  const [totalBudget, setTotalBudget] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (currentBudget) {
      setTotalBudget(currentBudget.totalBudget.toString());
      setAlertThreshold(currentBudget.alertThreshold || 80);
    } else {
      setTotalBudget('20000');
      setAlertThreshold(80);
    }
    setError('');
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(totalBudget);
    if (isNaN(val) || val <= 0) {
      setError('กรุณากรอกงบประมาณที่เป็นจำนวนบวก');
      return;
    }
    onSave(val, alertThreshold);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-800">
              ตั้งค่างบประมาณประจำเดือน
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
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900">
            ตั้งงบสำหรับ <span className="font-bold">{formatMonthLabel(currentMonth)}</span> เพื่อช่วยควบคุมค่าใช้จ่ายและรับการเตือนอัตโนมัติ
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Total Budget Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              งบประมาณรายจ่ายทั้งเดือน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">฿</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="20,000"
                className="w-full pl-10 pr-4 py-2.5 text-xl font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>แจ้งเตือนเมื่อใช้จ่ายถึง</span>
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {alertThreshold}% ของงบ
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>80% (แนะนำ)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="pt-1">
            <span className="text-[11px] text-slate-400">งบแนะนำ:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {[10000, 15000, 20000, 30000, 50000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTotalBudget(amt.toString())}
                  className="cursor-pointer text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  ฿{amt.toLocaleString()}
                </button>
              ))}
            </div>
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
              <span>บันทึกงบประมาณ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
