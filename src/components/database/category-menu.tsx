'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ColorPicker } from 'antd';

import { Check, MoreHorizontal, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditCategoryDialog from './edit-category';

interface Category {
  tag_id: string;
  name: string;
  color: string;
  card_id: string;
}
interface CategoryMenuProps {
  mapId: string;
  onSelectCategory: (category: any) => void;
  selectedCategories: Set<string>;
  onToggleCategory: (tagId: string) => void;
  position: { x: number; y: number } | null;
  onClose: () => void;
}
const CategoryMenu: React.FC<CategoryMenuProps> = ({
  mapId,
  onSelectCategory,
  selectedCategories,
  onToggleCategory,
  position,
  onClose,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select(
            `
           card_id,
           description,
           tags (
             tag_id,
             name,
             color
           )
         `
          )
          .eq('map_id', mapId)
          .order('created_at');
        if (error) throw error;
        const formattedCategories = data.map((item: any) => ({
          card_id: item.card_id,
          tag_id: item.tags.tag_id,
          name: item.tags.name,
          color: item.tags.color,
          description: item.description,
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [mapId]);
  const handleSelectAll = () => {
    const allTagIds = new Set(categories.map((cat) => cat.tag_id));
    if (selectedCategories.size === categories.length) {
      // If all are selected, clear selection
      allTagIds.forEach((tagId) => onToggleCategory(tagId));
    } else {
      // Otherwise, select all
      allTagIds.forEach((tagId) => {
        if (!selectedCategories.has(tagId)) {
          onToggleCategory(tagId);
        }
      });
    }
  };
  const handleClearSelection = () => {
    selectedCategories.forEach((tagId) => onToggleCategory(tagId));
  };
  const refreshCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(
          `
          card_id,
          description,
          tags (
            tag_id,
            name,
            color
          )
        `
        )
        .eq('map_id', mapId)
        .order('created_at');

      if (error) throw error;

      const formattedCategories = data.map((item: any) => ({
        card_id: item.card_id,
        tag_id: item.tags.tag_id,
        name: item.tags.name,
        color: item.tags.color,
        description: item.description,
      }));

      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };
  return (
    <Popover open={!!position} onOpenChange={(open) => !open && onClose()}>
      {/* <PopoverTrigger asChild>
        <button
          data-category-menu-trigger
          className="px-3 py-1.5 text-sm bg-white border rounded-md hover:bg-gray-50"
        >
          Group
        </button>
      </PopoverTrigger> */}
      <PopoverContent
        className="w-[240px] p-0"
        style={{
          position: 'fixed',
          left: position?.x ?? 0,
          top: position?.y ?? 0,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Group</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 text-sm text-gray-600 mb-2">
            <button
              onClick={handleSelectAll}
              className="hover:text-gray-900 text-xs"
            >
              Select all
            </button>
            <button
              onClick={handleClearSelection}
              className="hover:text-gray-900 text-xs"
            >
              Clear selection
            </button>
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.tag_id}
                className="flex items-center justify-between py-1 px-2 hover:bg-gray-100 rounded-sm"
              >
                <label className="flex items-center space-x-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.tag_id)}
                    onChange={() => onToggleCategory(category.tag_id)}
                    className="rounded border-gray-300"
                  />
                  <span className="flex items-center text-sm space-x-2">
                    {category.name}
                  </span>
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => setEditingCategory(category)}
                    >
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
      <EditCategoryDialog
        mapId={mapId}
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSave={refreshCategories}
      />
    </Popover>
  );
};
export default CategoryMenu;
