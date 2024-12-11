import { supabase } from "../lib/supabaseClient"

const createCard = async (mapId: string, tagId: string, name: string) => {
    const { data, error } = await supabase
        .from('cards')
        .insert({ map_id: mapId, tag_id: tagId, name: name })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const addNewTag = async (mapId: string, name: string, color: string) => {
    const { data: tag, error } = await supabase
        .from('tags')
        .insert({ map_id: mapId, name: name, color: color })
        .select()
        .single();

    if (error) {
        throw error;
    }

    const card = await createCard(mapId, tag.tag_id, name);
    return { tag, card };
};