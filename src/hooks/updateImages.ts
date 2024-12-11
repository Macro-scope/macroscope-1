import { supabase } from "@/lib/supabaseClient";

export async function updateImages(mapId:string, images: any) {
    try {
      const updates = images?.map((img:any) => ({
        map_id: mapId,
        image_id: img.image_id,
        position: img.position,
        dimension: img.dimension,
      }))
  
      const { data, error } = await supabase
      .from('images')
      .upsert(updates, {
        onConflict: 'image_id'
      });
  
      if (error) {
        throw error
      }
  
      console.log('Images updated successfully:', data)
      return data
    } catch (error) {
      console.error('Error updating images:', error)
      throw error
    }
  }