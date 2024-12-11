import { supabase } from "@/lib/supabaseClient";

export const getUserMaps = async (uid: string) => {
    try {
        const { data, error } = await supabase
            .from('maps')
            .select()
            .eq('user_id', uid);

        if (error) throw error;

        if (data) return data;
        else return ['No data received'];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}