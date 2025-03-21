// src/components/ZoomModal.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { FaHeart, FaShare, FaDownload, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { urlFor, getFileUrl, GalleryItem, projectId, dataset } from '@/lib/sanityClient';
import confetti from 'canvas-confetti';

interface ZoomModalProps {
  zoomItem: GalleryItem | null;
  setZoomItem: (item: GalleryItem | null) => void;
  theme: 'dark' | 'light';
  toggleFavorite: (id: string) => void;
  favorites: string[];
  handleShare: (item: GalleryItem) => Promise<void>;
  handleDownload: (item: GalleryItem) => void;
  galleryItems: GalleryItem[]; // New: For swipe navigation
}

export default function ZoomModal({
  zoomItem,
  setZoomItem,
  theme,
  toggleFavorite,
  favorites = [],
  handleShare,
  handleDownload,
  galleryItems,
}: ZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [doubleTapTimeout, setDoubleTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  // Sync currentIndex with zoomItem
  useEffect(() => {
    if (zoomItem) {
      const index = galleryItems.findIndex((item) => item._id === zoomItem._id);
      setCurrentIndex(index);
    }
  }, [zoomItem, galleryItems]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomItem(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setZoomItem]);

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (doubleTapTimeout) {
      clearTimeout(doubleTapTimeout);
      setDoubleTapTimeout(null);
      if (zoomItem) {
        toggleFavorite(zoomItem._id);
        if (!favorites.includes(zoomItem._id)) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); // Love burst
        }
      }
    } else {
      const timeout = setTimeout(() => setDoubleTapTimeout(null), 300);
      setDoubleTapTimeout(timeout);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < galleryItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoomItem(galleryItems[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoomItem(galleryItems[currentIndex - 1]);
    }
  };

  if (!zoomItem) return null;

  return (
    <AnimatePresence>
      {zoomItem && (
        <motion.div
          className="fixed inset-0 bg-black/95 flex z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onClick={() => setZoomItem(null)}
          role="dialog"
          aria-label="Expanded media view"
        >
          <motion.div
            className="flex w-full h-full items-center justify-center relative"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Image/Video with Zoom */}
            <div
              ref={mediaRef}
              className="w-2/3 h-full flex items-center justify-center relative"
              onDoubleClick={handleDoubleTap}
              onTouchEnd={handleDoubleTap}
            >
              <TransformWrapper>
                <TransformComponent>
                  {zoomItem.mediaType === 'image' ? (
                    <motion.img
                      src={urlFor(zoomItem.media!.asset)}
                      alt={zoomItem.title}
                      className="max-w-full max-h-[90vh] object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      loading="eager" // Preload for smoother modal
                    />
                  ) : (
                    <motion.video
                      src={getFileUrl(zoomItem.media!.asset._ref, projectId, dataset)}
                      controls
                      autoPlay
                      className="max-w-full max-h-[90vh] object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </TransformComponent>
              </TransformWrapper>

              {/* Swipe Navigation */}
              {currentIndex > 0 && (
                <motion.button
                  className="absolute left-4 bg-purple-600/50 hover:bg-purple-700/70 rounded-full p-3"
                  onClick={() => handleSwipe('right')}
                  whileHover={{ scale: 1.1 }}
                  aria-label="Previous image"
                >
                  <FaChevronLeft className="text-white" />
                </motion.button>
              )}
              {currentIndex < galleryItems.length - 1 && (
                <motion.button
                  className="absolute right-4 bg-purple-600/50 hover:bg-purple-700/70 rounded-full p-3"
                  onClick={() => handleSwipe('left')}
                  whileHover={{ scale: 1.1 }}
                  aria-label="Next image"
                >
                  <FaChevronRight className="text-white" />
                </motion.button>
              )}
            </div>

            {/* Right: Metadata and Actions */}
            <motion.div
              className={`w-1/3 h-full p-6 ${theme === 'dark' ? 'bg-black/90 text-white' : 'bg-white/90 text-black'} flex flex-col justify-between`}
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div>
                <h2 className="text-2xl font-bold">{zoomItem.title}</h2>
                <p className="mt-2">{zoomItem.description || 'A moment of cosmic love.'}</p>
                {zoomItem.tags && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {zoomItem.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        className="text-sm bg-purple-500/20 px-2 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {new Date(zoomItem.date || '1970-01-01').toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  onClick={() => toggleFavorite(zoomItem._id)}
                  aria-label={favorites.includes(zoomItem._id) ? 'Unlike' : 'Like'}
                >
                  <FaHeart
                    className={`${favorites.includes(zoomItem._id) ? 'text-pink-500' : 'text-gray-400'} text-2xl`}
                  />
                </motion.button>
                <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleShare(zoomItem)} aria-label="Share">
                  <FaShare className="text-2xl text-gray-400" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleDownload(zoomItem)} aria-label="Download">
                  <FaDownload className="text-2xl text-gray-400" />
                </motion.button>
              </div>
            </motion.div>

            {/* Enhanced Close Button */}
            <motion.button
              className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 rounded-full p-3 shadow-lg"
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoomItem(null)}
              aria-label="Close modal"
            >
              <FaTimes className="text-white text-xl" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}