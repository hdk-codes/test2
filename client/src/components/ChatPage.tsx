import { useState, useEffect } from "react";
import { auth, db, requestNotificationPermission } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { client } from "@/lib/sanityClient";
import { v4 as uuidv4 } from "uuid";
import { FaHeart, FaPaperPlane } from "react-icons/fa";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    requestNotificationPermission();
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!message && !file) return;

    let mediaUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const mediaDoc = await client.create({
        _type: "media",
        file: { _type: "file", asset: { _type: "reference", _ref: await client.assets.upload("file", file) } },
        uploadedBy: { _ref: user?.uid },
        timestamp: new Date().toISOString(),
      });
      mediaUrl = mediaDoc.file.asset.url;
    }

    await addDoc(collection(db, "messages"), {
      content: message,
      senderId: user?.uid,
      senderName: user?.displayName || user?.email,
      timestamp: new Date().toISOString(),
      mediaUrl,
    });
    setMessage("");
    setFile(null);
  };

  const sendLoveNote = async () => {
    await addDoc(collection(db, "messages"), {
      content: "💕 A Special Love Note 💕",
      senderId: user?.uid,
      senderName: user?.displayName || user?.email,
      timestamp: new Date().toISOString(),
      isLoveNote: true,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-love-bg p-4">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-lg ${
              msg.senderId === user?.uid ? "bg-love-pink text-white ml-auto" : "bg-gray-200 text-black"
            } max-w-xs`}
          >
            <p className="font-bold">{msg.senderName}</p>
            <p>{msg.content}</p>
            {msg.mediaUrl && (
              <img src={msg.mediaUrl} alt="Shared media" className="mt-2 max-w-full rounded" />
            )}
            {msg.isLoveNote && <FaHeart className="text-love-red animate-bounce mt-2" />}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-l-lg"
        />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="ml-2" />
        <button onClick={sendMessage} className="p-2 bg-love-red text-white rounded-r-lg">
          <FaPaperPlane />
        </button>
        <button onClick={sendLoveNote} className="ml-2 p-2 bg-love-pink text-white rounded">
          <FaHeart />
        </button>
      </div>
    </div>
  );
};

export default Chat;