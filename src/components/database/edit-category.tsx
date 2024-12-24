'use client';

import { useState, useEffect } from 'react';
import { ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { X } from 'lucide-react';
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
    tag_id: string;
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
    if (!category?.tag_id) return;
    try {
      setIsLoading(true);

      // Get the associated card
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('card_id, settings')
        .eq('tag_id', category.tag_id)
        .single();

      if (cardError && cardError.code !== 'PGRST116') {
        throw cardError;
      }

      // Update the tag
      const { error: tagError } = await supabase
        .from('tags')
        .update({
          name,
          color,
        })
        .eq('tag_id', category.tag_id);

      if (tagError) throw tagError;

      // If card exists, update its settings and description
      if (cardData?.card_id) {
        const currentSettings = cardData.settings || {
          tile: { fillColor: '#ffffff', borderColor: '#000000' },
          group: { fillColor: '#ffffff', borderColor: '#000000' },
        };

        const updatedSettings = {
          ...currentSettings,
          group: {
            ...currentSettings.group,
            borderColor: color,
          },
        };

        const { error: cardUpdateError } = await supabase
          .from('cards')
          .update({
            name,
            description,
            settings: updatedSettings,
          })
          .eq('card_id', cardData.card_id);

        if (cardUpdateError) throw cardUpdateError;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating category and card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOption = async (deleteItems: boolean) => {
    if (!category?.tag_id) return;

    try {
      setIsLoading(true);

      if (deleteItems) {
        // Delete both category and its items
        const { error: tilesError } = await supabase
          .from('tiles')
          .delete()
          .eq('tag_id', category.tag_id);

        if (tilesError) throw tilesError;

        const { error: cardError } = await supabase
          .from('cards')
          .delete()
          .eq('tag_id', category.tag_id);

        if (cardError) throw cardError;

        const { error: tagError } = await supabase
          .from('tags')
          .delete()
          .eq('tag_id', category.tag_id);

        if (tagError) throw tagError;
      } else {
        // Find existing 'Other' tag in the same map
        const { data: otherTag, error: tagError } = await supabase
          .from('tags')
          .select('tag_id')
          .eq('map_id', mapId)
          .eq('name', 'Other')
          .single();

        if (tagError && tagError.code !== 'PGRST116') throw tagError;

        // Create 'Other' tag if it doesn't exist
        const otherTagId = otherTag?.tag_id || (await createOtherTag()).tag_id;

        // Find or create 'Other' card
        const { data: otherCard, error: cardError } = await supabase
          .from('cards')
          .select('card_id')
          .eq('map_id', mapId)
          .eq('tag_id', otherTagId)
          .single();

        if (cardError && cardError.code !== 'PGRST116') throw cardError;

        const otherCardId =
          otherCard?.card_id || (await createOtherCard(otherTagId)).card_id;

        // Update all tiles to use the Other category
        const { error: updateError } = await supabase
          .from('tiles')
          .update({
            card_id: otherCardId,
            tag_id: otherTagId,
          })
          .eq('tag_id', category.tag_id);

        if (updateError) throw updateError;

        // Delete the original card (cascade will handle tile deletion)
        const { error: deleteCardError } = await supabase
          .from('cards')
          .delete()
          .eq('tag_id', category.tag_id);

        if (deleteCardError) throw deleteCardError;

        // Finally delete the tag
        const { error: deleteTagError } = await supabase
          .from('tags')
          .delete()
          .eq('tag_id', category.tag_id);

        if (deleteTagError) throw deleteTagError;
      }

      onSave();
      onClose();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error handling category deletion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const createOtherTag = async () => {
    const { data, error } = await supabase
      .from('tags')
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

  const createOtherCard = async (tagId: string) => {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        map_id: mapId,
        tag_id: tagId,
        name: 'Other',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const handleColorChange = (value: Color) => {
    console.log(value);
    setColor(value.toHexString());
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] p-0">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Edit Category Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mt-1">
                  {/* <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 p-0 border rounded cursor-pointer"
                  /> */}
                  <ColorPicker
                    value={color}
                    onChange={handleColorChange}
                    size="small"
                    onOpenChange={(open) => {
                      // Prevent event bubbling when color picker opens/closes
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
                    placeholder="Category name"
                    className="flex-1 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description"
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
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
              Delete Category
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
            Choose how to manage items while deleting the category
          </AlertDialogDescription>
          <div className="space-y-3">
            <button
              onClick={() => handleDeleteOption(false)}
              className="w-full bg-black text-white p-3 text-sm text-left  rounded-md "
            >
              Delete category and move items to 'Other' category
            </button>
            <button
              onClick={() => handleDeleteOption(true)}
              className="w-full p-3 text-center text-sm border rounded-md hover:bg-gray-50"
            >
              Delete both the category and its items
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default EditCategoryDialog;
