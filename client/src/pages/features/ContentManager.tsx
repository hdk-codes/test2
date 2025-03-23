import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/sanityClient';

interface ContentSection {
  id: string;
  type: 'landing' | 'birthdayCard' | 'loveLetter';
  content: any;
}

export default function ContentManager() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: fetchSections
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await client.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-8">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">Content Manager</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['landing', 'birthdayCard', 'loveLetter'].map((type) => (
          <motion.div
            key={type}
            className="bg-white rounded-xl shadow-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </h2>
            <button
              onClick={() => setActiveSection(type)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg"
            >
              Edit Content
            </button>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      {/* ... Modal implementation ... */}
    </div>
  );
}

function fetchSections() {
  // Implement your fetch logic
}

function updateSection(data: any) {
  // Implement your update logic
}
