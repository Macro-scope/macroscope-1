import { supabase } from "@/lib/supabaseClient";

export const getImages = async (mapId: string):Promise<string[] | undefined> => {
    try {
        const { data, error } = await supabase
            .from('images')
            .select()
            .eq('map_id', mapId);

        if (error) throw error;
        console.log(data)
        if (data) return data;
        return ['No data received'];
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}