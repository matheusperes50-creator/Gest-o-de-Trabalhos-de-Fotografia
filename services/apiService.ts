
import { Shoot, Client } from '../types';

/**
 * ==============================================================================
 * CÓDIGO DO GOOGLE APPS SCRIPT (IMPORTANTE: ATUALIZE NA SUA PLANILHA)
 * ==============================================================================
 * 
 * function doGet(e) {
 *   var ss = SpreadsheetApp.getActiveSpreadsheet();
 *   var sheet = ss.getSheetByName("lensflow_db") || ss.insertSheet("lensflow_db");
 *   var data = sheet.getRange(1, 1).getValue();
 *   return ContentService.createTextOutput(data || '{"shoots":[],"clients":[]}')
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   var ss = SpreadsheetApp.getActiveSpreadsheet();
 *   var dbSheet = ss.getSheetByName("lensflow_db") || ss.insertSheet("lensflow_db");
 *   var humanSheet = ss.getSheetByName("Visualizacao_Jobs") || ss.insertSheet("Visualizacao_Jobs");
 *   
 *   var dataString = e.postData.contents;
 *   var data = JSON.parse(dataString);
 *   
 *   // 1. Salva o JSON bruto (Estado atual do App)
 *   dbSheet.getRange(1, 1).setValue(dataString);
 *   
 *   // 2. Limpa a planilha visual para reconstruir SEM os itens excluídos
 *   humanSheet.clear();
 *   
 *   // Reconstrução de Trabalhos
 *   humanSheet.appendRow(["--- LISTA DE TRABALHOS ATUALIZADA ---"]);
 *   humanSheet.getRange(1, 1, 1, 8).merge().setBackground("#1e293b").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center");
 *   
 *   humanSheet.appendRow(["ID", "Cliente", "Serviço", "Data", "Valor", "Status", "Local", "Notas"]);
 *   humanSheet.getRange(2, 1, 1, 8).setBackground("#f1f5f9").setFontWeight("bold");
 *   
 *   if (data.shoots && data.shoots.length > 0) {
 *     data.shoots.forEach(function(s) {
 *       var cName = "Desconhecido";
 *       if (data.clients) {
 *         var c = data.clients.find(function(x){ return x.id === s.clientId });
 *         if (c) cName = c.name;
 *       }
 *       humanSheet.appendRow([s.id, cName, s.type, s.shootDate, s.price, s.status, s.location, s.notes]);
 *     });
 *   }
 *   
 *   humanSheet.appendRow([""]);
 *   humanSheet.appendRow(["--- BASE DE CLIENTES ---"]);
 *   var row = humanSheet.getLastRow();
 *   humanSheet.getRange(row, 1, 1, 4).merge().setBackground("#4f46e5").setFontColor("white").setFontWeight("bold");
 *   
 *   humanSheet.appendRow(["ID", "Nome", "WhatsApp", "E-mail"]);
 *   if (data.clients && data.clients.length > 0) {
 *     data.clients.forEach(function(c) {
 *       humanSheet.appendRow([c.id, c.name, c.contact, c.email]);
 *     });
 *   }
 *   
 *   humanSheet.autoResizeColumns(1, 8);
 *   return ContentService.createTextOutput("Sync Success").setMimeType(ContentService.MimeType.TEXT);
 * }
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbybR_IfmBTsPDOxH-S1z8hjzDy_fSLA8Ljhe_WlZZmPoanVGP5IXvon426Ukv-Trq7O/exec';

export interface SyncData {
  shoots: Shoot[];
  clients: Client[];
}

export const apiService = {
  async fetchData(): Promise<SyncData | null> {
    try {
      const response = await fetch(`${API_URL}?action=read&t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow',
      });

      if (!response.ok) return null;
      const text = await response.text();
      
      if (text.trim().startsWith('<!doctype') || text.includes('html')) return null;

      return JSON.parse(text) as SyncData;
    } catch (error) {
      return null;
    }
  },

  async saveData(data: SyncData): Promise<boolean> {
    try {
      // Enviamos o JSON completo. Se um item não estiver no JSON, o Script o removerá da planilha ao dar clear()
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
      });

      // Como o Google Script em POST retorna redirect e mode: no-cors não permite ler, 
      // assumimos sucesso se a requisição não der erro de rede.
      return true;
    } catch (error) {
      console.error('Falha crítica na sincronização nuvem:', error);
      return false;
    }
  }
};
