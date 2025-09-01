





import React, { useState, useContext, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
// BQ Imports
import BqLayout from './pages/bq/BqLayout';
import BqDashboard from './pages/bq/BqDashboard';
import BqList from './pages/bq/BqList';
import BqDetail from './pages/bq/BqDetail';
// RAB Imports
import RabLayout from './pages/rab/RabLayout';
import RabDashboard from './pages/rab/RabDashboard';
import RabList from './pages/rab/RabList';
import RabDetail from './pages/rab/RabDetail';
import PriceDatabase from './pages/rab/PriceDatabase';
// Project Imports
import ProjectLayout from './pages/project/ProjectLayout';
import ProjectDashboard from './pages/project/ProjectDashboard';
import ProjectList from './pages/project/ProjectList';
import ProjectDetail from './pages/project/ProjectDetail';
// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminPage from './pages/admin/AdminPage';
import UserManagement from './pages/admin/UserManagement';
import SystemLog from './pages/admin/SystemLog';
// Other page imports
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
// Util imports
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext } from './contexts/AuthContext';
import { type RabDocument, type Project, type PriceDatabaseItem, type WorkItem } from './types';
import { initializeDatabase, fetchData, initialData, saveAllDataToDb } from './services/db';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';


const MainLayout = () => {
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) {
     return <ReactRouterDOM.Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <ReactRouterDOM.Outlet />
        </main>
      </div>
    </div>
  );
};


