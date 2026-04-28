import React from 'react';
import { 
  ArrowLeftRight, 
  UserMinus, 
  Trash2, 
  Filter, 
  Plus, 
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const transfers = [
  { name: 'Ana Martins', from: 'Vendas Internas', to: 'Expansão Comercial', date: '12/05/2024' },
  { name: 'João Silva', from: 'Financeiro', to: 'Controladoria', date: '10/05/2024' },
  { name: 'Carla Lima', from: 'RH Matriz', to: 'Unidade Sul', date: '08/05/2024' },
];

const exits = [
  { name: 'Marcos Aurélio', id: '#8829', type: 'Pedido de Demissão', dept: 'Almoxarifado', date: '15/05/2024', status: 'Concluído' },
  { name: 'Beatriz Santos', id: '#4432', type: 'Fim de Contrato', dept: 'Marketing', date: '14/05/2024', status: 'Homologação' },
  { name: 'Lucas Pereira', id: '#1209', type: 'Sem Justa Causa', dept: 'TI / Infra', date: '12/05/2024', status: 'Aguardando Exame' },
];

export default function Movements() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Movimentações de Pessoal</h2>
          <p className="text-slate-500 font-medium">Gerenciamento e registro histórico de transferências e desligamentos.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:opacity-90 text-sm font-bold rounded-lg transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Nova Movimentação
          </button>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold">Transferências entre Módulos</h3>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Última Transferência</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Há 2 horas</span>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100">
                  <div className="w-full h-full bg-slate-100" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Ricardo Oliveira</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-tight">Analista Sênior</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-center flex-1">
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-1">Módulo Origem</div>
                  <div className="font-bold text-slate-800 text-sm">Logística</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div className="text-center flex-1">
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-1">Módulo Destino</div>
                  <div className="font-bold text-slate-800 text-sm">Operações</div>
                </div>
              </div>
            </div>
            <button className="mt-8 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline text-center w-full">
              Ver Detalhes do Registro
            </button>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origem</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Destino</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">
                            {t.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-600">{t.from}</td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-600">{t.to}</td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-500">{t.date}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-900 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-tight">
              <span>Exibindo 3 de 142 transferências</span>
              <button className="text-indigo-600 hover:underline uppercase tracking-widest">Ver Histórico Completo</button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UserMinus className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-bold">Histórico de Desligamentos</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="bg-red-50 text-red-700 text-[9px] font-black px-2 py-1 rounded border border-red-100 uppercase tracking-widest">Saídas: 12 (Maio)</span>
              <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-2 py-1 rounded border border-slate-200 uppercase tracking-widest">Turnover: 2.4%</span>
            </div>
            <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:text-slate-900">
              <Download className="w-3 h-3" /> Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Último Módulo</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {exits.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{e.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold tracking-tight">ID: {e.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-red-50 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100 uppercase">
                        {e.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{e.dept}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{e.date}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{e.status}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-900">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div className="flex gap-2">
              <button className="p-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 border border-slate-300 rounded-lg hover:bg-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight italic">Última atualização: hoje às 14:30</span>
          </div>
        </div>
      </section>
    </div>
  );
}
