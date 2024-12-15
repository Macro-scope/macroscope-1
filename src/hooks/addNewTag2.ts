import { supabase } from "../lib/supabaseClient"

const createCard = async (mapId: string, tagId: string, name: string, position: [number, number]) => {
    const pos = position.map((p) => p.toString());
    console.log(pos);
    const { data, error } = await supabase
        .from('cards')
        .insert({ map_id: mapId, tag_id: tagId, name: name, position: pos })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const addNewTag = async (mapId: string, name: string, color: string, position: any) => {
    const { data: tag, error } = await supabase
        .from('tags')
        .insert({ map_id: mapId, name: name, color: color })
        .select()
        .single();

    if (error) {
        throw error;
    }
    console.log(position);

    const card = await createCard(mapId, tag.tag_id, name, position);
    return { tag, card };
};