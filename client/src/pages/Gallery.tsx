import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryItem } from '@shared/schema';
import { useDeviceOrientation } from '@/hooks/use-device-orientation';

// Enhanced 3D Collage Gallery that responds to device orientation
export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { beta, gamma } = useDeviceOrientation();
  
  // Get all gallery items
  const { data: galleryItems = [], isLoading, refetch } = useQuery<GalleryItem[]>({
    queryKey: ['/api/gallery'],
    refetchOnWindowFocus: false,
  });
  
  // Search functionality
  const filteredItems = galleryItems.filter(item => {
    // If we have a search query, filter by title and description
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        (!item.description || !item.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // If we have selected tags, filter by tags
    if (searchTags.length > 0) {
      // Check if item has tags and at least one tag matches our search tags
      const itemTags = item.tags || [];
      if (itemTags.length === 0 || !itemTags.some(tag => searchTags.includes(tag))) {
        return false;
      }
    }
    
    return true;
  });
  
  // Handle tag selection
  const handleTagClick = (tag: string) => {
    if (searchTags.includes(tag)) {
      setSearchTags(searchTags.filter(t => t !== tag));
    } else {
      setSearchTags([...searchTags, tag]);
    }
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image or video to upload",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('tags', uploadForm.tags);
      
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      toast({
        title: "Upload successful",
        description: "Your media has been added to the gallery"
      });
      
      // Reset form and refetch gallery items
      setUploadForm({ title: '', description: '', tags: '' });
      setSelectedFile(null);
      refetch();
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your media",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  // Extract all unique tags from gallery items
  const allTags = Array.from(new Set(
    galleryItems.flatMap(item => item.tags || [])
  ));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white overflow-hidden">
      {/* Parallax Stars Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Our Memories Gallery
        </motion.h1>
        
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/30 border-purple-500 text-white placeholder:text-gray-400"
            />
            
            <div className="relative">
              <Input
                type="text"
                placeholder="Add tag..."
                value={activeTag}
                onChange={(e) => setActiveTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeTag.trim()) {
                    setSearchTags([...searchTags, activeTag.trim()]);
                    setActiveTag('');
                  }
                }}
                className="bg-black/30 border-purple-500 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={searchTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagClick(tag)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  searchTags.includes(tag) 
                    ? "bg-pink-600 hover:bg-pink-700 text-white" 
                    : "bg-black/20 text-gray-200 hover:bg-purple-800/50"
                )}
              >
                #{tag}
              </Button>
            ))}
          </div>
          
          {/* Upload Form */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-black/40 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30 mb-12"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center">Add New Memory</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  name="title"
                  value={uploadForm.title}
                  onChange={handleInputChange}
                  required
                  className="bg-black/30 border-purple-500/50 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  name="description"
                  value={uploadForm.description}
                  onChange={handleInputChange}
                  className="bg-black/30 border-purple-500/50 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input
                  name="tags"
                  value={uploadForm.tags}
                  onChange={handleInputChange}
                  placeholder="love, date, anniversary"
                  className="bg-black/30 border-purple-500/50 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Upload Image/Video</label>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="bg-black/30 border-purple-500/50 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-2 file:mr-3 hover:file:bg-purple-700"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={uploading || !selectedFile}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {uploading ? "Uploading..." : "Add to Gallery"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
        
        {/* Gallery Grid with 3D Parallax Effect */}
        <div className="relative z-10">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-300">No memories found</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
            >
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isMobile 
                        ? `rotateX(${(beta || 0) / 30}deg) rotateY(${(gamma || 0) / 30}deg)`
                        : 'none',
                      transformOrigin: 'center center',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                      perspective: '1000px'
                    }}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div 
                      className="h-64 sm:h-80 w-full relative overflow-hidden" 
                      style={{ 
                        transformStyle: 'preserve-3d',
                        perspective: '1000px'
                      }}
                    >
                      {item.mediaType === 'image' ? (
                        <img 
                          src={item.mediaUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: `translateZ(20px)`,
                          }}
                        />
                      ) : (
                        <video 
                          src={item.mediaUrl} 
                          controls={false}
                          autoPlay
                          muted
                          loop
                          className="w-full h-full object-cover"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: `translateZ(20px)`,
                          }}
                        />
                      )}
                      
                      {/* Glow effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Content */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: `translateZ(30px)`,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                        }}
                      >
                        <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-200 mb-2">{item.description}</p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="text-xs bg-pink-600/60 px-2 py-0.5 rounded-full text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTagClick(tag);
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}