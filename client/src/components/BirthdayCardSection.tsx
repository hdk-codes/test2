import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import Confetti from 'react-confetti';
import { toPng } from 'html-to-image';
import { PortableText } from '@portabletext/react';
import { urlForImage } from '@/lib/sanityClient';
import { client } from '@/lib/sanityClient';

const getImageUrl = (asset?: { _ref?: string; _type?: 'reference'; url?: string }) => {
  if (!asset) return '/placeholder-image.jpg';
  
  try {
    // If we have a direct URL, use it
    if (asset.url) {
      return asset.url;
    }
    
    // If we have a Sanity asset reference, use urlForImage
    if (asset._ref && asset._type === 'reference') {
      return urlForImage(asset) || '/placeholder-image.jpg';
    }
    
    return '/placeholder-image.jpg';
  } catch (error) {
    console.error('Error generating image URL:', error);
    return '/placeholder-image.jpg';
  }
};

// Types
interface Message {
  text: string;
  style?: { font?: string; color?: string; size?: number };
  _key: string;
}

interface ImageData {
  _key?: string;
  url?: string;
  alt?: string;
  caption?: string;
  asset?: { 
    _ref?: string; 
    _type?: 'reference';
    url?: string;
  };
  _type?: string;
}

interface BirthdayCardData {
  _id?: string;
  _type: string; // Make _type required, not optional
  title: string;
  messages: Message[];
  images: ImageData[];
  background?: string;
  content?: any[];
}

interface Props {
  isActive: boolean;
  progress: number;
  onContinue: () => void;
}

// Components
export const ReorderHandle: React.FC = () => (
  <div className="cursor-grab px-2">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6H16M8 12H16M8 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
);
// Constants
const fonts = ['Dancing Script', 'Lobster', 'Pacifico', 'Arial', 'Montserrat', 'Playfair Display'];
const colors = ['#FF6F61', '#FFB6C1', '#FFD700', '#E6E6FA', '#9370DB', '#20B2AA'];
const backgrounds = [
  '/sunset-bg.jpg',
  '/hearts-bg.jpg',
  '/flowers-bg.jpg',
  '/stars-bg.jpg',
  '/confetti-bg.jpg',
];
const romanticQuotes = [
  'Every mile between us is a step closer to forever.',
  'Distance means so little when you mean so much.',
  'I carry your heart with me, always.',
  'In a sea of people, my eyes will always search for you.',
  "You're my favorite notification.",
  'Your love is the rhythm my heart beats to.',
];


