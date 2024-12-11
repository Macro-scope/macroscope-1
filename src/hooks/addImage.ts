import { supabase } from "@/lib/supabaseClient";

export const addImage = async (mapId: string, publicUrl: string) => {
    try {
        const { error } = await supabase
            .from('images')
            .insert({
                map_id: mapId,
                url: publicUrl,
                dimension: [400, 500],
                position: [400, 400]
            })

        if (error) throw error;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}