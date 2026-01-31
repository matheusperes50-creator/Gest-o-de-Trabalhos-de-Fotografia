
import React, { useState, useMemo } from 'react';
import { Shoot, Client, ShootStatus, ShootType } from '../types';
import { STATUS_COLORS, SHOOT_TYPE_ICONS } from '../constants';

interface ShootListProps {
  shoots: Shoot[];
  clients: Client[];
  onAddShoot: () => void;
  onEditShoot: (shoot: Shoot) => void;
  onDeleteShoot: (id: string) => void;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const ShootList: React.FC<ShootListProps> = ({ shoots, clients, onAddShoot, onEditShoot, onDeleteShoot }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShootStatus | 'All'>('All');
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<number | 'all'>(new Date().getFullYear());
  const [copying, setCopying] = useState(false);

  const availableYears = useMemo(() => {
    const years = shoots
      .filter(s => s.shootDate && s.shootDate !== "A definir")
      .map(s => new Date(s.shootDate).getFullYear());
    return Array.from(new Set([...years, new Date().getFullYear()])).sort((a, b) => b - a);
  }, [shoots]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredShoots = shoots.filter(shoot => {
    const client = clients.find(c => c.id === shoot.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          shoot.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          shoot.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || shoot.status === statusFilter;
    
    let matchesDate = true;
    if (shoot.shootDate !== "A definir") {
      const date = new Date(shoot.shootDate);
      const matchesMonth = monthFilter === 'all' || date.getMonth() === monthFilter;
      const matchesYear = yearFilter === 'all' || date.getFullYear() === yearFilter;
      matchesDate = matchesMonth && matchesYear;
    } else {
      // Itens TBD só aparecem se o filtro de data for "Todos"
      matchesDate = monthFilter === 'all' && yearFilter === 'all';
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ["ID", "ID_Cliente", "Nome_Cliente", "Tipo_Servico", "Local", "Data_Trabalho", "Valor_Total", "Valor_Pago", "Saldo_Devedor", "Status", "Notas"];
    const rows = filteredShoots.map(s => {
      const client = clients.find(c => c.id === s.clientId);
      const balance = (s.price || 0) - (s.paidAmount || 0);
      return [
        s.id,
        s.clientId,
        client?.name || 'N/A',
        s.type,
        s.location,
        s.shootDate,
        s.price.toString().replace('.', ','),
        s.paidAmount.toString().replace('.', ','),
        balance.toString().replace('.', ',') ?? 0,
        s.status,
        s.notes.replace(/\n/g, " ")
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trabalhos_filtrados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareWhatsAppList = async () => {
    if (filteredShoots.length === 0) return;

    let message = `📸 *GESTÃO FOTO - LISTA DE TRABALHOS*\n`;
    message += `📅 Período: ${monthFilter !== 'all' ? MONTHS[monthFilter] : ''} ${yearFilter}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    filteredShoots.forEach((s, i) => {
      const client = clients.find(c => c.id === s.clientId);
      const dateStr = s.shootDate === "A definir" ? "_A definir_" : new Intl.DateTimeFormat('pt-BR').format(new Date(s.shootDate));
      message += `*${i + 1}. ${s.type}*\n`;
      message += `👤 Cliente: ${client?.name || '---'}\n`;
      message += `📅 Data: ${dateStr}\n`;
      message += `📍 Local: ${s.location || '---'}\n`;
      message += `💰 Valor: ${formatCurrency(s.price)}\n`;
      message += `📝 Status: ${s.status}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(message);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex-1 w-full max-w-md relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Buscar por cliente, serviço ou local..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          {/* Seletores de Data */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-2xl">
             <i className="fas fa-calendar-alt text-slate-300 text-xs"></i>
             <select 
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-xs font-black uppercase tracking-widest text-slate-600 bg-transparent outline-none cursor-pointer"
             >
                <option value="all">Mês</option>
                {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
             </select>
             <select 
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-xs font-black uppercase tracking-widest text-slate-600 bg-transparent outline-none cursor-pointer"
             >
                <option value="all">Ano</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
          </div>

          <select 
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-indigo-200 transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">Status</option>
            {Object.values(ShootStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={shareWhatsAppList}
            className={`px-4 py-3 border rounded-2xl transition-all shadow-sm flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${copying ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
          >
            <i className={`fas ${copying ? 'fa-check' : 'fab fa-whatsapp'} text-lg`}></i>
            <span className="hidden sm:inline">{copying ? 'Copiado!' : 'Copiar'}</span>
          </button>
          
          <button 
            onClick={onAddShoot}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <i className="fas fa-plus"></i>
            <span>Novo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Cliente / Local</th>
                <th className="px-6 py-5">Data</th>
                <th className="px-6 py-5">Financeiro</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredShoots.map(shoot => {
                const client = clients.find(c => c.id === shoot.clientId);
                const isFullyPaid = (shoot.paidAmount || 0) >= (shoot.price || 0);
                const isTBD = shoot.shootDate === "A definir";
                
                return (
                  <tr key={shoot.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg shadow-lg shadow-slate-200">
                          {SHOOT_TYPE_ICONS[shoot.type]}
                        </div>
                        <div className="max-w-[180px] md:max-w-xs">
                          <p className="font-black text-slate-800 text-sm leading-tight truncate">{client?.name || '---'}</p>
                          <div className="flex flex-col">
                            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">{shoot.type}</p>
                            {shoot.location && (
                              <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 truncate mt-0.5">
                                <i className="fas fa-location-dot text-[7px]"></i>
                                {shoot.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-bold">
                      {isTBD ? (
                        <span className="text-indigo-400 italic">A definir</span>
                      ) : (
                        new Intl.DateTimeFormat('pt-BR').format(new Date(shoot.shootDate))
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">{formatCurrency(shoot.price || 0)}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                           <span className={`text-[8px] font-black px-1 rounded ${isFullyPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                             {isFullyPaid ? 'QUITADO' : `PAGO: ${formatCurrency(shoot.paidAmount || 0)}`}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${STATUS_COLORS[shoot.status]}`}>
                        {shoot.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEditShoot(shoot)}
                          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button 
                          onClick={() => onDeleteShoot(shoot.id)}
                          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Excluir"
                        >
                          <i className="fas fa-trash-can text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredShoots.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Nenhum registro encontrado para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShootList;
