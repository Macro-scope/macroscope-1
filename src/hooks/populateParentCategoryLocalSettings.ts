// hooks/populateParentCategoryLocalSettings.ts
import { supabase } from "@/lib/supabaseClient";

export const populateParentCategoryLocalSettings = async (categoryId: string) => {
    try {
        const { data, error } = await supabase
            .from('parent_categories')
            .select()
            .eq('category_id', categoryId)
            .single();

        if (error) throw error;

        if (data) {
            console.log(data);
            return data.local_settings;
        }
    } catch (error) {
        console.error('Error fetching parent category settings:', error);
    }
}

