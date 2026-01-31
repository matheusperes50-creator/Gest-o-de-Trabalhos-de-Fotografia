
import { Shoot, Client } from '../types';

/**
 * URL do Google Apps Script atualizada com a chave de implantação final.
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbwCmdA464q2uEAhy-Fg4zhst8DxXSbhEoUUVPCD5B0fbeW32-OeFzb-9HKd4dtlpdwQfg/exec';
const SHEET_PARAM = 'lensflow';

export interface SyncData {
  shoots: Shoot[];
  clients: Client[];
}

export const apiService = {
  /**
   * Busca dados da planilha.
   */
  async fetchData(): Promise<SyncData | null> {
    try {
      const url = `${API_URL}?sheet=${SHEET_PARAM}&action=read&t=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-cache'
      });

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      
      const text = await response.text();
      
      // Se retornar HTML, o script pode estar configurado para login ou com erro de permissão
      if (text.trim().toLowerCase().startsWith('<!doctype')) {
        console.error("ERRO CLOUD: O Google retornou uma página (HTML) em vez de dados. Verifique se a implantação está configurada para acesso de 'Qualquer Pessoa' (Anyone).");
        return null;
      }

      try {
        const data = JSON.parse(text);
        if (data && (data.shoots || data.clients)) return data as SyncData;
        return null;
      } catch (e) {
        console.error("ERRO CLOUD: Falha ao processar resposta JSON.", text);
        return null;
      }
    } catch (error) {
      console.warn('Conexão Cloud Offline (Leitura):', error);
      return null;
    }
  },

  /**
   * Salva dados na planilha enviando o estado completo.
   */
  async saveData(data: SyncData): Promise<boolean> {
    try {
      /**
       * O Google Apps Script não suporta pre-flight CORS (OPTIONS).
       * Usamos 'no-cors' e 'text/plain' para garantir que o navegador envie o POST 
       * sem bloquear a requisição.
       */
      const url = `${API_URL}?sheet=${SHEET_PARAM}&action=update`;
      const payload = JSON.stringify(data);

      console.log("LensFlow Sync: Enviando pacote de dados para Google Sheets...");

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: payload,
      });

      /**
       * Em 'no-cors', a resposta é opaca (não conseguimos ler se deu 200 ou 500).
       * Se não disparou erro de rede (falta de internet), o pacote foi entregue ao servidor do Google.
       */
      console.log("LensFlow Sync: Dados despachados com sucesso via POST.");
      return true;
    } catch (error) {
      console.error('LensFlow Sync: Erro de rede ou bloqueio de firewall.', error);
      return false;
    }
  }
};
