import { supabase } from "@/lib/supabaseClient";

export const setUserInDatabase = async (userData:any) => {
    try {
        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', userData.id)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError
        }

        if (!existingUser) {
            // Insert new user
            const { data, error } = await supabase
                .from('users')
                .insert({
                    user_id: userData.id,
                    name: userData.user_metadata?.full_name || null,
                    email: userData.email,
                    avatar_url: userData.user_metadata?.avatar_url || null,
                })

            if (error) throw error

            // create a folder in S# bucket
            console.log('New user inserted:', data)
        } else {
            console.log("User already exists")
        }
    }
    catch (error) {
        console.error('Error inserting/updating user data:', error);
    }
}