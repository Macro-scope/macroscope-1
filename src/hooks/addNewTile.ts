import { supabase } from "@/lib/supabaseClient";

export const addNewTile = async (
  cardId: string,
  tagId: string,
  name: string,
  url: string,
  hidden: boolean
) => {
  const { data, error } = await supabase
    .from("tiles")
    .insert({
      card_id: cardId,
      category_id: tagId,
      name: name,
      url: url,
      hidden: hidden,
    })
    .select()
    .single();
  if (error) {
    throw error;
  }

  console.log("Tile created successfully:", data);
};
