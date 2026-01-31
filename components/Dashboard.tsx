
import React from 'react';
import { Shoot, Client, ShootStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface DashboardProps {
  shoots: Shoot[];
  clients: Client[];
  onViewShoot: (shoot: Shoot) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ shoots, clients, onViewShoot }) => {
  const totalRevenue = shoots.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const avgTicket = shoots.length > 0 ? totalRevenue / shoots.length : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const stats = [
    { label: 'Faturamento', value: formatCurrency(totalRevenue), icon: 'fa-money-bill-trend-up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ticket Médio', value: formatCurrency(avgTicket), icon: 'fa-chart-line', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Em Edição', value: shoots.filter(s => s.status === ShootStatus.EDITING).length, icon: 'fa-wand-magic-sparkles', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Clientes', value: clients.length, icon: 'fa-users', color: 'text-sky-600', bg: 'bg-sky-50' },
  ];

  const upcoming = [...shoots]
    .filter(s => new Date(s.shootDate) >= new Date())
    .sort((a, b) => new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
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
            <h3 className="font-bold text-slate-800">Agenda Próxima</h3>
            <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todos</button>
          </div>
          <div className="divide-y divide-slate-50">
            {upcoming.length > 0 ? (
              upcoming.map(shoot => {
                const client = clients.find(c => c.id === shoot.clientId);
                return (
                  <div key={shoot.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center leading-none">
                        <span className="text-[10px] font-bold uppercase">{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(shoot.shootDate))}</span>
                        <span className="text-lg font-black">{new Date(shoot.shootDate).getDate()}</span>
                      </div>
                      <div className="max-w-[150px] md:max-w-xs">
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{client?.name || 'Cliente'}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{shoot.type}</p>
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
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Agenda livre.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-base font-black mb-1 uppercase tracking-tight">Metas Mensais</h3>
              <p className="text-indigo-100 text-[10px] mb-6 font-bold uppercase tracking-widest">Progresso de faturamento</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-indigo-200 mb-1 tracking-widest">
                    <span>STATUS</span>
                    <span>{Math.round((totalRevenue / 15000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-indigo-900/30 h-2 rounded-full overflow-hidden border border-indigo-500/30">
                    <div 
                      className="h-full bg-white rounded-full shadow-inner transition-all duration-1000" 
                      style={{ width: `${Math.min((totalRevenue / 15000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-sm">
                   <i className="fas fa-shield-check"></i>
                </div>
                <div>
                   <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Backup Cloud</p>
                   <p className="text-[9px] text-emerald-600 font-bold">Sincronizado automaticamente com Google Sheets.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
