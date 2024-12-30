"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FiExternalLink, FiX } from "react-icons/fi";
import { LuTag } from "react-icons/lu";
import TileImage from "./TileImage";

type Props = {
  tileId: string;
  onClose?: () => void;
};

type Tile = {
  tile_id: string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  description_markdown?: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
  tags?: string[];
};

const TileInfoDrawer = ({ tileId, onClose }: Props) => {
  const [tile, setTile] = useState<Tile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTileInfo = async (tileId: string) => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("tiles")
          .select(`
            *,
            categories (name, color)
          `)
          .eq("tile_id", tileId)
          .single();

        if (error) throw error;
        setTile(data);
      } catch (error) {
        console.error("Error fetching tile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tileId) {
      getTileInfo(tileId);
    }
  }, [tileId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!tile) {
    return <div className="p-4">No information found</div>;
  }

  return (
    <div className="h-full bg-white relative ">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FiX className="w-5 h-5 text-gray-500" />
      </button>

      {/* Content container */}
      <div className="p-6">
        {/* Logo */}
        <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 mb-3">
          <TileImage
            imageUrl={tile.logo || `https://icons.duckduckgo.com/ip3/www.${tile.url}.ico`}
          />
        </div>

        {/* Name */}
        <h1 className="text-2xl font-medium text-gray-900 mb-4">
          {tile.name}
        </h1>

        {/* Visit website button */}
        <button
          onClick={() => window.open(tile.url, '_blank')}
          className="inline-flex bg-black text-white rounded-md py-2 px-4 items-center justify-center gap-2 hover:bg-gray-800 transition-colors mb-4"
        >
          Visit website <FiExternalLink className="w-4 h-4" />
        </button>

        {/* Category Tag */}
        <div className="mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {tile.categories?.name || "Other"}
          </span>
        </div>

        {/* Description Preview */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-2">
            {tile.description_markdown?.replace(/<[^>]*>/g, '') || "Description text goes here..."}
          </p>
        </div>

        {/* Meta Tags */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <LuTag className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {tile.tags && tile.tags.length > 0 ? (
                tile.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No tags available</span>
              )}
            </div>
          </div>
        </div>

        {/* Full Description with HTML */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div 
            className="prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ 
              __html: tile.description || tile.description_markdown || "" 
            }}
          />
        </div>

        {/* Last Updated */}
        <div className="text-sm text-gray-500">
          Last Updated: {new Date(tile.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default TileInfoDrawer;