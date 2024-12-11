import { supabase } from "@/lib/supabaseClient"

export const addLogo = async(imageUrl:string) => {
      try {
        // Fetch the image
        const response = await fetch(imageUrl)
        const blob = await response.blob()
  
        // Generate a unique file name
        const fileName = `image_${Date.now()}.${blob.type.split('/')[1]}`
  
        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from('logo-images') // replace with your bucket name
          .upload(fileName, blob)
  
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('logo-images')
          .getPublicUrl(fileName)
  
        return publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }