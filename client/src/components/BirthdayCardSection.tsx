import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { client } from "@/lib/sanityClient";
import { BirthdayCardData } from "@/lib/schema";

interface Props {
  isActive: boolean;
  progress: number;
  onContinue: () => void;
}

export default function BirthdayCardSection({ isActive, progress, onContinue }: Props) {
  const [data, setData] = useState<BirthdayCardData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    client
      .fetch<BirthdayCardData>('*[_type == "birthdayCard"][0]{message, images[]{url, alt}}')
      .then(setData);
  }, []);

  useEffect(() => {
    if (isActive) setTimeout(() => setIsOpen(true), 500);
    else setIsOpen(false);
  }, [isActive]);

  if (!data) return <div className="text-white">Loading...</div>;

  return (
    <section className="flex flex-col items-center justify-center h-full text-white">
      <h2 className="text-3xl sm:text-4xl font-['Dancing_Script'] mb-6">Happy Birthday, My Love!</h2>
      <motion.div
        className="relative w-72 h-96 sm:w-96 sm:h-[28rem]"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center rounded-lg shadow-lg"
          style={{ backgroundImage: "url('/card-front.jpg')" }}
          animate={{ rotateY: isOpen ? 180 : 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-pink-100 text-pink-800 p-6 rounded-lg flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, rotateY: isOpen ? 0 : -180 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <p className="text-lg sm:text-xl text-center">
            {data.message || "To the most gorgeous girl, may your day be filled with joy and love!"}
          </p>
          <motion.div
            className="mt-4 text-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🎂
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.button
        onClick={onContinue}
        className="mt-8 px-10 py-4 bg-pink-500 text-white rounded-full text-lg hover:bg-pink-600 focus:ring-2 focus:ring-pink-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        Next
      </motion.button>
    </section>
  );
}