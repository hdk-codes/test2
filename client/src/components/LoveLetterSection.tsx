import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format, isFuture } from 'date-fns';
import { PortableText } from '@portabletext/react';
import { LoveLetter, ContentImage, ContentAudioMessage, LetterContent } from '@/interfaces/LoveLetter';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/sanityClient';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Heart,
  Calendar,
  MapPin,
  Music,
  Lock,
  Send,
  Image as ImageIcon,
  Mic,
  Sparkles,
  Loader2,
  Trash2,
  Edit,
} from 'lucide-react';

// Update the GROQ query
const fetchLoveLetterQuery = `*[_type == "loveLetter" && _id == $id][0] {
  title,
  content[] {
    ...,
    _type == "image" => { 
      asset-> { 
        url 
      }
    }
  },
  theme {
    primaryColor,
    fontFamily,
    animation
  },
  effects,
  letters[] {
    author,
    content[] {
      ...,
      _type == "image" => { 
        asset-> { 
          url
        }
      },
      _type == "audioMessage" => {
        title,
        audioFile {
          asset-> {
            url
          }
        },
        caption,
        description,
        duration
      }
    },
    mood,
    attachments[] {
      _type,
      _type == "file" => {
        asset-> {
          url,
          originalFilename
        }
      },
      _type == "image" => {
        asset-> {
          url
        }
      },
      _type == "songLink" => {
        platform,
        url
      }
    },
    reactions[] {
      emoji,
      timestamp
    },
    createdAt
  },
  privacy {
    isPrivate,
    password
  },
  scheduling {
    deliveryDate,
    reminder
  },
  sharedMemories[] {
    date,
    title,
    description,
    location,
    images[] {
      asset-> {
        url
      }
    }
  },
  animations {
    openingEffect,
    backgroundEffect
  }
}`;

// Add default value handling in the component instead of the query
const handleFetchedData = (data: any): LoveLetter => {
  if (!data) return null;

  return {
    title: data.title || 'Untitled Letter',
    content: data.content || [],
    theme: {
      primaryColor: data.theme?.primaryColor || '#ff6b6b',
      fontFamily: data.theme?.fontFamily || 'Arial',
      animation: data.theme?.animation || 'fade'
    },
    effects: data.effects || [],
    letters: (data.letters || []).map((letter: any) => ({
      author: letter.author || 'me',
      content: letter.content || [],
      mood: letter.mood,
      attachments: letter.attachments || [],
      reactions: (letter.reactions || []).map((r: any) => ({
        emoji: r.emoji || '❤️',
        timestamp: r.timestamp || new Date().toISOString()
      })),
      createdAt: letter.createdAt || new Date().toISOString()
    })),
    privacy: {
      isPrivate: data.privacy?.isPrivate || false,
      password: data.privacy?.password
    },
    scheduling: {
      deliveryDate: data.scheduling?.deliveryDate,
      reminder: data.scheduling?.reminder || false
    },
    sharedMemories: (data.sharedMemories || []).map((memory: any) => ({
      date: memory.date || new Date().toISOString(),
      title: memory.title || 'A Sweet Moment',
      description: memory.description || 'No description yet',
      location: memory.location,
      images: memory.images || []
    })),
    animations: {
      openingEffect: data.animations?.openingEffect || 'fade',
      backgroundEffect: data.animations?.backgroundEffect || 'none'
    }
  };
};

// Background Effects
const ParticlesBackground = () => (
  <motion.div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-pink-300/50 rounded-full"
        animate={{
          y: [-20, window.innerHeight + 20],
          x: Math.random() * window.innerWidth,
          scale: [0.5, 1, 0],
          opacity: [0.8, 0],
        }}
        transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 2, ease: "easeOut" }}
      />
    ))}
  </motion.div>
);

const FloatingPetals = () => (
  <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-2xl"
        initial={{ top: -20, left: `${Math.random() * 100}%`, rotate: 0 }}
        animate={{ top: '100vh', rotate: 360, scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
      >
        🌸
      </motion.div>
    ))}
  </motion.div>
);

const StarryNight = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-purple-900">
    {Array.from({ length: 100 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 3 }}
        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
      />
    ))}
  </div>
);

