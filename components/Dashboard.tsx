
import React, { useState } from 'react';
import { Shoot, Client, ShootStatus } from '../types';

interface DashboardProps {
  shoots: Shoot[];
  clients: Client[];
  onViewShoot: (shoot: Shoot) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ shoots, clients, onViewShoot }) => {
  const [copying, setCopying] = useState(false);
  
  const totalContracted = shoots.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalReceived = shoots.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const totalToReceive = totalContracted - totalReceived;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const exportFinancialReport = () => {
    const headers = ["ID", "Cliente", "Tipo", "Data", "Status", "Valor Total", "Valor Pago", "Saldo Devedor"];
    const rows = shoots.map(s => {
      const client = clients.find(c => c.id === s.clientId);
      const balance = (s.price || 0) - (s.paidAmount || 0);
      return [
        s.id,
        client?.name || 'N/A',
        s.type,
        s.shootDate,
        s.status,
        s.price.toString().replace('.', ','),
        s.paidAmount.toString().replace('.', ','),
        balance.toString().replace('.', ',')
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Financeiro_GestaoFoto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareWhatsAppSummary = async () => {
    const upcoming = [...shoots]
      .filter(s => s.shootDate === "A definir" || new Date(s.shootDate) >= new Date())
      .sort((a, b) => {
        if (a.shootDate === "A definir") return 1;
        if (b.shootDate === "A definir") return -1;
        return new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime();
      })
      .slice(0, 5);

    let message = `🚀 *GESTÃO FOTO - RESUMO DA AGENDA*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    upcoming.forEach((s, i) => {
      const client = clients.find(c => c.id === s.clientId);
      const dateStr = s.shootDate === "A definir" ? "_A definir_" : new Intl.DateTimeFormat('pt-BR').format(new Date(s.shootDate));
      message += `*${i + 1}. ${s.type}*\n`;
      message += `👤 Cliente: ${client?.name || '---'}\n`;
      message += `📅 Data: ${dateStr}\n`;
      message += `📍 Local: ${s.location || 'Não informado'}\n`;
      message += `💰 Status: ${s.paidAmount >= s.price ? '✅ Pago' : '⚠️ Pendente'}\n\n`;
    });

    message += `_Gerado em: ${new Date().toLocaleDateString('pt-BR')}_`;

    try {
      await navigator.clipboard.writeText(message);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const stats = [
    { label: 'Total Contratado', value: formatCurrency(totalContracted), icon: 'fa-file-invoice-dollar', color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Recebido', value: formatCurrency(totalReceived), icon: 'fa-hand-holding-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'A Receber', value: formatCurrency(totalToReceive), icon: 'fa-clock-rotate-left', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Jobs Ativos', value: shoots.filter(s => s.status !== ShootStatus.DELIVERED).length, icon: 'fa-camera', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const upcoming = [...shoots]
    .filter(s => {
      if (s.shootDate === "A definir") return true;
      return new Date(s.shootDate) >= new Date();
    })
    .sort((a, b) => {
      if (a.shootDate === "A definir") return 1;
      if (b.shootDate === "A definir") return -1;
      return new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime();
    })
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800">Visão Geral</h3>
          <p className="text-xs text-slate-400 font-medium">Resumo financeiro e operacional.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={shareWhatsAppSummary}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-xl transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest ${copying ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
          >
            <i className={`fas ${copying ? 'fa-check' : 'fab fa-whatsapp'}`}></i>
            {copying ? 'Copiado!' : 'Copiar Resumo'}
          </button>
          <button 
            onClick={exportFinancialReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest"
          >
            <i className="fas fa-file-excel"></i>
            Baixar Relatório
          </button>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center text-xl`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-lg font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center text-sm">
            <h3 className="font-bold text-slate-800">Próximos Ensaios</h3>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Agenda</span>
          </div>
          <div className="divide-y divide-slate-50">
            {upcoming.length > 0 ? (
              upcoming.map(shoot => {
                const client = clients.find(c => c.id === shoot.clientId);
                const isPaid = (shoot.paidAmount || 0) >= (shoot.price || 0);
                const isTBD = shoot.shootDate === "A definir";
                
                return (
                  <div key={shoot.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${isTBD ? 'bg-slate-200' : 'bg-slate-900'} text-white rounded-lg flex flex-col items-center justify-center leading-none`}>
                        {isTBD ? (
                          <i className="fas fa-question text-slate-400"></i>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold uppercase">{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(shoot.shootDate))}</span>
                            <span className="text-lg font-black">{new Date(shoot.shootDate).getDate()}</span>
                          </>
                        )}
                      </div>
                      <div className="max-w-[150px] md:max-w-xs">
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{client?.name || 'Cliente'}</h4>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{shoot.type}</p>
                           {isPaid ? (
                             <span className="text-[8px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-black">PAGO</span>
                           ) : (
                             <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md font-black">PENDENTE</span>
                           )}
                           {isTBD && (
                             <span className="text-[8px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-md font-black">DATA A DEFINIR</span>
                           )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onViewShoot(shoot)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <i className="fas fa-chevron-right text-xs"></i>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sem compromissos futuros.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-base font-black mb-1 uppercase tracking-tight">Saúde Financeira</h3>
              <p className="text-indigo-100 text-[10px] mb-6 font-bold uppercase tracking-widest">Percentual Recebido</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-indigo-200 mb-1 tracking-widest">
                    <span>LIQUIDEZ</span>
                    <span>{totalContracted > 0 ? Math.round((totalReceived / totalContracted) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-indigo-900/30 h-2 rounded-full overflow-hidden border border-indigo-500/30">
                    <div 
                      className="h-full bg-white rounded-full shadow-inner transition-all duration-1000" 
                      style={{ width: `${totalContracted > 0 ? Math.min((totalReceived / totalContracted) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-indigo-500/30">
                   <p className="text-[9px] text-indigo-100 uppercase font-black">Meta Mensal</p>
                   <p className="text-xl font-black">{formatCurrency(totalReceived)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
