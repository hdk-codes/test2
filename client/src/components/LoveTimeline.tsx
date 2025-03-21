import { motion } from 'framer-motion';
import { GalleryItem } from '@shared/schema';

interface LoveTimelineProps {
  items: GalleryItem[];
}

export default function LoveTimeline({ items }: LoveTimelineProps) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-500"></div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.2 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className={`flex items-center mb-8 ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-1/2 px-4">
              <div className="bg-black/50 p-4 rounded-lg border border-pink-500/50">
                <h3 className="text-xl font-bold text-pink-300">{item.title}</h3>
                {item.date && (
                  <p className="text-sm text-gray-300">{new Date(item.date).toLocaleDateString()}</p>
                )}
                {item.description && <p className="text-gray-200">{item.description}</p>}
                {item.mediaType === 'image' ? (
                  <img src={item.mediaUrl} alt={item.title} className="mt-2 rounded-lg w-full" />
                ) : (
                  <video src={item.mediaUrl} controls className="mt-2 rounded-lg w-full" />
                )}
              </div>
            </div>
            <div className="w-1/2"></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}