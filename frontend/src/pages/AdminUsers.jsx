import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

// ── Status badge ─────────────────────────
function Badge({ active, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
        ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
    >
      {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ── Action dropdown (fixed positioning — nu se taie de overflow) ──
function ActionsMenu({ user, onAction, onClose, anchorRect }) {
  const actions = [
    {
      label: user.is_active ? 'Dezactiveaza cont' : 'Activeaza cont',
      icon: user.is_active ? UserX : UserCheck,
      action: () => onAction('toggle_active', { is_active: !user.is_active }),
      danger: user.is_active,
    },
    {
      label: user.is_verified ? 'Anuleaza verificare' : 'Verifica contul',
      icon: user.is_verified ? XCircle : CheckCircle2,
      action: () => onAction('toggle_verified', { is_verified: !user.is_verified }),
    },
    {
      label: user.role === 'admin' ? 'Retrage rol admin' : 'Promoveaza ca admin',
      icon: user.role === 'admin' ? ShieldOff : Shield,
      action: () => onAction('toggle_role', { role: user.role === 'admin' ? 'user' : 'admin' }),
    },
    {
      label: 'Sterge utilizator',
      icon: Trash2,
      action: () => onAction('delete'),
      danger: true,
    },
  ];

  // Calculeaza daca menu-ul incape jos; daca nu, deschide sus
  const menuH = actions.length * 42 + 8; // ~42px/item + padding
  const spaceBelow = window.innerHeight - (anchorRect?.bottom || 0);
  const openUp = spaceBelow < menuH;

  const style = anchorRect
    ? {
        position: 'fixed',
        top: openUp ? undefined : anchorRect.bottom + 4,
        bottom: openUp ? window.innerHeight - anchorRect.top + 4 : undefined,
        right: window.innerWidth - anchorRect.right,
        zIndex: 9999,
      }
    : {};

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12 }}
        style={style}
        className="w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1"
      >
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                a.action();
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors cursor-pointer
                ${a.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4" />
              {a.label}
            </button>
          );
        })}
      </motion.div>
    </>
  );
}

// ── Delete confirm modal ─────────────────
function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center">Sterge utilizator?</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          Esti sigur ca vrei sa stergi utilizatorul <strong>{user.full_name}</strong> ({user.email})?
          Aceasta actiune este ireversibila.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Anuleaza
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Sterge definitiv
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  AdminUsers — MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const perPage = 10;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter) params.status_filter = statusFilter;
      if (roleFilter) params.role_filter = roleFilter;

      const { data } = await adminApi.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Eroare la incarcarea utilizatorilor:', err);
      showToast('Eroare la incarcarea utilizatorilor', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (userId, actionType, payload) => {
    try {
      if (actionType === 'delete') {
        setDeleteTarget(users.find((u) => u.id === userId));
        return;
      }
      await adminApi.updateUser(userId, payload);
      showToast('Utilizator actualizat cu succes');
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Operatiune esuata.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteUser(deleteTarget.id);
      showToast(`${deleteTarget.full_name} a fost sters`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Stergerea a esuat.';
      showToast(msg, 'error');
      setDeleteTarget(null);
    }
  };

  const statusOptions = [
    { value: '', label: 'Toate' },
    { value: 'active', label: 'Activi' },
    { value: 'inactive', label: 'Inactivi' },
    { value: 'verified', label: 'Verificati' },
    { value: 'unverified', label: 'Neverificati' },
  ];

  const roleOptions = [
    { value: '', label: 'Toate rolurile' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilizatori</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} utilizator{total !== 1 && 'i'} in total
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reincarca
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cauta dupa nume sau email..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Niciun utilizator gasit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Utilizator</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Rol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Inregistrat</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                          {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Badge active={u.is_active} label={u.is_active ? 'Activ' : 'Inactiv'} />
                        <Badge active={u.is_verified} label={u.is_verified ? 'Verificat' : 'Neverificat'} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString('ro-RO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            if (openMenuId === u.id) {
                              setOpenMenuId(null);
                              setMenuAnchor(null);
                            } else {
                              setOpenMenuId(u.id);
                              setMenuAnchor(e.currentTarget.getBoundingClientRect());
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenuId === u.id && (
                            <ActionsMenu
                              user={u}
                              anchorRect={menuAnchor}
                              onAction={(actionType, payload) => handleAction(u.id, actionType, payload)}
                              onClose={() => { setOpenMenuId(null); setMenuAnchor(null); }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Pagina {page} din {pages} ({total} rezultate)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pNum;
                if (pages <= 5) {
                  pNum = i + 1;
                } else if (page <= 3) {
                  pNum = i + 1;
                } else if (page >= pages - 2) {
                  pNum = pages - 4 + i;
                } else {
                  pNum = page - 2 + i;
                }
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer
                      ${pNum === page
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {pNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            user={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg text-sm font-medium
              ${toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-white'
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
