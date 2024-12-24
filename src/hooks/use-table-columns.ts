/* eslint-disable @typescript-eslint/no-explicit-any */
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
  | 'article';

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

  //  base columns as a function to always get fresh tagOptions
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
    ],
    [tagOptions]
  ); // Add tagOptions as dependency

  // Initialize columns state
  const [columns, setColumns] = useState<CustomGridColumn[]>(getBaseColumns());

  // Update columns when tagOptions changes
  useEffect(() => {
    setColumns(getBaseColumns());
  }, [tagOptions, getBaseColumns]);

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

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

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
  };
};
