import { supabase } from "@/lib/supabaseClient";

export const getMapData = async (mapId: string) => {
  try {
    const { data, error } = await supabase
      .from("maps")
      .select(
        `*,
            cards (
                *,
                tiles (*)
            ),
            categories (*)` 
      )
      .eq('map_id', mapId)
      .single();

    if (error)
      console.log(error);

    return data;
  } catch (error) {
    console.error('Fetching map data error:', error);
    // Handle error appropriately
  }
};