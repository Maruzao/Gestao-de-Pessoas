import React from 'react';
import { 
  Users, 
  Activity, 
  UserPlus, 
  ArrowLeftRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/src/lib/utils';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 500 },
  { name: 'Jun', value: 900 },
];

const pieData = [
  { name: 'Operacional', value: 480, color: '#131b2e' },
  { name: 'Administrativo', value: 300, color: '#515f74' },
  { name: 'Vendas/CS', value: 420, color: '#dae2fd' },
];

const stats = [
  { label: 'Total de Colaboradores', value: '1.248', change: '+2.5%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Atestados Ativos', value: '12', change: '-4 hoje', icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Admissões Pendentes', value: '05', change: '8 em fila', icon: UserPlus, color: 'text-slate-900', bg: 'bg-slate-100' },
  { label: 'Transferências do Mês', value: '24', change: '+12%', icon: ArrowLeftRight, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const recentEmployees = [
  { name: 'Bárbara Freitas', role: 'Analista de Sistemas', dept: 'Tecnologia', status: 'Ativo' },
  { name: 'Fernando Mendes', role: 'Gerente de Projetos', dept: 'Operações', status: 'Pendente' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral do Sistema</h2>
          <p className="text-slate-500 font-medium">Bem-vindo de volta, aqui estão as métricas de hoje.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-bold px-2 py-1 rounded ${stat.bg} ${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Distribuição por Função</h3>
            <button className="text-xs font-bold text-indigo-600 hover:underline">Exportar Dados</button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">1.2k</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {pieData.map((item, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{item.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{item.value} ({Math.round(item.value/1200*100)}%)</span>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-medium italic">Atualizado às 08:00</span>
              </div>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#131b2e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold">Vencimentos</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Ricardo S.', type: 'Atestado de Saúde', date: 'Hoje', urgent: true },
                { name: 'Amanda M.', type: 'Licença Médica', date: '24 Mai', urgent: false },
                { name: 'Carlos O.', type: 'Exame Periódico', date: '26 Mai', urgent: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{item.type}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold", item.urgent ? "text-red-600" : "text-slate-600")}>
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Ver Todos
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
            <h3 className="text-lg font-bold mb-4">Colaboradores Recém Admitidos</h3>
            <div className="space-y-4">
              {recentEmployees.map((emp, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                    <div>
                      <p className="text-sm font-bold">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{emp.role}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight",
                    emp.status === 'Ativo' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