// Opening Animation Variants
const openingVariants: Variants = {
  fold: { initial: { scaleY: 0, originY: 0 }, animate: { scaleY: 1, transition: { duration: 0.8, ease: "easeOut" } } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.6 } } },
  butterfly: { initial: { scale: 0, rotate: -45 }, animate: { scale: 1, rotate: 0, transition: { duration: 1, ease: "easeOut" } } },
  hearts: { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "backOut" } } },
};

// Components
const LetterHeader = ({ letter }: { letter: LoveLetter }) => (
  <motion.div
    className="text-center mb-8 p-4 rounded-lg bg-white/20 backdrop-blur-sm hover:shadow-lg transition-shadow"
    style={{ fontFamily: letter.theme?.fontFamily, color: letter.theme?.primaryColor }}
    whileHover={{ scale: 1.02 }}
  >
    <h1 className="text-2xl md:text-3xl font-bold mb-2">{letter.title}</h1>
    <p className="text-gray-200">{letter.letters?.[0]?.createdAt ? format(new Date(letter.letters[0].createdAt), 'MMMM dd, yyyy') : 'Timeless'}</p>
  </motion.div>
);

const MemoryTimeline = ({ memories }: { memories?: LoveLetter['sharedMemories'] }) => (
  <div className="relative py-8 space-y-8 md:before:absolute md:before:inset-0 md:before:left-4 md:before:w-0.5 md:before:bg-pink-200">
    {(!memories?.length) ? (
      <p className="text-gray-300 italic">No memories yet—let’s weave some magic!</p>
    ) : (
      memories.map((memory, index) => (
        <motion.div key={index} className="flex gap-4 items-start" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.2 }}>
          <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-pink-600" />
          </div>
          <motion.div className="flex-1 bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors" whileHover={{ y: -4 }}>
            <h3 className="font-semibold text-white">{memory.title}</h3>
            <p className="text-sm text-gray-300">{memory.description}</p>
            {memory.location && (
              <button className="text-xs text-pink-300 mt-2 flex items-center gap-1 hover:underline">
                <MapPin className="w-3 h-3" /> {memory.location.lat}, {memory.location.lng}
              </button>
            )}
            {memory.images?.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {memory.images.map((img, idx) => (
                  <motion.img key={idx} src={img?.asset?.url || 'https://via.placeholder.com/64'} alt={memory.title} className="w-16 h-16 object-cover rounded" whileHover={{ scale: 1.1 }} />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      ))
    )}
  </div>
);

const LetterExchange = ({ letters, effects }: { letters?: LoveLetter['letters']; effects?: string[] }) => {
  const portableTextComponents = {
    types: {
      image: ({ value }: { value: ContentImage }) => (
        <motion.img src={value?.asset?.url || 'https://via.placeholder.com/300'} alt="Letter image" className="w-full h-auto rounded-lg my-2" whileHover={{ scale: 1.05 }} />
      ),
      audioMessage: ({ value }: { value: ContentAudioMessage }) => (
        <div className="my-2 p-4 bg-white/10 rounded-lg">
          <p className="font-semibold text-white">{value?.title}</p>
          <audio controls src={value?.audioFile?.asset?.url || ''} className="w-full my-2" />
          {value?.caption && <p className="text-sm text-gray-300">{value.caption}</p>}
          {value?.description && <p className="text-sm text-gray-200">{value.description}</p>}
          {value?.duration && <p className="text-xs text-gray-400">Duration: {value.duration}s</p>}
        </div>
      ),
    },
    marks: {
      heart: ({ children }: any) => <span className="text-pink-500">❤️ {children}</span>,
      sparkle: ({ children }: any) => <span className="animate-pulse text-yellow-300">✨ {children}</span>,
      kiss: ({ children }: any) => <span className="text-red-500">💋 {children}</span>,
      highlight: ({ children }: any) => <span className="bg-yellow-200/50 px-1">{children}</span>,
    },
  };

  return (
    <div className="space-y-6">
      {(!letters?.length) ? (
        <p className="text-gray-300 italic">No letters yet—start our sweet exchange!</p>
      ) : (
        letters.map((letter, index) => (
          <motion.div
            key={index}
            className={`flex ${letter.author === 'me' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`max-w-[80%] p-4 rounded-xl ${letter.author === 'me' ? 'bg-pink-100 text-pink-900' : 'bg-purple-100 text-purple-900'} ${effects?.includes('glow') ? 'shadow-[0_0_10px_rgba(255,107,107,0.5)]' : ''} ${effects?.includes('sparkles') ? 'relative overflow-hidden' : ''}`}
            >
              {effects?.includes('sparkles') && (
                <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Sparkles className="w-4 h-4 text-yellow-300 absolute top-2 right-2" />
                </motion.div>
              )}
              <PortableText value={letter.content || [{ _type: 'block', children: [{ _type: 'span', text: 'My heart beats for you.' }] }]} components={portableTextComponents} />
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <span>{format(new Date(letter.createdAt), 'HH:mm')}</span>
                {letter.mood && <span className="px-2 py-1 rounded-full bg-white/50">{letter.mood}</span>}
              </div>
              <AttachmentsPanel attachments={letter.attachments} />
              <ReactionsBar reactions={letter.reactions} />
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

const AttachmentsPanel = ({ attachments }: { attachments?: LetterContent['attachments'] }) => {
  if (!attachments?.length) return null;
  const IconMap = { file: ImageIcon, image: ImageIcon, songLink: Music };
  return (
    <motion.div className="mt-4 flex gap-3 flex-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {attachments.map((attachment, index) => {
        const Icon = IconMap[attachment._type as keyof typeof IconMap] || ImageIcon;
        const url = attachment._type === 'songLink' ? attachment.url : attachment.asset?.url;
        const label = attachment._type === 'songLink' ? `Song on ${attachment.platform}` : attachment._type === 'image' ? 'View Image' : 'Download';
        return (
          <motion.a key={index} href={url || '#'} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 flex items-center gap-2 text-sm text-white" whileHover={{ scale: 1.05 }}>
            <Icon className="w-4 h-4" /> {label}
          </motion.a>
        );
      })}
    </motion.div>
  );
};

const ReactionsBar = ({ reactions }: { reactions?: LetterContent['reactions'] }) => (
  <motion.div className="mt-2 flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {reactions?.map((reaction, index) => (
      <motion.button key={index} className="text-2xl" whileHover={{ scale: 1.2, y: -2 }}>{reaction.emoji}</motion.button>
    ))}
    <motion.button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white" whileHover={{ scale: 1.1 }}>+</motion.button>
  </motion.div>
);

const PrivacyLock = ({ onUnlock }: { onUnlock: (pwd: string) => void }) => {
  const [input, setInput] = useState('');
  return (
    <motion.div className="absolute inset-0 backdrop-blur-md flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-white/10 p-8 rounded-2xl text-center">
        <Lock className="w-12 h-12 mb-4 mx-auto text-pink-300 animate-pulse" />
        <Input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onUnlock(input)}
          placeholder="Unlock with a secret kiss..."
          className="bg-white/20 border-none text-white placeholder:text-white/50"
        />
        <Button onClick={() => onUnlock(input)} className="mt-4 bg-pink-500 hover:bg-pink-600">Reveal Love</Button>
      </div>
    </motion.div>
  );
};

// Full CRUD Form
const LoveLetterForm = ({ letter, onSave, onCancel }: { letter?: LoveLetter; onSave: (data: Partial<LoveLetter>) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState<Partial<LoveLetter>>(letter || {});
  const [newLetterContent, setNewLetterContent] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [parent]: { ...(prev[parent] || {}), [field]: value } }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAttachmentFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedData = { ...formData };
      if (newLetterContent || attachmentFile) {
        const newLetter: LetterContent = {
          author: 'me',
          content: newLetterContent ? [{ _type: 'block' as const, children: [{ _type: 'span' as const, text: newLetterContent }] }] : [],
          createdAt: new Date().toISOString(),
          mood: formData.letters?.[0]?.mood,
        };
        if (attachmentFile) {
          const uploadedAsset = await client.assets.upload('file', attachmentFile);
          newLetter.attachments = [{ _type: 'file' as const, asset: { url: uploadedAsset.url, originalFilename: attachmentFile.name } }];
        }
        updatedData.letters = [...(updatedData.letters || []), newLetter];
      }
      onSave(updatedData);
      toast({ title: 'Success', description: 'Our love letter is saved!' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Oh No!', description: 'Failed to save our love. Try again?' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Input name="title" value={formData.title || ''} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Main Content</label>
        <Textarea name="content" value={formData.content?.[0]?.children?.[0]?.text || ''} onChange={(e) => handleNestedChange('content', '0', [{ _type: 'block', children: [{ _type: 'span', text: e.target.value }] }])} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">New Letter</label>
        <Textarea value={newLetterContent} onChange={(e) => setNewLetterContent(e.target.value)} placeholder="Write your heart out..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mood</label>
        <Select onValueChange={(value) => handleNestedChange('letters', '0', { ...formData.letters?.[0], mood: value })} defaultValue={formData.letters?.[0]?.mood}>
          <SelectTrigger><SelectValue placeholder="Select Mood" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="romantic">Romantic</SelectItem>
            <SelectItem value="playful">Playful</SelectItem>
            <SelectItem value="nostalgic">Nostalgic</SelectItem>
            <SelectItem value="passionate">Passionate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Attachment</label>
        <Input type="file" onChange={handleFileChange} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Primary Color</label>
        <Input type="color" name="primaryColor" value={formData.theme?.primaryColor || '#ff6b6b'} onChange={(e) => handleNestedChange('theme', 'primaryColor', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Font Family</label>
        <Select onValueChange={(value) => handleNestedChange('theme', 'fontFamily', value)} defaultValue={formData.theme?.fontFamily}>
          <SelectTrigger><SelectValue placeholder="Select Font" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Effects</label>
        <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, effects: [value] }))} defaultValue={formData.effects?.[0]}>
          <SelectTrigger><SelectValue placeholder="Select Effect" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="hearts">Hearts</SelectItem>
            <SelectItem value="sparkles">Sparkles</SelectItem>
            <SelectItem value="glow">Glow</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Opening Effect</label>
        <Select onValueChange={(value) => handleNestedChange('animations', 'openingEffect', value)} defaultValue={formData.animations?.openingEffect}>
          <SelectTrigger><SelectValue placeholder="Select Opening" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fold">Fold</SelectItem>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="butterfly">Butterfly</SelectItem>
            <SelectItem value="hearts">Hearts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Background Effect</label>
        <Select onValueChange={(value) => handleNestedChange('animations', 'backgroundEffect', value)} defaultValue={formData.animations?.backgroundEffect}>
          <SelectTrigger><SelectValue placeholder="Select Background" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="particles">Particles</SelectItem>
            <SelectItem value="petals">Petals</SelectItem>
            <SelectItem value="stars">Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Private?</label>
        <Input type="checkbox" checked={formData.privacy?.isPrivate || false} onChange={(e) => handleNestedChange('privacy', 'isPrivate', e.target.checked)} />
      </div>
      {formData.privacy?.isPrivate && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <Input name="password" value={formData.privacy?.password || ''} onChange={(e) => handleNestedChange('privacy', 'password', e.target.value)} />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
        <Input type="datetime-local" name="deliveryDate" value={formData.scheduling?.deliveryDate?.slice(0, 16) || ''} onChange={(e) => handleNestedChange('scheduling', 'deliveryDate', e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="bg-pink-500 hover:bg-pink-600">Save</Button>
        <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
      </div>
    </form>
  );
};

// Main Component
interface LoveLetterSectionProps {
  isActive: boolean;
  progress: number;
  onContinue: () => void;
  letterId: string;
}

export default function LoveLetterSection({ isActive, progress, onContinue, letterId }: LoveLetterSectionProps) {
  const [letter, setLetter] = useState<LoveLetter | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        setIsLoading(true);
        const data = await client.fetch(fetchLoveLetterQuery, { id: letterId });
        const processedData = handleFetchedData(data);
        setLetter(processedData);
        setIsRevealed(!processedData?.privacy?.isPrivate);
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Oh No, Darling!', description: 'Our love letter got lost in the stars.' });
        setLetter(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (letterId) fetchLetter();

    const subscription = letterId ? client.listen(fetchLoveLetterQuery, { id: letterId }).subscribe((event) => {
      if (event.result) setLetter(handleFetchedData(event.result));
    }) : null;
    return () => subscription?.unsubscribe();
  }, [letterId, toast]);

  const handleCreate = async (data: Partial<LoveLetter>) => {
    try {
      const newLetter = await client.create({ _type: 'loveLetter', ...data });
      setLetter(newLetter);
      setIsEditing(false);
      toast({ title: 'Love Born!', description: 'Our letter has begun.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Oops!', description: 'Failed to start our love story.' });
    }
  };

  const handleUpdate = async (data: Partial<LoveLetter>) => {
    try {
      const updatedLetter = await client.patch(letterId).set(data).commit();
      setLetter(updatedLetter);
      setIsEditing(false);
      toast({ title: 'Love Updated!', description: 'Our story grows sweeter.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Oh Dear!', description: 'Failed to update our love.' });
    }
  };

  const handleDelete = async () => {
    try {
      await client.delete(letterId);
      setLetter(null);
      toast({ title: 'Farewell!', description: 'Our letter has faded into memory.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Oh No!', description: 'Couldn’t let go of our love.' });
    }
  };

  const handleUnlock = (passwordInput: string) => {
    if (letter?.privacy?.password === passwordInput) {
      setIsRevealed(true);
      toast({ title: 'Love Unlocked!', description: 'Our hearts are now one.' });
    } else {
      toast({ variant: 'destructive', title: 'Sweet Try!', description: 'Not quite the key—try again!' });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-pink-300 mb-4" />
          <p className="text-white">Unfolding our love story...</p>
        </div>
      );
    }

    if (!letterId || !letter) {
      return (
        <div className="text-center p-8 bg-white/10 rounded-xl">
          <Heart className="w-12 h-12 mx-auto text-pink-300 mb-4 animate-bounce" />
          <h2 className="text-2xl font-semibold text-white mb-4">No Love Letter Yet</h2>
          <p className="text-gray-300 mb-4">Shall we pen our first chapter?</p>
          <Button onClick={() => setIsEditing(true)} className="bg-pink-500 hover:bg-pink-600">Start Writing</Button>
        </div>
      );
    }

    if (letter.scheduling?.deliveryDate && isFuture(new Date(letter.scheduling.deliveryDate))) {
      return (
        <div className="text-center p-8 bg-white/10 rounded-xl">
          <Heart className="w-12 h-12 mx-auto text-pink-300 mb-4 animate-pulse" />
          <h2 className="text-2xl font-semibold text-white mb-4">Love in Waiting</h2>
          <p className="text-gray-300">Our letter blooms on {format(new Date(letter.scheduling.deliveryDate), 'MMMM dd, yyyy')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <LetterHeader letter={letter} />
        {letter.content?.length > 0 && (
          <motion.div className="p-6 bg-white/10 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-semibold text-white mb-2">Our Shared Words</h3>
            <PortableText value={letter.content} />
          </motion.div>
        )}
        <MemoryTimeline memories={letter.sharedMemories} />
        <LetterExchange letters={letter.letters} effects={letter.effects} />
        {letter.scheduling?.reminder && <p className="text-sm text-gray-300 italic">A sweet reminder is set!</p>}
      </div>
    );
  };

  const variant = openingVariants[letter?.animations?.openingEffect || 'fade'];

  return (
    <motion.section
      className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 p-4"
      initial={variant.initial}
      animate={variant.animate}
    >
      <motion.div
        className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-8 relative z-10"
        style={{ border: `1px solid ${letter?.theme?.primaryColor || '#ff6b6b'}` }}
      >
        {letter?.privacy?.isPrivate && !isRevealed ? (
          <PrivacyLock onUnlock={handleUnlock} />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-white">Our Love Unfolds</h2>
              {letter && (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} size="sm" className="bg-pink-500 hover:bg-pink-600"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                  <Button onClick={handleDelete} size="sm" variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                </div>
              )}
            </div>
            {renderContent()}
          </div>
        )}
      </motion.div>

      {letter?.animations?.backgroundEffect === 'particles' && <ParticlesBackground />}
      {letter?.animations?.backgroundEffect === 'petals' && <FloatingPetals />}
      {letter?.animations?.backgroundEffect === 'stars' && <StarryNight />}

      <motion.div className="fixed bottom-4 right-4 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Button onClick={onContinue} className="bg-pink-500 hover:bg-pink-600">Continue Our Tale</Button>
      </motion.div>

      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="bg-white p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{letter ? 'Edit Our Love Letter' : 'Begin Our Love Letter'}</SheetTitle>
          </SheetHeader>
          <LoveLetterForm letter={letter} onSave={letter ? handleUpdate : handleCreate} onCancel={() => setIsEditing(false)} />
        </SheetContent>
      </Sheet>
    </motion.section>
  );
}