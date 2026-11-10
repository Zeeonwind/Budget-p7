import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase/config';
import { handleFirestoreError, OperationType } from './firebase/errors';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { BillReminders } from './components/BillReminders';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { BillModal } from './components/BillModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Transaction, Budget, BillReminder, AppNotification } from './types';
import { getCurrentMonthKey, getTodayString, getDaysDifference, formatCurrency, formatMonthLabel } from './utils/formatters';
import { 
  hasNotificationPermission, 
  requestNotificationPermission, 
  sendBrowserNotification 
} from './utils/notifications';
import confetti from 'canvas-confetti';

function generateDocId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Current selected month: 'YYYY-MM'
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthKey());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'bills_budget'>('dashboard');

  // Firestore Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<BillReminder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillReminder | null>(null);

  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Browser notification permission state
  const [browserNotifGranted, setBrowserNotifGranted] = useState<boolean>(false);

  useEffect(() => {
    setBrowserNotifGranted(hasNotificationPermission());
  }, []);

  // Set up Firestore realtime listeners
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setBills([]);
      setNotifications([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    // 1. Transactions Listener
    const txPath = 'transactions';
    const txQuery = query(collection(db, txPath), where('userId', '==', user.uid));
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          category: data.category,
          date: data.date,
          note: data.note || '',
          paymentMethod: data.paymentMethod || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      setTransactions(items);
      setDataLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, txPath);
    });

    // 2. Budgets Listener
    const budgetPath = 'budgets';
    const budgetQuery = query(collection(db, budgetPath), where('userId', '==', user.uid));
    const unsubBudgets = onSnapshot(budgetQuery, (snapshot) => {
      const items: Budget[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          month: data.month,
          totalBudget: data.totalBudget,
          alertThreshold: data.alertThreshold || 80,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      setBudgets(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, budgetPath);
    });

    // 3. Bill Reminders Listener
    const billsPath = 'bill_reminders';
    const billsQuery = query(collection(db, billsPath), where('userId', '==', user.uid));
    const unsubBills = onSnapshot(billsQuery, (snapshot) => {
      const items: BillReminder[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title,
          amount: data.amount,
          category: data.category,
          dueDate: data.dueDate,
          frequency: data.frequency,
          isPaid: data.isPaid ?? false,
          remindDaysBefore: data.remindDaysBefore ?? 3,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      setBills(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, billsPath);
    });

    // 4. Notifications Listener
    const notifPath = 'notifications';
    const notifQuery = query(collection(db, notifPath), where('userId', '==', user.uid));
    const unsubNotifs = onSnapshot(notifQuery, (snapshot) => {
      const items: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: data.isRead ?? false,
          relatedId: data.relatedId,
          createdAt: data.createdAt
        });
      });
      // Sort newest first
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setNotifications(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, notifPath);
    });

    return () => {
      unsubTx();
      unsubBudgets();
      unsubBills();
      unsubNotifs();
    };
  }, [user]);

  // Current Month Data Filtering
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  const currentBudget = useMemo(() => {
    return budgets.find(b => b.month === currentMonth) || null;
  }, [budgets, currentMonth]);

  // Current Month Summary Metrics
  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  // Previous Month Summary Metrics for Comparison
  const [prevIncome, prevExpense] = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const prevTxs = transactions.filter(t => t.date.startsWith(prevKey));
    const inc = prevTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return [inc, exp];
  }, [transactions, currentMonth]);

  const daysInCurrentMonth = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [currentMonth]);

  // Automated Notification Checks (Bills & Budget)
  const checkedRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!user || dataLoading) return;

    const runChecks = async () => {
      const todayStr = getTodayString();

      // 1. Check Upcoming & Overdue Bills
      for (const bill of bills) {
        if (bill.isPaid) continue;

        const diffDays = getDaysDifference(bill.dueDate);
        const shouldRemind = diffDays <= (bill.remindDaysBefore || 3);
        const checkKey = `bill_${bill.id}_${todayStr}_${diffDays <= 0 ? 'overdue' : 'due'}`;

        if (shouldRemind && !checkedRef.current[checkKey]) {
          checkedRef.current[checkKey] = true;

          // Check if notification already exists in state
          const existing = notifications.find(
            n => n.relatedId === bill.id && n.createdAt.startsWith(todayStr)
          );

          if (!existing) {
            let title = `แจ้งเตือนบิล: ${bill.title}`;
            let msg = '';
            if (diffDays < 0) {
              title = `⚠️ บิลเลยกำหนดชำระ: ${bill.title}`;
              msg = `บิล "${bill.title}" จำนวน ${formatCurrency(bill.amount)} เลยกำหนดชำระมาแล้ว ${Math.abs(diffDays)} วัน (ครบกำหนด ${bill.dueDate})`;
            } else if (diffDays === 0) {
              title = `⏰ บิลครบกำหนดชำระวันนี้: ${bill.title}`;
              msg = `บิล "${bill.title}" จำนวน ${formatCurrency(bill.amount)} ครบกำหนดชำระในวันนี้`;
            } else {
              msg = `บิล "${bill.title}" จำนวน ${formatCurrency(bill.amount)} จะครบกำหนดชำระในอีก ${diffDays} วัน (${bill.dueDate})`;
            }

            try {
              const notifId = generateDocId('notif');
              const notifData: AppNotification = {
                id: notifId,
                userId: user.uid,
                title,
                message: msg,
                type: 'bill_reminder',
                isRead: false,
                relatedId: bill.id,
                createdAt: new Date().toISOString()
              };

              await setDoc(doc(db, 'notifications', notifId), notifData);

              // Dispatch browser notification
              sendBrowserNotification(title, { body: msg });
            } catch (err) {
              console.error('Failed to create bill notification:', err);
            }
          }
        }
      }

      // 2. Check Monthly Budget Limit & Threshold
      if (currentBudget && currentBudget.totalBudget > 0) {
        const thresholdPercent = currentBudget.alertThreshold || 80;
        const spentPercent = (totalExpense / currentBudget.totalBudget) * 100;
        const isOver = totalExpense > currentBudget.totalBudget;
        const isNear = !isOver && spentPercent >= thresholdPercent;

        const budgetCheckKey = `budget_${currentMonth}_${isOver ? 'over' : isNear ? 'near' : 'ok'}`;

        if ((isOver || isNear) && !checkedRef.current[budgetCheckKey]) {
          checkedRef.current[budgetCheckKey] = true;

          const existing = notifications.find(
            n => n.type === 'budget_alert' && n.message.includes(currentMonth)
          );

          if (!existing) {
            let title = '';
            let msg = '';

            if (isOver) {
              title = `🚨 แจ้งเตือนค่าใช้จ่ายเกินงบ (${formatMonthLabel(currentMonth)})`;
              msg = `ยอดรายจ่ายเดือนนี้รวม ${formatCurrency(totalExpense)} ซึ่งเกินงบประมาณ ${formatCurrency(currentBudget.totalBudget)} ไปแล้ว ${formatCurrency(totalExpense - currentBudget.totalBudget)}`;
            } else {
              title = `⚠️ ค่าใช้จ่ายใกล้ถึงงบที่กำหนด (${formatMonthLabel(currentMonth)})`;
              msg = `คุณใช้จ่ายไปแล้ว ${spentPercent.toFixed(1)}% ของงบประมาณ (${formatCurrency(totalExpense)} จาก ${formatCurrency(currentBudget.totalBudget)})`;
            }

            try {
              const notifId = generateDocId('notif');
              const notifData: AppNotification = {
                id: notifId,
                userId: user.uid,
                title,
                message: msg,
                type: 'budget_alert',
                isRead: false,
                createdAt: new Date().toISOString()
              };

              await setDoc(doc(db, 'notifications', notifId), notifData);
              sendBrowserNotification(title, { body: msg });
            } catch (err) {
              console.error('Failed to create budget alert:', err);
            }
          }
        }
      }
    };

    runChecks();
  }, [bills, currentBudget, totalExpense, currentMonth, user, dataLoading, notifications]);

  // Request browser notification
  const handleRequestBrowserNotification = async () => {
    const granted = await requestNotificationPermission();
    setBrowserNotifGranted(granted);
    if (granted) {
      sendBrowserNotification('เปิดการแจ้งเตือนสำเร็จ 🎉', {
        body: 'ระบบจะส่งการแจ้งเตือนบิลค้างชำระและงบประมาณให้คุณแบบเรียลไทม์'
      });
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  // Transaction Actions
  const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = new Date().toISOString();

    if (editingTx) {
      const updateData: Transaction = {
        ...editingTx,
        ...data,
        updatedAt: now
      };
      try {
        await setDoc(doc(db, 'transactions', editingTx.id), updateData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `transactions/${editingTx.id}`);
      }
    } else {
      const newId = generateDocId('tx');
      const newDoc: Transaction = {
        id: newId,
        userId: user.uid,
        ...data,
        createdAt: now
      };
      try {
        await setDoc(doc(db, 'transactions', newId), newDoc);
        if (data.type === 'income') {
          confetti({ particleCount: 40, spread: 50 });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `transactions/${newId}`);
      }
    }
    setEditingTx(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
    }
  };

  // Budget Actions
  const handleSaveBudget = async (newTotal: number, newThreshold: number) => {
    if (!user) return;
    const now = new Date().toISOString();
    const existing = budgets.find(b => b.month === currentMonth);

    if (existing) {
      const updateData: Budget = {
        ...existing,
        totalBudget: newTotal,
        alertThreshold: newThreshold,
        updatedAt: now
      };
      try {
        await setDoc(doc(db, 'budgets', existing.id), updateData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `budgets/${existing.id}`);
      }
    } else {
      const newId = generateDocId('bgt');
      const newDoc: Budget = {
        id: newId,
        userId: user.uid,
        month: currentMonth,
        totalBudget: newTotal,
        alertThreshold: newThreshold,
        createdAt: now
      };
      try {
        await setDoc(doc(db, 'budgets', newId), newDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `budgets/${newId}`);
      }
    }
  };

  // Bill Actions
  const handleSaveBill = async (data: Omit<BillReminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = new Date().toISOString();

    if (editingBill) {
      const updateData: BillReminder = {
        ...editingBill,
        ...data,
        updatedAt: now
      };
      try {
        await setDoc(doc(db, 'bill_reminders', editingBill.id), updateData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `bill_reminders/${editingBill.id}`);
      }
    } else {
      const newId = generateDocId('bill');
      const newDoc: BillReminder = {
        id: newId,
        userId: user.uid,
        ...data,
        createdAt: now
      };
      try {
        await setDoc(doc(db, 'bill_reminders', newId), newDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `bill_reminders/${newId}`);
      }
    }
    setEditingBill(null);
  };

  const handleDeleteBill = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bill_reminders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bill_reminders/${id}`);
    }
  };

  const handleTogglePaidBill = async (bill: BillReminder, recordExpense: boolean) => {
    if (!user) return;
    const now = new Date().toISOString();
    const newPaidStatus = !bill.isPaid;

    const updateBill: BillReminder = {
      ...bill,
      isPaid: newPaidStatus,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'bill_reminders', bill.id), updateBill);

      if (newPaidStatus) {
        confetti({ particleCount: 35, spread: 50 });

        if (recordExpense) {
          const newTxId = generateDocId('tx');
          const newTx: Transaction = {
            id: newTxId,
            userId: user.uid,
            type: 'expense',
            amount: bill.amount,
            category: bill.category || 'ค่าน้ำ-ไฟ-อินเทอร์เน็ต',
            date: getTodayString(),
            note: `ชำระบิล: ${bill.title}`,
            paymentMethod: 'โอนเงิน / พร้อมเพย์ (PromptPay)',
            createdAt: now
          };
          await setDoc(doc(db, 'transactions', newTxId), newTx);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bill_reminders/${bill.id}`);
    }
  };

  // Notification Actions
  const handleMarkAsRead = async (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (!target) return;
    try {
      await setDoc(doc(db, 'notifications', id), {
        ...target,
        isRead: true
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.isRead);
    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { isRead: true });
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'notifications');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
      batch.delete(doc(db, 'notifications', n.id));
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'notifications');
    }
  };

  // Unread notifications count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">กำลังเชื่อมต่อข้อมูล...</p>
      </div>
    );
  }

  // If not logged in, show Login Landing Page
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col">
      {/* Top Header */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* TAB 1: Dashboard Overview (Summary Cards + Visual Analytics Charts) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              prevIncome={prevIncome}
              prevExpense={prevExpense}
              budget={currentBudget}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              daysInMonth={daysInCurrentMonth}
            />

            <AnalyticsCharts
              currentMonthTransactions={currentMonthTransactions}
              allTransactions={transactions}
              currentMonth={currentMonth}
            />

            {/* Quick Recent Transactions Section */}
            <div className="pt-2">
              <TransactionList
                transactions={currentMonthTransactions}
                onEditTransaction={(tx) => {
                  setEditingTx(tx);
                  setIsTxModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenNewTransaction={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
                currentMonth={currentMonth}
              />
            </div>
          </div>
        )}

        {/* TAB 2: All Transactions History */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <TransactionList
              transactions={currentMonthTransactions}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenNewTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              currentMonth={currentMonth}
            />
          </div>
        )}

        {/* TAB 3: Bill Reminders & Budget Setting */}
        {activeTab === 'bills_budget' && (
          <BillReminders
            bills={bills}
            budget={currentBudget}
            onOpenNewBill={() => {
              setEditingBill(null);
              setIsBillModalOpen(true);
            }}
            onEditBill={(bill) => {
              setEditingBill(bill);
              setIsBillModalOpen(true);
            }}
            onDeleteBill={handleDeleteBill}
            onTogglePaidBill={handleTogglePaidBill}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            isBrowserNotificationGranted={browserNotifGranted}
            onRequestBrowserNotification={handleRequestBrowserNotification}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        currentBudget={currentBudget}
        currentMonth={currentMonth}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
        editingBill={editingBill}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAll={handleClearAllNotifications}
      />

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
        ระบบบันทึกรายรับ-รายจ่าย • เชื่อมต่อฐานข้อมูล Firebase Firestore • เข้าสู่ระบบด้วย Gmail
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
