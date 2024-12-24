'use client';

import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { setHandTool, setMapSettings } from '../../redux/mapSettingsSlice';
import { setImages } from '../../redux/imagesSlice';
import { supabase } from '../../lib/supabaseClient';
import { addImage } from '../../hooks/addImage';
import { getImages } from '../../hooks/getImages';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { MousePointer, Image as ImageIcon, Settings, Plus } from 'lucide-react';
import { Sheet, SheetContent } from '../ui/sheet';
import AddItemForm from '../forms/add-item-form';

const iconStyle = {
  width: '20px',
  height: '20px',
  minWidth: '20px',
  minHeight: '20px',
  display: 'block',
};

const ToolsMenu = () => {
  const { handTool } = useSelector(
    (state: { handTool: { value: boolean } }) => ({
      handTool: state.handTool.value,
    })
  );
  const dispatch = useDispatch();
  const { id: mapId } = useParams();
  const fileInputRef = useRef(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const timestamp = Date.now();
      const fileName = `Image-${timestamp}-${file.name}`;

      const { error } = await supabase.storage
        .from('map-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('map-images').getPublicUrl(fileName);

      await addImage(String(mapId), publicUrl);
      const images = await getImages(String(mapId));
      dispatch(setImages(images));
    } catch (error) {
      console.error('Error handling image:', error);
      alert('Failed to upload image');
    }

    event.target.value = '';
  };

  return (
    <>
      <Card
        className="absolute mt-[15%] ml-2 z-10 p-2 shadow-lg"
        style={{ cursor: handTool ? 'grab' : 'default' }}
      >
        <TooltipProvider>
          <div className="flex flex-col gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsAddSheetOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 transition-all hover:scale-105"
                >
                  <Plus style={iconStyle} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-base px-4 py-2">
                <p>Add</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={!handTool ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => dispatch(setHandTool(!handTool))}
                  className="h-10 w-10 transition-all hover:scale-105"
                >
                  <MousePointer
                    style={iconStyle}
                    strokeWidth={!handTool ? 2 : 1.5}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-base px-4 py-2">
                <p>{!handTool ? 'Select Tool' : 'Hand Tool'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 transition-all hover:scale-105"
                >
                  <ImageIcon style={iconStyle} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-base px-4 py-2">
                <p>Add Image</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(setMapSettings('global'))}
                  className="h-10 w-10 transition-all hover:scale-105"
                >
                  <Settings style={iconStyle} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-base px-4 py-2">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="p-0 w-[400px]">
          <AddItemForm
            mapId={String(mapId)}
            onSave={() => setIsAddSheetOpen(false)}
            onCancel={() => setIsAddSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ToolsMenu;
