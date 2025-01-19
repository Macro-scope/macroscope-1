import { supabase } from "@/lib/supabaseClient";

export const getMapData = async (mapId: string) => {
  try {
    // First get the main map data with cards, categories and tiles
    const { data: mapData, error: mapError } = await supabase
      .from("maps")
      .select(
        `
        *,
        cards!left(
          *,
          tiles(*),
          categories!left(*)
        )
      `
      )
      .eq("map_id", mapId)
      .single();

    // Then get parent categories data
    const { data: parentCategories, error: parentError } = await supabase
      .from("parent_categories")
      .select("*")
      .eq("map_id", mapId);

    if (mapError) {
      console.error("Map error:", mapError);
      return null;
    }

    if (parentError) {
      console.error("Parent categories error:", parentError);
      return null;
    }

    // Combine the data
    return {
      ...mapData,
      parent_categories: parentCategories,
    };
  } catch (error) {
    console.error("Fetching map data error:", error);
    return null;
  }
};
