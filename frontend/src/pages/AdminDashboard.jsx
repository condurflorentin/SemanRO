import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

// ── Stat Card ──────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      setError('Nu s-au putut incarca statisticile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={loadStats}
          className="mt-3 text-sm text-red-600 underline hover:no-underline cursor-pointer"
        >
          Reincarca
        </button>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total utilizatori', value: stats.total_users, color: 'blue' },
    { icon: UserCheck, label: 'Utilizatori activi', value: stats.active_users, color: 'green' },
    { icon: ShieldCheck, label: 'Verificati', value: stats.verified_users, color: 'purple' },
    { icon: UserPlus, label: 'Noi astazi', value: stats.new_users_today, color: 'amber' },
    { icon: CalendarDays, label: 'Noi saptamana aceasta', value: stats.new_users_this_week, color: 'cyan' },
    { icon: CalendarRange, label: 'Noi luna aceasta', value: stats.new_users_this_month, color: 'red' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Privire de ansamblu asupra platformei SemanRO</p>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i} />
        ))}
      </div>

      {/* Recent users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Ultimii utilizatori inregistrati</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recent_users?.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">Niciun utilizator inca.</p>
          ) : (
            stats.recent_users?.map((u) => (
              <div key={u.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                    {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {u.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('ro-RO')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
