import { supabase } from "@/lib/supabaseClient";

const createCard = async (mapId: string, tagId: string, name: string) => {
    const { data, error } = await supabase
        .from('cards')
        .insert({ map_id: mapId, tag_id: tagId, name: name })

    if (error) {
        throw error
    }

    console.log('Card created successfully:', data)
}

export const addNewTag = async (mapId: string, name: string, color: string) => {
    const { data, error } = await supabase
        .from('tags')
        .insert({ map_id: mapId, name: name, color: color }).select().single()
    if (error) {
        throw error
    }
    else {
        createCard(mapId, data.tag_id, name);
    }

    console.log('Tag created successfully:', data)
}