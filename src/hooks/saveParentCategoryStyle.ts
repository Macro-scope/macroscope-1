import { supabase } from '@/lib/supabaseClient';

export const saveParentCategoryStyle = async (categoryId: string, settings: any) => {
  try {
    const { data, error } = await supabase
      .from('parent_categories')
      .update({ local_settings: settings })
      .eq('category_id', categoryId)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving parent category style:', error);
    throw error;
  }
};