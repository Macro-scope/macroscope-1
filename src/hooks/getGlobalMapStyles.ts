import { supabase } from "@/lib/supabaseClient";

export const getGlobalMapStyles = async (mapId: string) => {
    try {
        const { data, error } = await supabase
            .from('maps')
            .select("settings")
            .eq('map_id', mapId).single();

        if (error) throw error;

        if (data) return data;
        else return ['No data received'];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}