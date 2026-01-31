
import React, { useState, useEffect } from 'react';
import { Shoot, Client, ShootStatus, ShootType, AIAdvice } from '../types';
import { generateShootAdvice } from '../services/geminiService';
import { STATUS_COLORS } from '../constants';

interface ShootModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shoot: Partial<Shoot>) => void;
  shoot?: Shoot;
  clients: Client[];
  isSyncing?: boolean;
}

const ShootModal: React.FC<ShootModalProps> = ({ isOpen, onClose, onSave, shoot, clients, isSyncing }) => {
  const [formData, setFormData] = useState<Partial<Shoot>>({
    clientId: '',
    type: ShootType.CASAMENTO,
    status: ShootStatus.SCHEDULED,
    shootDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    publicationDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    notes: '',
    price: 0,
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{shoot ? 'Editar Trabalho' : 'Novo Trabalho'}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Configurações de Produção</p>
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Cliente Vinculado</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <select 
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none"
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  >
                    <option value="">Selecione na sua lista de contatos...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Serviço / Categoria</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as ShootType})}
                  >
                    {Object.values(ShootType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Local do Trabalho</label>
                  <div className="relative">
                    <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                      placeholder="Ex: Fazenda, Buffet ou Endereço..."
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Valor Contratado (R$)</label>
                   <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-indigo-500 text-lg">R$</span>
                      <input 
                        type="number" 
                        className="w-full p-4 pl-14 bg-indigo-50/30 border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-800 text-xl shadow-inner"
                        placeholder="0,00"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      />
                   </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Status Atual</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ShootStatus})}
                  >
                    {Object.values(ShootStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Data de Realização</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={formData.shootDate}
                    onChange={(e) => setFormData({...formData, shootDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Entrega Final</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Notas de Produção / Briefing</label>
                <textarea 
                  rows={3}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-700 font-medium leading-relaxed"
                  placeholder="Instruções da cerimônia, detalhes da festa ou briefing corporativo..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
            </div>

            <button 
              onClick={() => onSave(formData)}
              disabled={isSyncing}
              className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
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

          {/* AI Helper Side */}
          <div className="lg:col-span-2 bg-indigo-50/40 rounded-[2.5rem] p-8 border border-indigo-100 flex flex-col shadow-inner">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-black text-indigo-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-200">
                  <i className="fas fa-sparkles"></i>
                </div>
                Assistente de IA
              </h4>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !formData.clientId}
                className="text-[10px] font-black px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md uppercase tracking-[0.15em]"
              >
                {isGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : 'Gerar Criativos'}
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
              {!aiAdvice && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <div className="w-24 h-24 bg-indigo-200/50 rounded-full flex items-center justify-center text-indigo-400 text-4xl mb-6">
                     <i className="fas fa-robot"></i>
                  </div>
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-widest leading-loose">Deixe a IA criar suas legendas e organizar seu checklist pré-produção.</p>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <i className="fas fa-wand-magic-sparkles text-indigo-600 text-2xl animate-pulse"></i>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">Processando...</p>
                    <p className="text-[10px] text-indigo-500 font-bold">Analisando tipo de trabalho e perfil do cliente.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-700">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                       <i className="fab fa-instagram text-rose-500"></i>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cópia para Redes Sociais</h5>
                    </div>
                    <div className="p-6 bg-white border border-indigo-100 rounded-3xl text-sm text-slate-700 leading-relaxed shadow-sm font-medium italic relative group">
                      {aiAdvice?.instagramCaption}
                      <button className="absolute top-4 right-4 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                         <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4">
                       <i className="fas fa-video text-indigo-500"></i>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ideias de Vídeo Curto</h5>
                    </div>
                    <div className="space-y-3">
                      {aiAdvice?.reelIdeas.map((idea, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-white border border-indigo-100 rounded-2xl shadow-sm hover:border-indigo-300 transition-colors">
                          <span className="font-black text-indigo-600 text-sm">#{i+1}</span>
                          <p className="text-xs font-bold text-slate-800 leading-snug">{idea}</p>
                        </div>
                      ))}
                    </div>
                  </section>
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
