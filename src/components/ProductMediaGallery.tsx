import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import { ProductMedia } from '@/hooks/useProductMedia';

interface ProductMediaGalleryProps {
  media: ProductMedia[];
  productName: string;
  fallbackImage?: string;
}

const ProductMediaGallery = ({ media, productName, fallbackImage }: ProductMediaGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // If no media, show fallback image
  const displayMedia = media.length > 0 ? media : [
    {
      id: 'fallback',
      media_url: fallbackImage || '/placeholder.svg',
      media_type: 'image' as const,
      alt_text: productName
    }
  ];

  const currentMedia = displayMedia[selectedIndex];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % displayMedia.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + displayMedia.length) % displayMedia.length);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const target = e.target as HTMLImageElement | HTMLVideoElement;
    if ('src' in target) {
      target.src = '/placeholder.svg';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
        {currentMedia.media_type === 'image' ? (
          <img
            src={resolveImageUrl(currentMedia.media_url)}
            alt={currentMedia.alt_text || productName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={currentMedia.media_url}
              className="w-full h-full object-cover"
              controls
              onError={handleImageError}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Play className="h-16 w-16 text-white bg-black/50 rounded-full p-4" />
            </div>
          </div>
        )}
        
        {/* Navigation Arrows */}
        {displayMedia.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnail Grid */}
      {displayMedia.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {displayMedia.map((mediaItem, index) => (
            <button
              key={mediaItem.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                selectedIndex === index ? 'border-primary' : 'border-border'
              }`}
            >
              {mediaItem.media_type === 'image' ? (
                <img
                  src={resolveImageUrl(mediaItem.media_url)}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="relative w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductMediaGallery;