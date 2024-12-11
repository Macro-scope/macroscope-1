import { supabase } from "@/lib/supabaseClient";

export const getUserDetails = async (uid: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select()
            .eq('user_id', uid)
            .single()

        if (error) throw error;

        if (data) {
            return data;
        }
        else return 'No user received';
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}