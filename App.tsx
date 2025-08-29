
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
import { initializeDatabase, fetchData, initialData } from './services/db';
import { Loader2 } from 'lucide-react';


const MainLayout = ({ notifications, setNotifications }: { notifications: any[], setNotifications: React.Dispatch<React.SetStateAction<any[]>> }) => {
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) {
     return <ReactRouterDOM.Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} notifications={notifications} setNotifications={setNotifications} />
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

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Status RAB #RAB005 diperbarui menjadi Diterima.', time: '5 menit lalu', read: false, icon: 'CheckCircle', link: '/rab/detail/5' },
    { id: 2, text: 'Proyek "Website E-commerce Klien A" mendekati tenggat waktu.', time: '2 jam lalu', read: false, icon: 'Clock', link: '/project/detail/PROJ001' },
    { id: 3, text: 'Komentar baru pada Laporan Proyek "Pembangunan Kantor Cabang".', time: '1 hari lalu', read: true, icon: 'MessageSquare', link: '/project/detail/PROJ004' },
    { id: 4, text: 'Pemeliharaan sistem dijadwalkan malam ini pukul 23:00.', time: '2 hari lalu', read: true, icon: 'Server', link: '#' },
    { id: 5, text: 'Database harga material berhasil diimpor.', time: '3 hari lalu', read: true, icon: 'CheckCircle', link: '/rab/database'},
    { id: 6, text: 'Tugas baru ditambahkan ke Proyek "Migrasi Sistem Gudang".', time: '3 hari lalu', read: true, icon: 'MessageSquare', link: '/project/detail/PROJ003'},
  ]);
  
  const fetchAllData = async () => {
    const data = await fetchData();
    setProjects(data.projects);
    setRabData(data.rabData);
    setBqData(data.bqData);
    setPriceDatabase(data.priceDatabase);
    setWorkItems(data.workItems);
    setPriceCategories(data.priceCategories);
    setWorkCategories(data.workCategories);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initializeDatabase();
      await fetchAllData();
      setIsLoading(false);
    };
    init();

    const pollInterval = setInterval(fetchAllData, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-lg font-semibold">Memuat data dari database...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactRouterDOM.Routes>
       <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
       <ReactRouterDOM.Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Routes with the main header and layout */}
      <ReactRouterDOM.Route element={<MainLayout notifications={notifications} setNotifications={setNotifications} />}>
        <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate replace to="/dashboard" />} />
        <ReactRouterDOM.Route path="/dashboard" element={<Dashboard projects={projects} rabData={rabData} bqData={bqData} />} />
        <ReactRouterDOM.Route path="/notifications" element={<NotificationsPage notifications={notifications} setNotifications={setNotifications} />} />
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
