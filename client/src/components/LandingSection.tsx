import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { client } from "@/lib/sanityClient";
import { LandingData } from "@/lib/schema";

interface Props {
  isActive: boolean;
  progress: number;
  onContinue: () => void;
}

export default function LandingSection({ isActive, progress, onContinue }: Props) {
  const [data, setData] = useState<LandingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    client
      .fetch<LandingData>('*[_type == "landingSection"][0]{title, message}')
      .then(setData)
      .catch(() => setError("Failed to load content"));
  }, []);

  useEffect(() => {
    if (!data || !isActive) return;
    const fullText = data.title || "Hi love ❣️";
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 150);
    return () => clearInterval(timer);
  }, [data, isActive]);

  if (error) return <div className="text-white">{error}</div>;
  if (!data) return <div className="text-white">Loading...</div>;

  return (
    <section className="flex flex-col items-center justify-center h-full text-white">
      <motion.h1
        className="text-4xl sm:text-6xl md:text-8xl font-['Dancing_Script'] mb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {displayText}
      </motion.h1>
      <motion.p
        className="text-lg sm:text-xl mb-8 max-w-md text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        {data.message}
      </motion.p>
      <motion.button
        onClick={onContinue}
        className="px-10 py-4 bg-pink-500 text-white rounded-full text-lg hover:bg-pink-600 focus:ring-2 focus:ring-pink-300"
        whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(255, 107, 139, 0.8)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        Begin Our Journey
      </motion.button>
      <motion.div
        className="absolute bottom-10 text-lg"
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        Scroll Down ↓
      </motion.div>
    </section>
  );
}