const App = () => {
  const [rabData, setRabData] = useState<RabDocument[]>([]);
  const [bqData, setBqData] = useState<RabDocument[]>([]); 
  const [projects, setProjects] = useState<Project[]>([]);
  const [priceDatabase, setPriceDatabase] = useState<PriceDatabaseItem[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [priceCategories, setPriceCategories] = useState<string[]>([]);
  const [workCategories, setWorkCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchAllData = async () => {
    const data = fetchData();
    setProjects(data.projects);
    setRabData(data.rabData);
    setBqData(data.bqData);
    setPriceDatabase(data.priceDatabase);
    setWorkItems(data.workItems);
    setPriceCategories(data.priceCategories);
    setWorkCategories(data.workCategories);
  };

  const handleSaveAllData = async () => {
    const success = saveAllDataToDb({
      projects,
      rabData,
      bqData,
      priceDatabase,
      workItems,
    });
    if (success) {
      toast.success('Semua data berhasil disimpan!');
    } else {
      toast.error('Gagal menyimpan data.');
    }
    return success;
  };

  useEffect(() => {
    const init = () => {
      setIsLoading(true);
      initializeDatabase();
      fetchAllData();
      setIsLoading(false);
    };
    init();

  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-lg font-semibold">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactRouterDOM.Routes>
       <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
       <ReactRouterDOM.Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Routes with the main header and layout */}
      <ReactRouterDOM.Route element={<MainLayout />}>
        <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate replace to="/dashboard" />} />
        <ReactRouterDOM.Route path="/dashboard" element={<Dashboard projects={projects} rabData={rabData} bqData={bqData} />} />
        <ReactRouterDOM.Route path="/notifications" element={<NotificationsPage />} />
        <ReactRouterDOM.Route path="/profile" element={<ProfilePage />} />
        <ReactRouterDOM.Route path="/settings" element={<SettingsPage />} />
        
        {/* BQ Routes */}
        <ReactRouterDOM.Route path="/bq" element={
          <ProtectedRoute disallowedRoles={['OBM', 'Purchasing']}>
            <BqLayout bqData={bqData} setBqData={setBqData} priceDatabase={priceDatabase} setPriceDatabase={setPriceDatabase} workItems={workItems} setWorkItems={setWorkItems} priceCategories={priceCategories} setPriceCategories={setPriceCategories} workCategories={workCategories} setWorkCategories={setWorkCategories}/>
          </ProtectedRoute>
        }>
          <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate replace to="dashboard" />} />
          <ReactRouterDOM.Route path="dashboard" element={<BqDashboard />} />
          <ReactRouterDOM.Route path="daftar" element={<BqList />} />
          <ReactRouterDOM.Route path="database" element={<PriceDatabase />} />
        </ReactRouterDOM.Route>

        {/* RAB Routes */}
        <ReactRouterDOM.Route path="/rab" element={
          <ProtectedRoute disallowedRoles={['OBM', 'Purchasing']}>
            <RabLayout rabData={rabData} setRabData={setRabData} priceDatabase={priceDatabase} setPriceDatabase={setPriceDatabase} workItems={workItems} setWorkItems={setWorkItems} priceCategories={priceCategories} setPriceCategories={setPriceCategories} workCategories={workCategories} setWorkCategories={setWorkCategories}/>
          </ProtectedRoute>
        }>
          <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate replace to="dashboard" />} />
          <ReactRouterDOM.Route path="dashboard" element={<RabDashboard />} />
          <ReactRouterDOM.Route path="daftar" element={<RabList />} />
          <ReactRouterDOM.Route path="database" element={<PriceDatabase />} />
        </ReactRouterDOM.Route>

        <ReactRouterDOM.Route path="/project" element={<ProjectLayout projects={projects} setProjects={setProjects} />}>
          <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate replace to="dashboard" />} />
          <ReactRouterDOM.Route path="dashboard" element={<ProjectDashboard />} />
          <ReactRouterDOM.Route path="daftar" element={<ProjectList />} />
        </ReactRouterDOM.Route>

        <ReactRouterDOM.Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout 
                projects={projects}
                rabData={rabData}
                bqData={bqData}
                priceDatabase={priceDatabase}
                workItems={workItems}
                setProjects={setProjects} 
                setRabData={setRabData} 
                setBqData={setBqData}
                setPriceDatabase={setPriceDatabase}
                setWorkItems={setWorkItems}
                initialData={initialData}
                // FIX: Made fetchAllData async to match the expected Promise<void> return type.
                fetchAllData={fetchAllData}
                // FIX: Made handleSaveAllData async to match the expected Promise<boolean> return type.
                handleSaveAllData={handleSaveAllData}
              />
            </ProtectedRoute>
          }
        >
          <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate replace to="data" />} />
          <ReactRouterDOM.Route path="data" element={<AdminPage />} />
          <ReactRouterDOM.Route path="users" element={<UserManagement />} />
          <ReactRouterDOM.Route path="logs" element={<SystemLog />} />
        </ReactRouterDOM.Route>

      </ReactRouterDOM.Route>

      {/* Full-screen route for BQ Detail, without the MainLayout */}
      <ReactRouterDOM.Route 
        path="/bq/detail/:bqId" 
        element={
          <ProtectedRoute disallowedRoles={['OBM', 'Purchasing']}>
            <BqDetail 
              bqData={bqData} 
              setBqData={setBqData} 
              priceDatabase={priceDatabase} 
              setPriceDatabase={setPriceDatabase}
              workItems={workItems}
              setWorkItems={setWorkItems}
            />
          </ProtectedRoute>
        } 
      />

      {/* Full-screen route for RAB Detail, without the MainLayout */}
      <ReactRouterDOM.Route 
        path="/rab/detail/:rabId" 
        element={
          <ProtectedRoute disallowedRoles={['OBM', 'Purchasing']}>
            <RabDetail 
              rabData={rabData} 
              setRabData={setRabData} 
              priceDatabase={priceDatabase} 
              setPriceDatabase={setPriceDatabase}
              workItems={workItems}
              setWorkItems={setWorkItems}
            />
          </ProtectedRoute>
        } 
      />

      {/* Full-screen route for Project Detail, without the MainLayout */}
      <ReactRouterDOM.Route 
        path="/project/detail/:projectId" 
        element={<ProjectDetail projects={projects} setProjects={setProjects} />} 
      />
    </ReactRouterDOM.Routes>
  );
};

export default App;