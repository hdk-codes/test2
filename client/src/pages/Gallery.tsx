// src/Gallery.tsx
import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTrash, FaEdit, FaSearchPlus, FaDownload, FaShare, FaMusic, FaMoon, FaSun, FaExpand, FaPlus, FaFilter } from 'react-icons/fa';
import { client, urlFor, getFileUrl, GalleryItem, projectId, dataset } from '@/lib/sanityClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDeviceOrientation } from '@/hooks/use-device-orientation';
import confetti from 'canvas-confetti';
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';
import GalleryItemCard from '@/components/GalleryItemCard';
import UploadForm from '@/components/UploadForm';
import ZoomModal from '@/components/ZoomModal';
import './styles.css';

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [zoomItem, setZoomItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'favorites'>('date');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10); // New: Control items per page
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cardColor, setCardColor] = useState('#ff69b4');
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { beta, gamma } = useDeviceOrientation();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite Query for fetching gallery items
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['galleryItems', sortBy, itemsPerPage],
    queryFn: async ({ pageParam = 0 }) => {
      const query = `*[_type == "galleryItem"] | order(${sortBy} desc) [${pageParam * itemsPerPage}...${(pageParam + 1) * itemsPerPage}]`;
      return await client.fetch(query);
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.length === itemsPerPage ? allPages.length : undefined),
    initialPageParam: 0,
  });

  // Flatten pages into a single array
  const galleryItems = data?.pages.flat() || [];

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const createMutation = useMutation({
    mutationFn: async (items: (Omit<GalleryItem, '_id'> & { _type: string })[]) => {
      const results = await Promise.all(items.map((item) => client.create(item)));
      confetti({ particleCount: 150, spread: 90 });
      return results;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['galleryItems'] }),
    onError: (error) => toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: GalleryItem) => client.patch(item._id).set(item).commit(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryItems'] });
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => client.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['galleryItems'] }),
  });

  const filteredItems = galleryItems.filter((item) =>
    (!searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (searchTags.length === 0 || (item.tags && item.tags.some((tag) => searchTags.includes(tag))))
  ).sort((a, b) => {
    if (sortBy === 'favorites') return favorites.includes(b._id) ? 1 : -1;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return new Date(b.date || '1970-01-01').getTime() - new Date(a.date || '1970-01-01').getTime();
  });

  const handleTagClick = (tag: string) => setSearchTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setUploadFiles(Array.from(e.target.files || []));
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate(editItem);
  };
  const handleDelete = (id: string) => {
    if (confirm('Delete this memory?')) deleteMutation.mutate(id);
  };
  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleMusic = () => {
    if (audioRef.current) {
      isMusicPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsMusicPlaying(!isMusicPlaying);
    }
  };
  const handleDownload = (item: GalleryItem) => {
    const url = item.mediaType === 'image' ? urlFor(item.media!.asset) : getFileUrl(item.media!.asset._ref, projectId, dataset);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title}.${item.mediaType === 'image' ? 'jpg' : 'mp4'}`;
    link.click();
  };
  const handleShare = async (item: GalleryItem) => {
    const url = `${window.location.origin}/gallery/${item._id}`;
    if (navigator.share) await navigator.share({ title: item.title, text: item.description, url });
    else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied', description: 'Share this moment!' });
    }
  };
  const toggleSelection = (id: string) => setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  const handleTouchStart = (item: GalleryItem) => {
    const timeout = setTimeout(() => setPreviewItem(item), 500);
    return () => clearTimeout(timeout);
  };

  const allTags = Array.from(new Set(galleryItems.flatMap((item) => item.tags || [])));
  const loveQuotes = [
    '"Our love is a galaxy of its own."',
    '"Every moment with you is a star in my sky."',
    '"You are my universe, my eternal love."',
  ];

  return (
    <ParallaxProvider>   
     <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-white'} overflow-x-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {theme === 'dark' && (
        <Parallax speed={-10}>
          <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-black to-purple-900">
            {[...Array(300)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                style={{
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
                animate={{ y: [0, -30, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: Math.random() * 6 + 3, repeat: Infinity, delay: Math.random() * 4 }}
              />
            ))}
          </div>
        </Parallax>
      )}

      <audio ref={audioRef} src="/love.mp3" loop />

      <div className="relative z-10 px-4 py-8 md:px-8 md:py-12">
        <motion.h1
          className={`text-4xl md:text-6xl font-extrabold text-center mb-8 bg-clip-text text-transparent ${theme === 'dark' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500' : 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600'}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Cosmic Love Gallery 🌌
        </motion.h1>

        <motion.div className={`mb-8 ${theme === 'dark' ? 'bg-black/80 glass' : 'bg-white/80'} backdrop-blur-xl p-4 rounded-2xl border ${theme === 'dark' ? 'border-purple-500/50' : 'border-purple-300/50'}`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search our love..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 ${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`}
              />
              <Button onClick={() => setFilterOpen(!filterOpen)} className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <FaFilter />
              </Button>
            </div>

            <AnimatePresence>
              {filterOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Add a tag..."
                    value={activeTag}
                    onChange={(e) => setActiveTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && activeTag.trim()) {
                        setSearchTags([...searchTags, activeTag.trim()]);
                        setActiveTag('');
                      }
                    }}
                    className={`${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <motion.button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`rounded-full ${searchTags.includes(tag) ? 'bg-purple-600' : theme === 'dark' ? 'bg-black/40 text-purple-300' : 'bg-white/40 text-purple-600'}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        #{tag}
                      </motion.button>
                    ))}
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={`${theme === 'dark' ? 'bg-black/50 text-white border-purple-500' : 'bg-white/50 text-black border-purple-300'} rounded-full p-2 w-full`}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="favorites">Sort by Favorites</option>
                  </select>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className={`${theme === 'dark' ? 'bg-black/50 text-white border-purple-500' : 'bg-white/50 text-black border-purple-300'} rounded-full p-2 w-full`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 justify-center flex-wrap">
              <Button onClick={toggleTheme} className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 neumorphic">
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
              </Button>
              <Button onClick={toggleMusic} className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 neumorphic">
                <FaMusic />
              </Button>
              <Button onClick={() => setIsFullscreen(!isFullscreen)} className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 neumorphic">
                <FaExpand />
              </Button>
              <Button onClick={() => setSelectionMode(!selectionMode)} className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 neumorphic">
                {selectionMode ? 'Exit Selection' : 'Select Items'}
              </Button>
              {selectionMode && (
                <Button onClick={() => selectedItems.forEach(handleDelete)} className="rounded-full bg-red-500">
                  Delete Selected
                </Button>
              )}
              <Input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="w-10 h-10 rounded-full p-0 border-none" />
            </div>

            <UploadForm uploadFiles={uploadFiles} setUploadFiles={setUploadFiles} createMutation={createMutation} onFileChange={handleFileChange} theme={theme} />
          </div>
        </motion.div>

        {isLoading && galleryItems.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <motion.div className="w-12 h-12 border-4 border-t-purple-500 border-b-pink-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-purple-300 text-lg">No moments yet—let’s capture our love!</div>
        ) : (
          <>
            <motion.div className={`grid gap-4 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} auto-rows-min`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <GalleryItemCard
                    key={item._id}
                    item={item}
                    theme={theme}
                    cardColor={cardColor}
                    isMobile={isMobile}
                    beta={beta}
                    gamma={gamma}
                    favorites={favorites}
                    selectionMode={selectionMode}
                    selectedItems={selectedItems}
                    toggleFavorite={toggleFavorite}
                    setZoomItem={setZoomItem}
                    setEditItem={setEditItem}
                    handleDelete={handleDelete}
                    handleDownload={handleDownload}
                    handleShare={handleShare}
                    toggleSelection={toggleSelection}
                    handleTouchStart={handleTouchStart}
                    handleTouchEnd={() => setPreviewItem(null)}
                    previewItem={previewItem}
                    loveQuotes={loveQuotes}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
            <div ref={sentinelRef} className="h-10" />
            {hasNextPage && (
              <div className="text-center mt-4">
                <Button onClick={() => fetchNextPage()} className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  Load More
                </Button>
              </div>
            )}
          </>
        )}

        {editItem && (
          <motion.div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditItem(null)}>
            <motion.div className={`${theme === 'dark' ? 'bg-black/90 glass' : 'bg-white/90'} backdrop-blur-xl p-6 rounded-2xl max-w-md w-full border ${theme === 'dark' ? 'border-purple-500/50' : 'border-purple-300/50'}`} initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} onClick={(e) => e.stopPropagation()}>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'} mb-4`}>Edit Our Moment</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} placeholder="Title" className={`${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`} />
                <Input value={editItem.description || ''} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} placeholder="Description" className={`${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`} />
                <Input value={editItem.tags?.join(', ') || ''} onChange={(e) => setEditItem({ ...editItem, tags: e.target.value.split(',').map((t) => t.trim()) })} placeholder="Tags (comma-separated)" className={`${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`} />
                <Button type="submit" disabled={updateMutation.isPending} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">{updateMutation.isPending ? 'Saving...' : 'Save Memory'}</Button>
              </form>
            </motion.div>
          </motion.div>
        )}

<ZoomModal
          zoomItem={zoomItem}
          setZoomItem={setZoomItem}
          theme={theme}
          toggleFavorite={toggleFavorite}
          favorites={favorites || []}
          handleShare={handleShare}
          handleDownload={handleDownload}
          galleryItems={filteredItems} // New: Pass all items for swipe navigation
        />
        <motion.div className="fixed bottom-8 right-8 z-20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
          <Button onClick={() => document.querySelector('input[type="file"]')?.click()} className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg w-14 h-14 flex items-center justify-center neumorphic">
            <FaPlus size={24} />
          </Button>
        </motion.div>
      </div>
    </div>
    </ParallaxProvider>

  );
}