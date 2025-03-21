import { motion } from 'framer-motion';
import { FaHeart, FaSearchPlus } from 'react-icons/fa';
import { GalleryItem ,projectId ,dataset, urlFor , getFileUrl} from '@/lib/sanityClient';

interface FavoritesProps {
  favorites: string[];
  galleryItems: GalleryItem[];
  onToggleFavorite: (id: string) => void;
  onZoom: (item: GalleryItem) => void;
}

export default function Favorites({ favorites, galleryItems, onToggleFavorite, onZoom }: FavoritesProps) {
  const favoriteItems = galleryItems.filter((item) => favorites.includes(item._id));

   
  return (
    <motion.div
      className="bg-black/80 backdrop-blur-lg p-6 rounded-xl border border-pink-500/40 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-pink-300 mb-6 text-center">Our Favorite Moments 💖</h2>
      {favoriteItems.length === 0 ? (
        <p className="text-center text-pink-200">No favorites yet—star some memories!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoriteItems.map((item) => (
            <motion.div
              key={item._id}
              className="relative rounded-xl overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.05, rotateY: 10 }}
              style={{ transformStyle: 'preserve-3d', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }}
            >
              <div className="h-48 w-full">
                {item.mediaType === 'image' ? (
                  <img src={urlFor(item.media!.asset)} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <video src={getFileUrl(item.media!.asset._ref, projectId, dataset)} className="w-full h-full object-cover" muted autoPlay loop />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 flex flex-col justify-end">
                <h3 className="text-white font-bold">{item.title}</h3>
                <div className="flex gap-2 mt-2">
                  <FaHeart
                    className="text-pink-500 cursor-pointer"
                    onClick={() => onToggleFavorite(item._id)}
                  />
                  <FaSearchPlus className="text-white cursor-pointer" onClick={() => onZoom(item)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}