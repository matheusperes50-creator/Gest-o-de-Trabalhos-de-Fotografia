
import React from 'react';
import { Client } from '../types';

interface ClientListProps {
  clients: Client[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onEditClient, onDeleteClient }) => {
  const exportToCSV = () => {
    const headers = ["ID", "Nome", "Contato", "Email"];
    const rows = clients.map(c => [c.id, c.name, c.contact, c.email]);
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_lensflow_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Base de Clientes</h3>
          <p className="text-sm text-slate-400 font-medium">Gerencie seus contatos e histórico de trabalhos.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-wider hover:text-emerald-600 transition-all shadow-sm"
          >
            <i className="fas fa-file-export"></i>
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button 
            onClick={onAddClient}
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <i className="fas fa-user-plus"></i>
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {clients.map(client => (
          <div key={client.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full transition-transform group-hover:scale-110"></div>
            
            <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEditClient(client)}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-2 bg-white rounded-lg shadow-sm border border-slate-100"
                title="Editar"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                onClick={() => onDeleteClient(client.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-lg shadow-sm border border-slate-100"
                title="Excluir"
              >
                <i className="fas fa-trash-can"></i>
              </button>
            </div>

            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-2xl text-xl font-black shadow-lg shadow-slate-200 uppercase">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-lg leading-tight">{client.name}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: {client.id}</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <i className="fab fa-whatsapp text-emerald-500 text-lg"></i>
                <span className="text-sm font-bold text-emerald-900">{client.contact || '---'}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <i className="fas fa-envelope text-slate-400"></i>
                <span className="text-sm font-bold text-slate-600 truncate">{client.email || '---'}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Status: Ativo</span>
              <button onClick={() => onEditClient(client)} className="text-indigo-500 hover:underline">Ver Detalhes</button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
              <i className="fas fa-users text-4xl text-slate-100 mb-4"></i>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sua base de clientes está vazia.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
