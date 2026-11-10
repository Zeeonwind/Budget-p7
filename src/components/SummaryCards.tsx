import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  PiggyBank, 
  AlertTriangle, 
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Budget } from '../types';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  prevIncome: number;
  prevExpense: number;
  budget: Budget | null;
  onOpenBudgetModal: () => void;
  daysInMonth: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  prevIncome,
  prevExpense,
  budget,
  onOpenBudgetModal,
  daysInMonth
}) => {
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
  const dailyAverageExpense = totalExpense > 0 && daysInMonth > 0 ? totalExpense / daysInMonth : 0;

  // Budget calculations
  const totalBudget = budget?.totalBudget || 0;
  const alertThreshold = budget?.alertThreshold || 80;
  const budgetSpentPercent = totalBudget > 0 ? Math.min(200, Math.round((totalExpense / totalBudget) * 100)) : 0;
  const isOverBudget = totalBudget > 0 && totalExpense > totalBudget;
  const isNearBudget = totalBudget > 0 && !isOverBudget && budgetSpentPercent >= alertThreshold;

  // Percentage difference from previous month
  const calcDiff = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const incomeDiff = calcDiff(totalIncome, prevIncome);
  const expenseDiff = calcDiff(totalExpense, prevExpense);

  return (
    <div className="space-y-4">
      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รายรับรวม (Income)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 tracking-tight">
            {formatCurrency(totalIncome)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            {incomeDiff !== 0 ? (
              <span className={`font-semibold ${incomeDiff > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                {incomeDiff > 0 ? `+${incomeDiff}%` : `${incomeDiff}%`}
              </span>
            ) : null}
            <span>เทียบกับเดือนก่อน</span>
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-125 transition-transform duration-300 -z-10" />
        </div>

        {/* Expense Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รายจ่ายรวม (Expense)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600 tracking-tight">
            {formatCurrency(totalExpense)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>เฉลี่ยวันละ {formatCurrency(dailyAverageExpense)}</span>
            {expenseDiff !== 0 && (
              <span className={`font-semibold ${expenseDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {expenseDiff > 0 ? `+${expenseDiff}%` : `${expenseDiff}%`}
              </span>
            )}
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-rose-50 rounded-full group-hover:scale-125 transition-transform duration-300 -z-10" />
        </div>

        {/* Net Balance Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ยอดคงเหลือสุทธิ (Balance)</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netBalance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`mt-3 text-2xl font-bold tracking-tight ${
            netBalance >= 0 ? 'text-slate-900' : 'text-amber-600'
          }`}>
            {formatCurrency(netBalance, true)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`font-semibold ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netBalance >= 0 ? 'สถานะการเงินเป็นบวก' : 'รายจ่ายมากกว่ารายรับ'}
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-125 transition-transform duration-300 -z-10" />
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">อัตราการออม (Savings Rate)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 tracking-tight">
            {savingsRate}%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>
              {savingsRate >= 30 ? 'ระดับการออมยอดเยี่ยม 👏' : savingsRate >= 15 ? 'ระดับการออมเหมาะสม 👍' : 'ควรเริ่มวางแผนการออมเพิ่ม'}
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-50 rounded-full group-hover:scale-125 transition-transform duration-300 -z-10" />
        </div>
      </div>

      {/* Monthly Budget Progress Alert Bar */}
      <div className={`p-4 rounded-2xl border transition shadow-sm ${
        isOverBudget
          ? 'bg-red-50/80 border-red-200'
          : isNearBudget
          ? 'bg-amber-50/80 border-amber-200'
          : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isOverBudget
                ? 'bg-red-600 text-white'
                : isNearBudget
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isOverBudget ? (
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              ) : isNearBudget ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  งบประมาณประจำเดือน (Monthly Budget)
                </span>
                {totalBudget > 0 ? (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isOverBudget
                      ? 'bg-red-600 text-white'
                      : isNearBudget
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isOverBudget
                      ? `เกินงบ ${formatCurrency(totalExpense - totalBudget)}`
                      : `ใช้ไปแล้ว ${budgetSpentPercent}%`}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    ยังไม่ได้กำหนดงบ
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-0.5">
                {totalBudget > 0 ? (
                  <>
                    ใช้จ่าย <span className="font-semibold text-slate-800">{formatCurrency(totalExpense)}</span> จากงบทั้งหมด{' '}
                    <span className="font-semibold text-slate-800">{formatCurrency(totalBudget)}</span> (เหลือใช้ได้อีก{' '}
                    <span className={`font-semibold ${totalBudget >= totalExpense ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatCurrency(Math.max(0, totalBudget - totalExpense))}
                    </span>)
                  </>
                ) : (
                  'กำหนดเพดานงบประมาณเพื่อรับการแจ้งเตือนอัตโนมัติเมื่อใกล้เต็มหรือเกินงบ'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenBudgetModal}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 bg-white text-xs font-semibold text-slate-700 shadow-sm transition active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{totalBudget > 0 ? 'ปรับแก้งบประมาณ' : 'ตั้งค่างบประมาณ'}</span>
          </button>
        </div>

        {/* Progress Bar if budget set */}
        {totalBudget > 0 && (
          <div className="mt-3">
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverBudget
                    ? 'bg-red-600'
                    : isNearBudget
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetSpentPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
