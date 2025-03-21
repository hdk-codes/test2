// src/components/FavoritesTab.tsx
import { GalleryItem } from '@/lib/sanityClient';

interface FavoritesTabProps {
  favorites: string[];
  galleryItems: GalleryItem[];
}

export default function FavoritesTab({ favorites, galleryItems }: FavoritesTabProps) {
  const favoriteItems = galleryItems.filter((item) => favorites.includes(item._id));
  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold text-purple-300">Favorites</h2>
      {favoriteItems.length === 0 ? (
        <p className="text-purple-200">No favorites yet!</p>
      ) : (
        <ul>
          {favoriteItems.map((item) => (
            <li key={item._id} className="text-white">{item.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}