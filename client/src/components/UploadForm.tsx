// src/components/UploadForm.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseMutationResult } from '@tanstack/react-query';
import {client} from '@/lib/sanityClient'; // Adjust the path based on your project structure
import { GalleryItem } from '@/lib/sanityClient';

interface UploadFormProps {
  uploadFiles: File[];
  setUploadFiles: (files: File[]) => void;
  createMutation: UseMutationResult<any, any, (Omit<GalleryItem, '_id'> & { _type: string })[], any>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  theme: 'dark' | 'light';
}

export default function UploadForm({ uploadFiles, setUploadFiles, createMutation, onFileChange, theme }: UploadFormProps) {
  const [uploadMetadata, setUploadMetadata] = useState<{ title: string; description: string; tags: string[] }[]>([]);

  useEffect(() => {
    setUploadMetadata(uploadFiles.map(() => ({ title: '', description: '', tags: [] })));
  }, [uploadFiles]);

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles.length) return;
    const items = await Promise.all(
      uploadFiles.map(async (file, i) => {
        const mediaAsset = await client.assets.upload(file.type.startsWith('image') ? 'image' : 'file', file, {
          filename: `${Date.now()}-${file.name.replace(/\s+/g, '_')}`,
        });
        return {
          _type: 'galleryItem',
          title: uploadMetadata[i].title || file.name.split('.')[0],
          description: uploadMetadata[i].description,
          tags: uploadMetadata[i].tags,
          date: new Date().toISOString(),
          media: { _type: "file" as const, asset: { _type: "reference", _ref: mediaAsset._id } },
          mediaType: file.type.startsWith('image') ? 'image' : 'video',
        };
      })
    );
    createMutation.mutate(items);
    setUploadFiles([]);
  };

  return (
    <form onSubmit={handleBulkUpload} className="space-y-4">
      <Input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={onFileChange}
        className={`${theme === 'dark' ? 'bg-black/50 border-purple-500/50 text-white' : 'bg-white/50 border-purple-300/50 text-black'} rounded-full`}
      />
      {uploadFiles.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {uploadFiles.map((file, i) => (
            <div key={i} className="space-y-2">
              <Input
                value={uploadMetadata[i]?.title || ''}
                onChange={(e) =>
                  setUploadMetadata((prev) => [
                    ...prev.slice(0, i),
                    { ...prev[i], title: e.target.value },
                    ...prev.slice(i + 1),
                  ])
                }
                placeholder={`Title for ${file.name}`}
                className={`${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`}
              />
              <Input
                value={uploadMetadata[i]?.description || ''}
                onChange={(e) =>
                  setUploadMetadata((prev) => [
                    ...prev.slice(0, i),
                    { ...prev[i], description: e.target.value },
                    ...prev.slice(i + 1),
                  ])
                }
                placeholder="Description"
                className={`${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`}
              />
              <Input
                value={uploadMetadata[i]?.tags.join(', ') || ''}
                onChange={(e) =>
                  setUploadMetadata((prev) => [
                    ...prev.slice(0, i),
                    { ...prev[i], tags: e.target.value.split(',').map((t) => t.trim()) },
                    ...prev.slice(i + 1),
                  ])
                }
                placeholder="Tags (comma-separated)"
                className={`${theme === 'dark' ? 'bg-black/50 border-purple-500 text-white' : 'bg-white/50 border-purple-300 text-black'} rounded-full`}
              />
            </div>
          ))}
          <Button
            type="submit"
            disabled={uploadFiles.length === 0 || createMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          >
            {createMutation.isPending ? 'Adding to Our Galaxy...' : 'Capture Our Love'}
          </Button>
        </motion.div>
      )}
    </form>
  );
}