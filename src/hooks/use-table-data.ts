import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useDispatch } from 'react-redux';
import { setSaveStatus } from '@/redux/save-statusSlice';
import { addLogo } from './addLogo';


interface HistoryState {
  data: any[];
  timestamp: number;
}

const getFaviconFromUrl = async (url: string) => {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    if (!domain) return null;

    const faviconUrls = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://icon.horse/icon/${domain}`,
      `${urlObj.protocol}//${domain}/favicon.ico`,
    ];

    for (const faviconUrl of faviconUrls) {
      try {
        const response = await fetch(faviconUrl);
        if (response.ok || response.status === 304) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('image/')) {
            const logoUrl = await addLogo(faviconUrl);
            return logoUrl;
          }
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  } catch (e) {
    console.error('Error parsing URL:', e);
    return null;
  }
};

export const useTableData = ({ mapId }: { mapId: string }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add history stacks for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  // Add data to history when it changes
  useEffect(() => {
    if (!isUndoRedo && data.length > 0) {
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push({
        data: JSON.parse(JSON.stringify(data)),
        timestamp: Date.now()
      });
      setHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
    setIsUndoRedo(false);
  }, [data]);

  const undo = useCallback(async () => {
    if (currentHistoryIndex > 0) {
      setIsUndoRedo(true);
      const previousState = history[currentHistoryIndex - 1];
      const currentState = history[currentHistoryIndex];
      
      try {
        dispatch(setSaveStatus('saving'));
        
        // Find items that were added (exist in current but not in previous)
        const addedItems = currentState.data.filter(currentItem => 
          !previousState.data.find(prevItem => prevItem.id === currentItem.id)
        );

        // Delete added items from database
        for (const item of addedItems) {
          const { error: deleteError } = await supabase
            .from('tiles')
            .delete()
            .eq('tile_id', item.id);

          if (deleteError) throw deleteError;
        }

        // Update remaining items
        const updates = previousState.data.map((item: any) => ({
          tile_id: item.id,
          name: item.name,
          url: item.url,
          logo: item.logo,
          tag_id: item.tag_id,
          card_id: item.card_id,
          hidden: item.hidden,
          position: item.position,
          description: item.description?.html,
          description_markdown: item.description?.markdown
        }));

        if (updates.length > 0) {
          const { error } = await supabase
            .from('tiles')
            .upsert(updates, {
              onConflict: 'tile_id',
              ignoreDuplicates: false
            });

          if (error) throw error;
        }

        // Update local state
        setData(previousState.data);
        setCurrentHistoryIndex(currentHistoryIndex - 1);
        
        dispatch(setSaveStatus('saved'));
        setTimeout(() => dispatch(setSaveStatus('idle')), 2000);
      } catch (error) {
        console.error('Error during undo:', error);
        dispatch(setSaveStatus('idle'));
      }
    }
  }, [currentHistoryIndex, history, dispatch]);

  const redo = useCallback(async () => {
    if (currentHistoryIndex < history.length - 1) {
      setIsUndoRedo(true);
      const nextState = history[currentHistoryIndex + 1];
      const currentState = history[currentHistoryIndex];
      
      try {
        dispatch(setSaveStatus('saving'));
        
        // Find items that were deleted (exist in next but not in current)
        const addedItems = nextState.data.filter(nextItem => 
          !currentState.data.find(currentItem => currentItem.id === nextItem.id)
        );

        // Create new items in database
        for (const item of addedItems) {
          const newItem = {
            tile_id: item.id,
            name: item.name,
            url: item.url,
            logo: item.logo,
            tag_id: item.tag_id,
            card_id: item.card_id,
            hidden: item.hidden,
            position: item.position,
            description: item.description?.html,
            description_markdown: item.description?.markdown
          };

          const { error } = await supabase
            .from('tiles')
            .insert([newItem]);

          if (error) throw error;
        }

        // Update remaining items
        const updates = nextState.data.map((item: any) => ({
          tile_id: item.id,
          name: item.name,
          url: item.url,
          logo: item.logo,
          tag_id: item.tag_id,
          card_id: item.card_id,
          hidden: item.hidden,
          position: item.position,
          description: item.description?.html,
          description_markdown: item.description?.markdown
        }));

        if (updates.length > 0) {
          const { error } = await supabase
            .from('tiles')
            .upsert(updates, {
              onConflict: 'tile_id',
              ignoreDuplicates: false
            });

          if (error) throw error;
        }

        // Update local state
        setData(nextState.data);
        setCurrentHistoryIndex(currentHistoryIndex + 1);
        
        dispatch(setSaveStatus('saved'));
        setTimeout(() => dispatch(setSaveStatus('idle')), 2000);
      } catch (error) {
        console.error('Error during redo:', error);
        dispatch(setSaveStatus('idle'));
      }
    }
  }, [currentHistoryIndex, history, dispatch]);

  // Add keyboard shortcuts in Database.tsx
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y' || 
                 (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // First fetch cards for the given map
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select(
            `
            *,
            tags (
              name,
              color
            )
          `
          )
          .eq('map_id', mapId);

        if (cardsError) throw cardsError;

        // Then fetch tiles with their card relationships
        const { data: tilesData, error: tilesError } = await supabase
          .from('tiles')
          .select(
            `
            *,
            cards!inner (
              card_id,
              tags (
                name,
                color
              )
            )
          `
          )
          .in(
            'card_id',
            cardsData.map((card) => card.card_id)
          )
          .order('position');

        if (tilesError) throw tilesError;

        // Transform the data
        const transformedData = tilesData.map((tile) => ({
          id: tile.tile_id,
          name: tile.name || '',
          url: tile.url || '',
          logo: tile.logo || '',
          category: {
            value: tile.card_id,
            label: tile.cards.tags.name,
            color: tile.cards.tags.color,
          },
          description: tile.description ? {
            html: tile.description,
            markdown: tile.description_markdown || ''
          } : null,
          hidden: tile.hidden || false,
          last_updated: tile.updated_at || tile.created_at,
          card_id: tile.card_id,
          tag_id: tile.tag_id,
          position: tile.position,
        }));

        setData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mapId]);

  const addRow = useCallback(async (position?: number) => {
    try {
      dispatch(setSaveStatus('saving'));
      // Get the first card for the map
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
            color: '#808080' // Default gray color
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
            name: 'Other'
          })
          .select('*, tags!inner(tag_id, name, color)')
          .single();

        if (cardCreateError) throw cardCreateError;
        cardData = newCard;
      } else {
        cardData = cardsData[0];
      }

      // Continue with the rest of the function using cardData
      if (position !== undefined) {
        const { error: updateError } = await supabase.rpc('increment_positions', {
          p_position: position,
          p_map_id: mapId
        });

        if (updateError) throw updateError;
      }

      // Get the maximum position for this map
      const { data: maxPosData, error: maxPosError } = await supabase
        .from('tiles')
        .select('position')
        .eq('card_id', cardData.card_id)
        .order('position', { ascending: false })
        .limit(1);

      if (maxPosError) throw maxPosError;

      // Calculate the new position
      const newPosition = position ?? ((maxPosData && maxPosData[0]) ? maxPosData[0].position + 1 : 0);

      const newRowData = {
        name: 'New Tile',
        url: '',
        logo: '',
        tag_id: cardData.tag_id,
        card_id: cardData.card_id,
        hidden: false,
        position: newPosition,
      };

      const { data: insertedData, error } = await supabase
        .from('tiles')
        .insert([newRowData])
        .select(`
          *,
          cards!inner (
            card_id,
            tags (
              name,
              color
            )
          )
        `)
        .single();

      if (error) throw error;

      // Transform the inserted data
      const transformedRow = {
        id: insertedData.tile_id,
        name: insertedData.name,
        url: insertedData.url,
        logo: insertedData.logo,
        category: {
          value: insertedData.card_id,
          label: insertedData.cards.tags.name,
          color: insertedData.cards.tags.color,
        },
        hidden: insertedData.hidden,
        last_updated: insertedData.updated_at || insertedData.created_at,
        card_id: insertedData.card_id,
        tag_id: insertedData.tag_id,
        position: insertedData.position,
      };

      // Update the local state with the new row in the correct position
      setData((prevData) => {
        if (position === undefined) {
          // Add to the beginning
          return [transformedRow, ...prevData];
        } else {
          // Add at the specified position
          const newData = [...prevData];
          newData.splice(position, 0, transformedRow);
          return newData;
        }
      });
      dispatch(setSaveStatus('saved'));
      setTimeout(() => dispatch(setSaveStatus('idle')), 2000);
    } catch (err) {
      dispatch(setSaveStatus('idle'));
      console.error('Error adding row:', err);
      throw err;
    }
  }, [mapId, dispatch]);

  const updateRow = async (id: string, updatedData: any) => {
    console.log('updateRow called with:', { id, updatedData });
    try {
      dispatch(setSaveStatus('saving'));

      if ('url' in updatedData && updatedData.url !== '') {
        console.log('URL update detected:', updatedData.url);
        const logoUrl = await getFaviconFromUrl(updatedData.url);
        if (logoUrl) {
          console.log('New logo URL:', logoUrl);
          updatedData.logo = logoUrl;
        }
      }

      // Format the data for the database
      const dataToUpdate = {
        ...updatedData,
        // If description is being updated
        ...(updatedData.description && {
          description: updatedData.description.html,
          description_markdown: updatedData.description.markdown
        })
      };

      // Remove the nested description object if it exists
      if (dataToUpdate.description?.html) {
        delete dataToUpdate.description;
      }

      const { error } = await supabase
        .from('tiles')
        .update(dataToUpdate)
        .eq('tile_id', id);

      if (error) throw error;

      // Update local state
      setData((prevData) =>
        prevData.map((row) =>
          row.id === id
            ? {
                ...row,
                ...updatedData,
              }
            : row
        )
      );

      dispatch(setSaveStatus('saved'));
      setTimeout(() => dispatch(setSaveStatus('idle')), 2000);
    } catch (error) {
      console.error('Error in updateRow:', error);
      dispatch(setSaveStatus('idle'));
      throw error;
    }
  };

  const deleteRow = async (id: string) => {
    try {
      dispatch(setSaveStatus('saving'));
      const { error } = await supabase
        .from('tiles')
        .delete()
        .eq('tile_id', id);

      if (error) throw error;

      // Update local state
      setData(prevData => prevData.filter(row => row.id !== id));
      dispatch(setSaveStatus('saved'));
      setTimeout(() => dispatch(setSaveStatus('idle')), 2000);
    } catch (err) {
      console.error('Error deleting row:', err);
      dispatch(setSaveStatus('idle'));
      throw err;
    }
  };

  const reorderRow = useCallback(async (from: number, to: number) => {
    try {
      dispatch(setSaveStatus('saving'));
      // Create new array with reordered items
      const newData = [...data];
      const [movedItem] = newData.splice(from, 1);
      newData.splice(to, 0, movedItem);

      // Update local state immediately for smooth UI
      setData(newData);

      // Get all tiles for this map in current order
      const { data: tilesData, error: tilesError } = await supabase
        .from('tiles')
        .select(`
          tile_id,
          name,
          url,
          logo,
          tag_id,
          card_id,
          hidden,
          position
        `)
        .in(
          'card_id',
          data.map(item => item.card_id)
        )
        .order('position');

      if (tilesError) throw tilesError;

      // Create updates array preserving all required fields
      const updates = tilesData.map((tile, index) => ({
        tile_id: tile.tile_id,
        name: tile.name,
        url: tile.url,
        logo: tile.logo,
        tag_id: tile.tag_id,
        card_id: tile.card_id,
        hidden: tile.hidden,
        position: index
      }));

      // Move the dragged tile to its new position
      const draggedTileUpdate = updates.find(u => u.tile_id === movedItem.id);
      if (draggedTileUpdate) {
        updates.splice(updates.indexOf(draggedTileUpdate), 1);
        updates.splice(to, 0, draggedTileUpdate);
        // Update positions for all items
        updates.forEach((update, index) => {
          update.position = index;
        });
      }

      // Update all positions while preserving other fields
      const { error } = await supabase
        .from('tiles')
        .upsert(updates, { 
          onConflict: 'tile_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      dispatch(setSaveStatus('saved'));
      setTimeout(() => dispatch(setSaveStatus('idle')), 2000);
    } catch (err) {
      dispatch(setSaveStatus('idle'));
      console.error('Error reordering rows:', err);
      // Revert to original order if there's an error
      const { data: originalData, error: fetchError } = await supabase
        .from('tiles')
        .select(`
          *,
          cards!inner (
            card_id,
            tags (
              name,
              color
            )
          )
        `)
        .eq('cards.map_id', mapId)
        .order('position');

      if (fetchError) {
        console.error('Error fetching original data:', fetchError);
        return;
      }

      if (originalData) {
        const transformedData = originalData.map((tile) => ({
          id: tile.tile_id,
          name: tile.name || '',
          url: tile.url || '',
          logo: tile.logo || '',
          category: {
            value: tile.card_id,
            label: tile.cards.tags.name,
            color: tile.cards.tags.color,
          },
          hidden: tile.hidden || false,
          last_updated: tile.updated_at || tile.created_at,
          card_id: tile.card_id,
          tag_id: tile.tag_id,
          position: tile.position,
        }));
        setData(transformedData);
      }
    }
  }, [data, mapId, dispatch]);

  return {
    data,
    setData,
    loading,
    error,
    addRow,
    updateRow,
    deleteRow,
    reorderRow,
    undo,
    redo,
    canUndo: currentHistoryIndex > 0,
    canRedo: currentHistoryIndex < history.length - 1
  };
};