const BirthdayCardSection: React.FC<Props> = ({ isActive, progress, onContinue }) => {
  const [cardData, setCardData] = useState<BirthdayCardData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<{ font: string; color: string; size: number }>({
    font: 'Lobster',
    color: '#FF6F61',
    size: 20,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch card data
  const fetchCardData = useCallback(async () => {
    try {
      setLoading('Fetching your love story...');
      const data = await client.fetch<BirthdayCardData>(
        `*[_type == "birthdayCard"][0]{
          _id,
          title,
          messages[]{_key, text, style},
          images[]{
            _key,
            alt,
            caption,
            asset->{
              _ref,
              url
            }
          },
          background,
          content
        }`
      );

      if (data) {
        const processedData = {
          ...data,
          messages: data.messages || [],
          images: data.images || [],
          content: data.content || [],
        };
        setCardData(processedData);
        setSelectedBackground(processedData.background || backgrounds[0]);
      } else {
        setCardData({
          _type: 'birthdayCard', // Add required _type
          title: 'Happy Birthday, my love! 🎉💕',
          messages: [],
          images: [],
          content: []
        });
        setSelectedBackground(backgrounds[0]);
      }
      setLoading(null);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError('Failed to load your card. Please try again.');
      setLoading(null);
    }
  }, []);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  // Animation and confetti
  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        setIsOpen(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }, 300);
    } else {
      setIsOpen(false);
    }
  }, [isActive]);

  // CRUD Operations
  const addMessage = async () => {
    if (!newMessage.trim()) {
      setError('Please write something from your heart');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading('Adding your love note...');
    try {
      const message: Message = {
        text: newMessage.trim(),
        _key: uuidv4(),
        style: selectedStyle,
      };

      if (cardData?._id) {
        const updatedMessages = [...(cardData.messages || []), message];
        await client.patch(cardData._id).set({ messages: updatedMessages }).commit();
        setCardData({ ...cardData, messages: updatedMessages });
      } else {
        const newCard: BirthdayCardData = {
          _type: 'birthdayCard',
          title: cardData?.title || 'Happy Birthday, my love! 🎉💕',
          messages: [message],
          images: [],
          background: selectedBackground,
        };
        const created = await client.create(newCard);
        setCardData({ ...newCard, _id: created._id, images: [] });
      }

      setNewMessage('');
      setLoading(null);
    } catch (error: any) {
      console.error('Failed to add message:', error);
      setError('Failed to add your message. Please try again.');
      setLoading(null);
    }
  };

  const updateMessage = async (key: string) => {
    if (!cardData?._id) return;

    setLoading('Updating your message...');
    try {
      const updatedMessages = cardData.messages.map((msg) =>
        msg._key === key ? { ...msg } : msg
      );

      await client.patch(cardData._id).set({ messages: updatedMessages }).commit();
      setCardData({ ...cardData, messages: updatedMessages });
      setEditingMessageKey(null);
      setLoading(null);
    } catch (error: any) {
      console.error('Failed to update message:', error);
      setError('Failed to update your message. Please try again.');
      setLoading(null);
    }
  };

  const deleteMessage = async (key: string) => {
    if (!cardData?._id) return;

    setLoading('Removing message...');
    try {
      const updatedMessages = cardData.messages.filter((msg) => msg._key !== key);
      await client.patch(cardData._id).set({ messages: updatedMessages }).commit();
      setCardData({ ...cardData, messages: updatedMessages });
      setLoading(null);
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      setError('Failed to remove your message. Please try again.');
      setLoading(null);
    }
  };

  const updateMessageOrder = async (newOrder: Message[]) => {
    if (!cardData?._id) return;

    try {
      setCardData({ ...cardData, messages: newOrder });
      await client.patch(cardData._id).set({ messages: newOrder }).commit();
    } catch (error: any) {
      console.error('Failed to update message order:', error);
      setError('Failed to rearrange your messages. Please try again.');
      fetchCardData();
    }
  };

  const handleImageUpload = async () => {
    if (!newImage) {
      setError('Please select an image to upload');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading('Adding your precious moment...');
    try {
      const uploadedImage = await client.assets.upload('image', newImage);

      const imageData: ImageData = {
        _key: uuidv4(),
        _type: 'image',
        asset: { _type: 'reference', _ref: uploadedImage._id },
        alt: 'Our Moment',
        caption: romanticQuotes[Math.floor(Math.random() * romanticQuotes.length)],
      };

      if (cardData?._id) {
        const updatedImages = [...(cardData.images || []), imageData];
        await client.patch(cardData._id).set({ images: updatedImages }).commit();
        await fetchCardData();
      } else {
        const newCard: BirthdayCardData = {
          _type: 'birthdayCard',
          title: cardData?.title || 'Happy Birthday, my love! 🎉💕',
          messages: [],
          images: [imageData],
          background: selectedBackground,
        };
        await client.create(newCard);
        await fetchCardData();
      }

      setNewImage(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      setLoading(null);
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      setError('Failed to upload your image. Please try again.');
      setLoading(null);
    }
  };

  const deleteImage = async (key: string) => {
    if (!cardData?._id) return;

    setLoading('Removing image...');
    try {
      const updatedImages = cardData.images.filter((img) => img._key !== key);
      await client.patch(cardData._id).set({ images: updatedImages }).commit();
      setCardData({ ...cardData, images: updatedImages });
      setLoading(null);
    } catch (error: any) {
      console.error('Failed to delete image:', error);
      setError('Failed to remove your image. Please try again.');
      setLoading(null);
    }
  };

  const updateCardBackground = async (background: string) => {
    if (!cardData?._id) return;

    setSelectedBackground(background);
    try {
      await client.patch(cardData._id).set({ background }).commit();
      setCardData({ ...cardData, background });
    } catch (error: any) {
      console.error('Failed to update background:', error);
      setError('Failed to update the background. Please try again.');
    }
  };

  const updateCardTitle = async (title: string) => {
    if (!cardData?._id) return;

    try {
      await client.patch(cardData._id).set({ title }).commit();
      setCardData({ ...cardData, title });
    } catch (error: any) {
      console.error('Failed to update title:', error);
      setError('Failed to update the card title. Please try again.');
    }
  };

  const downloadCard = () => {
    if (!cardRef.current) return;

    setLoading('Capturing your memories...');
    try {
      toPng(cardRef.current, { quality: 0.95, cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${cardData?.title || 'MomentsWithYou'}.png`;
          link.href = dataUrl;
          link.click();
          setLoading(null);
        })
        .catch((error: any) => {
          console.error('Failed to download card:', error);
          setError('Failed to save your card. Please try again.');
          setLoading(null);
        });
    } catch (error: any) {
      console.error('Download error:', error);
      setError('Failed to save your card. Please try again.');
      setLoading(null);
    }
  };

  if (!cardData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-blue-200">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-pink-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-800 text-xl">Loading your love story...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-blue-200 p-6 flex justify-center items-center overflow-hidden">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={['#FF6F61', '#FFB6C1', '#FFD700', '#9370DB']}
          recycle={false}
        />
      )}

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-0 right-0 mx-auto w-80 bg-white shadow-lg rounded-lg p-4 text-center z-50"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-t-2 border-pink-600 border-solid rounded-full animate-spin"></div>
              <p className="text-pink-800">{loading}</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-0 right-0 mx-auto w-80 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50"
          >
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {isEditing ? (
            <input
              value={cardData!.title}
              onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
              onBlur={() => updateCardTitle(cardData!.title)}
              className="text-3xl sm:text-4xl font-['Lobster'] text-pink-800 bg-white/50 p-2 rounded-lg shadow-inner text-center w-full max-w-lg mx-auto"
            />
          ) : (
            <h2 className="text-3xl sm:text-4xl font-['Lobster'] text-pink-800">
              {cardData!.title}
            </h2>
          )}
        </motion.div>

        <motion.div
          className="relative w-full rounded-xl shadow-2xl overflow-hidden"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            className="relative w-full h-48 sm:h-64 bg-cover bg-center rounded-t-xl"
            style={{ backgroundImage: `url(${cardData!.background || selectedBackground})` }}
            animate={{ rotateY: isOpen ? 180 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {isEditing && (
              <div className="absolute bottom-2 right-2 flex gap-2 overflow-x-auto max-w-full p-2 bg-white/30 backdrop-blur-sm rounded-full">
                {backgrounds.map((bg, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateCardBackground(bg)}
                    className={`w-8 h-8 rounded-full bg-cover bg-center border-2 ${selectedBackground === bg ? 'border-yellow-400 scale-110' : 'border-white/50'
                      }`}
                    style={{ backgroundImage: `url(${bg})` }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            ref={cardRef}
            className="relative w-full bg-white/90 p-6 rounded-b-xl flex flex-col items-center max-h-[600px] overflow-y-auto scrollable-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0, rotateY: isOpen ? 0 : -180 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {cardData!.content && cardData!.content.length > 0 && (
              <div className="mb-6 prose text-pink-800 font-['Pacifico'] text-center">
                <PortableText value={cardData!.content} />
              </div>
            )}

{cardData!.images && cardData!.images.length > 0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-6">
    {cardData!.images.map((img, idx) => {
      // Get image URL considering both asset reference and direct URL
      const imageUrl = img.url || (img.asset ? getImageUrl(img.asset) : '/placeholder-image.jpg');
      
      return (
        <motion.div
          key={img._key || idx}
          className="relative group rounded-lg overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src={imageUrl}
            alt={img.alt || 'Our Moment'}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.jpg';
              target.onerror = null; // Prevent infinite error loop
            }}
          />
          <motion.div
            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ y: 20 }}
            whileHover={{ y: 0 }}
          >
            <p className="text-white text-center font-['Dancing_Script'] text-lg p-2">
              {img.caption || romanticQuotes[idx % romanticQuotes.length]}
            </p>
            {isEditing && (
              <button
                onClick={() => deleteImage(img._key || '')}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </motion.div>
        </motion.div>
      );
    })}
  </div>
) : (
  <div className="w-full text-center mb-6 p-6 border-2 border-dashed border-pink-200 rounded-lg">
    <p className="text-pink-800 font-['Dancing_Script'] text-xl">
      {isEditing ? 'Add your favorite moments together' : 'No moments added yet'}
    </p>
  </div>
)}

            {cardData!.messages && cardData!.messages.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={cardData!.messages}
                onReorder={updateMessageOrder}
                className="w-full mb-6"
              >
                {cardData!.messages.map((msg) => (
                  <Reorder.Item key={msg._key} value={msg} className="mb-4 cursor-move">
                    <motion.div
                      className="p-4 bg-white/80 rounded-lg shadow-md flex items-center justify-between gap-4 group"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {isEditing ? (
                        editingMessageKey === msg._key ? (
                          <>
                            <input
                              type="text"
                              value={msg.text}
                              onChange={(e) => {
                                const updatedMessages = cardData.messages.map((m) =>
                                  m._key === msg._key ? { ...m, text: e.target.value } : m
                                );
                                setCardData({ ...cardData, messages: updatedMessages });
                              }}
                              className="flex-1 p-2 border border-pink-300 rounded-md text-pink-800"
                              onBlur={() => updateMessage(msg._key)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateMessage(msg._key);
                                }
                              }}
                            />
                            <button
                              onClick={() => updateMessage(msg._key)}
                              className="px-3 py-1 bg-green-500 text-white rounded-full text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageKey(null);
                                // Reset to original text
                                fetchCardData();
                              }}
                              className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <span
                            className="flex-1 text-pink-800 font-['Dancing_Script'] text-lg"
                            style={{
                              fontFamily: msg.style?.font,
                              color: msg.style?.color,
                              fontSize: `${msg.style?.size}px`,
                            }}
                          >
                            {msg.text}
                          </span>
                        )
                      ) : (
                        <span
                          className="flex-1 text-pink-800 font-['Dancing_Script'] text-lg"
                          style={{
                            fontFamily: msg.style?.font,
                            color: msg.style?.color,
                            fontSize: `${msg.style?.size}px`,
                          }}
                        >
                          {msg.text}
                        </span>
                      )}
                      {isEditing && (
                        <>
                          <button
                            onClick={() => setEditingMessageKey(msg._key)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(msg._key)}
                            className="px-3 py-1 bg-red-500 text-white rounded-full text-sm"
                          >
                            Delete
                          </button>
                          <div className="flex gap-1">
                            <select
                              value={msg.style?.font || selectedStyle.font}
                              onChange={(e) => {
                                const updatedMessages = cardData.messages.map((m) =>
                                  m._key === msg._key
                                    ? { ...m, style: { ...m.style, font: e.target.value } }
                                    : m
                                );
                                setCardData({ ...cardData, messages: updatedMessages });
                              }}
                              className="text-black text-xs rounded-md"
                            >
                              {fonts.map((font) => (
                                <option key={font} value={font}>
                                  {font}
                                </option>
                              ))}
                            </select>
                            <select
                              value={msg.style?.color || selectedStyle.color}
                              onChange={(e) => {
                                const updatedMessages = cardData.messages.map((m) =>
                                  m._key === msg._key
                                    ? { ...m, style: { ...m.style, color: e.target.value } }
                                    : m
                                );
                                setCardData({ ...cardData, messages: updatedMessages });
                              }}
                              className="text-black text-xs rounded-md"
                            >
                              {colors.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={msg.style?.size || selectedStyle.size}
                              min="12"
                              max="36"
                              step="1"
                              onChange={(e) => {
                                const updatedMessages = cardData.messages.map((m) =>
                                  m._key === msg._key
                                    ? {
                                      ...m,
                                      style: {
                                        ...m.style,
                                        size: parseInt(e.target.value, 10),
                                      },
                                    }
                                    : m
                                );
                                setCardData({ ...cardData, messages: updatedMessages });
                              }}
                              className="w-16 text-black text-xs rounded-md"
                            />
                          </div>
                        </>
                      )}
                      <ReorderHandle/>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <div className="w-full text-center mb-6 p-6 border-2 border-dashed border-pink-200 rounded-lg">
                <p className="text-pink-800 font-['Dancing_Script'] text-xl">
                  {isEditing ? 'Write a heartfelt message' : 'No messages yet'}
                </p>
              </div>
            )}

            {isEditing && (
              <>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Your message..."
                  className="w-full p-4 border-2 border-dashed border-pink-200 rounded-lg mb-4 text-pink-800 font-['Dancing_Script'] text-lg resize-none"
                  rows={3}
                />
                <div className="flex gap-4 items-center mb-6">
                  <select
                    value={selectedStyle.font}
                    onChange={(e) => setSelectedStyle({ ...selectedStyle, font: e.target.value })}
                    className="text-black rounded-md"
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStyle.color}
                    onChange={(e) => setSelectedStyle({ ...selectedStyle, color: e.target.value })}
                    className="text-black rounded-md"
                  >
                    {colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={selectedStyle.size}
                    min="12"
                    max="36"
                    step="1"
                    onChange={(e) =>
                      setSelectedStyle({
                        ...selectedStyle,
                        size: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-20 text-black rounded-md"
                  />
                  <button
                    onClick={addMessage}
                    className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 shadow-lg"
                  >
                    Add Message
                  </button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  className="text-black w-full p-2"
                  ref={imageInputRef}
                />
                <button
                  onClick={handleImageUpload}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 shadow-lg"
                >
                  Add a Moment
                </button>
              </>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className="px-8 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditing ? "Seal with Love" : "Edit Our Story"}
              </motion.button>
              <motion.button
                onClick={downloadCard}
                className="px-8 py-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Our Moments
              </motion.button>
              <motion.button
                onClick={onContinue}
                className="px-8 py-3 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue to Letter
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


export default BirthdayCardSection;