import { supabase } from "@/lib/supabaseClient";

export const renameMap = async (mapId: string, name: string) => {
    const {data} = await supabase
        .from('maps')
        .update({ name: name })
        .eq('map_id', mapId)
        .select()
        .single()
    return data.name
}