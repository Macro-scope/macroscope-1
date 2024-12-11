import React, { useCallback, useEffect, useState } from 'react';
import { FaLink as Link, FaImage, FaTrash, FaArrowUpFromBracket, FaChevronDown } from 'react-icons/fa6';
import { SheetHeader, SheetTitle } from '../ui/sheet';
import { useTableColumns } from '../../hooks/use-table-columns';
import { useParams } from 'react-router-dom';

import { Dialog, DialogContent } from '../ui/dialog';
import { ImageUpload } from '../database/image-upload';
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { supabase } from '@/lib/supabaseClient';
import { TiptapEditor } from '../editor/tiptap-editor';
import { useTableData } from '@/hooks/use-table-data';
import Select  from 'react-select/creatable';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../ui/alert-dialog";

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

interface EditItemFormData {
  name: string;
  url: string;
  logo: string;
  category: {
    value: string;
    label: string;
    color: string;
  };
  description: string;
  descriptionHtml: string;
  last_updated: string;
  tile_id: string;
}
interface EditItemFormProps {
  data: EditItemFormData;
  onSave: (updatedData: Partial<FormData>) => void;
  onCancel: () => void;
  mapId: string;
}

interface Option {
  value: string;
  label: string;
}

export default function EditItemForm({
  data,
  onSave,
  onCancel,
  mapId,
}: EditItemFormProps) {
 
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [tagOptions, setTagOptions] = useState<any[]>([]);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const { data: tableData, setData, loading, error, addRow, updateRow, deleteRow, reorderRow, 
    undo, redo, canUndo, canRedo } = useTableData({ mapId });
  // Add console logs to debug
  const fetchTags = useCallback(async () => {
  

    try {
      console.log('Fetching tags for mapId:', mapId);
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('map_id', mapId);

      if (error) throw error;

      console.log('Fetched tags:', tags);

      const formattedTags = tags.map(tag => ({
        value: tag.tag_id,
        label: tag.name,
        color: tag.color,
      }));

      console.log('Formatted tags:', formattedTags);
      setTagOptions(formattedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, [mapId]);

  // Log when component mounts and when data changes
  useEffect(() => {
    console.log('EditItemForm mounted or data changed:', data);
    fetchTags();
  }, [fetchTags, data]);

  // Log current state
  useEffect(() => {
    console.log('Current tagOptions:', tagOptions);
  }, [tagOptions]);

  const { columns } = useTableColumns(mapId);
  
  const categoryColumn = columns.find(col => col.id === 'category');
  const categoryOptions = categoryColumn?.options || [];

  const [formData, setFormData] = useState<FormData>({
    name: data.name || '',
    url: data.url || '',
    logo: data.logo || '',
    category: data.category || { value: '', label: '', color: '' },
    description: data.description || '',
    last_updated: data.last_updated || new Date().toISOString()
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    
    if (id === 'category') {
      const selectedOption = categoryOptions.find((opt:any) => opt.value === value);
      if (selectedOption) {
        setFormData(prev => ({
          ...prev,
          category: {
            value: selectedOption.value,
            label: selectedOption.label,
            color: selectedOption.color,
          },
        }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const [showErrorDialog, setShowErrorDialog] = useState(false);

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

  const inputClass =
    'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
  const labelClass = 'block text-[0.7rem] font-medium text-gray-700 mb-1';

  const handleCategoryChange = async (value: string) => {
    const selectedOption = tagOptions.find((opt) => opt.value === value);
    console.log('Selected option:', selectedOption);
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        category: {
          value: selectedOption.value,
          label: selectedOption.label,
          color: selectedOption.color,
        },
      }));
    }
  };

  const handleDescriptionSave = async (content: { html: string, markdown: string }) => {
    try {
      await updateRow(data.tile_id, {
        description: {
          html: content.html,
          markdown: content.markdown
        }
      });
      // setFormData(prev => ({
      //   ...prev,
      //   description: content.markdown
      // }));
      setIsDescriptionDialogOpen(false);
    } catch (error) {
      console.error('Error saving description:', error);
    }
  };

  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleCreateNewTag = async (tagName: string) => {
    try {
      // Create new tag
      const { data: newTag, error: tagError } = await supabase
        .from('tags')
        .insert({
          map_id: mapId,
          name: tagName,
          color: '#000000' // Using black color
        })
        .select()
        .single();

      if (tagError) throw tagError;

      // Create a new card with the new tag
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

      // Update form data with new category
      setFormData(prev => ({
        ...prev,
        category: {
          value: newTag.tag_id,
          label: tagName,
          color: '#000000',
        }
      }));

      // Reset creation state
      setNewTagName('');
      setIsCreatingNewTag(false);
      
      // Refresh tags list
      await fetchTags();

      return newCard;
    } catch (error) {
      console.error('Error creating new tag:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4 px-4">
      <SheetHeader>
        <SheetTitle className="text-lg font-semibold">Edit Item</SheetTitle>
      </SheetHeader>
      <div className="relative w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center group">
        {data.logo ? (
          <img 
            src={data.logo} 
            alt="Logo" 
            className="w-full h-full object-contain rounded-lg" 
          />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center">
            <FaImage className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        <div className="absolute right-2 bottom-0 flex gap-1">
          <button 
            type="button"
            onClick={() => setIsImageDialogOpen(true)}
            className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-50"
          >
            <FaArrowUpFromBracket className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            type="button"
            className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-50"
            onClick={() => {
              setFormData(prev => ({ ...prev, logo: '' }));
              onSave({ logo: '' });
            }}
          >
            <FaTrash className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[80vh] flex flex-col overflow-hidden bg-white">
          <h2 className="text-lg font-medium shrink-0">Add Image</h2>
          <div className="flex-1 min-h-0 overflow-hidden">
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
          </div>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-[0.7rem] font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-[0.7rem] font-medium mb-1">
            URL
          </label>
          <div className="relative">
            <input
              id="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md text-sm pr-8"
            />
            <Link className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
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
                // Handle creating new tag
                try {
                  await handleCreateNewTag(newValue.label);
                } catch (error) {
                  console.error('Error creating new tag:', error);
                }
              } else {
                // Handle selecting existing tag
                handleCategoryChange(newValue.value);
              }
            }}
            onCreateOption={async (inputValue) => {
              try {
                await handleCreateNewTag(inputValue);
              } catch (error) {
                console.error('Error creating new tag:', error);
              }
            }}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '36px',
                height: '36px',
                boxShadow: 'none',
                borderColor: '#e5e7eb',
                '&:hover': {
                  borderColor: '#000000',
                },
              }),
              valueContainer: (base) => ({
                ...base,
                height: '36px',
                padding: '0 6px',
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#f7f7f7' : 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#000000',
              }),
              placeholder: (base) => ({
                ...base,
                fontSize: '0.875rem',
              }),
              singleValue: (base) => ({
                ...base,
                fontSize: '0.875rem',
              }),
            }}
            classNames={{
              control: () => 'border rounded-md text-sm',
              menu: () => 'mt-1 bg-white border rounded-md shadow-lg',
              option: () => 'px-3 py-2 hover:bg-gray-50',
            }}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-[0.7rem] font-medium mb-1">
            Description
          </label>
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsDescriptionDialogOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-gray-200 rounded text-sm"
            >
              Edit
            </button>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md text-sm"
              readOnly
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Last Modified:{' '}
          <span className="font-medium">
            {new Date(data.last_updated).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-8 ">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </form>

      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col z-[999] bg-white">
          <h2 className="text-lg font-medium mb-4">Edit Description</h2>
          <div className="flex-1 overflow-hidden">
            <TiptapEditor
              initialContent={data.descriptionHtml || ''}
              onSave={handleDescriptionSave}
              onCancel={() => setIsDescriptionDialogOpen(false)}
            />
          </div>
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
    </div>
  );
}