/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import MedicalCertificates from './components/MedicalCertificates';
import Movements from './components/Movements';
import Onboarding from './components/Onboarding';
import { motion, AnimatePresence } from 'motion/react';
import { Employee } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Carregar colaboradores do banco ao iniciar
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleSetEmployees = async (newEmployees: Employee[] | ((prev: Employee[]) => Employee[])) => {
    let data = typeof newEmployees === 'function' ? newEmployees(employees) : newEmployees;
    
    // Sanitizar IDs removendo '#'
    data = data.map(emp => ({
      ...emp,
      id: String(emp.id).replace('#', '')
    }));

    setEmployees(data);
    
    // Sincronizar com o backend
    try {
      await fetch('/api/employees/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error("Erro ao sincronizar colaboradores:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'employees': return <EmployeeList employees={employees} setEmployees={handleSetEmployees} />;
      case 'certificates': return <MedicalCertificates employees={employees} />;
      case 'movements': return <Movements />;
      case 'onboarding': return <Onboarding />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 h-16 border-b border-slate-200 glass flex items-center justify-between px-8">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome, NP ou função..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-bold text-slate-900">Marcus Silva</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">
          LGPD Compliance Protocol v2.4 • Last data sync: 2 minutes ago
        </footer>
      </div>
    </div>
  );
}
