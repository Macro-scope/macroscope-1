import { useState, useCallback, useEffect } from 'react';
import { GridColumn, GridColumnIcon } from '@glideapps/glide-data-grid';
import { supabase } from '../lib/supabaseClient';
import { SortAsc } from 'lucide-react';
import React from 'react';

export type ColumnType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'url'
  | 'image'
  | 'button'
  | 'uri'
  | 'article'
  | 'parentCategory'
  | 'tags'
  | 'markdown';

export interface CustomGridColumn extends Omit<GridColumn, 'id'> {
  title: string;
  type: ColumnType;
  id: string;
  width?: number;
  options?: any;
  onClick?: boolean;
}

export const useTableColumns = (mapId?: string) => {
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string; color?: string }[]
  >([]);

  const [parentCategoryOptions, setParentCategoryOptions] = useState<
    { value: string; label: string; color?: string }[]
  >([]);
  const [tagOptions, setTagOptions] = useState<
    { value: string; label: string; color?: string }[]
  >([]);
  const fetchParentCategories = useCallback(async () => {
    if (!mapId) return;

    const { data, error } = await supabase
      .from('parent_categories')
      .select('category_id, name, color')
      .eq('map_id', mapId);

    if (error) {
      console.error('Error fetching parent categories:', error);
      return;
    }

    const formattedCategories = data.map((category) => ({
      value: category.category_id,
      label: category.name,
      color: category.color,
    }));

    setParentCategoryOptions(formattedCategories);
  }, [mapId]);
  const fetchTags = useCallback(async () => {
    if (!mapId) return;

    const { data, error } = await supabase
      .from('cards')
      .select(
        `
        card_id,
        name,
        category_id,
        settings,
        categories (
          name,
          color
        )
      `
      )
      .eq('map_id', mapId)
      .not('category_id', 'is', null);

    if (error) {
      console.error('Error fetching cards:', error);
      return;
    }

    const formattedTags = data.map((card) => ({
      value: card.card_id,
      label: card.name,
      color:
        card.settings?.tile?.fillColor ||
        card.categories[0]?.color ||
        '#ffffff',
    }));

    setTagOptions(formattedTags);
  }, [mapId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);
  const getBaseColumns = useCallback(
    (): CustomGridColumn[] => [
      {
        id: 'name',
        title: 'Name',
        type: 'text',
        icon: GridColumnIcon.HeaderString,
        width: 150,
        hasMenu: true,
        menuIcon: GridColumnIcon.HeaderSplitString,
      },
      { id: 'url', title: 'URL', type: 'uri', icon: GridColumnIcon.HeaderUri },
      {
        id: 'logo',
        title: 'Logo',
        type: 'image',
        icon: GridColumnIcon.HeaderImage,
        width: 150,
      },
      {
        id: 'category',
        title: 'Category',
        type: 'multiselect',
        icon: GridColumnIcon.HeaderString,
        width: 150,
        options: tagOptions,
        hasMenu: true,
        menuIcon: GridColumnIcon.HeaderBoolean,
        onClick: true,
      },
      // {
      //   id: 'parentCategory',
      //   title: 'Parent Group',
      //   type: 'multiselect',
      //   icon: GridColumnIcon.HeaderString,
      //   width: 150,
      //   options: parentCategoryOptions,
      // },
      {
        id: 'hidden',
        title: 'Hidden',
        type: 'boolean',
        icon: GridColumnIcon.HeaderBoolean,
        width: 100,
      },
      {
        id: 'description',
        title: 'Description',
        type: 'article',
        icon: GridColumnIcon.HeaderMarkdown,
        width: 200,
        onClick: true,
      },
      {
        id: 'markdown',
        title: 'Description2',
        type: 'markdown',
        icon: GridColumnIcon.HeaderMarkdown,
        width: 200,
        onClick: true,
      },
      {
        id: 'tags',
        title: 'Tags',
        type: 'tags',
        icon: GridColumnIcon.HeaderString,
        width: 150,

        onClick: true,
      },
      {
        id: 'last_updated',
        title: 'Last Updated',
        type: 'date',
        icon: GridColumnIcon.HeaderDate,
        width: 150,
      },
      {
        id: 'actions',
        title: 'Actions',
        type: 'button',
        icon: GridColumnIcon.HeaderEmoji,
        width: 100,
      },
    ],
    [categoryOptions, parentCategoryOptions]
  );

  const [columns, setColumns] = useState<CustomGridColumn[]>(getBaseColumns());

  useEffect(() => {
    setColumns(getBaseColumns());
  }, [categoryOptions, parentCategoryOptions, getBaseColumns]);

  const fetchCategories = useCallback(async () => {
    if (!mapId) return;

    const { data, error } = await supabase
      .from('cards')
      .select('card_id,name,category_id,description')
      .eq('map_id', mapId);

    if (error) {
      console.error('Error fetching cards:', error);
      return;
    }

    const categoryIds = data
      .map((card) => card.category_id)
      .filter((id): id is string => id != null);

    if (categoryIds.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('category_id,name,color')
        .in('category_id', categoryIds);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      const uniqueCategories = new Map();
      categoriesData?.forEach((category) => {
        uniqueCategories.set(category.category_id, {
          value: category.category_id,
          label: category.name,
          color: category.color,
        });
      });

      setCategoryOptions(Array.from(uniqueCategories.values()));
    }
  }, [mapId]);

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, [fetchCategories, fetchParentCategories]);

  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<ColumnType>('text');

  const addColumn = useCallback(() => {
    if (newColumnName) {
      const newColumn: CustomGridColumn = {
        id: newColumnName.toLowerCase().replace(/\s+/g, '_'),
        title: newColumnName,
        width: 150,
        type: newColumnType,
        icon: GridColumnIcon.HeaderBoolean,
      };
      setColumns([...columns, newColumn]);
      setNewColumnName('');
      setNewColumnType('text');
    }
  }, [newColumnName, newColumnType, columns]);

  return {
    columns,
    setColumns,
    newColumnName,
    setNewColumnName,
    newColumnType,
    setNewColumnType,
    addColumn,
    refreshCategories: fetchCategories,
    refreshParentCategories: fetchParentCategories,
  };
};
