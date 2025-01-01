import { supabase } from '../lib/supabaseClient';

const createCard = async (
  mapId: string,
  tagId: string,
  name: string,
  position: [number, number]
) => {
  const pos = position.map((p) => p.toString());
  console.log(pos);
  const { data, error } = await supabase
    .from('cards')
    .insert({
      map_id: mapId,
      category_id: tagId,
      name: name,
      position: pos,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating card:', error);
    throw error;
  }

  return data;
};

export const addNewTag = async (
  mapId: string,
  name: string,
  color: string,
  position: any
) => {
  // Generate category_id first
  const categoryId = crypto.randomUUID();

  const { data: tag, error } = await supabase
    .from('categories')
    .insert({
      category_id: categoryId,
      map_id: mapId,
      name: name,
      color: color,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  try {
    const card = await createCard(mapId, categoryId, name, position);
    return { tag, card };
  } catch (error) {
    // If card creation fails, clean up the category
    await supabase.from('categories').delete().eq('category_id', categoryId);
    throw error;
  }
};
