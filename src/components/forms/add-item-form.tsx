import React, { useState, useCallback, useEffect } from 'react';
import { Camera, Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUpload } from '../database/image-upload';
import { supabase } from '@/lib/supabaseClient';
import Select from 'react-select/creatable';
import { useTableData } from '@/hooks/use-table-data';

interface FormData {
  name: string;
  url: string;
  logo: string;
  category: {
    value: string;
    label: string;
    color: string;
  };
}

interface AddItemFormProps {
  mapId: string;
  onClose: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ mapId, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    logo: '',
    category: { value: '', label: '', color: '' },
  });
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [tagOptions, setTagOptions] = useState<any[]>([]);
  const { addRow } = useTableData({ mapId });

  const fetchTags = useCallback(async () => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('map_id', mapId);

      if (error) throw error;

      const formattedTags = tags.map((tag) => ({
        value: tag.tag_id,
        label: tag.name,
        color: tag.color,
      }));

      setTagOptions(formattedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, [mapId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateNewTag = async (tagName: string) => {
    try {
      const { data: newTag, error: tagError } = await supabase
        .from('tags')
        .insert({
          map_id: mapId,
          name: tagName,
          color: '#000000',
        })
        .select()
        .single();

      if (tagError) throw tagError;

      const { data: newCard, error: cardError } = await supabase
        .from('cards')
        .insert({
          map_id: mapId,
          tag_id: newTag.tag_id,
          name: tagName,
        })
        .select('*, tags!inner(tag_id, name, color)')
        .single();

      if (cardError) throw cardError;

      setFormData((prev) => ({
        ...prev,
        category: {
          value: newTag.tag_id,
          label: tagName,
          color: '#000000',
        },
      }));

      await fetchTags();
      return newCard;
    } catch (error) {
      console.error('Error creating new tag:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the first card for the map if no category is selected
      if (!formData.category.value) {
        const { data: cardsData, error: cardError } = await supabase
          .from('cards')
          .select('*, tags!inner(tag_id, name, color)')
          .eq('map_id', mapId)
          .limit(1);

        let cardData;

        // If no cards exist, create a new tag and card
        if (!cardsData || cardsData.length === 0) {
          // Create a new tag
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({
              map_id: mapId,
              name: 'Other',
              color: '#808080', // Default gray color
            })
            .select()
            .single();

          if (tagError) throw tagError;

          // Create a new card with the new tag
          const { data: newCard, error: cardCreateError } = await supabase
            .from('cards')
            .insert({
              map_id: mapId,
              tag_id: newTag.tag_id,
              name: 'Other',
            })
            .select('*, tags!inner(tag_id, name, color)')
            .single();

          if (cardCreateError) throw cardCreateError;
          cardData = newCard;
        } else {
          cardData = cardsData[0];
        }

        // Create the new row data
        const newRowData = {
          name: formData.name || 'New Tile',
          url: formData.url || '',
          logo: formData.logo || '',
          tag_id: cardData.tag_id,
          card_id: cardData.card_id,
        };

        await addRow(newRowData);
      } else {
        // If category is selected, use that category's card
        const { data: cardData, error: cardError } = await supabase
          .from('cards')
          .select('*')
          .eq('tag_id', formData.category.value)
          .single();

        if (cardError) throw cardError;

        const newRowData = {
          name: formData.name || 'New Tile',
          url: formData.url || '',
          logo: formData.logo || '',
          tag_id: formData.category.value,
          card_id: cardData.card_id,
        };

        await addRow(newRowData);
      }

      onClose();
    } catch (error) {
      console.error('Error creating new item:', error);
    }
  };

  return (
    <Card className="w-[360px] border-none shadow-none h-full overflow-y-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Add New Item</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="relative w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center group overflow-hidden">
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-300" />
              </div>
            )}

            <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsImageDialogOpen(true)}
              >
                Upload
              </Button>
            </div>
          </div>

          <div className="space-y-4 pb-20">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter item name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="relative">
                <Input
                  id="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="pr-10"
                  placeholder="Enter URL"
                />
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                isClearable
                placeholder="Search or create category..."
                value={
                  formData.category.value
                    ? {
                        value: formData.category.value,
                        label: formData.category.label,
                      }
                    : null
                }
                options={tagOptions}
                onChange={(newValue: any) => {
                  if (!newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      category: { value: '', label: '', color: '' },
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      category: {
                        value: newValue.value,
                        label: newValue.label,
                        color: newValue.color,
                      },
                    }));
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" onClick={handleSubmit}>
            Add Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddItemForm;
