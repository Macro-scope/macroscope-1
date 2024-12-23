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
  | 'parentCategory';

export interface CustomGridColumn extends Omit<GridColumn, 'id'> {
  title: string;
  type: ColumnType;
  id: string;
  width?: number;
  options?: any;
  onClick?: boolean;
}

export const useTableColumns = (mapId?: string) => {
  const [tagOptions, setTagOptions] = useState<
    { value: string; label: string; color?: string }[]
  >([]);
  
  // Add state for parent category options
  const [parentCategoryOptions, setParentCategoryOptions] = useState<
    { value: string; label: string; color?: string }[]
  >([]);

  // Add function to fetch parent categories
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

  // Modified base columns to include parent category
  const getBaseColumns = useCallback((): CustomGridColumn[] => [
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
    },
    {
      id: 'parentCategory',
      title: 'Parent Group',
      type: 'multiselect',
      icon: GridColumnIcon.HeaderString,
      width: 150,
      options: parentCategoryOptions,
    },
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
  ], [tagOptions, parentCategoryOptions]); // Add parentCategoryOptions as dependency

  // Initialize columns state
  const [columns, setColumns] = useState<CustomGridColumn[]>(getBaseColumns());

  // Update columns when options change
  useEffect(() => {
    setColumns(getBaseColumns());
  }, [tagOptions, parentCategoryOptions, getBaseColumns]);

  // Fetch tags from Supabase
  const fetchTags = useCallback(async () => {
    if (!mapId) return;

    const { data, error } = await supabase
      .from('tags')
      .select('tag_id, name, color')
      .eq('map_id', mapId);

    if (error) {
      console.error('Error fetching tags:', error);
      return;
    }

    const formattedTags = data.map((tag) => ({
      value: tag.tag_id,
      label: tag.name,
      color: tag.color,
    }));

    setTagOptions(formattedTags);
  }, [mapId]);

  // Fetch both tags and parent categories
  useEffect(() => {
    fetchTags();
    fetchParentCategories();
  }, [fetchTags, fetchParentCategories]);

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
    refreshTags: fetchTags,
    refreshParentCategories: fetchParentCategories, // Add this to allow refreshing parent categories
  };
};