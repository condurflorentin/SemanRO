import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full text-center">
        <img src="/logo.png" alt="SemanRO" className="h-16 w-auto object-contain mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Bine ai venit, <span className="font-semibold text-gray-900">{user?.full_name}</span>!
        </p>
        <div className="text-left bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <p><span className="font-medium text-gray-600">Email:</span> {user?.email}</p>
          <p><span className="font-medium text-gray-600">Cont creat:</span> {new Date(user?.created_at).toLocaleDateString('ro-RO')}</p>
          <p><span className="font-medium text-gray-600">Verificat:</span> {user?.is_verified ? '✅ Da' : '⏳ Nu'}</p>
        </div>
        <button
          onClick={logout}
          className="px-8 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
        >
          Deconectare
        </button>
      </div>
    </div>
  );
}
