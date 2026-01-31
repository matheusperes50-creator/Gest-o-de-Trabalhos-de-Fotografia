
import React, { useState } from 'react';
import { Shoot, Client, ShootStatus, ShootType } from '../types';
import { STATUS_COLORS, SHOOT_TYPE_ICONS } from '../constants';

interface ShootListProps {
  shoots: Shoot[];
  clients: Client[];
  onAddShoot: () => void;
  onEditShoot: (shoot: Shoot) => void;
  onDeleteShoot: (id: string) => void;
}

const ShootList: React.FC<ShootListProps> = ({ shoots, clients, onAddShoot, onEditShoot, onDeleteShoot }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShootStatus | 'All'>('All');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredShoots = shoots.filter(shoot => {
    const client = clients.find(c => c.id === shoot.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          shoot.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          shoot.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || shoot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["ID", "ID_Cliente", "Nome_Cliente", "Tipo_Servico", "Local", "Data_Trabalho", "Data_Entrega", "Valor_RS", "Status", "Notas"];
    const rows = filteredShoots.map(s => {
      const client = clients.find(c => c.id === s.clientId);
      return [
        s.id,
        s.clientId,
        client?.name || 'N/A',
        s.type,
        s.location,
        s.shootDate,
        s.deliveryDate,
        s.price,
        s.status,
        s.notes.replace(/\n/g, " ")
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trabalhos_lensflow_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
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
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={exportToCSV}
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
            title="Exportar para Google Sheets"
          >
            <i className="fas fa-file-csv text-lg"></i>
            <span className="hidden sm:inline">Planilha</span>
          </button>
          
          <select 
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-wider outline-none cursor-pointer hover:border-indigo-200 transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">Todos Status</option>
            {Object.values(ShootStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={onAddShoot}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
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
                <th className="px-6 py-5">Valor</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredShoots.map(shoot => {
                const client = clients.find(c => c.id === shoot.clientId);
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
                      {new Intl.DateTimeFormat('pt-BR').format(new Date(shoot.shootDate))}
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-slate-800">
                      {formatCurrency(shoot.price || 0)}
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
                    Nenhum registro encontrado.
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
