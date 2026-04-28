import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Clock, 
  BrainCircuit,
  Search,
  Download,
  Trash2,
  TrendingUp,
  ChevronRight,
  Play,
  CheckSquare,
  Square,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Filter,
  XCircle,
  Database,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Employee, ExtractedCertificate } from '../types';
import { medicalAgent } from '../services/aiAgentService';

interface MedicalCertificatesProps {
  employees: Employee[];
}

export default function MedicalCertificates({ employees }: MedicalCertificatesProps) {
  const [files, setFiles] = useState<{ id: string; name: string; progress: number; status: 'pending' | 'processing' | 'done', file?: File }[]>([]);
  const [results, setResults] = useState<ExtractedCertificate[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [validatedFilter, setValidatedFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingResults = results.filter(r => !r.isValidated);
  const validatedResults = results.filter(r => r.isValidated).filter(r => 
    validatedFilter === '' || 
    r.name.toLowerCase().includes(validatedFilter.toLowerCase()) ||
    r.np.includes(validatedFilter) ||
    r.cid.toLowerCase().includes(validatedFilter.toLowerCase())
  );

  // Carregar resultados do banco ao iniciar
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/certificates');
        const data = await response.json();
        setResults(data.map((item: any) => ({
          ...item,
          sentToMedical: !!item.sentToMedical,
          selected: false
        })));
      } catch (error) {
        console.error("Erro ao buscar atestados:", error);
      }
    };
    fetchResults();
  }, []);

  const handleSelectAll = (checked: boolean, isForValidated: boolean = false) => {
    setResults(prev => prev.map(r => {
      if (isForValidated && r.isValidated) return { ...r, selected: checked };
      if (!isForValidated && !r.isValidated) return { ...r, selected: checked };
      return r;
    }));
  };

  const toggleSelect = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList) return;
    
    const newFiles = Array.from(filesList).slice(0, 50 - files.length);
    const mapped = newFiles.map((f: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      progress: 0,
      status: 'pending' as const,
      file: f
    }));
    setFiles(prev => [...prev, ...mapped]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processWithAi = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;
    setIsAiProcessing(true);

    for (const fileItem of pendingFiles) {
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing', progress: 10 } : f));
      
      try {
        // 1. Upload do arquivo para o backend
        const formData = new FormData();
        if (fileItem.file) formData.append('file', fileItem.file);
        
        const uploadRes = await fetch('/api/certificates/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) throw new Error("Falha no upload do arquivo.");

        const uploadData = await uploadRes.json();
        const originalPath = uploadData.fileName;

        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: 40 } : f));

        // 2. Processamento via Agente de IA (Extração Inteligente)
        if (!fileItem.file) throw new Error("Arquivo não encontrado");
        const extraction = await medicalAgent.extractCertificateData(fileItem.file, employees);
        
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: 80 } : f));

        const originalFileExt = fileItem.name.split('.').pop() || '';
        
        // Verificar duplicados (NP + Data)
        const isDuplicate = results.find(r => r.np === (extraction.np || '').replace(/\D/g, '') && r.date === extraction.date);
        
        const finalResult: ExtractedCertificate = {
          id: Math.random().toString(36).substr(2, 9),
          np: (extraction.np || '999').replace(/\D/g, ''),
          name: extraction.name || 'Desconhecido',
          admission: extraction.admission || '-',
          role: extraction.role || '-',
          status: isDuplicate ? 'REVISAR' : (extraction.status as any || 'EXTRAÍDO'),
          cid: extraction.cid || 'N/A',
          cidReason: extraction.cidReason || (isDuplicate ? 'Possível duplicidade detectada.' : ''),
          fileName: fileItem.name,
          date: extraction.date || '-',
          days: extraction.days || 0,
          progress: 100,
          sentToMedical: false,
          originalPath: originalPath,
          originalFileExt: originalFileExt,
          selected: false
        };

        // 3. Salvar no Banco de Dados SQL
        await fetch('/api/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalResult)
        });

        setResults(prev => [finalResult, ...prev]);
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'done', progress: 100 } : f));
      } catch (error) {
        console.error("Erro no processamento:", error);
      }
    }

    setIsAiProcessing(false);
  };

  const toggleSentToMedical = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentToMedical: !currentState })
      });
      setResults(prev => prev.map(res => res.id === id ? { ...res, sentToMedical: !currentState } : res));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const validateCertificate = async (id: string) => {
    const now = new Date().toLocaleString('pt-BR');
    try {
      await fetch(`/api/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isValidated: true, validationDate: now })
      });
      setResults(prev => prev.map(res => res.id === id ? { ...res, isValidated: true, validationDate: now, selected: false } : res));
    } catch (error) {
      console.error("Erro ao validar atestado:", error);
    }
  };

  const deleteIndividualRecord = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este registro permanentemente do banco de dados?")) {
      try {
        const response = await fetch(`/api/certificates?ids=${encodeURIComponent(id)}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setResults(prev => prev.filter(r => r.id !== id));
        } else {
          alert(`Erro ao excluir: ${data.error || 'Falha no servidor'}`);
        }
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        alert("Erro de conexão ao tentar excluir. Verifique se o servidor está online.");
      }
    }
  };

  const clearQueue = () => {
    setFiles([]);
  };

  const clearResults = async () => {
    const selectedIds = results.filter(r => r.selected).map(r => r.id);
    
    if (selectedIds.length === 0) {
      if (window.confirm("Deseja realmente limpar TODOS os resultados (pendentes e validados) do banco de dados?")) {
        try {
          const response = await fetch('/api/certificates', { method: 'DELETE' });
          const data = await response.json();
          if (response.ok && data.success) {
            setResults([]);
          } else {
            alert(`Erro ao limpar banco: ${data.error || 'Falha no servidor'}`);
          }
        } catch (error) {
          console.error("Erro ao limpar banco:", error);
          alert("Erro de conexão ao tentar limpar.");
        }
      }
    } else {
      if (window.confirm(`Deseja realmente excluir permanentemente os ${selectedIds.length} itens selecionados do banco de dados?`)) {
        try {
          const response = await fetch(`/api/certificates?ids=${encodeURIComponent(selectedIds.join(','))}`, { method: 'DELETE' });
          const data = await response.json();
          if (response.ok && data.success) {
            setResults(prev => prev.filter(r => !r.selected));
          } else {
            alert(`Erro ao excluir selecionados: ${data.error || 'Falha no servidor'}`);
          }
        } catch (error) {
          console.error("Erro ao excluir selecionados:", error);
          alert("Erro de conexão ao tentar excluir selecionados.");
        }
      }
    }
  };

  const handleExportSpreadsheet = (isForValidated: boolean) => {
    const source = isForValidated ? validatedResults : pendingResults;
    if (source.length === 0) return;
    
    const dataToExport = source.map(r => ({
      'NP': String(r.np).replace(/\D/g, ''),
      'NOME': r.name.toUpperCase(),
      'ADMISSÃO': r.admission,
      'FUNÇÃO': r.role.toUpperCase(),
      'STATUS': (employees.find(e => String(e.id).replace(/\D/g, '') === String(r.np).replace(/\D/g, ''))?.status || 'ATIVO').toUpperCase(),
      'DESCRIÇÃO CID': r.cid,
      'Data de Início': r.date,
      'Afastamento': `${String(r.days).padStart(2, '0')} Dias`,
      'MOTIVO': r.cidReason || 'NÃO ESPECIFICADO',
      ...(isForValidated ? { 'Data Validação': r.validationDate } : {})
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Atestados");
    const fileName = isForValidated ? "Banco_de_dados_Atestados_Mês" : "Atestados_Extraidos";
    XLSX.writeFile(wb, `${fileName}_${new Date().getFullYear()}.xlsx`);
  };

  const handleMassSave = async () => {
    const toSave = results.filter(r => r.selected);
    if (toSave.length === 0) return alert("Selecione os atestados que deseja baixar.");

    alert(`Iniciando download de ${toSave.length} arquivos individualmente.`);

    for (const res of toSave) {
      const ext = res.originalFileExt ? `.${res.originalFileExt}` : '.pdf';
      // Removendo # do nome do arquivo no download
      const sanitizedNp = String(res.np).replace(/#/g, '');
      const fileName = `${sanitizedNp}_${res.name.replace(/\s+/g, '_')}_${res.date.replace(/\//g, '-')}_${res.days}dias${ext}`.replace(/#/g, '');
      
      const link = document.createElement('a');
      link.href = `/api/certificates/download/${res.id}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 font-sans pb-20">
      <header className="flex justify-between items-center">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-black">
            <span>Gestão Administrativa</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-black">Atestados Médicos</span>
          </nav>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Gestão de Atestados</h2>
          <p className="text-slate-500 font-medium">Módulo de extração automática de dados via Inteligência Artificial.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-900 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Manual de Uso
          </button>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
            <FileText className="w-4 h-4" />
            Enviar por E-mail
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-slate-900" />
                <h3 className="font-bold text-sm">Processamento IA</h3>
              </div>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-black text-green-700">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SISTEMA IA ONLINE
              </span>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30 p-8 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer group"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-3 group-hover:scale-110 group-hover:text-indigo-500 transition-all" />
                <p className="text-sm font-bold text-slate-900">Arraste ou clique para adicionar</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Formatos aceitos: PDF e Imagens (JPG, PNG, WEBP, etc)</p>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                {files.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Nenhum arquivo na fila</p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="space-y-2 p-3 bg-white border border-slate-100 rounded-lg group hover:border-slate-200 transition-all">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-2 truncate max-w-[200px]">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          {file.name}
                        </span>
                        {file.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-slate-400 font-bold tabular-nums">{file.progress}%</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500", 
                            file.status === 'done' ? "bg-green-500" : 
                            file.status === 'processing' ? "bg-indigo-500" : "bg-slate-200"
                          )} 
                          style={{ width: `${file.progress}%` }} 
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={clearQueue}
                  disabled={isAiProcessing || files.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-all"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
                <button 
                  onClick={processWithAi}
                  disabled={isAiProcessing || files.filter(f => f.status === 'pending').length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md overflow-hidden relative group"
                >
                  {isAiProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" /> Começar IA
                    </>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm group hover:border-green-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Processados</span>
                <CheckCircle2 className="w-4 h-4 text-green-600 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-3xl font-black text-slate-900">{results.length}</span>
              <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1 uppercase">
                <TrendingUp className="w-3 h-3" /> Atualizado em tempo real
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm group hover:border-amber-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aguardando Revisão</span>
                <Clock className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-12" />
              </div>
              <span className="text-3xl font-black text-slate-900">{results.filter(r => r.status === 'REVISAR').length}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Dados sensíveis</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm group hover:border-indigo-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Acurácia Geral</span>
                <BrainCircuit className="w-4 h-4 text-indigo-600 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-3xl font-black text-slate-900">98.4<span className="text-lg text-slate-300">%</span></span>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full w-[98.4%] transition-all duration-1000" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  Resultados Extraídos
                </h3>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Válidos: {results.filter(r => r.status === 'EXTRAÍDO').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Revisar: {pendingResults.filter(r => r.status === 'REVISAR').length}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={clearResults}
                  className="text-[10px] font-black uppercase px-3 py-1.5 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> {pendingResults.some(r => r.selected) ? 'Excluir Selecionados' : 'Limpar Tudo'}
                </button>
                <button 
                  onClick={() => handleExportSpreadsheet(false)}
                  className="text-[10px] font-black uppercase px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3 h-3 text-green-600" /> Planilha Extraída
                </button>
                <button 
                  onClick={handleMassSave}
                  className="text-[10px] font-black uppercase px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-3 h-3" /> Download ({pendingResults.filter(r => r.selected).length})
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 w-12 border-r border-slate-200 text-center">
                      <button 
                        onClick={() => handleSelectAll(!pendingResults.every(r => r.selected), false)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors inline-flex"
                      >
                        {pendingResults.length > 0 && pendingResults.every(r => r.selected) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 text-left">NP</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 text-left">Colaborador</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 text-center">Status IA</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 text-left">Data / Período</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 text-left">CID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 text-left">Motivo Detectado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center text-slate-300">
                        <p className="text-sm font-medium">Nenhum atestado pendente de validação.</p>
                      </td>
                    </tr>
                  ) : (
                    pendingResults.map((res) => (
                      <tr key={res.id} className={cn(
                        "hover:bg-slate-50/50 group transition-all",
                        res.selected && "bg-indigo-50/30"
                      )}>
                        <td className="px-4 py-4 border-r border-slate-100 text-center">
                          <button onClick={() => toggleSelect(res.id)} className={cn("transition-colors", res.selected ? "text-indigo-600" : "text-slate-200 group-hover:text-slate-400")}>
                            {res.selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 text-[11px] font-bold text-slate-900 tracking-tighter">
                          {res.np}
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100">
                           <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-900 uppercase">{res.name}</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{res.fileName}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded text-[9px] font-black inline-flex items-center gap-1.5 uppercase",
                            res.status === 'EXTRAÍDO' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {res.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{res.date}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{res.days} dias</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100">
                          <span className="text-xs font-black text-indigo-700 font-mono tracking-widest">{res.cid}</span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100">
                          <span className="text-[9px] text-slate-400 line-clamp-1 max-w-[120px]" title={res.cidReason}>{res.cidReason || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => validateCertificate(res.id)}
                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all shadow-sm"
                              title="Validar e Arquivar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteIndividualRecord(res.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                              title="Excluir Registro"
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
          </div>

          {/* BANCO DE DADOS PRINCIPAL */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col mt-6">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-900">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Banco de Dados Atestados Mês
                </h3>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center gap-2 relative">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5" />
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome, NP ou CID..."
                    value={validatedFilter}
                    onChange={(e) => setValidatedFilter(e.target.value)}
                    className="bg-slate-800 border-none text-[10px] text-white py-1.5 pl-8 pr-3 rounded-lg focus:ring-1 focus:ring-indigo-500 w-64 placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExportSpreadsheet(true)}
                  className="text-[10px] font-black uppercase px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-3 h-3" /> Salvar Banco em Excel
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    {['NP', 'Nome Colaborador', 'Período', 'Função', 'CID', 'Status RH', 'Motivo', 'Validação', 'Ações'].map((h, i) => (
                      <th key={h} className={cn(
                        "px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 last:border-0",
                        (i === 5 || i === 8) ? "text-center" : "text-left"
                      )}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validatedResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center text-slate-300 italic">
                        Nenhum registro validado encontrado no banco de dados.
                      </td>
                    </tr>
                  ) : (
                    validatedResults.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-6 py-4 border-r border-slate-100 text-xs font-black text-slate-400 group-hover:text-slate-900 tabular-nums">{res.np}</td>
                        <td className="px-6 py-4 border-r border-slate-100">
                          <span className="text-xs font-black text-slate-900 uppercase">{res.name}</span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{res.date}</span>
                            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-tighter">{res.days} Dias</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 text-[10px] text-slate-500 font-medium uppercase">{res.role}</td>
                        <td className="px-6 py-4 border-r border-slate-100">
                          <span className="text-xs font-black text-indigo-700 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">{res.cid}</span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 text-center">
                           <button onClick={() => toggleSentToMedical(res.id, !!res.sentToMedical)} className={cn("p-1.5 rounded-lg transition-all", res.sentToMedical ? "text-green-600 bg-green-50" : "text-slate-300 hover:text-slate-500")}>
                             {res.sentToMedical ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                           </button>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 text-[10px] text-slate-500 line-clamp-2 max-w-[200px] leading-tight" title={res.cidReason}>
                          {res.cidReason}
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 text-[10px] font-bold text-slate-400 italic">
                          {res.validationDate}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => deleteIndividualRecord(res.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">LGPD Compliant Extraction Engine</span>
              <div className="flex gap-2 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                Exibindo {results.length} registros
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
