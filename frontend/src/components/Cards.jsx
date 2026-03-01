import { BookOpen, Building2, Smile } from 'lucide-react';
import { motion } from 'framer-motion';

const cards = [
  {
    icon: BookOpen,
    title: 'Educație',
    description: 'Soluții de prevenire a plagiatului pentru instituții de învățământ.',
  },
  {
    icon: Building2,
    title: 'Companii',
    description: 'Ofertă pentru companii, edituri și alte instituții.',
  },
  {
    icon: Smile,
    title: 'Individuali',
    description: 'Serviciul de verificare a similitudinilor pentru persoane fizice.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Cards() {
  return (
    <motion.section
      className="w-full bg-gray-50 py-20 px-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                <Icon className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
              <p className="text-gray-500 leading-relaxed mb-5">{card.description}</p>
              <button className="text-sm font-semibold text-gray-900 tracking-wide underline underline-offset-4 hover:text-red-600 transition-colors cursor-pointer">
                CITEȘTE MAI MULT
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
