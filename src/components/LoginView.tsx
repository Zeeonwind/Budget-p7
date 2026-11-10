import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  PieChart, 
  Bell, 
  ShieldCheck, 
  Wallet, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, loading, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 flex flex-col justify-between text-slate-800">
      {/* Header Bar */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              สมุดบัญชีรายรับ-รายจ่าย
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Firebase Cloud
              </span>
            </h1>
            <p className="text-xs text-slate-500">Expense & Budget Management</p>
          </div>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition shadow-sm"
        >
          <span>เข้าสู่ระบบ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Pitch & Login CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>จัดการการเงินส่วนบุคคล สะดวก ปลอดภัย แม่นยำ</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              วางแผนการเงินง่ายๆ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
                สรุปยอดรายเดือน & กราฟวิเคราะห์
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              ติดตามรายรับและรายจ่าย บันทึกผ่านระบบคลาวด์ พร้อมระบบเตือนชำระบิลค้างจ่าย และแจ้งเตือนทันทีเมื่อใช้จ่ายเกินงบประมาณที่กำหนด
            </p>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">เกิดข้อผิดพลาด</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  ปิด
                </button>
              </div>
            )}

            {/* Google Login Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="cursor-pointer group flex items-center justify-center gap-3 px-7 py-4 bg-white text-slate-800 hover:text-slate-900 border-2 border-slate-200 hover:border-emerald-400 font-semibold rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-emerald-500/10 transition-all duration-200 active:scale-[0.98]"
              >
                {/* Google Icon SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-base">เข้าสู่ระบบด้วย Google (Gmail)</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>บันทึกข้อมูลเรียลไทม์</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>ความปลอดภัยตามมาตรฐาน Google</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>แยกข้อมูลเฉพาะบัญชีของคุณ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup / Feature Showcase */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Decorative Blur Background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl -z-10" />

              <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-300/40 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ฿
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">สรุปเดือนพฤศจิกายน 2569</p>
                      <p className="text-lg font-bold text-slate-900">+฿24,800.00</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    ออมได้ 42%
                  </span>
                </div>

                {/* Feature highlight mini-cards */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 transition flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">กราฟวิเคราะห์รายจ่ายแม่นยำ</h3>
                      <p className="text-xs text-slate-500">แยกตามหมวดหมู่ อาหาร, ค่าเช่า, ช้อปปิ้ง, เดินทาง</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 transition flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">แจ้งเตือนบิล & ควบคุมงบ</h3>
                      <p className="text-xs text-slate-500">ไม่พลาดบิลค่าน้ำค่าไฟ พร้อมเตือนเมื่อใช้จ่ายเกินงบ</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 transition flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">เปรียบเทียบแนวโน้มการเงิน</h3>
                      <p className="text-xs text-slate-500">ดูกราฟแท่งรายรับ vs รายจ่าย ย้อนหลังแต่ละเดือน</p>
                    </div>
                  </div>
                </div>

                {/* Privacy Badge */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    เข้าสู่ระบบปลอดภัยด้วยบัญชี Google
                  </span>
                  <span className="font-medium text-emerald-600">100% ฟรี</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 max-w-7xl mx-auto w-full text-center text-xs text-slate-400 border-t border-slate-200/60">
        ระบบจัดการรายรับ-รายจ่าย • พัฒนาด้วย React & Firebase Firestore Cloud • บัญชี Google ปลอดภัย
      </footer>
    </div>
  );
};
