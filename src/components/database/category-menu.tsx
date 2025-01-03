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
  category_id: string;
  card_id: string;
  name: string;
  color: string;
  description?: string;
}

interface CategoryMenuProps {
  mapId: string;
  onSelectCategory: (category: any) => void;
  selectedCategories: Set<string>;
  onToggleCategory: (cardId: string) => void;
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

  const fetchCategories = async () => {
    try {
      // First fetch cards with their category IDs
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('card_id,name,category_id,description')
        .eq('map_id', mapId)
        .not('category_id', 'is', null);

      if (cardsError) throw cardsError;

      if (!cardsData || cardsData.length === 0) {
        setCategories([]);
        return;
      }

      // Get unique category IDs
      const categoryIds = [
        ...new Set(cardsData.map((card) => card.category_id)),
      ];

      // Then fetch the categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('category_id,name,color')
        .in('category_id', categoryIds);

      if (categoriesError) throw categoriesError;

      // Combine the data
      const formattedCategories = cardsData
        .filter((card) => card.category_id)
        .map((card) => {
          const category = categoriesData.find(
            (cat) => cat.category_id === card.category_id
          );
          return {
            card_id: card.card_id,
            category_id: card.category_id,
            name: category?.name || '',
            color: category?.color || '',
            description: card.description,
          };
        });

      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [mapId]);

  const handleSelectAll = () => {
    const allCardIds = new Set(categories.map((cat) => cat.card_id));
    if (selectedCategories.size === categories.length) {
      // If all are selected, clear selection
      allCardIds.forEach((cardId) => onToggleCategory(cardId));
    } else {
      // Otherwise, select all
      allCardIds.forEach((cardId) => {
        if (!selectedCategories.has(cardId)) {
          onToggleCategory(cardId);
        }
      });
    }
  };

  const handleClearSelection = () => {
    selectedCategories.forEach((categoryId) => onToggleCategory(categoryId));
  };

  return (
    <Popover open={!!position} onOpenChange={(open) => !open && onClose()}>
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
            <span className="text-sm font-medium text-gray-900">Cards</span>
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
                key={category.card_id}
                className="flex items-center justify-between py-1 px-2 hover:bg-gray-100 rounded-sm"
              >
                <label className="flex items-center space-x-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.card_id)}
                    onChange={() => onToggleCategory(category.card_id)}
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
        onSave={fetchCategories}
      />
    </Popover>
  );
};

export default CategoryMenu;
