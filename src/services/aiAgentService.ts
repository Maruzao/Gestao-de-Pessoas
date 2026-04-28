import { GoogleGenAI, Type } from "@google/genai";
import { Employee, ExtractedCertificate } from "../types";

// Agente de Comunicação e Extração focado em Precisão
export class MedicalAgent {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Converte um arquivo para o formato que o Gemini aceita (base64)
   */
  private async fileToGenerativePart(file: File): Promise<{ inlineData: { data: string, mimeType: string } }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Processa um atestado médico real usando IA e correlaciona com a base de colaboradores.
   */
  async extractCertificateData(
    file: File, 
    employees: Employee[]
  ): Promise<Partial<ExtractedCertificate>> {
    try {
      const imagePart = await this.fileToGenerativePart(file);

      const prompt = `
        Você é um Assistente de RH de alta precisão especializado em processamento de atestados médicos.
        Analise a imagem anexa e extraia as informações REAIS contidas no documento.
        
        INSTRUÇÕES DE EXTRAÇÃO:
        1. Identifique o NOME COMPLETO do colaborador no atestado.
        2. Localize o CID (Código de 3 ou 4 caracteres, ex: J00, M54.5).
        3. Identifique a DATA DE EMISSÃO do atestado.
        4. Identifique o TEMPO DE AFASTAMENTO em dias.

        CORRELAÇÃO COM A BASE:
        Cruze o nome encontrado no atestado com a lista de colaboradores abaixo. Utilize lógica de aproximação se necessário (ex: Jeremias Silva -> Jeremias Farias da Silva).
        LISTA DE COLABORADORES: ${JSON.stringify(employees.map(e => ({ name: e.name, id: e.id, role: e.role, admission: e.admission })))}

        RESUMO DO CID (cidReason):
        Forneça uma descrição curta e técnica do CID encontrado.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              np: { type: Type.STRING, description: "ID Numérico do colaborador na base (sem #)" },
              name: { type: Type.STRING, description: "Nome completo conforme consta no atestado" },
              admission: { type: Type.STRING, description: "Data de admissão do colaborador na base" },
              role: { type: Type.STRING, description: "Cargo/Função do colaborador na base" },
              cid: { type: Type.STRING, description: "Código CID encontrado" },
              cidReason: { type: Type.STRING, description: "Breve resumo/descrição do CID" },
              date: { type: Type.STRING, description: "Data do atestado (DD/MM/AAAA)" },
              days: { type: Type.NUMBER, description: "Número de dias de afastamento" },
              status: { type: Type.STRING, enum: ["EXTRAÍDO", "REVISAR"] }
            },
            required: ["np", "name", "cid", "date", "days", "status"]
          }
        }
      });
      
      const text = response.text || "{}";
      const extracted = JSON.parse(text);

      // Limpeza final do NP (garantir que é só número)
      if (extracted.np) {
        extracted.np = extracted.np.replace(/\D/g, '');
      }

      return extracted;
    } catch (error) {
      console.error("Erro crítico na extração IA:", error);
      return { 
        status: 'REVISAR',
        name: 'Erro no Processamento',
        cid: 'N/A',
        np: '0',
        date: new Date().toLocaleDateString('pt-BR'),
        days: 0
      };
    }
  }
}

export const medicalAgent = new MedicalAgent();
