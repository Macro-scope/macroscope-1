import { supabase } from "@/lib/supabaseClient";

export const setGlobalMapStyle = async (mapId: string, mapStyle: any) => {
    await supabase
        .from('maps')
        .update({ settings: mapStyle })
        .eq('map_id', mapId)
}