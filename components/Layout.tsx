
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'shoots' | 'clients';
  setActiveTab: (tab: 'dashboard' | 'shoots' | 'clients') => void;
  isSyncing?: boolean;
  isCloudSynced?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isSyncing, isCloudSynced }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 shadow-xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-camera-retro text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">LensFlow</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <i className="fas fa-chart-pie w-5"></i>
            <span className="text-sm font-bold">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('shoots')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'shoots' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <i className="fas fa-briefcase w-5"></i>
            <span className="text-sm font-bold">Trabalhos</span>
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <i className="fas fa-users w-5"></i>
            <span className="text-sm font-bold">Clientes</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-[10px] font-black border border-indigo-700">PRO</div>
            <div>
              <p className="font-medium text-slate-200 leading-none mb-1 text-xs">Sistema LensFlow</p>
              <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isCloudSynced ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                {isSyncing ? 'Sincronizando...' : isCloudSynced ? 'Cloud Sync ON' : 'Cloud Offline'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-20 md:pb-0">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 sticky top-0 z-50 flex justify-between items-center shadow-sm backdrop-blur-md bg-white/80">
          <div className="flex items-center gap-4">
            <div className="md:hidden w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white mr-1 shadow-lg shadow-indigo-100">
              <i className="fas fa-camera-retro text-xs"></i>
            </div>
            <h2 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest truncate">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'shoots' ? 'Jobs' : 'Clients'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
              onClick={() => window.location.reload()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:bg-slate-50 ${isSyncing ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}
             >
                <i className={`fas ${isSyncing ? 'fa-sync-alt fa-spin text-indigo-500' : isCloudSynced ? 'fa-cloud text-emerald-500' : 'fa-wifi-slash text-amber-500'} text-[10px]`}></i>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isSyncing ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {isSyncing ? 'Sincronizando...' : isCloudSynced ? 'Sincronizado' : 'Atualizar'}
                </span>
             </button>
             <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <i className="fas fa-bell"></i>
             </button>
          </div>
        </header>
        
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-2xl">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <i className="fas fa-chart-pie text-lg"></i>
            <span className="text-[9px] font-black uppercase">Início</span>
          </button>
          <button onClick={() => setActiveTab('shoots')} className={`flex flex-col items-center gap-1 ${activeTab === 'shoots' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <i className="fas fa-briefcase text-lg"></i>
            <span className="text-[9px] font-black uppercase">Jobs</span>
          </button>
          <button onClick={() => setActiveTab('clients')} className={`flex flex-col items-center gap-1 ${activeTab === 'clients' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <i className="fas fa-users text-lg"></i>
            <span className="text-[9px] font-black uppercase">Clientes</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
