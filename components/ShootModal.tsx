
import React, { useState, useEffect } from 'react';
import { Shoot, Client, ShootStatus, ShootType, AIAdvice } from '../types';
import { generateShootAdvice } from '../services/geminiService';

interface ShootModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shoot: Partial<Shoot>) => void;
  onDelete?: (id: string) => void;
  shoot?: Shoot;
  clients: Client[];
  isSyncing?: boolean;
}

const ShootModal: React.FC<ShootModalProps> = ({ isOpen, onClose, onSave, onDelete, shoot, clients, isSyncing }) => {
  const [formData, setFormData] = useState<Partial<Shoot>>({
    clientId: '',
    type: ShootType.CASAMENTO,
    status: ShootStatus.SCHEDULED,
    shootDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    publicationDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    notes: '',
    price: 0,
    paidAmount: 0,
    location: '',
  });

  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (shoot) {
      setFormData(shoot);
      setAiAdvice(null);
    } else {
      setFormData({
        clientId: '',
        type: ShootType.CASAMENTO,
        status: ShootStatus.SCHEDULED,
        shootDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        publicationDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
        notes: '',
        price: 0,
        paidAmount: 0,
        location: '',
      });
    }
  }, [shoot, isOpen]);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    const client = clients.find(c => c.id === formData.clientId);
    if (!client || !formData.type) {
      alert("Selecione um cliente e o tipo de serviço primeiro!");
      return;
    }

    setIsGenerating(true);
    try {
      const advice = await generateShootAdvice(client.name, formData.type as ShootType);
      setAiAdvice(advice);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar sugestões da IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const balanceToPay = (formData.price || 0) - (formData.paidAmount || 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{shoot ? 'Editar Trabalho' : 'Novo Trabalho'}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Configurações GestãoFoto</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 shadow-sm">
            <i className="fas fa-times text-slate-400"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Cliente</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <select 
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none"
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  >
                    <option value="">Selecione o cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Tipo de Serviço</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as ShootType})}
                  >
                    {Object.values(ShootType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Local</label>
                  <div className="relative">
                    <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                      placeholder="Local do ensaio/festa"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Seção Financeira */}
              <div className="p-6 bg-slate-900 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <i className="fas fa-wallet text-emerald-400 text-xs"></i>
                   <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Controle de Pagamento</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Valor Total (R$)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-white font-black text-lg focus:border-indigo-500 transition-all"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Valor Já Pago (R$)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-emerald-400 font-black text-lg focus:border-emerald-500 transition-all"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({...formData, paidAmount: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Devedor</span>
                   <span className={`text-xl font-black ${balanceToPay <= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanceToPay)}
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Data do Evento</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={formData.shootDate}
                    onChange={(e) => setFormData({...formData, shootDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Status</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ShootStatus})}
                  >
                    {Object.values(ShootStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Anotações</label>
                <textarea 
                  rows={2}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-700 font-medium"
                  placeholder="Detalhes adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {shoot && onDelete && (
                <button 
                  onClick={() => onDelete(shoot.id)}
                  className="flex-1 py-5 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash-can"></i>
                  Excluir Trabalho
                </button>
              )}
              <button 
                onClick={() => onSave(formData)}
                disabled={isSyncing}
                className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-300 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isSyncing ? (
                  <>
                    <i className="fas fa-sync fa-spin"></i>
                    Salvando na Nuvem...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </div>

          {/* AI Helper Side */}
          <div className="lg:col-span-2 bg-indigo-50/40 rounded-[2.5rem] p-8 border border-indigo-100 flex flex-col shadow-inner">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-black text-indigo-900 flex items-center gap-3 text-sm">
                <i className="fas fa-wand-magic-sparkles"></i>
                GestãoFoto AI
              </h4>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !formData.clientId}
                className="text-[10px] font-black px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Ideias'}
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
              {!aiAdvice && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <i className="fas fa-robot text-4xl mb-4"></i>
                  <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Use nossa IA para criar legendas e checklists de marketing.</p>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Consultando Gemini...</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="p-6 bg-white border border-indigo-100 rounded-3xl text-xs text-slate-700 leading-relaxed shadow-sm italic">
                    <h5 className="text-[9px] font-black text-indigo-500 uppercase mb-2">Sugestão de Legenda</h5>
                    {aiAdvice?.instagramCaption}
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[9px] font-black text-indigo-500 uppercase">Checklist do Ensaio</h5>
                    {aiAdvice?.checklist.map((item, i) => (
                      <div key={i} className="flex gap-2 p-3 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold text-slate-700">
                         <i className="fas fa-check text-emerald-500"></i>
                         {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShootModal;
