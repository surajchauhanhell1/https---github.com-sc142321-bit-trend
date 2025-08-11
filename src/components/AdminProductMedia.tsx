import { useState } from 'react';
import { Plus, X, Image, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductMedia, useAddProductMedia, useDeleteProductMedia } from '@/hooks/useProductMedia';
import { useToast } from '@/hooks/use-toast';

interface AdminProductMediaProps {
  productId: string;
}

const AdminProductMedia = ({ productId }: AdminProductMediaProps) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [altText, setAltText] = useState('');
  
  const { data: media = [], refetch } = useProductMedia(productId);
  const addMedia = useAddProductMedia();
  const deleteMedia = useDeleteProductMedia();
  const { toast } = useToast();

  const handleAddMedia = async () => {
    if (!mediaUrl.trim()) {
      toast({
        title: "Error",
        description: "Media URL is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await addMedia.mutateAsync({
        product_id: productId,
        media_url: mediaUrl,
        media_type: mediaType,
        display_order: media.length,
        alt_text: altText || null
      });

      setMediaUrl('');
      setAltText('');
      toast({
        title: "Success",
        description: "Media added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add media",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await deleteMedia.mutateAsync(mediaId);
      toast({
        title: "Success",
        description: "Media deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Media Form */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={mediaType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaType('image')}
            >
              <Image className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button
              variant={mediaType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaType('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="media-url">Media URL</Label>
            <Input
              id="media-url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={`Enter ${mediaType} URL or path (e.g., src/assets/image.jpg)`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt Text (optional)</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the media for accessibility"
            />
          </div>
          
          <Button onClick={handleAddMedia} disabled={addMedia.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add {mediaType}
          </Button>
        </div>

        {/* Media List */}
        <div className="space-y-2">
          <h4 className="font-medium">Current Media ({media.length})</h4>
          {media.length === 0 ? (
            <p className="text-muted-foreground text-sm">No media added yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item, index) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted">
                    {item.media_type === 'image' ? (
                      <img
                        src={item.media_url}
                        alt={item.alt_text || `Media ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMedia(item.id)}
                    disabled={deleteMedia.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.media_type} #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminProductMedia;