import { supabase } from "@/lib/supabaseClient";
import { getMapData } from "./getMapData";

export const duplicateMap = async (mapId: string) => {
    const existingMap = await getMapData(mapId);

    // Create map
    const { data: newMap } = await supabase
        .from('maps')
        .insert({
            name: `${existingMap.name} - copy`,
            user_id: existingMap.user_id,
            settings: existingMap.settings,
            navbar: existingMap.navbar,
        })
        .select()
        .single();
    console.log("Done creating map", newMap)

    if (newMap) {
        // Create tags
        const tags = existingMap?.tags?.map((tag: any) => ({
            name: tag.name,
            color: tag.color,
            map_id: newMap?.map_id
        }))

        const { data: newTags, error } = await supabase
            .from("tags")
            .upsert(tags)
            .select()

        if (error) console.log("Error - ", error)
        console.log("Done creating tags", tags, newTags)

        if (newTags) {
            // Create cards with correct tag associations
            const cardPromises = existingMap.cards.map(async (existingCard: any) => {
                // Find the original tag for this card
                const originalTag = existingMap.tags.find((tag: any) => tag.tag_id === existingCard.tag_id);
                
                // Find the corresponding new tag with the same name
                const newTag = newTags.find((tag: any) => tag.name === originalTag?.name);

                if (newTag) {
                    const { data: newCard } = await supabase
                        .from("cards")
                        .insert({
                            map_id: newMap?.map_id,
                            tag_id: newTag.tag_id,
                            position: existingCard.position,
                            dimension: existingCard.dimension,
                            hidden: existingCard.hidden,
                            settings: existingCard.settings,
                            name: existingCard.name,
                        })
                        .select()
                        .single()
                    return newCard;
                }
            });

            // Wait for all cards to be created
            const newCards = (await Promise.all(cardPromises)).filter(Boolean);
            console.log("Done creating cards", newCards);

            // Create tiles from each card's tiles array
            const allTiles = existingMap.cards.flatMap((existingCard: any) => {
                // Find the new card that matches this existing card
                const newCard = newCards.find((c: any) => c.name === existingCard.name);
                
                // Map through all tiles in this card
                return existingCard.tiles?.map((tile: any) => ({
                    name: tile.name,
                    url: tile.url,
                    logo: tile.logo,
                    hidden: tile.hidden,
                    position: tile.position,
                    description: tile.description,
                    description_markdown: tile.description_markdown,
                    card_id: newCard?.card_id,
                    tag_id: newCard?.tag_id, // Use the new card's tag_id
                })) || [];
            });

            if (allTiles.length > 0) {
                await supabase
                    .from('tiles')
                    .upsert(allTiles)

                console.log("Done creating all tiles", allTiles)
            }

            console.log("Done creating all")
        }
    }
}

