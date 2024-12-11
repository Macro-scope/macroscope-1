import { supabase } from "@/lib/supabaseClient";

export const setPublishedNav = async (mapId: string, nav: any) => {
    await supabase
        .from('maps')
        .update({ navbar: nav })
        .eq('map_id', mapId)
}