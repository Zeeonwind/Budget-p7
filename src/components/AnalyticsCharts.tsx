import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, THAI_MONTHS_SHORT } from '../utils/formatters';
import { getCategoryDetails } from '../constants/categories';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
  Tag
} from 'lucide-react';

interface AnalyticsChartsProps {
  currentMonthTransactions: Transaction[];
  allTransactions: Transaction[];
  currentMonth: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  currentMonthTransactions,
  allTransactions,
  currentMonth
}) => {
  const [chartView, setChartView] = useState<'categories' | 'monthly_trend' | 'daily_trend'>('categories');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  // Filter transactions for current month by type
  const activeTransactions = currentMonthTransactions.filter(t => t.type === categoryType);
  const totalAmount = activeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryMap: { [cat: string]: number } = {};
  activeTransactions.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryData = Object.entries(categoryMap)
    .map(([cat, amount]) => {
      const details = getCategoryDetails(cat, categoryType);
      const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      return {
        category: cat,
        details,
        amount,
        percent
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 6-Month Comparison Data
  const getSixMonthsData = () => {
    const [currY, currM] = currentMonth.split('-').map(Number);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currY, currM - 1 - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      const monthLabel = `${THAI_MONTHS_SHORT[d.getMonth()]} ${String(y + 543).slice(-2)}`;

      const mTrans = allTransactions.filter(t => t.date.startsWith(key));
      const income = mTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = mTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      months.push({ key, label: monthLabel, income, expense });
    }
    return months;
  };

  const sixMonths = getSixMonthsData();
  const maxSixMonthVal = Math.max(1, ...sixMonths.map(m => Math.max(m.income, m.expense)));

  // Daily Spending Trend within Current Month
  const [yearNum, monthNum] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const dailyData: { day: number; expense: number; income: number }[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
    const dayTrans = currentMonthTransactions.filter(t => t.date === dayStr);
    const exp = dayTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const inc = dayTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    dailyData.push({ day, expense: exp, income: inc });
  }
  const maxDailyExpense = Math.max(1, ...dailyData.map(d => d.expense));

  // Donut SVG Generator
  let accumulatedAngle = 0;
  const donutSegments = categoryData.map(item => {
    const angle = (item.percent / 100) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      ...item,
      startAngle,
      angle
    };
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            กราฟวิเคราะห์สรุปผลข้อมูล
          </h2>
          <p className="text-xs text-slate-500">
            แสดงสัดส่วนการเงินและเปรียบเทียบแนวโน้มเพื่อการตัดสินใจที่แม่นยำ
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
          <button
            onClick={() => setChartView('categories')}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              chartView === 'categories'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>สัดส่วนหมวดหมู่</span>
          </button>

          <button
            onClick={() => setChartView('monthly_trend')}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              chartView === 'monthly_trend'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>แนวโน้ม 6 เดือน</span>
          </button>

          <button
            onClick={() => setChartView('daily_trend')}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              chartView === 'daily_trend'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>รายวันในเดือน</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Category Breakdown (Donut Chart + Ranked List) */}
      {chartView === 'categories' && (
        <div className="space-y-5">
          {/* Sub-toggle: Expense vs Income */}
          <div className="flex items-center justify-between">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setCategoryType('expense')}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  categoryType === 'expense'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>วิเคราะห์รายจ่าย ({formatCurrency(totalAmount)})</span>
              </button>
              <button
                onClick={() => setCategoryType('income')}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  categoryType === 'income'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>วิเคราะห์รายรับ ({formatCurrency(totalAmount)})</span>
              </button>
            </div>

            <span className="text-xs text-slate-400">
              พบ {categoryData.length} หมวดหมู่
            </span>
          </div>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Tag className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
              <p className="text-sm">ยังไม่มีข้อมูล{categoryType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
              <p className="text-xs text-slate-400 mt-1">กดปุ่ม "+ เพิ่มรายการ" เพื่อเริ่มบันทึก</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Donut Chart representation */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-56 h-56">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                    />
                    {donutSegments.map((seg, idx) => {
                      const strokeDash = `${seg.percent * 2.387} 238.7`;
                      const strokeOffset = -((seg.startAngle / 360) * 238.7);
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={seg.details.color}
                          strokeWidth="16"
                          strokeDasharray={strokeDash}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-500 hover:stroke-width-[18]"
                        />
                      );
                    })}
                  </svg>

                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[11px] font-medium text-slate-400">
                      รวม{categoryType === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                    </span>
                    <span className={`text-base font-bold ${
                      categoryType === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Table / Progress bars */}
              <div className="lg:col-span-7 space-y-3">
                {categoryData.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.details.color }}
                        />
                        <span className="font-semibold text-slate-800">
                          {item.details.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-slate-400 font-mono w-12 text-right">
                          {item.percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.details.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 6-Month Comparison (Income vs Expense Bar Chart) */}
      {chartView === 'monthly_trend' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">เปรียบเทียบย้อนหลัง 6 เดือน</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="font-medium text-slate-700">รายรับ</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                <span className="font-medium text-slate-700">รายจ่าย</span>
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200">
            {sixMonths.map((m, idx) => {
              const incHeight = maxSixMonthVal > 0 ? (m.income / maxSixMonthVal) * 100 : 0;
              const expHeight = maxSixMonthVal > 0 ? (m.expense / maxSixMonthVal) * 100 : 0;
              const isCurrent = m.key === currentMonth;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-28 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-lg pointer-events-none z-20 whitespace-nowrap">
                    <p className="font-bold">{m.label}</p>
                    <p className="text-emerald-400">รายรับ: {formatCurrency(m.income)}</p>
                    <p className="text-rose-400">รายจ่าย: {formatCurrency(m.expense)}</p>
                    <p className="text-slate-300">คงเหลือ: {formatCurrency(m.income - m.expense)}</p>
                  </div>

                  {/* Bars side-by-side */}
                  <div className="w-full max-w-[50px] flex items-end justify-center gap-1 h-44">
                    {/* Income Bar */}
                    <div
                      className="w-1/2 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all duration-300"
                      style={{ height: `${Math.max(incHeight > 0 ? 4 : 0, incHeight)}%` }}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-1/2 bg-rose-500 rounded-t-md hover:bg-rose-600 transition-all duration-300"
                      style={{ height: `${Math.max(expHeight > 0 ? 4 : 0, expHeight)}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span className={`text-[11px] mt-2 font-medium ${
                    isCurrent ? 'text-emerald-700 font-bold underline underline-offset-4' : 'text-slate-500'
                  }`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Daily Spending Trend in Current Month */}
      {chartView === 'daily_trend' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>แนวโน้มการใช้จ่ายในแต่ละวัน (วันที่ 1 - {daysInMonth})</span>
            <span className="text-rose-600 font-medium">
              วันที่มีรายจ่ายสูงสุด: {formatCurrency(maxDailyExpense)}
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-1 pt-4 pb-2 border-b border-slate-200">
            {dailyData.map((d) => {
              const height = maxDailyExpense > 0 ? (d.expense / maxDailyExpense) * 100 : 0;
              const hasExpense = d.expense > 0;

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip */}
                  {hasExpense && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-20 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-lg pointer-events-none z-20 whitespace-nowrap">
                      <p className="font-bold">วันที่ {d.day}</p>
                      <p className="text-rose-400">รายจ่าย: {formatCurrency(d.expense)}</p>
                      {d.income > 0 && <p className="text-emerald-400">รายรับ: {formatCurrency(d.income)}</p>}
                    </div>
                  )}

                  {/* Daily Bar */}
                  <div
                    className={`w-full max-w-[12px] rounded-t-sm transition-all duration-200 ${
                      hasExpense ? 'bg-rose-400 group-hover:bg-rose-600' : 'bg-slate-100'
                    }`}
                    style={{ height: `${Math.max(hasExpense ? 4 : 2, height)}%` }}
                  />

                  {/* Day label (every 5 days) */}
                  <span className="text-[9px] text-slate-400 mt-1">
                    {d.day === 1 || d.day % 5 === 0 || d.day === daysInMonth ? d.day : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
