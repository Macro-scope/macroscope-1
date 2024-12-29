import { supabase } from "@/lib/supabaseClient";

export async function updateMapCards(mapId: string, newCardsData: any) {
  try {
    const updates = newCardsData?.map((card: any) => ({
      map_id: mapId,
      card_id: card.card_id,
      position: card.position,
      category_id: card.category_id,
      dimension: card.dimension,
      settings: card.settings,
      name: card.name,
      hidden: card.hidden,
    }));

    const { data, error } = await supabase.from("cards").upsert(updates, {
      onConflict: "card_id",
    });

    if (error) {
      throw error;
    }

    // console.log('Cards updated successfully:', data)
    return data;
  } catch (error) {
    console.error("Error updating cards:", error);
    throw error;
  }
}
