import { supabase } from "@/lib/supabaseClient";

export const deleteImage = async (imageId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('images') // Assuming 'images' is the table name
      .delete()
      .eq('image_id', imageId); // Assuming 'image_id' is the identifier for images in the table

    if (error) {
      throw error;
    }

    // Optionally handle the result of deletion
    console.log('Image deleted:', data);

    return true; // Return true if the deletion was successful
  } catch (error) {
    console.error('Error deleting image:', error);
    return false; // Return false if there was an error
  }
};
