'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
}

export function ImageLightbox({ isOpen, onClose, imageUrl, imageName }: ImageLightboxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl p-2 bg-black/95 border-zinc-800 text-white overflow-hidden flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-between p-2">
          <span className="text-xs text-zinc-400 truncate max-w-md">{imageName || 'Shared image'}</span>
          <div className="flex items-center gap-2">
            <a href={imageUrl} download={imageName || 'image'} target="_blank" rel="noreferrer">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <Download className="w-4 h-4" />
              </Button>
            </a>
            <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 text-zinc-300 hover:text-white hover:bg-zinc-800">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-auto flex items-center justify-center p-2">
          <img src={imageUrl} alt={imageName || 'Full preview'} className="max-h-[75vh] max-w-full rounded object-contain shadow-2xl" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
