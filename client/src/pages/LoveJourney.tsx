import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/use-media-query';
import InteractiveHeart from '@/components/InteractiveHeart';
import { useParallax } from '@/hooks/use-parallax';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanityClient';
import { LoveLetterData } from '@/lib/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { FiMusic, FiPause, FiPlay } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import ParallaxBackground from '@/components/ParallaxBackground';
import LoveTimeline from '@/components/LoveTimeline';
import FinalSection from '@/components/FinalSection';
import LandingSection from '@/components/LandingSection';
import BirthdayCardSection from '@/components/BirthdayCardSection';
import LoveLetterSection from '@/components/LoveLetterSection';

// Add TimelineEvent type
interface TimelineEvent {
  title: string;
  description: string;
  date: string;
  image?: {
    asset: {
      url: string;
    };
  };
}

// Music Player Component
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-full p-4 flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={togglePlay}
          className="text-white hover:text-pink-300 transition-colors"
        >
          {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
        </button>
        <audio
          ref={audioRef}
          src="/path-to-your-romantic-song.mp3"
          loop
        />
      </motion.div>
    </div>
  );
};

// Timeline Component
const Timeline = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <div className="relative py-20">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-500" />
      {events.map((event, index) => (
        <motion.div
          key={index}
          className={`flex items-center gap-8 mb-12 ${
            index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
          }`}
          initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <ImmersiveCard depth={30}>
            <div className="max-w-md">
              <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
              <p className="text-pink-200">{event.description}</p>
            </div>
          </ImmersiveCard>
          <div className="w-4 h-4 bg-pink-500 rounded-full relative z-10">
            <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Floating particles component for background
const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-purple-500/10" />
      <AnimatePresence>
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              opacity: 0,
              y: Math.random() * window.innerHeight,
              x: Math.random() * window.innerWidth,
            }}
            animate={{
              opacity: [0, 1, 0],
              y: [null, Math.random() * -500],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              filter: "blur(1px)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Enhanced FloatingParticles with Hearts
const FloatingHearts = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <AnimatePresence>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              y: Math.random() * window.innerHeight,
              x: Math.random() * window.innerWidth,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [null, Math.random() * -500],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute text-pink-500"
          >
            <IoHeart size={Math.random() * 20 + 10} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// 3D Card component with hover effect
const ImmersiveCard = ({ children, depth = 20 }: { children: React.ReactNode; depth?: number }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  return (
    <motion.div
      className="relative w-full rounded-xl overflow-hidden backdrop-blur-sm bg-white/10"
      style={{ transformStyle: "preserve-3d" }}
      animate={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
    >
      <motion.div
        style={{ transform: `translateZ(${depth}px)` }}
        className="relative z-10 p-6"
      >
        {children}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30" />
    </motion.div>
  );
};

// Enhanced HeroSection
const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/20 via-purple-500/20 to-transparent animate-pulse" />
      <motion.div
        className="text-center z-10"
        style={{ y }}
      >
        <motion.h1 
          className="text-4xl md:text-7xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Love Story
        </motion.h1>
        <InteractiveHeart id="hero-heart" size="large" pulseEffect={true} />
      </motion.div>
    </motion.div>
  );
};

// Memory gallery with masonry layout
interface MemoryGalleryProps {
  memories: any[];
  onAdd: (memory: any) => Promise<void>;
  onUpdate: (id: string, updates: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const MemoryGallery = ({ memories, onAdd, onUpdate, onDelete }: MemoryGalleryProps) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Add new memory card */}
      <motion.div
        className="cursor-pointer"
        whileHover={{ scale: 1.05 }}
        onClick={() => onAdd({
          title: 'New Memory',
          description: 'Click to edit',
          date: new Date().toISOString()
        })}
      >
        <ImmersiveCard>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-pink-300 rounded-lg">
            <IoHeart className="w-12 h-12 text-pink-300" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 text-center">Add New Memory</h3>
        </ImmersiveCard>
      </motion.div>

      {/* Existing memories */}
      {memories.map((memory, index) => (
        <motion.div
          key={memory._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ImmersiveCard>
            {isEditing === memory._id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={memory.title}
                  onChange={(e) => onUpdate(memory._id, { ...memory, title: e.target.value })}
                  className="w-full bg-white/10 rounded px-3 py-2 text-white"
                />
                <textarea
                  value={memory.description}
                  onChange={(e) => onUpdate(memory._id, { ...memory, description: e.target.value })}
                  className="w-full bg-white/10 rounded px-3 py-2 text-white"
                />
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(null)}>Save</Button>
                  <Button variant="destructive" onClick={() => onDelete(memory._id)}>Delete</Button>
                </div>
              </div>
            ) : (
              <>
                <img 
                  src={memory.image} 
                  alt={memory.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-white mb-2">{memory.title}</h3>
                <p className="text-pink-200">{memory.description}</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsEditing(memory._id)}
                >
                  Edit
                </Button>
              </>
            )}
          </ImmersiveCard>
        </motion.div>
      ))}
    </div>
  );
};

