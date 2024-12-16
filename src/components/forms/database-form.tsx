import React, { useCallback, useEffect, useState } from 'react';
import { Camera, Link2, Trash2, Upload, ChevronDown, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from '../database/image-upload';
import { supabase } from '@/lib/supabaseClient';
import { TiptapEditor } from '../editor/tiptap-editor';
import { useTableData } from '@/hooks/use-table-data';
import { useTableColumns } from '../../hooks/use-table-columns';
import Select from 'react-select/creatable';
import { useParams } from 'react-router-dom';

interface FormData {
  name: string;
  url: string;
  logo: string;
  category: {
    value: string;
    label: string;
    color: string;
  };
  description: string;
  last_updated: string;
}

interface EditItemFormData extends FormData {
  descriptionHtml: string;
  tile_id: string;
}

interface EditItemFormProps {
  data: EditItemFormData;
  onSave: (updatedData: Partial<FormData>) => void;
  onCancel: () => void;
  mapId: string;
}

export default function EditItemForm({
  data,
  onSave,
  onCancel,
  mapId,
}: EditItemFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: data.name || '',
    url: data.url || '',
    logo: data.logo || '',
    category: data.category || { value: '', label: '', color: '' },
    description: data.description || '',
    last_updated: data.last_updated || new Date().toISOString()
  });

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [tagOptions, setTagOptions] = useState<any[]>([]);
  
  const { data: tableData, updateRow } = useTableData({ mapId });
  const { columns } = useTableColumns(mapId);

  const fetchTags = useCallback(async () => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('map_id', mapId);

      if (error) throw error;

      const formattedTags = tags.map(tag => ({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category.value) {
      setShowErrorDialog(true);
      return;
    }

    const updates: any = {};
    if (formData.name !== data.name) updates.name = formData.name;
    if (formData.url !== data.url) updates.url = formData.url;
    if (formData.description !== data.description) updates.description = formData.description;
    if (formData.category.value !== data.category.value) {
      updates.tag_id = formData.category.value;
    }
    
    onSave(updates);
  };

  const handleDescriptionSave = async (content: { html: string; markdown: string }) => {
    try {
      await updateRow(data.tile_id, {
        description: {
          html: content.html,
          markdown: content.markdown
        }
      });
      setIsDescriptionDialogOpen(false);
    } catch (error) {
      console.error('Error saving description:', error);
    }
  };

  const handleCreateNewTag = async (tagName: string) => {
    try {
      const { data: newTag, error: tagError } = await supabase
        .from('tags')
        .insert({
          map_id: mapId,
          name: tagName,
          color: '#000000'
        })
        .select()
        .single();

      if (tagError) throw tagError;

      const { data: newCard, error: cardError } = await supabase
        .from('cards')
        .insert({
          map_id: mapId,
          tag_id: newTag.tag_id,
          name: tagName
        })
        .select('*, tags!inner(tag_id, name, color)')
        .single();

      if (cardError) throw cardError;

      setFormData(prev => ({
        ...prev,
        category: {
          value: newTag.tag_id,
          label: tagName,
          color: '#000000',
        }
      }));

      await fetchTags();
      return newCard;
    } catch (error) {
      console.error('Error creating new tag:', error);
      throw error;
    }
  };

  return (
    <Card className="w-[360px] border-none shadow-none h-full overflow-y-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Edit Item</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
          >
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
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </Button>
              {formData.logo && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, logo: '' }));
                    onSave({ logo: '' });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
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
                />
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                isClearable
                placeholder="Search or create category..."
                value={formData.category.value ? {
                  value: formData.category.value,
                  label: formData.category.label
                } : null}
                options={tagOptions}
                onChange={async (newValue: any) => {
                  if (!newValue) {
                    setFormData(prev => ({
                      ...prev,
                      category: { value: '', label: '', color: '' }
                    }));
                    return;
                  }

                  if (newValue.__isNew__) {
                    try {
                      await handleCreateNewTag(newValue.label);
                    } catch (error) {
                      console.error('Error creating new tag:', error);
                    }
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      category: {
                        value: newValue.value,
                        label: newValue.label,
                        color: newValue.color,
                      },
                    }));
                  }
                }}
                onCreateOption={handleCreateNewTag}
                classNames={{
                  control: () => 'border rounded-md !min-h-[40px]',
                  menu: () => 'mt-1 bg-white border rounded-md shadow-lg',
                  option: () => 'px-3 py-2 hover:bg-gray-50',
                }}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: 'black',
                    primary25: '#f9fafb',
                    primary50: '#f3f4f6',
                  },
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="pr-20"
                  readOnly
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDescriptionDialogOpen(true)}
                  className="absolute right-2 top-2"
                >
                  Edit
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Last Modified:{' '}
              <span className="font-medium">
                {new Date(data.last_updated).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 mt-6">
        <Button 
          className="w-full"
          onClick={handleSubmit}
        >
          Save Changes
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onCancel}
        >
          Discard
        </Button>
      </CardFooter>

      {/* Dialogs remain the same */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <ImageUpload
            initialImage={data.logo}
            initialUrl={data.url}
            onImageSelect={async (imageUrl) => {
              setFormData(prev => ({ ...prev, logo: imageUrl }));
              onSave({ logo: imageUrl });
              setIsImageDialogOpen(false);
            }}
            onClose={() => setIsImageDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-[900px] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Description</DialogTitle>
          </DialogHeader>
          <TiptapEditor
            initialContent={data.descriptionHtml || ''}
            onSave={handleDescriptionSave}
            onCancel={() => setIsDescriptionDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Category</AlertDialogTitle>
            <AlertDialogDescription>
              Please select a category before saving the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}