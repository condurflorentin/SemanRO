import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Cards from '../components/Cards';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center overflow-hidden">
      {/* Background subtle — linii verticale ca în imagine */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-full opacity-[0.04]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-px bg-gray-900"
              style={{ left: `${12 + i * 12}%`, transform: `rotate(${-5 + i * 0.5}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <Navbar />
      <HeroSection />
      <Cards />

      {/* Footer simplu */}
      <footer className="w-full py-8 text-center text-sm text-gray-400">
        © 2026 SemanRO — Proiect de licență
      </footer>
    </div>
  );
}
