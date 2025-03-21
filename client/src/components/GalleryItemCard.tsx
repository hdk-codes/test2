// src/components/GalleryItemCard.tsx
import { motion } from 'framer-motion';
import { FaHeart, FaTrash, FaEdit, FaDownload, FaShare } from 'react-icons/fa';
import { urlFor, getFileUrl, GalleryItem, projectId, dataset } from '@/lib/sanityClient';

interface GalleryItemCardProps {
  item: GalleryItem;
  theme: 'dark' | 'light';
  cardColor: string;
  isMobile: boolean;
  beta: number | null;
  gamma: number | null;
  favorites: string[];
  selectionMode: boolean;
  selectedItems: string[];
  toggleFavorite: (id: string) => void;
  setZoomItem: (item: GalleryItem | null) => void;
  setEditItem: (item: GalleryItem | null) => void;
  handleDelete: (id: string) => void;
  handleDownload: (item: GalleryItem) => void;
  handleShare: (item: GalleryItem) => Promise<void>;
  toggleSelection: (id: string) => void;
  handleTouchStart: (item: GalleryItem) => () => void;
  handleTouchEnd: () => void;
  previewItem: GalleryItem | null;
  loveQuotes: string[];
  index: number;
}

export default function GalleryItemCard({
  item,
  theme,
  cardColor,
  isMobile,
  beta,
  gamma,
  favorites,
  selectionMode,
  selectedItems,
  toggleFavorite,
  setZoomItem,
  setEditItem,
  handleDelete,
  handleDownload,
  handleShare,
  toggleSelection,
  handleTouchStart,
  handleTouchEnd,
  previewItem,
  loveQuotes,
  index,
}: GalleryItemCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl group cursor-pointer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      style={{
        transform: isMobile ? `rotateX(${(beta || 0) / 15}deg) rotateY(${(gamma || 0) / 15}deg)` : 'none',
        boxShadow: `0 15px 30px rgba(0,0,0,${theme === 'dark' ? '0.6' : '0.2'})`,
        border: `1px solid ${cardColor}50`,
      }}
      whileHover={{ scale: 1.05, boxShadow: `0 20px 40px rgba(0,0,0,${theme === 'dark' ? '0.8' : '0.3'})` }}
      onTouchStart={handleTouchStart(item)}
      onTouchEnd={handleTouchEnd}
      onClick={() => setZoomItem(item)} // Trigger ZoomModal on click
    >
      {item.mediaType === 'image' && item.media?.asset ? (
        <img
          src={urlFor(item.media.asset)}
          alt={item.media.alt || item.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : item.mediaType === 'video' && item.media?.asset ? (
        <video
          src={getFileUrl(item.media.asset._ref, projectId, dataset)}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => e.currentTarget.pause()}
          onTouchStart={(e) => e.currentTarget.play()}
          onTouchEnd={(e) => e.currentTarget.pause()}
          muted
          loop
          loading="lazy"
        />
      ) : null}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      >
        <div>
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          <p className="text-xs text-purple-200">{item.description || loveQuotes[Math.floor(Math.random() * loveQuotes.length)]}</p>
        </div>
        <div className="flex gap-2 text-white">
          <motion.div whileHover={{ scale: 1.2 }}><FaHeart className={`${favorites.includes(item._id) ? 'text-pink-500' : 'text-white'} cursor-pointer`} onClick={(e) => { e.stopPropagation(); toggleFavorite(item._id); }} /></motion.div>
          <motion.div whileHover={{ scale: 1.2 }}><FaEdit className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditItem(item); }} /></motion.div>
          <motion.div whileHover={{ scale: 1.2 }}><FaTrash className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} /></motion.div>
          <motion.div whileHover={{ scale: 1.2 }}><FaDownload className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDownload(item); }} /></motion.div>
          <motion.div whileHover={{ scale: 1.2 }}><FaShare className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleShare(item); }} /></motion.div>
        </div>
      </motion.div>
      {selectionMode && (
        <input
          type="checkbox"
          checked={selectedItems.includes(item._id)}
          onChange={() => toggleSelection(item._id)}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2"
        />
      )}
      {previewItem?._id === item._id && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          {item.mediaType === 'image' ? (
            <img src={urlFor(item.media!.asset)} alt={item.title} className="max-h-64" />
          ) : (
            <video src={getFileUrl(item.media!.asset._ref, projectId, dataset)} autoPlay muted className="max-h-64" />
          )}
        </div>
      )}
    </motion.div>
  );
}