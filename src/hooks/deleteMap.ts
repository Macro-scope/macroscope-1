import { supabase } from "@/lib/supabaseClient";

export const deleteMap = async (mapId: string) => {
    await supabase
        .from('maps')
        .delete()
        .eq('map_id', mapId)
}