import { motion } from 'framer-motion';
import SplineScene from './SplineScene';

export default function HeroSection() {
  return (
    <main className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-16 gap-8">
      {/* ── Partea Stângă: Text ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="md:w-1/2 space-y-6"
      >
        <h2 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
          Trei pași simpli pentru a preveni plagiatul.
        </h2>
        <p className="text-xl lg:text-2xl text-gray-400 italic">
          Încărcare, Analiză, Raport
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-red-600 text-white text-lg px-10 py-4 rounded-full shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
        >
          Verifică acum
        </motion.button>
      </motion.div>

      {/* ── Partea Dreaptă: Scenă 3D ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        className="md:w-1/2 h-[400px] lg:h-[500px] relative"
      >
        <SplineScene />
      </motion.div>
    </main>
  );
}
