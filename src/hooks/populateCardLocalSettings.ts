import { supabase } from "@/lib/supabaseClient";

export const populateCardLocalSettings = async (cardId: string) => {
    try {
        const { data, error } = await supabase
            .from('cards')
            .select()
            .eq('card_id', cardId)
            .single();

        if (error) throw error;

        if (data){
            console.log(data)
            return data.settings;
        } 
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}