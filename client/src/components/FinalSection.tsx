import { motion } from 'framer-motion';

export interface FinalSectionProps {
  isActive: boolean;
  progress: number;
  onHeartBurst: () => void;
}

export default function FinalSection({ isActive, progress, onHeartBurst }: FinalSectionProps) {
  return (
    <section className="flex flex-col items-center justify-center h-full text-white">
      <motion.h2
        className="text-3xl sm:text-4xl font-['Dancing_Script'] mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Forever Together
      </motion.h2>
      <button
        onClick={onHeartBurst}
        className="px-10 py-4 bg-pink-500 text-white rounded-full text-lg hover:bg-pink-600 focus:ring-2 focus:ring-pink-300"
        aria-label="Celebrate our love"
      >
        Celebrate Our Love
      </button>
    </section>
  );
}