import { useEffect, useState, useCallback } from "react";
import { motion, Reorder } from "framer-motion";
import { client } from "@/lib/sanityClient";
import { v4 as uuidv4 } from "uuid";
import Confetti from "react-confetti";
import { toPng } from "html-to-image";
import { PortableText } from "@portabletext/react";

interface Message {
  text: string;
  style?: { font?: string; color?: string; size?: number };
  _key: string;
}

interface ImageData {
  url?: string;
  alt?: string;
  caption?: string;
  asset?: { _ref: string; _type: "reference" };
}

interface BirthdayCardData {
  _id?: string;
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

const fonts = ["Dancing Script", "Lobster", "Pacifico", "Arial"];
const colors = ["#FF6F61", "#FFB6C1", "#FFD700", "#E6E6FA"];
const romanticQuotes = [
  "Every mile between us is a step closer to forever.",
  "Distance means so little when you mean so much.",
  "I carry your heart with me, always.",
];

export default function BirthdayCardSection({ isActive, progress, onContinue }: Props) {
  const [cardData, setCardData] = useState<BirthdayCardData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<{ font: string; color: string; size: number }>({
    font: "Lobster",
    color: "#FF6F61",
    size: 20,
  });

  // Fetch card data
  const fetchCardData = useCallback(async () => {
    try {
      const data = await client.fetch<BirthdayCardData>(
        `*[_type == "birthdayCard"][0]{
          _id,
          title,
          messages[]{_key, text, style},
          images[]{
            alt,
            caption,
            "url": asset->url
          },
          background,
          content
        }`
      );
      setCardData(data || { title: "Happy Birthday, my love! 🎉💕", messages: [], images: [], content: [] });
    } catch (error) {
      console.error("Fetch error:", error);
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
    if (!cardData?._id || !newMessage) return;
    const message: Message = { text: newMessage, _key: uuidv4(), style: selectedStyle };
    const updatedMessages = [...cardData.messages, message];
    await client.patch(cardData._id).set({ messages: updatedMessages }).commit();
    setCardData({ ...cardData, messages: updatedMessages });
    setNewMessage("");
  };

  const updateMessageOrder = async (newOrder: Message[]) => {
    if (!cardData?._id) return;
    await client.patch(cardData._id).set({ messages: newOrder }).commit();
    setCardData({ ...cardData, messages: newOrder });
  };

  const handleImageUpload = async () => {
    if (!cardData?._id || !newImage) return;
    const uploadedImage = await client.assets.upload("image", newImage);
    const imageRef = {
      _type: "image",
      asset: { _type: "reference", _ref: uploadedImage._id },
      alt: "Our Moment",
      caption: romanticQuotes[Math.floor(Math.random() * romanticQuotes.length)],
    };
    const updatedImages = [...cardData.images, imageRef];
    await client.patch(cardData._id).set({ images: updatedImages }).commit();
    await fetchCardData();
    setNewImage(null);
  };

  const downloadCard = () => {
    const cardElement = document.getElementById("birthday-card");
    if (cardElement) {
      toPng(cardElement).then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${cardData?.title || "MomentsWithYou"}.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  };

  if (!cardData) return <div className="text-white text-center">Crafting our love story...</div>;

  return (
    <section
      className="relative min-h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-blue-200 p-6 flex justify-center items-center overflow-hidden"
    >
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={["#FF6F61", "#FFB6C1", "#FFD700"]}
        />
      )}

      {/* Tablet-width container */}
      <div className="w-full max-w-2xl mx-auto scrollable-section">
        {/* Title Section */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-['Lobster'] text-pink-800">
            {cardData.title}
          </h2>
        </motion.div>

        {/* Card Container */}
        <motion.div
          id="birthday-card"
          className="relative w-full rounded-xl shadow-2xl"
          style={{ perspective: "1200px" }}
        >
          <motion.div
            className="relative w-full h-48 sm:h-64 bg-cover bg-center rounded-xl"
            style={{ backgroundImage: `url(${cardData.background || "/sunset-bg.jpg"})` }}
            animate={{ rotateY: isOpen ? 180 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.div
            className="relative w-full bg-white/90 p-6 rounded-xl flex flex-col items-center overflow-y-auto scrollable-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0, rotateY: isOpen ? 0 : -180 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {/* Rich Text Content */}
            {cardData.content && (
              <div className="mb-6 prose text-pink-800 font-['Pacifico'] text-center">
                <PortableText value={cardData.content} />
              </div>
            )}

            {/* Gallery of Moments */}
            <div className="grid grid-cols-1 gap-6 w-full mb-6">
              {cardData.images.map((img, idx) => (
                <motion.div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2, duration: 0.5 }}
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                >
                  <img
                    src={img.url || "https://via.placeholder.com/300"}
                    alt={img.alt || "Our Moment"}
                    className="w-full h-48 object-cover"
                  />
                  <motion.div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                  >
                    <p className="text-white text-center font-['Dancing_Script'] text-lg p-2">
                      {img.caption || romanticQuotes[idx % romanticQuotes.length]}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Messages */}
            <Reorder.Group
              axis="y"
              values={cardData.messages}
              onReorder={updateMessageOrder}
              className="w-full mb-6"
            >
              {cardData.messages.map((msg) => (
                <Reorder.Item key={msg._key} value={msg} className="mb-4 cursor-move">
                  <motion.div
                    className="p-4 bg-pink-50 rounded-lg shadow-md text-center"
                    style={{
                      fontFamily: msg.style?.font,
                      color: msg.style?.color,
                      fontSize: `${msg.style?.size}px`,
                    }}
                    whileHover={{ scale: 1.03, backgroundColor: "#FFF5F5" }}
                  >
                    {isEditing ? (
                      <input
                        value={msg.text}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            messages: cardData.messages.map((m) =>
                              m._key === msg._key ? { ...m, text: e.target.value } : m
                            ),
                          })
                        }
                        className="text-black p-2 rounded w-full"
                      />
                    ) : (
                      msg.text
                    )}
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>
        </motion.div>

        {/* Editing Controls */}
        {isEditing && (
          <div className="mt-6 w-full flex flex-col gap-4">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write your heart out..."
              className="text-black p-3 rounded-lg shadow-inner w-full"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={selectedStyle.font}
                onChange={(e) => setSelectedStyle({ ...selectedStyle, font: e.target.value })}
                className="text-black p-2 rounded-lg"
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
                className="text-black p-2 rounded-lg"
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
                onChange={(e) =>
                  setSelectedStyle({ ...selectedStyle, size: Math.max(12, Math.min(36, +e.target.value)) })
                }
                min={12}
                max={36}
                className="text-black p-2 rounded-lg w-full"
              />
            </div>
            <button
              onClick={addMessage}
              className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-lg"
            >
              Add Love Note
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files?.[0] || null)}
              className="text-black w-full p-2"
            />
            <button
              onClick={handleImageUpload}
              className="px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 shadow-lg"
            >
              Add a Moment
            </button>
          </div>
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
            Next Chapter
          </motion.button>
        </div>
      </div>
    </section>
  );
}