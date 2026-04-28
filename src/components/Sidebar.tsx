import React from 'react';
import { cn } from '@/src/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  ArrowLeftRight, 
  UserPlus, 
  Settings, 
  LogOut,
  Building2,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Colaboradores', icon: Users },
  { id: 'certificates', label: 'Atestados', icon: Stethoscope },
  { id: 'movements', label: 'Movimentações', icon: ArrowLeftRight },
  { id: 'onboarding', label: 'Admissão', icon: UserPlus },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-slate-50 flex flex-col p-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">Human Resources</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Enterprise Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
              activeTab === item.id 
                ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-200 mt-auto space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium">
          <Settings className="w-4 h-4" />
          Configurações
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
