
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ShootList from './components/ShootList';
import ClientList from './components/ClientList';
import ShootModal from './components/ShootModal';
import ClientModal from './components/ClientModal';
import { Shoot, Client, ShootStatus, ShootType } from './types';
import { apiService } from './services/apiService';

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shoots' | 'clients'>('dashboard');
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Modais
  const [isShootModalOpen, setIsShootModalOpen] = useState(false);
  const [selectedShoot, setSelectedShoot] = useState<Shoot | undefined>();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const remoteData = await apiService.fetchData();
    
    if (remoteData) {
      setShoots(remoteData.shoots || []);
      setClients(remoteData.clients || []);
      setIsCloudSynced(true);
      localStorage.setItem('lensflow_data_v8', JSON.stringify(remoteData));
    } else {
      const stored = localStorage.getItem('lensflow_data_v8');
      if (stored) {
        const parsed = JSON.parse(stored);
        setShoots(parsed.shoots || []);
        setClients(parsed.clients || []);
      }
      setIsCloudSynced(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncWithCloud = useCallback(async (newShoots: Shoot[], newClients: Client[]) => {
    // Atualiza interface imediatamente
    setShoots(newShoots);
    setClients(newClients);
    
    // Salva cópia local de segurança
    const localData = { shoots: newShoots, clients: newClients };
    localStorage.setItem('lensflow_data_v8', JSON.stringify(localData));
    
    // Sincroniza com Google Sheets
    setIsSyncing(true);
    const success = await apiService.saveData(localData);
    
    // Em modo no-cors, o 'success' aqui significa que a requisição de rede foi despachada
    setIsCloudSynced(success);
    
    // Feedback de finalização para o usuário
    setTimeout(() => setIsSyncing(false), 1000);
  }, []);

  // --- Operações de Trabalho (Shoot) ---
  const handleAddShoot = () => {
    setSelectedShoot(undefined);
    setIsShootModalOpen(true);
  };

  const handleEditShoot = (shoot: Shoot) => {
    setSelectedShoot(shoot);
    setIsShootModalOpen(true);
  };

  const handleDeleteShoot = (id: string) => {
    if (window.confirm("Deseja realmente excluir este trabalho?")) {
      const updated = shoots.filter(s => s.id !== id);
      syncWithCloud(updated, clients);
    }
  };

  const handleSaveShoot = (data: Partial<Shoot>) => {
    let updatedShoots: Shoot[];
    if (selectedShoot) {
      updatedShoots = shoots.map(s => s.id === selectedShoot.id ? { ...s, ...data } as Shoot : s);
    } else {
      const newShoot: Shoot = {
        ...data,
        id: generateId(),
        price: data.price || 0,
        location: data.location || '',
      } as Shoot;
      updatedShoots = [newShoot, ...shoots];
    }
    syncWithCloud(updatedShoots, clients);
    setIsShootModalOpen(false);
  };

  // --- Operações de Cliente (Client) ---
  const handleAddClient = () => {
    setSelectedClient(undefined);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (data: Omit<Client, 'id'>) => {
    let updatedClients: Client[];
    if (selectedClient) {
      updatedClients = clients.map(c => c.id === selectedClient.id ? { ...c, ...data } : c);
    } else {
      const newClient: Client = { ...data, id: generateId() };
      updatedClients = [newClient, ...clients];
    }
    syncWithCloud(shoots, updatedClients);
    setIsClientModalOpen(false);
  };

  const handleDeleteClient = (id: string) => {
    const hasShoots = shoots.some(s => s.clientId === id);
    if (hasShoots) {
      alert("Este cliente possui trabalhos vinculados e não pode ser excluído.");
      return;
    }
    if (window.confirm("Deseja excluir este cliente?")) {
      const updatedClients = clients.filter(c => c.id !== id);
      syncWithCloud(shoots, updatedClients);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20 animate-bounce">
          <i className="fas fa-camera-retro text-3xl"></i>
        </div>
        <h1 className="text-xl font-black uppercase tracking-[0.4em] mb-4 text-white/90">LensFlow</h1>
        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Sincronizando Banco de Dados...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isSyncing={isSyncing}
      isCloudSynced={isCloudSynced}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          shoots={shoots} 
          clients={clients} 
          onViewShoot={handleEditShoot} 
        />
      )}
      {activeTab === 'shoots' && (
        <ShootList 
          shoots={shoots} 
          clients={clients} 
          onAddShoot={handleAddShoot} 
          onEditShoot={handleEditShoot} 
          onDeleteShoot={handleDeleteShoot} 
        />
      )}
      {activeTab === 'clients' && (
        <ClientList 
          clients={clients} 
          onAddClient={handleAddClient} 
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient} 
        />
      )}

      <ShootModal 
        isOpen={isShootModalOpen} 
        onClose={() => setIsShootModalOpen(false)} 
        onSave={handleSaveShoot} 
        shoot={selectedShoot} 
        clients={clients} 
        isSyncing={isSyncing}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        client={selectedClient}
      />
    </Layout>
  );
};

export default App;
