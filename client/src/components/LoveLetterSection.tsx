import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { client } from "@/lib/sanityClient";
import { LoveLetterData } from "@/lib/schema";

interface Props {
  isActive: boolean;
  progress: number;
  onContinue: () => void;
}

export default function LoveLetterSection({ isActive, progress, onContinue }: Props) {
  const [data, setData] = useState<LoveLetterData | null>(null);
  const [note, setNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    client
      .fetch<LoveLetterData>('*[_type == "loveLetter"][0]{title, placeholder}')
      .then(setData);
    const savedNote = localStorage.getItem("loveNote");
    if (savedNote) setNote(savedNote);
  }, []);

  useEffect(() => {
    if (isActive) setTimeout(() => setIsOpen(true), 500);
    else setIsOpen(false);
  }, [isActive]);

  useEffect(() => {
    localStorage.setItem("loveNote", note);
  }, [note]);

  if (!data) return <div className="text-white">Loading...</div>;

  return (
    <section className="flex flex-col items-center justify-center h-full text-white">
      <h2 className="text-3xl sm:text-4xl font-['Dancing_Script'] mb-6">{data.title}</h2>
      <motion.div
        className="relative w-72 h-96 sm:w-96 sm:h-[28rem]"
        style={{ perspective: "1000px" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center rounded-lg shadow-lg"
          style={{ backgroundImage: "url('/letter-front.jpg')" }}
          animate={{ rotateY: isOpen ? 180 : 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <motion.div
          className="absolute inset-0 bg-white text-pink-800 p-6 rounded-lg flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, rotateY: isOpen ? 0 : -180 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={data.placeholder}
            className="w-full h-32 p-4 bg-transparent border border-pink-300 text-pink-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <motion.p
            className="mt-4 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: note ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {note || "Your note will appear here..."}
          </motion.p>
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