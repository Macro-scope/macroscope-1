'use client';

import { useState, useEffect } from 'react';
import { ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    category_id: string;
    card_id?: string;
    name: string;
    color: string;
    description?: string;
  } | null;
  onSave: () => void;
  mapId: string;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
  mapId,
}) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#0000FF');
  const [description, setDescription] = useState(category?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setDescription(category.description || '');
    }
  }, [category]);

  const handleSave = async () => {
    if (!category?.card_id) return;
    try {
      setIsLoading(true);

      // Update the card
      const { error: cardError } = await supabase
        .from('cards')
        .update({
          name,
          description,
          settings: {
            tile: { fillColor: '#ffffff', borderColor: '#000000' },
            group: { fillColor: '#ffffff', borderColor: color },
          },
        })
        .eq('card_id', category.card_id);

      if (cardError) throw cardError;

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOption = async (deleteItems: boolean) => {
    if (!category?.card_id) return;

    try {
      setIsLoading(true);

      if (deleteItems) {
        // Delete the card
        const { error: cardError } = await supabase
          .from('cards')
          .delete()
          .eq('card_id', category.card_id);

        if (cardError) throw cardError;
      } else {
        // Find or create 'Other' category
        const { data: otherCategory, error: categoryError } = await supabase
          .from('categories')
          .select('category_id')
          .eq('map_id', mapId)
          .eq('name', 'Other')
          .single();

        if (categoryError && categoryError.code !== 'PGRST116')
          throw categoryError;

        const otherCategoryId =
          otherCategory?.category_id ||
          (await createOtherCategory()).category_id;

        // Update the card to use Other category
        const { error: updateError } = await supabase
          .from('cards')
          .update({
            category_id: otherCategoryId,
          })
          .eq('card_id', category.card_id);

        if (updateError) throw updateError;
      }

      onSave();
      onClose();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error handling card deletion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOtherCategory = async () => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: 'Other',
        color: '#808080',
        map_id: mapId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const handleColorChange = (value: Color) => {
    setColor(value.toHexString());
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] p-0">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Edit Card Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mt-1">
                  <ColorPicker
                    value={color}
                    onChange={handleColorChange}
                    size="small"
                    onOpenChange={(open) => {
                      event?.stopPropagation();
                    }}
                    getPopupContainer={(triggerNode) =>
                      triggerNode.parentNode as HTMLElement
                    }
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Card name"
                    className="flex-1 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Card description"
                  className="w-full px-3 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white p-6 max-w-[400px]">
          <div className="flex justify-between items-center">
            <AlertDialogTitle className="text-xl font-semibold mb-4">
              Delete Card
            </AlertDialogTitle>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setShowDeleteDialog(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogDescription className="mb-6">
            Choose how to handle this card
          </AlertDialogDescription>
          <div className="space-y-3">
            <button
              onClick={() => handleDeleteOption(false)}
              className="w-full bg-black text-white p-3 text-sm text-left rounded-md"
            >
              Move card to &apos;Other&apos; category
            </button>
            <button
              onClick={() => handleDeleteOption(true)}
              className="w-full p-3 text-center text-sm border rounded-md hover:bg-gray-50"
            >
              Delete card permanently
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditCategoryDialog;
