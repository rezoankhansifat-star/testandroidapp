import React, { useState, useMemo } from 'react';
import { 
  Home as HomeIcon, 
  PieChart, 
  ArrowLeftRight, 
  LayoutGrid, 
  Settings as SettingsIcon,
  Plus,
  ChevronLeft,
  Calendar,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Car,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useStorage } from './hooks/useStorage';
import { CATEGORIES, THEME } from './constants';
import { Transaction, CategoryType, Budget } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'home' | 'graph' | 'transactions' | 'category' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('home');
  const { data, addTransaction, deleteTransaction, updateBudget } = useStorage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Derived data
  const monthlyTransactions = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return data.transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
  }, [data.transactions]);

  const totalIncome = useMemo(() => 
    monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  , [monthlyTransactions]);

  const totalExpense = useMemo(() => 
    monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  , [monthlyTransactions]);

  const balance = totalIncome - totalExpense;

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [monthlyTransactions]);

  const renderView = () => {
    switch (activeView) {
      case 'home': return <HomeView data={data} totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} categoryTotals={categoryTotals} />;
      case 'graph': return <GraphView categoryTotals={categoryTotals} transactions={monthlyTransactions} />;
      case 'category': return <BudgetView data={data} monthlyTransactions={monthlyTransactions} />;
      case 'transactions': return <TransactionsView transactions={data.transactions} />;
      case 'settings': return <SettingsView budgets={data.budgets} onUpdateBudget={updateBudget} />;
      default: return <HomeView data={data} totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} categoryTotals={categoryTotals} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#7F3DFF] rounded-xl flex items-center justify-center text-white">
            <LayoutGrid size={24} />
          </div>
          <h1 className="text-xl font-bold">FinTrack</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarButton icon={HomeIcon} label="Home" active={activeView === 'home'} onClick={() => setActiveView('home')} />
          <SidebarButton icon={PieChart} label="Graph" active={activeView === 'graph'} onClick={() => setActiveView('graph')} />
          <SidebarButton icon={ArrowLeftRight} label="Transactions" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
          <SidebarButton icon={LayoutGrid} label="Category" active={activeView === 'category'} onClick={() => setActiveView('category')} />
          <SidebarButton icon={SettingsIcon} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </nav>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="mt-6 w-full py-4 bg-[#7F3DFF] text-white rounded-2xl font-bold shadow-lg shadow-[#7F3DFF]/30 flex items-center justify-center gap-2 hover:bg-[#6A2EE0] transition-colors"
        >
          <Plus size={20} />
          <span>Add Transaction</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-6">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Floating Add Button */}
        <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 bg-[#7F3DFF] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#7F3DFF]/40 active:scale-95 transition-transform"
          >
            <Plus size={32} />
          </button>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 absolute bottom-0 w-full z-40">
          <NavButton icon={HomeIcon} label="Home" active={activeView === 'home'} onClick={() => setActiveView('home')} />
          <NavButton icon={PieChart} label="Graph" active={activeView === 'graph'} onClick={() => setActiveView('graph')} />
          <div className="w-12" /> {/* Spacer for floating button */}
          <NavButton icon={ArrowLeftRight} label="Transactions" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
          <NavButton icon={LayoutGrid} label="Category" active={activeView === 'category'} onClick={() => setActiveView('category')} />
        </nav>
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addTransaction} 
      />
    </div>
  );
}

// --- Sub-components ---

function SidebarButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold",
        active 
          ? "bg-[#7F3DFF]/10 text-[#7F3DFF]" 
          : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
      )}
    >
      <Icon size={22} />
      <span>{label}</span>
    </button>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-colors",
        active ? "text-[#7F3DFF]" : "text-[#C6C6C6]"
      )}
    >
      <Icon size={24} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function HomeView({ data, totalIncome, totalExpense, balance, categoryTotals }: { data: any, totalIncome: number, totalExpense: number, balance: number, categoryTotals: any[] }) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const currentMonth = format(new Date(), 'MMMM');

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
          <LayoutGrid size={20} className="text-[#7F3DFF]" />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium">Today: <span className="text-gray-900">${(balance).toLocaleString()}</span></p>
        </div>
        <button className="px-4 py-1.5 bg-[#EEE5FF] text-[#7F3DFF] rounded-full text-xs font-semibold">
          Upgrade
        </button>
      </div>

      {/* Toggle */}
      <div className="bg-gray-50 p-1 rounded-2xl flex">
        <button 
          onClick={() => setType('expense')}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
            type === 'expense' ? "bg-[#4C6FFF] text-white shadow-sm" : "text-gray-400"
          )}
        >
          Expense
        </button>
        <button 
          onClick={() => setType('income')}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
            type === 'income' ? "bg-[#4C6FFF] text-white shadow-sm" : "text-gray-400"
          )}
        >
          Income
        </button>
      </div>

      {/* Savings Card */}
      <div className="space-y-4">
        <p className="text-xs text-gray-400 font-medium text-center">{currentMonth} Savings</p>
        <h2 className="text-4xl font-bold text-center">${(balance).toLocaleString()}</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="px-3 py-1 bg-[#00D1FF]/10 text-[#00D1FF] rounded-full">Earned</span>
              <span className="text-gray-400">${totalIncome.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00D1FF] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalIncome / (totalIncome + totalExpense || 1)) * 100, 100)}%` }} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="px-3 py-1 bg-[#FF5C5C]/10 text-[#FF5C5C] rounded-full">Spend</span>
              <span className="text-gray-400">${totalExpense.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF5C5C] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalExpense / (totalIncome + totalExpense || 1)) * 100, 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Spending */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Top Spending</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {categoryTotals.length > 0 ? categoryTotals.sort((a, b) => b.value - a.value).slice(0, 5).map((cat) => {
            const catInfo = CATEGORIES.find(c => c.name === cat.name);
            return (
              <div key={cat.name} className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-14 h-14 rounded-2xl bg-[#EEE5FF] flex items-center justify-center text-[#7F3DFF]" style={{ backgroundColor: `${catInfo?.color}15`, color: catInfo?.color }}>
                  {catInfo?.icon ? <catInfo.icon size={24} /> : <LayoutGrid size={24} />}
                </div>
                <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{cat.name}</span>
              </div>
            );
          }) : (
            <div className="text-xs text-gray-400 p-4">No spending data yet.</div>
          )}
        </div>
      </div>

      {/* Monthly Budget Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Monthly Budget</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {data.budgets.length > 0 ? data.budgets.map((budget: any) => {
            const catInfo = CATEGORIES.find(c => c.name === budget.category);
            const spent = data.transactions
              .filter((t: any) => t.type === 'expense' && t.category === budget.category)
              .reduce((sum: number, t: any) => sum + t.amount, 0);
            const percent = Math.min((spent / budget.limit) * 100, 100);

            return (
              <div key={budget.category} className="min-w-[240px] p-4 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5C5C]/10 flex items-center justify-center text-[#FF5C5C]" style={{ backgroundColor: `${catInfo?.color}15`, color: catInfo?.color }}>
                    {catInfo?.icon ? <catInfo.icon size={20} /> : <LayoutGrid size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{budget.category}</p>
                    <p className="text-[10px] text-gray-400">${(budget.limit / 30).toFixed(0)} Per day</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: catInfo?.color }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span style={{ color: catInfo?.color }}>${spent.toLocaleString()}</span>
                    <span className="text-gray-300">${budget.limit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-xs text-gray-400 p-4">No budgets set yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function GraphView({ categoryTotals, transactions }: { categoryTotals: any[], transactions: Transaction[] }) {
  const COLORS = ['#4C6FFF', '#FF5C5C', '#FF9500', '#AF52DE', '#34C759', '#5856D6', '#FF2D55', '#FFCC00', '#8E8E93', '#C7C7CC'];
  
  const total = categoryTotals.reduce((sum, c) => sum + c.value, 0);
  const currentMonth = format(new Date(), 'MMMM');

  return (
    <div className="bg-[#7F3DFF] min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between text-white">
          <ChevronLeft size={24} />
          <h2 className="text-lg font-bold">Billing Reports</h2>
          <Calendar size={24} />
        </div>

        {/* Month Selector */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar text-white/60 text-sm font-medium pb-2">
          {[currentMonth].map(m => (
            <span key={m} className={cn("text-white relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full")}>
              {m}
            </span>
          ))}
        </div>

        {/* Chart Card */}
        <div className="bg-white rounded-[40px] p-8 shadow-xl relative overflow-hidden">
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryTotals.length > 0 ? categoryTotals : [{ name: 'Empty', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {categoryTotals.length === 0 && <Cell fill="#F3F4F6" />}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-gray-400 font-bold">Total</p>
              <p className="text-2xl font-bold">${total.toLocaleString()}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {categoryTotals.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-bold text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-t-[40px] -mx-6 p-6 space-y-6 min-h-[400px]">
          {categoryTotals.length > 0 ? categoryTotals.map((cat, i) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                  {(() => {
                    const catInfo = CATEGORIES.find(c => c.name === cat.name);
                    const Icon = catInfo?.icon || LayoutGrid;
                    return <Icon size={24} />;
                  })()}
                </div>
                <div>
                  <p className="font-bold">{cat.name}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    {transactions.filter(t => t.category === cat.name).length} transactions
                  </p>
                </div>
              </div>
              <p className="font-bold text-lg">${cat.value.toLocaleString()}</p>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-400">No expenses this month.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BudgetView({ data, monthlyTransactions }: { data: any, monthlyTransactions: Transaction[] }) {
  const [activeTab, setActiveTab] = useState<'categories' | 'merchants'>('categories');
  const currentMonth = format(new Date(), 'MMMM');
  const totalBudget = data.budgets.reduce((sum: number, b: any) => sum + b.limit, 0);

  const getCategorySpending = (category: CategoryType) => {
    return monthlyTransactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="bg-[#7F3DFF] min-h-screen">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between text-white">
          <ChevronLeft size={24} />
          <h2 className="text-lg font-bold">Budget</h2>
          <Calendar size={24} />
        </div>

        <div className="text-center text-white space-y-2 py-4">
          <h1 className="text-5xl font-bold">${totalBudget.toLocaleString()}<span className="text-2xl opacity-60">.00</span></h1>
          <p className="text-sm font-medium opacity-60">{currentMonth}</p>
        </div>

        {/* Small Line Chart Placeholder */}
        <div className="h-24 -mx-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTransactions.length > 0 ? monthlyTransactions.map((t, i) => ({ v: t.amount, i })) : [{v: 0, i: 0}]}>
              <Line type="monotone" dataKey="v" stroke="white" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-[40px] -mx-6 p-6 space-y-6 min-h-screen">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('categories')}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors relative",
                activeTab === 'categories' ? "text-[#7F3DFF]" : "text-gray-300"
              )}
            >
              Categories
              {activeTab === 'categories' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#7F3DFF] rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('merchants')}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors relative",
                activeTab === 'merchants' ? "text-[#7F3DFF]" : "text-gray-300"
              )}
            >
              Merchants
              {activeTab === 'merchants' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#7F3DFF] rounded-t-full" />}
            </button>
          </div>

          {/* Budget List */}
          <div className="space-y-4">
            {data.budgets.length > 0 ? data.budgets.map((budget: any) => {
              const spent = getCategorySpending(budget.category);
              const percent = Math.min((spent / budget.limit) * 100, 100);
              const isExceeding = spent > budget.limit;
              const catInfo = CATEGORIES.find(c => c.name === budget.category);

              return (
                <div key={budget.category} className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${catInfo?.color}15`, color: catInfo?.color }}>
                      {catInfo?.icon ? <catInfo.icon size={24} /> : <LayoutGrid size={24} />}
                    </div>
                    <div>
                      <p className="font-bold">{budget.category}</p>
                      <p className="text-xs text-gray-400 font-medium">${(budget.limit / 30).toFixed(0)} Per day</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%`, backgroundColor: catInfo?.color }} 
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span style={{ color: catInfo?.color }}>${spent.toLocaleString()}</span>
                      <span className="text-gray-300">${budget.limit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExceeding ? (
                      <>
                        <AlertCircle size={16} className="text-[#FD3C4A]" />
                        <p className="text-[10px] text-[#FD3C4A] font-medium">You have exceeded your budget!</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} className="text-[#34C759]" />
                        <p className="text-[10px] text-gray-400 font-medium">Your {budget.category.toLowerCase()} spending still on track</p>
                      </>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-10 text-gray-400">No budgets set. Go to settings to add some.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionsView({ transactions }: { transactions: Transaction[] }) {
  const groupedTransactions = transactions.reduce((groups: { [key: string]: Transaction[] }, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    
    let label = format(new Date(transaction.date), 'MMMM dd, yyyy');
    if (date === today) label = 'Today';
    if (date === yesterday) label = 'Yesterday';

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(transaction);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(groupedTransactions[b][0].date).getTime() - new Date(groupedTransactions[a][0].date).getTime();
  });

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400">
            <Search size={20} />
          </div>
          <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400">
            <MoreVertical size={20} />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {sortedDates.length > 0 ? sortedDates.map(dateLabel => (
          <div key={dateLabel} className="space-y-4">
            <h3 className="text-lg font-bold">{dateLabel}</h3>
            <div className="space-y-4">
              {groupedTransactions[dateLabel].map((t) => {
                const cat = CATEGORIES.find(c => c.name === t.category);
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-gray-50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>
                        {cat?.icon ? <cat.icon size={24} /> : <LayoutGrid size={24} />}
                      </div>
                      <div>
                        <p className="font-bold">{t.category}</p>
                        <p className="text-xs text-gray-400 font-medium">{format(new Date(t.date), 'hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold text-lg", t.type === 'income' ? "text-[#00A86B]" : "text-[#FD3C4A]")}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsView({ budgets, onUpdateBudget }: { budgets: Budget[], onUpdateBudget: (budget: Budget) => void }) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');

  const handleSaveBudget = () => {
    if (editingCategory && newLimit) {
      onUpdateBudget({ category: editingCategory as CategoryType, limit: parseFloat(newLimit) });
      setEditingCategory(null);
      setNewLimit('');
    }
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Budget Settings</h3>
          <div className="grid gap-4">
            {CATEGORIES.filter(c => c.name !== 'Salary').map(cat => {
              const budget = budgets.find(b => b.category === cat.name);
              return (
                <div key={cat.name} className="p-4 bg-white rounded-3xl border border-gray-50 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                        <cat.icon size={20} />
                      </div>
                      <span className="font-bold">{cat.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingCategory(cat.name);
                        setNewLimit(budget?.limit.toString() || '');
                      }}
                      className="text-[#7F3DFF] text-sm font-bold"
                    >
                      {budget ? 'Edit' : 'Set Budget'}
                    </button>
                  </div>
                  {budget && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Monthly Limit</span>
                      <span className="font-bold">${budget.limit.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account</h3>
          <div className="space-y-2">
            {[
              { icon: HomeIcon, label: 'Profile', color: '#7F3DFF' },
              { icon: SettingsIcon, label: 'Security', color: '#FF5C5C' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-gray-50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    <item.icon size={24} />
                  </div>
                  <p className="font-bold">{item.label}</p>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-[40px] p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Set Budget for {editingCategory}</h3>
              <button onClick={() => setEditingCategory(null)} className="text-gray-400">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Monthly Limit</label>
                <input 
                  type="number" 
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="$0.00"
                  className="w-full text-3xl font-bold border-b-2 border-gray-100 focus:border-[#7F3DFF] focus:ring-0 p-2"
                  autoFocus
                />
              </div>
              <button 
                onClick={handleSaveBudget}
                className="w-full py-4 bg-[#7F3DFF] text-white rounded-2xl font-bold shadow-lg shadow-[#7F3DFF]/30"
              >
                Save Budget
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AddTransactionModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (t: any) => void }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<CategoryType>('Other');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onAdd({
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    });
    setAmount('');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full bg-white rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6 sm:m-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Amount</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$0.00"
              className="w-full text-4xl font-bold border-none focus:ring-0 p-0"
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold text-sm transition-all",
                type === 'expense' ? "bg-[#FD3C4A] text-white shadow-lg shadow-[#FD3C4A]/30" : "bg-gray-50 text-gray-400"
              )}
            >
              Expense
            </button>
            <button 
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold text-sm transition-all",
                type === 'income' ? "bg-[#00A86B] text-white shadow-lg shadow-[#00A86B]/30" : "bg-gray-50 text-gray-400"
              )}
            >
              Income
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                    category === cat.name ? "bg-[#7F3DFF]/10 text-[#7F3DFF]" : "text-gray-400"
                  )}
                >
                  <cat.icon size={20} />
                  <span className="text-[8px] font-bold truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#7F3DFF] text-white rounded-2xl font-bold shadow-lg shadow-[#7F3DFF]/30 active:scale-95 transition-transform"
          >
            Save Transaction
          </button>
        </form>
      </motion.div>
    </div>
  );
}
