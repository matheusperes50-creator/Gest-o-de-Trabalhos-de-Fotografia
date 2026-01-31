
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
const STORAGE_KEY = 'lensflow_data_v10';

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
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

  /**
   * Sincroniza o estado atual com o LocalStorage e com a Planilha Google
   */
  const triggerSync = async (updatedShoots: Shoot[], updatedClients: Client[]) => {
    setIsSyncing(true);
    
    // Atualiza o estado visual imediatamente
    setShoots(updatedShoots);
    setClients(updatedClients);
    
    const dataToSave = { shoots: updatedShoots, clients: updatedClients };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    // Envia para o Google Sheets e aguarda resposta
    const success = await apiService.saveData(dataToSave);
    setIsCloudSynced(success);
    
    setTimeout(() => setIsSyncing(false), 800);
  };

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
    const shoot = shoots.find(s => s.id === id);
    const client = clients.find(c => c.id === shoot?.clientId);
    const confirmMessage = `Tem certeza que deseja excluir o trabalho de "${client?.name || 'este cliente'}"?\n\n⚠️ IMPORTANTE: Isso removerá o registro permanentemente tanto no App quanto na planilha Google (aba TRABALHOS).`;
    
    if (window.confirm(confirmMessage)) {
      const updated = shoots.filter(s => s.id !== id);
      triggerSync(updated, clients);
      setIsShootModalOpen(false);
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
    triggerSync(updatedShoots, clients);
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
    triggerSync(shoots, updatedClients);
    setIsClientModalOpen(false);
  };

  const handleDeleteClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    const confirmMessage = `Tem certeza que deseja excluir o cadastro de "${client?.name || 'este cliente'}"?\n\n⚠️ IMPORTANTE: Isso removerá o cadastro tanto na aba CLIENTES quanto na aba TRABALHOS (todos os ensaios deste cliente serão apagados) tanto no App quanto na planilha Google.`;
    
    if (window.confirm(confirmMessage)) {
      // Exclusão em Cascata: Remove o cliente e todos os seus trabalhos
      const updatedClients = clients.filter(c => c.id !== id);
      const updatedShoots = shoots.filter(s => s.clientId !== id);
      
      triggerSync(updatedShoots, updatedClients);
      setIsClientModalOpen(false);
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
        onDelete={handleDeleteShoot}
        shoot={selectedShoot} 
        clients={clients} 
        isSyncing={isSyncing}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        onDelete={handleDeleteClient}
        client={selectedClient}
      />
    </Layout>
  );
};

export default App;
