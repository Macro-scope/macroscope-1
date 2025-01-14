import React, { useState, useCallback, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Camera, Upload, Link2, Trash2 } from 'lucide-react';
import Select from 'react-select/creatable';
import { supabase } from '@/lib/supabaseClient';
import { useDispatch } from 'react-redux';
import { setCards } from '@/redux/mapCardsSlice';
import { getMapData } from '@/hooks/getMapData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { ImageUpload } from '@/components/database/image-upload';

interface AddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapId: string;
}

const AddForm = ({ open, onOpenChange, mapId }: AddSheetProps) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    logo: '',
    category: { value: '', label: '', color: '' },
    description: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('map_id', mapId);

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      const formattedCategories = categories.map((category) => ({
        value: category.category_id,
        label: category.name,
        color: category.color || '#000000',
      }));

      setCategoryOptions(formattedCategories);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateNewCategory = async (categoryName: string) => {
    try {
      setIsLoading(true);
      const newCategoryId = crypto.randomUUID();

      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          category_id: newCategoryId,
          map_id: mapId,
          name: categoryName,
          color: '#000000',
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      const newCategoryOption = {
        value: newCategoryId,
        label: categoryName,
        color: '#000000',
      };

      setFormData((prev) => ({
        ...prev,
        category: newCategoryOption,
      }));

      await fetchCategories();
    } catch (error) {
      console.error('Error creating new category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      let cardId: string;
      const tileName = formData.name.trim() || 'New Tile';

      if (formData.category?.value) {
        const { data: existingCard, error: cardError } = await supabase
          .from('cards')
          .select('card_id')
          .eq('category_id', formData.category.value)
          .eq('map_id', mapId)
          .single();

        if (cardError) {
          const { data: newCard, error: createError } = await supabase
            .from('cards')
            .insert({
              map_id: mapId,
              category_id: formData.category.value,
              name: formData.category.label,
            })
            .select('card_id')
            .single();

          if (createError) throw createError;
          cardId = newCard.card_id;
        } else {
          cardId = existingCard.card_id;
        }
      } else {
        // Get or create default card
        const { data: existingCard, error: cardError } = await supabase
          .from('cards')
          .select('card_id')
          .eq('name', 'Default Card')
          .eq('map_id', mapId)
          .single();

        if (cardError) {
          const { data: defaultCard, error: defaultCardError } = await supabase
            .from('cards')
            .insert({
              map_id: mapId,
              name: 'Default Card',
            })
            .select('card_id')
            .single();

          if (defaultCardError) throw defaultCardError;
          cardId = defaultCard.card_id;
        } else {
          cardId = existingCard.card_id;
        }
      }

      const { error: tileError } = await supabase.from('tiles').insert({
        card_id: cardId,
        name: tileName,
        url: formData.url || '#',
        logo: formData.logo,
        category_id: formData.category?.value,
        description_markdown: formData.description,
      });

      if (tileError) throw tileError;

      const mapData = await getMapData(mapId);
      if (mapData) {
        dispatch(setCards(mapData.cards));
      }

      onOpenChange(false);
      setFormData({
        name: '',
        url: '',
        logo: '',
        category: { value: '', label: '', color: '' },
        description: '',
      });
    } catch (error) {
      console.error('Error creating tile:', error);
    }
  };

  const handleDescriptionSave = async (content: {
    html: string;
    markdown: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      description: content.markdown,
    }));
    setIsDescriptionDialogOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[360px] border-none shadow-none h-[calc(100vh-64px)] mt-16 pt-0"
        side="right"
      >
        <SheetHeader className="p-4 pb-2">
          <SheetTitle>Add New Item</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Image</h3>
            </div>
            <div className="relative w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center group">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Camera className="w-12 h-12 text-gray-300" />
              )}
              <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsImageDialogOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                {formData.logo && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, logo: '' }))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator className="border-1" />

          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Basic Info</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-48 h-8 rounded-md border px-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">URL</span>
                <div className="relative w-48">
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full h-8 rounded-md border px-2 pr-8"
                  />
                  <Link2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <Separator className="border-1" />

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Category</h3>
            </div>

            <Select
              isDisabled={isLoading}
              isClearable
              placeholder={
                isLoading
                  ? 'Loading categories...'
                  : 'Search or create category...'
              }
              value={formData.category}
              options={categoryOptions}
              onChange={(newValue: any) => {
                if (!newValue) {
                  setFormData((prev) => ({
                    ...prev,
                    category: { value: '', label: '', color: '' },
                  }));
                  return;
                }

                if (newValue.__isNew__) {
                  handleCreateNewCategory(newValue.label);
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    category: newValue,
                  }));
                }
              }}
              classNames={{
                control: () => 'border rounded-md !min-h-[40px]',
                menu: () => 'mt-1 bg-white border rounded-md shadow-lg',
                option: () => 'px-3 py-2 hover:bg-gray-50',
              }}
            />
          </div>

          <Separator className="border-1" />

          {/* Description Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Description</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDescriptionDialogOpen(true)}
              >
                Edit
              </Button>
            </div>

            <textarea
              value={formData.description}
              readOnly
              className="w-full h-24 rounded-md border p-2 resize-none text-sm"
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button className="w-full" onClick={handleCreate}>
            Create Tile
          </Button>
        </div>

        {/* Image Upload Dialog */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent className="sm:max-w-[680px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <ImageUpload
              initialImage={formData.logo}
              initialUrl={formData.url}
              onImageSelect={(imageUrl) => {
                setFormData((prev) => ({ ...prev, logo: imageUrl }));
                setIsImageDialogOpen(false);
              }}
              onClose={() => setIsImageDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Description Editor Dialog */}
        <Dialog
          open={isDescriptionDialogOpen}
          onOpenChange={setIsDescriptionDialogOpen}
        >
          <DialogContent className="sm:max-w-[900px] h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Description</DialogTitle>
            </DialogHeader>
            <TiptapEditor
              initialContent=""
              onSave={handleDescriptionSave}
              onCancel={() => setIsDescriptionDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

export default AddForm;
