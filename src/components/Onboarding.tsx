import React from 'react';
import { 
  UserPlus, 
  Map as MapIcon, 
  Bed, 
  ClipboardCheck, 
  PlaneTakeoff,
  BarChart2,
  AlertTriangle,
  LocateFixed,
  ChevronRight,
  MoreVertical,
  Check
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const onboardingData = [
  { name: 'Ricardo Mendes', origin: 'Curitiba, PR', arrival: '14 Out 2023', status: 'Finalizado', accommodation: 'Bloco A - Q204', role: 'Engenheiro Civil' },
  { name: 'Ana Lúcia Silva', origin: 'Salvador, BA', arrival: '22 Out 2023', status: 'Exames Médicos', accommodation: 'Não Definido', role: 'Analista de Dados', alert: 'Pendente Ida' },
  { name: 'Marcos Castro', origin: 'Goiânia, GO', arrival: '18 Out 2023', status: 'Contrato', accommodation: 'Hotel Executivo', role: 'Técnico Operacional' },
  { name: 'Fernanda Borges', origin: 'Manaus, AM', arrival: '25 Out 2023', status: 'Triagem', accommodation: 'Bloco C - Q102', role: 'Supervisora RH' },
];

export default function Onboarding() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Admissão e Logística</h2>
          <p className="text-slate-500 font-medium">Acompanhe o processo de integração e as passagens dos novos talentos.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
          <UserPlus className="w-5 h-5" />
          Iniciar Nova Admissão
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'EM ADMISSÃO', value: '12', sub: '+3 esta semana', icon: UserPlus, color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'VIAGENS PENDENTES', value: '08', sub: 'Aguardando bilhete', icon: PlaneTakeoff, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'ALOJAMENTOS', value: '85%', sub: 'Taxa de ocupação', icon: Bed, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'TEMPO MÉDIO', value: '4.2d', sub: '-0.5d vs alvo', icon: BarChart2, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-slate-200 rounded-xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</span>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className={cn("text-[10px] font-bold", stat.sub.includes('+') ? "text-green-600" : "text-slate-400")}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold">Controle de Logística e Admissão</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origem</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Chegada</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Alojamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {onboardingData.map((emp, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-400 border border-slate-200">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1">
                        <LocateFixed className="w-3 h-3 text-slate-300" />
                        {emp.origin}
                      </div>
                    </td>
                    <td className="px-6 py-4 italic">
                      <div className="text-xs font-bold text-slate-700">{emp.arrival}</div>
                      {emp.alert && (
                        <div className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {emp.alert}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest",
                        emp.status === 'Finalizado' ? "bg-green-100 text-green-700" : 
                        emp.status === 'Exames Médicos' ? "bg-amber-100 text-amber-700" : 
                        emp.status === 'Contrato' ? "bg-blue-100 text-blue-700" : 
                        "bg-slate-100 text-slate-600"
                      )}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{emp.accommodation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold">Logística Ativa</h3>
            </div>
            <div className="h-40 bg-slate-100 relative group overflow-hidden">
               <MapIcon className="w-full h-full text-slate-200" strokeWidth={0.5} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
               <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                  4 Vôos em trânsito agora
               </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <PlaneTakeoff className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold">GRU → CGB</span>
                </div>
                <span className="text-green-600 font-black uppercase">Confirmado</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
             <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Check-list de Chegada</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Próximos 3 dias</p>
                
                <ul className="space-y-4">
                  {[
                    { label: 'Coleta de EPI - 5 pessoas', done: true },
                    { label: 'Integração de Segurança', done: false },
                    { label: 'Entrega de Crachás', done: false },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                        item.done ? "bg-white border-white" : "border-slate-700"
                      )}>
                        {item.done && <Check className="w-3 h-3 text-slate-900" />}
                      </div>
                      <span className={cn("text-xs font-bold", item.done ? "text-white" : "text-slate-400")}>{item.label}</span>
                    </li>
                  ))}
                </ul>
             </div>
             <ClipboardCheck className="absolute -right-8 -bottom-8 w-32 h-32 text-white opacity-5 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
