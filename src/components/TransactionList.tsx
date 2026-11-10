import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { getCategoryDetails, ALL_CATEGORIES } from '../constants/categories';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Download, 
  Plus, 
  Receipt,
  Tag
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
  currentMonth: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
  currentMonth
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter transactions
  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = t.category.toLowerCase().includes(q);
      const matchNote = t.note?.toLowerCase().includes(q);
      const matchMethod = t.paymentMethod?.toLowerCase().includes(q);
      if (!matchCat && !matchNote && !matchMethod) return false;
    }
    return true;
  });

  // Group by date
  const groupedByDate: { [date: string]: Transaction[] } = {};
  filtered.forEach(t => {
    if (!groupedByDate[t.date]) {
      groupedByDate[t.date] = [];
    }
    groupedByDate[t.date].push(t);
  });

  // Sorted dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'ช่องทางชำระ', 'บันทึกช่วยจำ'];
    const rows = transactions.map(t => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.category,
      t.amount.toString(),
      t.paymentMethod || '-',
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense_report_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            ประวัติรายการรายรับและรายจ่าย
          </h2>
          <p className="text-xs text-slate-500">
            แสดงรายการทั้งหมด {transactions.length} รายการในเดือนนี้
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-sm"
              title="ส่งออกรายงานเป็น CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด CSV</span>
            </button>
          )}

          <button
            onClick={onOpenNewTransaction}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
        {/* Search Input */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาหมวดหมู่, หมายเหตุ, ช่องทางชำระ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Type Toggle */}
        <div className="sm:col-span-4 flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1 rounded-lg transition ${
              filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`flex-1 py-1 rounded-lg transition ${
              filterType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รายรับ
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`flex-1 py-1 rounded-lg transition ${
              filterType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รายจ่าย
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {ALL_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name} ({cat.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="py-14 text-center text-slate-400">
          <Receipt className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่มเพิ่มรายการเพื่อบันทึก</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => {
            const dayItems = groupedByDate[date];
            const dayIncome = dayItems.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const dayExpense = dayItems.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

            return (
              <div key={date} className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                {/* Date Header */}
                <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    {formatThaiDate(date)}
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    {dayIncome > 0 && (
                      <span className="font-semibold text-emerald-600">
                        +{formatCurrency(dayIncome)}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span className="font-semibold text-rose-600">
                        -{formatCurrency(dayExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date Items */}
                <div className="divide-y divide-slate-100">
                  {dayItems.map(item => {
                    const catDetails = getCategoryDetails(item.category, item.type);
                    const isIncome = item.type === 'income';

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/80 transition group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Category Badge Icon */}
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-xs"
                            style={{ backgroundColor: catDetails.color }}
                          >
                            <Tag className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800">
                                {item.category}
                              </p>
                              {item.paymentMethod && (
                                <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                  {item.paymentMethod}
                                </span>
                              )}
                            </div>
                            {item.note && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold tracking-tight ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isIncome ? `+${formatCurrency(item.amount)}` : `-${formatCurrency(item.amount)}`}
                          </span>

                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEditTransaction(item)}
                              title="แก้ไขรายการ"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`ต้องการลบรายการ "${item.category} (${formatCurrency(item.amount)})" หรือไม่?`)) {
                                  onDeleteTransaction(item.id);
                                }
                              }}
                              title="ลบรายการ"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
