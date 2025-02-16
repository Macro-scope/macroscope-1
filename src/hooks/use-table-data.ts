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
        timestamp: Date.now(),
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

        // Validate history states
        if (!previousState?.data || !currentState?.data) {
          throw new Error('Invalid history state');
        }

        // Find items that were added (exist in current but not in previous)
        const addedItems = currentState.data.filter(
          (currentItem) =>
            currentItem?.id && // Ensure ID exists
            !previousState.data.find(
              (prevItem) => prevItem?.id === currentItem.id
            )
        );

        // Delete added items from database
        for (const item of addedItems) {
          if (!item.id) continue; // Skip if no ID

          const { error: deleteError } = await supabase
            .from('tiles')
            .delete()
            .eq('tile_id', item.id);

          if (deleteError) {
            console.error(`Error deleting tile ${item.id}:`, deleteError);
            throw deleteError;
          }
        }

        // Separate updates for tiles and cards
        const tileUpdates = previousState.data
          .filter((item) => item?.id) // Only include items with valid IDs
          .map((item: any) => ({
            tile_id: item.id,
            name: item.name || '',
            url: item.url || '',
            logo: item.logo || '',
            category_id: item.category_id,
            card_id: item.card_id,
            hidden: item.hidden || false,
            position: item.position || 0,
            description: item.description?.html || null,
            description_markdown: item.description?.markdown || null,
            updated_at: new Date().toISOString(),
          }));

        // Prepare card updates for parent_category_id
        const cardUpdates = previousState.data
          .filter(
            (item) => item?.card_id && item?.parent_category_id !== undefined
          )
          .map((item: any) => ({
            card_id: item.card_id,
            parent_category_id: item.parent_category_id,
          }));

        if (tileUpdates.length > 0) {
          // Process tile updates in smaller batches
          const BATCH_SIZE = 50;
          for (let i = 0; i < tileUpdates.length; i += BATCH_SIZE) {
            const batch = tileUpdates.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('tiles').upsert(batch, {
              onConflict: 'tile_id',
              ignoreDuplicates: false,
            });

            if (error) {
              console.error('Error updating tiles:', error);
              throw error;
            }
          }
        }

        // Update cards if there are any parent_category_id changes
        if (cardUpdates.length > 0) {
          for (const update of cardUpdates) {
            const { error } = await supabase
              .from('cards')
              .update({ parent_category_id: update.parent_category_id })
              .eq('card_id', update.card_id);

            if (error) {
              console.error('Error updating card:', error);
              throw error;
            }
          }
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
        const addedItems = nextState.data.filter(
          (nextItem) =>
            !currentState.data.find(
              (currentItem) => currentItem.id === nextItem.id
            )
        );

        // Create new items in database
        for (const item of addedItems) {
          const newItem = {
            tile_id: item.id,
            name: item.name,
            url: item.url,
            logo: item.logo,
            category_id: item.category_id,
            card_id: item.card_id,
            hidden: item.hidden,
            position: item.position,
            description: item.description?.html,
            description_markdown: item.description?.markdown,
          };

          const { error } = await supabase.from('tiles').insert([newItem]);

          if (error) throw error;
        }

        // Update remaining items
        const updates = nextState.data.map((item: any) => ({
          tile_id: item.id,
          name: item.name,
          url: item.url,
          logo: item.logo,
          category_id: item.category_id,
          card_id: item.card_id,
          hidden: item.hidden,
          position: item.position,
          description: item.description?.html,
          description_markdown: item.description?.markdown,
        }));

        if (updates.length > 0) {
          const { error } = await supabase.from('tiles').upsert(updates, {
            onConflict: 'tile_id',
            ignoreDuplicates: false,
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
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
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
          categories ( 
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
          cards (
            card_id,
            parent_category_id,
            categories ( 
              name,
              color
            ),
            parent_categories (
              category_id,
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
          short_description_markdown: tile.short_description_markdown || '',
          category: {
            value: tile.card_id,
            label: tile.cards.categories.name,
            color:
              tile.cards.settings?.tile?.fillColor ||
              tile.cards.categories.color,
          },
          // Parse the JSONB tags field
          tags: Array.isArray(tile.tags) ? tile.tags : [], // Ensure it's an array
          hidden: tile.hidden || false,
          last_updated: tile.updated_at || tile.created_at,
          card_id: tile.card_id,
          category_id: tile.category_id,
          position: tile.position,
          short_description_html: tile.short_description_html,
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

  const addRow = useCallback(
    async (position?: number) => {
      try {
        dispatch(setSaveStatus('saving'));

        // First, check if "Other" category exists for this map
        const { data: existingCategory, error: categoryCheckError } =
          await supabase
            .from('categories')
            .select('category_id')
            .eq('map_id', mapId)
            .eq('name', 'Other')
            .single();

        if (categoryCheckError && categoryCheckError.code !== 'PGRST116') {
          // PGRST116 is "not found" error
          throw categoryCheckError;
        }

        let categoryId;
        if (!existingCategory) {
          // Create new "Other" category if it doesn't exist
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              category_id: crypto.randomUUID(), // Still need to generate UUID as it's required
              map_id: mapId,
              name: 'Other',
              color: '#808080',
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.category_id;
        } else {
          categoryId = existingCategory.category_id;
        }

        // Get or create card for this category
        const { data: existingCard, error: cardCheckError } = await supabase
          .from('cards')
          .select('*')
          .eq('map_id', mapId)
          .eq('category_id', categoryId)
          .single();

        if (cardCheckError && cardCheckError.code !== 'PGRST116') {
          throw cardCheckError;
        }

        let cardData;
        if (!existingCard) {
          // Create new card if it doesn't exist
          const { data: newCard, error: cardCreateError } = await supabase
            .from('cards')
            .insert({
              map_id: mapId,
              category_id: categoryId,
              name: 'Other',
              position: ['100', '100'],
              dimension: ['200', '300'],
            })
            .select('*, categories!inner(category_id, name, color)')
            .single();

          if (cardCreateError) throw cardCreateError;
          cardData = newCard;
        } else {
          cardData = existingCard;
        }

        // Continue with position handling
        if (position !== undefined) {
          const { error: updateError } = await supabase.rpc(
            'increment_positions',
            {
              p_position: position,
              p_map_id: mapId,
            }
          );

          if (updateError) throw updateError;
        }

        // Rest of your existing code for position and new row creation
        const { data: maxPosData, error: maxPosError } = await supabase
          .from('tiles')
          .select('position')
          .eq('card_id', cardData.card_id)
          .order('position', { ascending: false })
          .limit(1);

        if (maxPosError) throw maxPosError;

        const newPosition =
          position ??
          (maxPosData && maxPosData[0] ? maxPosData[0].position + 1 : 0);

        const newRowData = {
          name: 'New Tile',
          url: '',
          logo: '',
          category_id: categoryId,
          card_id: cardData.card_id,
          hidden: false,
          position: newPosition,
        };

        const { data: insertedData, error } = await supabase
          .from('tiles')
          .insert([newRowData])
          .select(
            `
            *,
            cards!inner (
              card_id,
              categories ( 
                name,
                color
              )
            )
          `
          )
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
            label: insertedData.cards.categories.name,
            color: insertedData.cards.categories.color,
          },
          hidden: insertedData.hidden,
          last_updated: insertedData.updated_at || insertedData.created_at,
          card_id: insertedData.card_id,
          category_id: insertedData.category_id,
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
    },
    [mapId, dispatch]
  );

  const updateRow = async (id: string, updatedData: any) => {
    try {
      dispatch(setSaveStatus('saving'));

      // Format the data for the database
      const dataToUpdate = {
        ...(updatedData.name !== undefined && { name: updatedData.name }),
        ...(updatedData.url !== undefined && { url: updatedData.url }),
        ...(updatedData.logo !== undefined && { logo: updatedData.logo }),
        ...(updatedData.category_id !== undefined && {
          category_id: updatedData.category_id,
        }),
        ...(updatedData.card_id !== undefined && {
          card_id: updatedData.card_id,
        }),
        ...(updatedData.hidden !== undefined && { hidden: updatedData.hidden }),
        ...(updatedData.position !== undefined && {
          position: updatedData.position,
        }),
        ...(updatedData.description !== undefined && {
          description: updatedData.description,
          description_markdown: updatedData.description_markdown,
        }),
        // Add short description fields
        ...(updatedData.short_description_html !== undefined && {
          short_description_markdown: updatedData.short_description,
          short_description_html: updatedData.short_description_html,
        }),
        updated_at: new Date().toISOString(),
      };

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
                last_updated: new Date().toISOString(),
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
      const { error } = await supabase.from('tiles').delete().eq('tile_id', id);

      if (error) throw error;

      // Update local state
      setData((prevData) => prevData.filter((row) => row.id !== id));
      dispatch(setSaveStatus('saved'));
      setTimeout(() => dispatch(setSaveStatus('idle')), 2000);
    } catch (err) {
      console.error('Error deleting row:', err);
      dispatch(setSaveStatus('idle'));
      throw err;
    }
  };

  const reorderRow = useCallback(
    async (from: number, to: number) => {
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
          .select(
            `
          tile_id,
          name,
          url,
          logo,
          category_id,
          card_id,
          hidden,
          position
        `
          )
          .in(
            'card_id',
            data.map((item) => item.card_id)
          )
          .order('position');

        if (tilesError) throw tilesError;

        // Create updates array preserving all required fields
        const updates = tilesData.map((tile, index) => ({
          tile_id: tile.tile_id,
          name: tile.name,
          url: tile.url,
          logo: tile.logo,
          category_id: tile.category_id,
          card_id: tile.card_id,
          hidden: tile.hidden,
          position: index,
        }));

        // Move the dragged tile to its new position
        const draggedTileUpdate = updates.find(
          (u) => u.tile_id === movedItem.id
        );
        if (draggedTileUpdate) {
          updates.splice(updates.indexOf(draggedTileUpdate), 1);
          updates.splice(to, 0, draggedTileUpdate);
          // Update positions for all items
          updates.forEach((update, index) => {
            update.position = index;
          });
        }

        // Update all positions while preserving other fields
        const { error } = await supabase.from('tiles').upsert(updates, {
          onConflict: 'tile_id',
          ignoreDuplicates: false,
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
          .select(
            `
        *,
        cards!inner (
          card_id,
          categories ( 
            name,
            color
          )
        )
      `
          )
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
              label: tile.cards.categories.name,
              color: tile.cards.categories.color,
            },
            hidden: tile.hidden || false,
            last_updated: tile.updated_at || tile.created_at,
            card_id: tile.card_id,
            category_id: tile.category_id,
            position: tile.position,
          }));
          setData(transformedData);
        }
      }
    },
    [data, mapId, dispatch]
  );

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
    canRedo: currentHistoryIndex < history.length - 1,
  };
};
