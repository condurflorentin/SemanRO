import { Suspense, lazy, useState } from 'react';
import { FileSearch, BarChart3, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy load Spline doar când avem un URL valid
const Spline = lazy(() => import('@splinetool/react-spline'));

// Pune aici URL-ul scenei tale din Spline Editor (când o ai gata)
const SPLINE_SCENE_URL = null; // ex: "https://prod.spline.design/xxxxx/scene.splinecode"

// Ilustrație placeholder stilizată (până adaugi scena 3D reală)
function PlaceholderIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-80 h-80">
        {/* Card principal */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 left-8 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-2 bg-gray-200 rounded w-4/5" />
            <div className="h-2 bg-red-200 rounded w-3/5" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-2 bg-red-200 rounded w-2/5" />
          </div>
        </motion.div>

        {/* Card grafic */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-24 right-0 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-20"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-gray-700">Raport</span>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 h-16">
            {[60, 85, 45, 90, 70, 55, 80].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.8, delay: 0.1 * i }}
                className={`flex-1 rounded-sm ${h > 70 ? 'bg-red-500' : 'bg-red-200'}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Badge verificare */}
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-8 left-12 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2 z-30"
        >
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">87% Originalitate</p>
            <p className="text-[10px] text-gray-400">Verificat cu succes</p>
          </div>
        </motion.div>

        {/* Lupă floating */}
        <motion.div
          animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-4 right-8 z-10"
        >
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <FileSearch className="w-7 h-7 text-white" />
          </div>
        </motion.div>

        {/* Background circle decorativ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-red-50 -z-10" />
      </div>
    </div>
  );
}

// Loading spinner
function SplineLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SplineScene() {
  const [hasError, setHasError] = useState(false);

  // Dacă nu avem URL de Spline sau a dat eroare, arată placeholder-ul
  if (!SPLINE_SCENE_URL || hasError) {
    return <PlaceholderIllustration />;
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      <Suspense fallback={<SplineLoader />}>
        <ErrorCatcher onError={() => setHasError(true)}>
          <Spline scene={SPLINE_SCENE_URL} />
        </ErrorCatcher>
      </Suspense>
    </div>
  );
}

// Error Boundary simplu
import { Component } from 'react';
class ErrorCatcher extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() {
    return this.state.hasError ? <PlaceholderIllustration /> : this.props.children;
  }
}
