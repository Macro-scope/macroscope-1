// @ts-nocheck
import React from "react";
import { CustomRenderer, GridCellKind } from "@glideapps/glide-data-grid";
import { Dialog, DialogContent } from "../ui/dialog";

interface ImageCellProps {
  imageUrl: string;
}

interface ImageCellType {
  kind: "image-cell";
  imageUrl: string;
  readonly?: boolean;
}

export const ImageDialog: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex items-center justify-center p-4">
          <img 
            src={imageUrl} 
            alt="Full size" 
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ImageCell: CustomRenderer<any> = {
  kind: GridCellKind.Custom,
  isMatch: (cell: any): cell is ImageCellType => cell.kind === "image-cell",
  draw: (args, cell) => {
    const { ctx, theme, rect } = args;
    const { x, y, width: w, height: h } = rect;
    
    if (cell.imageUrl) {
      const image = new Image();
      image.src = cell.imageUrl;
      
      const padding = theme.cellHorizontalPadding;
      const imageHeight = h - (padding * 2);
      const imageWidth = imageHeight; // Keep it square
      const imageX = x + (w - imageWidth) / 2; // Center horizontally
      const imageY = y + padding;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imageX, imageY, imageWidth, imageHeight, 4);
      ctx.clip();
      ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
      ctx.restore();
    }

    return true;
  },
  onClick: (cell) => {
    return cell.imageUrl ? true : false;
  },
  onPaste: (value, cell) => ({
    ...cell,
    imageUrl: value,
  }),
};