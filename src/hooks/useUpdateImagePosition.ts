import { supabase } from "@/lib/supabaseClient";

export const useUpdateImagePosition = () => {
  const updateImagePosition = async (
    imageId: string,
    newPosition: [number, number]
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("images") 
        .update({ position: newPosition })
        .eq("image_id", imageId);

      if (error) {
        throw error;
      }

      console.log("Image position updated in Supabase:", data);
      return true; 
    } catch (error) {
      console.error("Error updating image position:", error);
      return false; 
    }
  };

  return { updateImagePosition };
};
   