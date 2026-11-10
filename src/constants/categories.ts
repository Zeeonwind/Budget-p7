import { CategoryItem } from '../types';

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', icon: 'Utensils', color: '#F97316', type: 'expense' },
  { id: 'transport', name: 'การเดินทางและพาหนะ', icon: 'Car', color: '#3B82F6', type: 'expense' },
  { id: 'housing', name: 'ที่อยู่อาศัยและค่าเช่า', icon: 'Home', color: '#8B5CF6', type: 'expense' },
  { id: 'utilities', name: 'ค่าน้ำ-ไฟ-อินเทอร์เน็ต', icon: 'Zap', color: '#EAB308', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' },
  { id: 'health', name: 'สุขภาพและการรักษา', icon: 'HeartPulse', color: '#EF4444', type: 'expense' },
  { id: 'entertainment', name: 'ความบันเทิงและสันทนาการ', icon: 'Film', color: '#14B8A6', type: 'expense' },
  { id: 'education', name: 'การศึกษาและพัฒนาตนเอง', icon: 'GraduationCap', color: '#6366F1', type: 'expense' },
  { id: 'debt', name: 'ชำระหนี้และบัตรเครดิต', icon: 'CreditCard', color: '#F43F5E', type: 'expense' },
  { id: 'family', name: 'ครอบครัวและสัตว์เลี้ยง', icon: 'Users', color: '#10B981', type: 'expense' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', icon: 'MoreHorizontal', color: '#64748B', type: 'expense' }
];

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'salary', name: 'เงินเดือนประจำ', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', icon: 'Laptop', color: '#06B6D4', type: 'income' },
  { id: 'bonus', name: 'โบนัสและเงินรางวัล', icon: 'Award', color: '#F59E0B', type: 'income' },
  { id: 'investment', name: 'ผลตอบแทนการลงทุน/ปันผล', icon: 'TrendingUp', color: '#8B5CF6', type: 'income' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', icon: 'Store', color: '#3B82F6', type: 'income' },
  { id: 'gift', name: 'ของขวัญ / ผู้ใหญ่ให้', icon: 'Gift', color: '#EC4899', type: 'income' },
  { id: 'other_income', name: 'รายรับอื่นๆ', icon: 'PlusCircle', color: '#64748B', type: 'income' }
];

export const PAYMENT_METHODS = [
  'เงินสด (Cash)',
  'โอนเงิน / พร้อมเพย์ (PromptPay)',
  'บัตรเครดิต (Credit Card)',
  'บัตรเดบิต (Debit Card)',
  'TrueMoney / E-Wallet',
  'หักบัญชีอัตโนมัติ (Auto Debit)'
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryDetails(nameOrId: string, type?: 'income' | 'expense'): CategoryItem {
  const match = ALL_CATEGORIES.find(c => c.name === nameOrId || c.id === nameOrId);
  if (match) return match;
  return {
    id: 'unknown',
    name: nameOrId || 'อื่นๆ',
    icon: 'CircleDot',
    color: type === 'income' ? '#10B981' : '#F97316',
    type: type || 'expense'
  };
}
