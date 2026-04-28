export interface Employee {
  id: string;
  name: string;
  email: string;
  admission: string;
  role: string;
  status: string;
  supervisor: string;
}

export interface ExtractedCertificate {
  id: string;
  np: string;
  name: string;
  admission: string;
  role: string;
  status: 'EXTRAÍDO' | 'REVISAR';
  cid: string;
  cidReason?: string; // Motivo/Resumo do CID
  fileName: string;
  originalPath: string;
  originalFileExt?: string;
  progress: number;
  date: string; // Data do atestado
  days: number; // Dias de afastamento
  sentToMedical?: boolean;
  isValidated?: boolean;
  validationDate?: string;
  selected?: boolean; // Para UI
}
