import { useState } from 'react';
import { motion } from 'framer-motion';

interface ResponseFormProps {
  onClose: () => void;
  onSubmit: (response: any) => void;
}

export function ResponseForm({ onClose, onSubmit }: ResponseFormProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('romantic');
  const [attachments, setAttachments] = useState<File[]>([]);

  const moodOptions = ['romantic', 'playful', 'nostalgic', 'passionate'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      content: [{
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: content }]
      }],
      mood,
      attachments: attachments.map(file => ({
        _type: file.type.startsWith('audio/') ? 'audioMessage' : 'image',
        file: file
      }))
    });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl p-6 w-full max-w-lg"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <h3 className="text-2xl font-dancing text-pink-600 mb-4">Write Your Response</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-pink-300"
            placeholder="Write your message..."
          />
          
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {moodOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          
          <input
            type="file"
            multiple
            accept="image/*,audio/*"
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            className="w-full"
          />
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Send Response
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
