import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Columns, 
  Plus, 
  FileDown, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ClipboardPaste,
  Trash2,
  CheckCircle2,
  Sparkles,
  Eye,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Employee } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export default function EmployeeList({ employees, setEmployees }: EmployeeListProps) {
  const [pasteText, setPasteText] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map(emp => emp.id));
    }
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Deseja realmente excluir permanentemente os ${selectedIds.length} colaboradores selecionados do banco de dados?`)) {
      setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
      setSelectedIds([]);
    }
  };

  const deleteIndividual = (id: string) => {
    if (confirm('Deseja realmente excluir este colaborador permanentemente do banco de dados?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  // Parse helper for preview
  const getPreviewRows = () => {
    if (!pasteText.trim()) return [];
    return pasteText.trim().split('\n').filter(line => {
      const upper = line.toUpperCase();
      return line.trim().length > 0 && 
             !upper.includes('NOME') && 
             !upper.includes('NP') &&
             !upper.includes('ADMISSÃO');
    }).slice(0, 5).map(line => { // Limitar a 5 na prévia para não quebrar o layout
      const cols = line.split('\t');
      return cols.length > 1 ? cols : line.split(',');
    });
  };

  const previewRows = getPreviewRows();

  const handleProcessPaste = () => {
    if (!pasteText.trim()) return;
    setIsProcessing(true);

    // Simulation of processing delay
    setTimeout(() => {
      const lines = pasteText.trim().split('\n');
      const newEmployees = lines.filter(line => {
        const upper = line.toUpperCase();
        // Filtrar vazios e cabeçalhos
        return line.trim().length > 0 && 
               !upper.includes('NOME') && 
               !upper.includes('NP') &&
               !upper.includes('ADMISSÃO');
      }).map(line => {
        const cols = line.split('\t');
        const data = cols.length > 1 ? cols : line.split(',');
        
        // Mapeamento baseado na imagem do Excel:
        // 0: NP, 1: NOME, 2: ADMISSÃO, 3: FUNÇÃO, 4: STATUS, 5: SUPERVISOR ... 13: E-MAIL
        return {
          id: data[0] ? (data[0].startsWith('#') ? data[0] : '#' + data[0].trim()) : '#' + Math.floor(Math.random() * 90000 + 10000),
          name: data[1]?.trim() || 'Nome não identificado',
          admission: data[2]?.trim() || '-',
          role: data[3]?.trim() || '-',
          status: data[4]?.trim() || 'Ativo',
          supervisor: data[5]?.trim() || '-',
          email: data[13]?.trim() || (data[1] ? `${data[1].toLowerCase().trim().replace(/\s+/g, '.')}@empresa.com` : '-')
        };
      });

      // SUBSTITUIR todas as informações (como solicitado)
      setEmployees(newEmployees);
      setPasteText('');
      setShowPaste(false);
      setIsProcessing(false);
    }, 800);
  };

  const clearEmployees = () => {
    if (confirm('Deseja realmente limpar todos os registros?')) {
      setEmployees([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-black">
            <span>Recursos Humanos</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Colaboradores</span>
          </nav>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Colaboradores</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPaste(!showPaste)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border text-sm font-bold rounded-lg transition-all shadow-sm",
              showPaste ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            )}
          >
            <ClipboardPaste className="w-4 h-4" />
            Colagem Inteligente
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-all shadow-sm">
            <FileDown className="w-4 h-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:opacity-90 text-sm font-bold rounded-lg transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>
      </div>

      {showPaste && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Colagem Inteligente (Excel / Sheets)</h3>
              </div>
              <p className="text-xs text-slate-500">Copie as linhas da sua planilha e cole abaixo. O sistema identificará os campos automaticamente.</p>
            </div>
            <button 
              onClick={() => setShowPaste(false)}
              className="text-slate-400 hover:text-slate-900"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
          
          {pasteText.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="sticky top-0 bg-white border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2 text-slate-400 font-black uppercase">NP</th>
                      <th className="px-3 py-2 text-slate-400 font-black uppercase">Nome</th>
                      <th className="px-3 py-2 text-slate-400 font-black uppercase">Admissão</th>
                      <th className="px-3 py-2 text-slate-400 font-black uppercase">Função</th>
                      <th className="px-3 py-2 text-slate-400 font-black uppercase">Status</th>
                      <th className="px-3 py-2 text-slate-400 font-black uppercase">Supervisor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="bg-white/50">
                        <td className="px-3 py-2 font-bold text-slate-600">{row[0] || '-'}</td>
                        <td className="px-3 py-2 font-medium text-slate-900">{row[1] || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{row[2] || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{row[3] || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{row[4] || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{row[5] || '-'}</td>
                      </tr>
                    ))}
                    {pasteText.split('\n').length > 5 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-center text-slate-400 italic">
                          ... e mais {pasteText.split('\n').length - 5 - (pasteText.toUpperCase().includes('NOME') ? 1 : 0)} linhas detectadas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-2 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase ml-2">Visualização da Tabela Detectada</span>
                <button 
                  onClick={() => setPasteText('')}
                  className="text-[10px] text-indigo-600 font-black uppercase hover:underline"
                >
                  Substituir Dados Colados
                </button>
              </div>
            </div>
          ) : (
            <textarea 
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-slate-900 outline-none resize-none"
              placeholder="Cole aqui (Ex: 460540	ADAO FRANCISCO	15/12/2025...)"
            />
          )}

          <div className="flex justify-between items-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              Formatos aceitos: TSV, CSV, Texto Plano
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPasteText('')}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Limpar
              </button>
              <button 
                onClick={handleProcessPaste}
                disabled={isProcessing || !pasteText.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Processar e Substituir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:border-slate-300">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            {selectedIds.length > 0 && (
              <button 
                onClick={deleteSelected}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm animate-in fade-in zoom-in-95"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Selecionados ({selectedIds.length})
              </button>
            )}
            <button 
              onClick={clearEmployees}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Tudo
            </button>
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">
            Exibindo {employees.length} de {employees.length} registros
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-900 transition-colors">
                    {selectedIds.length > 0 && selectedIds.length === employees.length ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                    NP <ArrowDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">Admissão</th>
                <th className="px-6 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">Função</th>
                <th className="px-6 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">Supervisor</th>
                <th className="px-6 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Nenhum colaborador encontrado. Use a "Colagem Inteligente" para adicionar dados rapidamente.
                  </td>
                </tr>
              ) : (
                employees.map((emp, i) => (
                  <tr key={i} className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    selectedIds.includes(emp.id) && "bg-indigo-50/30"
                  )}>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => toggleSelect(emp.id)} className={cn("transition-colors", selectedIds.includes(emp.id) ? "text-indigo-600" : "text-slate-200 group-hover:text-slate-400")}>
                        {selectedIds.includes(emp.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{emp.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-600 border border-slate-200">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{emp.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{emp.admission}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{emp.role}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-black uppercase rounded tracking-tight inline-block",
                        emp.status.toUpperCase() === 'ATIVO' ? "bg-green-100 text-green-700" : 
                        emp.status.toUpperCase() === 'FÉRIAS' || emp.status.toUpperCase() === 'FERIAS' ? "bg-orange-100 text-orange-700" : 
                        "bg-slate-100 text-slate-500"
                      )}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{emp.supervisor}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Ver Perfil Completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteIndividual(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir Colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Linhas por página:</span>
            <select className="text-xs border-slate-200 rounded-lg py-1 px-2 pr-6 bg-white focus:ring-slate-900">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">1-4 de 1.248</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewingEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                  {viewingEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{viewingEmployee.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ID: {viewingEmployee.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingEmployee(null)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Nome Completo</label>
                  <p className="text-sm font-bold text-slate-900">{viewingEmployee.name}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">E-mail Corporativo</label>
                  <p className="text-sm font-bold text-slate-900">{viewingEmployee.email}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Data de Admissão</label>
                  <p className="text-sm font-bold text-slate-900">{viewingEmployee.admission}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Cargo / Função</label>
                  <p className="text-sm font-bold text-slate-900">{viewingEmployee.role}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Supervisor Direto</label>
                  <p className="text-sm font-bold text-slate-900">{viewingEmployee.supervisor}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Status Contratual</label>
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase rounded tracking-tight inline-block mt-1",
                    viewingEmployee.status.toUpperCase() === 'ATIVO' ? "bg-green-100 text-green-700" : 
                    "bg-slate-100 text-slate-500"
                  )}>
                    {viewingEmployee.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setViewingEmployee(null)}
                className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                Fechar
              </button>
              <button 
                onClick={() => {
                   window.print();
                }}
                className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:opacity-90 shadow-md flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" /> Exportar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
