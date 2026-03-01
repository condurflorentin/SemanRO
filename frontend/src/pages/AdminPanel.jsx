import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUsers />;
      case 'dashboard':
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}
