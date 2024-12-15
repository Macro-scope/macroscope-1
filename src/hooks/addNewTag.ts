import { supabase } from "@/lib/supabaseClient";
import { useSelector } from "react-redux";

const { mapCards, images } = useSelector((state: any) => ({
    mapCards: state.mapCards,
    images: state.images,
}));

const getCanvasSize = () => {
    if (!mapCards?.data?.length && (!images || !Array.isArray(images))) return;

    // Calculate the bounding box of all cards and images
    let maxX = 0;
    let maxY = 0;

    // Update maxX and maxY based on card dimensions and positions
    mapCards.data.forEach((card: any) => {
        maxX = Math.max(maxX, Number(card.position[0]) + Number(card.dimension[0]));
        maxY = Math.max(maxY, Number(card.position[1]) + Number(card.dimension[1]));
    });

    // Update maxX and maxY based on image dimensions and positions
    images.forEach((image: any) => {
        maxX = Math.max(maxX, Number(image.position[0]) + Number(image.dimension[0]));
        maxY = Math.max(maxY, Number(image.position[1]) + Number(image.dimension[1]));
    });

    // Add padding
    const padding = 50;
    maxX += padding;
    maxY += padding;
    return { maxX, maxY };
}

const createCard = async (mapId: string, tagId: string, name: string) => {
    const { maxX, maxY } = getCanvasSize();
    const { data, error } = await supabase
        .from('cards')
        .insert({ map_id: mapId, tag_id: tagId, name: name, position: [maxX, maxY] }) //add location here 

    if (error) {
        throw error
    }

    console.log('Card created successfully:', data)
}

export const addNewTag = async (mapId: string, name: string, color: string) => {
    const { data, error } = await supabase
        .from('tags')
        .insert({ map_id: mapId, name: name, color: color }).select().single()
    if (error) {
        throw error
    }
    else {
        createCard(mapId, data.tag_id, name);
    }

    console.log('Tag created successfully:', data)
}