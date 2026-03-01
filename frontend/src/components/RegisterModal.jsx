import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, fullName, password);
      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la înregistrare');
    } finally {
      setLoading(false);
    }
  };

  // Validare parolă vizuală
  const passwordChecks = [
    { label: 'Minimum 8 caractere', valid: password.length >= 8 },
    { label: 'Conține o literă mare', valid: /[A-Z]/.test(password) },
    { label: 'Conține o cifră', valid: /\d/.test(password) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <img src="/logo.png" alt="SemanRO" className="h-28 w-auto object-contain mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Înregistrare</h2>
          <p className="text-gray-500 mt-1">Creează un cont nou</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            Cont creat cu succes! Redirecționare...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nume complet */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nume complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="space-y-1.5">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      check.valid ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    {check.valid && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={check.valid ? 'text-green-600' : 'text-gray-400'}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Se creează contul...' : 'Înregistrare'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ai deja un cont?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-red-600 font-semibold hover:underline cursor-pointer"
          >
            Conectează-te
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}
