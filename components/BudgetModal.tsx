
import React, { useState } from 'react';
import { ShootType } from '../types';
import { GoogleGenAI } from "@google/genai";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    type: ShootType.PORTRAIT,
    date: '',
    location: '',
    price: '',
    description: ''
  });
  const [isRefining, setIsRefining] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyingInitial, setCopyingInitial] = useState(false);

  if (!isOpen) return null;

  const handleRefineWithAI = async () => {
    if (!formData.description) {
      alert("Descreva brevemente o que está incluso para que a IA possa refinar.");
      return;
    }
    
    setIsRefining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Transforme essa descrição de serviço fotográfico em um texto curto, profissional e muito atraente para um orçamento: "${formData.description}". Mantenha em tópicos curtos.`
      });
      setFormData({ ...formData, description: response.text || formData.description });
    } catch (error) {
      console.error(error);
      alert("Erro ao refinar com IA.");
    } finally {
      setIsRefining(false);
    }
  };

  const copyInitialContact = async () => {
    let message = `Olá! Tudo bem? Fico feliz pelo seu interesse! 📸\n\n`;
    message += `Para que eu possa preparar um orçamento personalizado e preciso para você, poderia me passar alguns detalhes básicos?\n\n`;
    message += `📌 *Tipo de evento/ensaio:*\n`;
    message += `📍 *Local (Cidade/Bairro):*\n`;
    message += `📅 *Data pretendida:*\n\n`;
    message += `Assim que me enviar, já monto sua proposta e te mando! 🚀`;

    try {
      await navigator.clipboard.writeText(message);
      setCopyingInitial(true);
      setTimeout(() => setCopyingInitial(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const copyBudget = async () => {
    const priceFormatted = formData.price ? 
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.price)) : 
      'A combinar';

    let message = `📸 *PROPOSTA DE TRABALHO - GESTÃO FOTO*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Olá *${formData.clientName || 'Cliente'}*, tudo bem? É um prazer atender você! Seguem os detalhes para o seu ensaio:\n\n`;
    message += `✨ *Tipo:* ${formData.type}\n`;
    message += `📅 *Data:* ${formData.date ? new Date(formData.date).toLocaleDateString('pt-BR') : 'A definir'}\n`;
    message += `📍 *Local:* ${formData.location || 'A definir'}\n\n`;
    
    if (formData.description) {
      message += `📝 *O que está incluso:*\n${formData.description}\n\n`;
    }
    
    message += `💰 *Investimento:* ${priceFormatted}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Vamos eternizar esse momento? Se tiver qualquer dúvida, estou à disposição! 🚀`;

    try {
      await navigator.clipboard.writeText(message);
      setCopying(true);
      setTimeout(() => {
        setCopying(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h3 className="text-xl font-black tracking-tight">Vendas e Orçamentos</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Primeiro Contato • Proposta Comercial</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh]">
          {/* Fase 1: Coleta de Dados */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fase 1: Coleta de Informações</h4>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium mb-4 italic">
                O cliente acabou de chamar? Copie a mensagem abaixo para solicitar os dados necessários (Tipo, Local e Data).
              </p>
              <button 
                onClick={copyInitialContact}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${copyingInitial ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-sm'}`}
              >
                <i className={`fas ${copyingInitial ? 'fa-check' : 'fa-comment-dots'}`}></i>
                {copyingInitial ? 'Mensagem Copiada!' : 'Copiar Mensagem Inicial'}
              </button>
            </div>
          </section>

          {/* Fase 2: Elaboração da Proposta */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fase 2: Gerar Proposta Detalhada</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nome do Cliente</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                  placeholder="Ex: Maria Silva"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tipo de Evento</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as ShootType})}
                >
                  {Object.values(ShootType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Valor (R$)</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                  placeholder="0,00"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Data</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Localização</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                  placeholder="Cidade/Bairro"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição / O que está incluso</label>
                <button 
                  onClick={handleRefineWithAI}
                  disabled={isRefining || !formData.description}
                  className="text-[9px] font-black text-indigo-600 uppercase hover:underline disabled:opacity-30"
                >
                  {isRefining ? 'Refinando...' : '✨ Refinar com IA'}
                </button>
              </div>
              <textarea 
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none resize-none"
                placeholder="Ex: 2 horas de cobertura, todas as fotos editadas..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <button 
              onClick={copyBudget}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${copying ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              <i className={`fas ${copying ? 'fa-check' : 'fab fa-whatsapp'}`}></i>
              {copying ? 'Proposta Copiada!' : 'Copiar Proposta Completa'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
