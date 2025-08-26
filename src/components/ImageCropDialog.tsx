import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropDialog = ({ isOpen, onClose, imageUrl, onCropComplete }: ImageCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop({
      unit: '%',
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    });
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, 'image/jpeg', 0.95);
      });
    },
    []
  );

  const handleCropSave = useCallback(async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
        onCropComplete(croppedImageUrl);
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  }, [completedCrop, getCroppedImg, onCropComplete]);

  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop your image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              onLoad={onImageLoad}
              className="max-w-full max-h-96 object-contain"
              alt="Crop preview"
            />
          </ReactCrop>
          
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCropSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;