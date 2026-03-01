import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const navLinks = ['Acasă', 'Despre Sistem', 'Clienți', 'Contact'];

  return (
    <>
      <nav className="w-full px-6 lg:px-10 py-5 flex justify-between items-center max-w-7xl mx-auto">
        {/* ── Logo ────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SemanRO" className="h-10 w-auto object-contain" />
          <span className="text-sm font-semibold text-gray-900">
            Seman<span className="text-red-600">RO</span>
          </span>
        </div>

        {/* ── Links (centru) ─────────────────────────── */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link}
              href="#"
              className={`text-sm font-medium transition-colors ${
                i === 0 ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        {/* ── Butoane dreapta ────────────────────────── */}
        <div className="flex items-center gap-3">

          {user ? (
            <>
              <span className="text-sm text-gray-600">Salut, {user.full_name}!</span>
              <button
                onClick={logout}
                className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Deconectare
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowRegister(true)}
                className="bg-red-600 text-white px-5 py-2 text-sm font-medium rounded-full hover:bg-red-700 transition-colors cursor-pointer"
              >
                Înregistrare
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Conectare
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Modale ───────────────────────────────────── */}
      <AnimatePresence>
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
