import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Utilizatori', icon: Users },
];

export default function AdminLayout({ activeTab, onTabChange, children }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Mobile backdrop ───────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col
          bg-white border-r border-gray-200 transition-all duration-300
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100">
          <Shield className="w-7 h-7 text-red-600 shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
              Seman<span className="text-red-600">RO</span> Admin
            </span>
          )}
          {/* Mobile close btn */}
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors cursor-pointer
                  ${isActive
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? tab.label : ''}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
              <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? 'Deconectare' : ''}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Deconectare</span>}
          </button>
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer justify-center"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar (mobile) */}
        <header className="lg:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-gray-900">
            Seman<span className="text-red-600">RO</span> Admin
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