// Love quotes section with 3D perspective
const LoveQuotes = ({ quotes }: { quotes: string[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useParallax(containerRef, 0.5);

  return (
    <div 
      ref={containerRef}
      className="py-20 relative overflow-hidden"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        {quotes.map((quote, index) => (
          <motion.div
            key={index}
            className="mb-12"
            initial={{ opacity: 0, rotateX: 45 }}
            whileInView={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <ImmersiveCard depth={40}>
              <blockquote className="text-2xl text-white font-light italic">
                "{quote}"
              </blockquote>
            </ImmersiveCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function LoveJourney() {
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 25,
        y: (e.clientY - window.innerHeight / 2) / 25,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle section transitions
  const handleSectionChange = (index: number) => {
    setActiveSection(index);
    setProgress((index / 4) * 100);
  };

  const sections = [
    {
      id: 'landing',
      Component: LandingSection,
      props: {
        isActive: activeSection === 0,
        progress,
        onContinue: () => handleSectionChange(1),
      },
    },
    {
      id: 'birthdayCard',
      Component: BirthdayCardSection,
      props: {
        isActive: activeSection === 1,
        progress,
        onContinue: () => handleSectionChange(2),
      },
    },
    {
      id: 'loveLetter',
      Component: LoveLetterSection,
      props: {
        isActive: activeSection === 2,
        progress,
        onContinue: () => handleSectionChange(3),
        letterId: 'your-letter-id',
      },
    },
    {
      id: 'final',
      Component: FinalSection,
      props: {
        isActive: activeSection === 3,
        progress,
        onHeartBurst: () => {
          // Add heart burst animation
        },
      },
    },
  ];

  // Fetch data from Sanity
  const { data: loveData, isLoading, refetch } = useQuery<LoveLetterData>({
    queryKey: ['loveJourney'],
    queryFn: async () => {
      return await client.fetch(`
        *[_type == "loveJourney"][0] {
          _id,
          memories[]{
            _id,
            title,
            description,
            "image": image.asset->url,
            date
          },
          quotes,
          specialMoments[]{
            _id,
            title,
            description,
            "image": image.asset->url
          },
          timeline[]{
            _id,
            title,
            description,
            date,
            "image": image.asset->url
          }
        }
      `);
    }
  });

  // CRUD Operations
  const addMemory = async (memory: any) => {
    try {
      await client.patch(loveData?._id || '')
        .setIfMissing({ memories: [] })
        .append('memories', [memory])
        .commit();
      await refetch();
    } catch (error) {
      console.error('Error adding memory:', error);
    }
  };

  const updateMemory = async (id: string, updates: any) => {
    try {
      await client
        .patch(loveData?._id || '')
        .set({
          'memories[_id == $id]': {
            ...updates,
            _id: id
          }
        })
        .params({ id })
        .commit();
      await refetch();
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await client
        .patch(loveData?._id || '')
        .unset([`memories[_id == "${id}"]`])
        .commit();
      await refetch();
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  // Smooth scroll handler
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Intersection observer for section detection
  const [currentSection, setCurrentSection] = useState('home');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id);
            const index = sections.findIndex(s => s.id === entry.target.id);
            if (index !== -1) {
              setActiveSection(index);
              setProgress((index / (sections.length - 1)) * 100);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <ParallaxBackground
        scrollProgress={progress / 100}
        activeSection={activeSection}
        mouseEffect={mousePosition}
      />

      {/* Fixed navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex justify-center space-x-8 py-4">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`text-white px-4 py-2 rounded-full transition-all ${
                    currentSection === section.id
                      ? 'bg-pink-500'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Progress indicator */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 z-50"
        style={{ width: `${progress}%` }}
      />

      {/* Content sections */}
      <div className="relative z-10 snap-y snap-mandatory h-screen overflow-y-auto">
        <section id="home" className="snap-start h-screen">
          <LandingSection
            isActive={currentSection === 'home'}
            progress={progress}
            onContinue={() => scrollToSection('birthdayCard')}
          />
        </section>

        <section id="birthdayCard" className="snap-start min-h-screen">
          <BirthdayCardSection
            isActive={currentSection === 'birthdayCard'}
            progress={progress}
            onContinue={() => scrollToSection('loveLetter')}
          />
        </section>

        <section id="loveLetter" className="snap-start min-h-screen">
          <LoveLetterSection
            isActive={currentSection === 'loveLetter'}
            progress={progress}
            onContinue={() => scrollToSection('memories')}
            letterId={loveData?._id || ''}
          />
        </section>

        <section id="memories" className="snap-start min-h-screen p-8">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-4xl font-bold text-white text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Beautiful Memories
            </motion.h2>
            {loveData?.memories && (
              <MemoryGallery
                memories={loveData.memories}
                onAdd={addMemory}
                onUpdate={updateMemory}
                onDelete={deleteMemory}
              />
            )}
          </div>
        </section>

        <section id="quotes" className="snap-start min-h-screen p-8 bg-gradient-to-b from-transparent to-black/20">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-4xl font-bold text-white text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Love Quotes
            </motion.h2>
            {loveData?.quotes && <LoveQuotes quotes={loveData.quotes} />}
          </div>
        </section>

        <section id="timeline" className="snap-start min-h-screen p-8">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-4xl font-bold text-white text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Journey Together
            </motion.h2>
            {loveData?.timeline && <LoveTimeline items={loveData.timeline} />}
          </div>
        </section>

        <section id="final" className="snap-start h-screen">
          <FinalSection
            isActive={currentSection === 'final'}
            progress={progress}
            onHeartBurst={() => {/* Add heart burst animation */}}
          />
        </section>
      </div>

      {/* Floating elements */}
      <FloatingHearts />
      <MusicPlayer />
    </main>
  );
}
