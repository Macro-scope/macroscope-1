import { supabase } from "@/lib/supabaseClient";

export const saveLocalCardStyle = async (cardId: string, style: any) => {
    const { data, error } = await supabase
        .from('cards')
        .update({ settings: style })
        .eq('card_id', cardId)
        .select()
    console.log(data)
    if (error)
        console.log(error)
}