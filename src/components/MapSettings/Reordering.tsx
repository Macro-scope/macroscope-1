import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { Rnd } from "react-rnd";
import { GripVertical, Loader, X } from "lucide-react";
import { RootState } from "@/redux/store";
import { setMapSettings } from "@/redux/mapSettingsSlice";
import { Label } from "../ui/label";
import { setCards } from "@/redux/mapCardsSlice";
import { getMapData } from "@/hooks/getMapData";
import { toast } from "sonner";
import { Sheet, SheetContent } from "../ui/sheet";

interface Tile {
  tile_id: string;
  card_id: string;
  url: string;
  name: string;
  order: number;
  logo?: string;
}

const TILE_HEIGHT = 64;

const Reordering = ({ mapId }: { mapId: string }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [originalTiles, setOriginalTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  const dispatch = useDispatch();
  const { cardId } = useSelector((state: RootState) => ({
    cardId: state.localCardId.cardId,
  }));

  const hasUnsavedChanges =
    JSON.stringify(tiles) !== JSON.stringify(originalTiles);

  const fetchCardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("tiles")
        .select("*")
        .eq("card_id", cardId)
        .order("order", { ascending: true });

      if (error) throw error;

      if (data) {
        const sortedTiles = data.map((tile, index) => ({
          ...tile,
          order: tile.order ?? index,
        }));
        setTiles(sortedTiles);
        setOriginalTiles(sortedTiles);
      }
    } catch (err) {
      console.error("Error fetching tiles:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) {
      fetchCardData();
    }
  }, [cardId]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (id: string, d: { x: number; y: number }) => {
    setIsDragging(false);
    const draggedItemIndex = tiles.findIndex((tile) => tile.tile_id === id);
    const newPosition = Math.round(d.y / TILE_HEIGHT);

    if (newPosition === draggedItemIndex) return;

    // Create a copy of tiles array
    const newTiles = [...tiles];
    const [draggedItem] = newTiles.splice(draggedItemIndex, 1);

    // Calculate the bounded position
    const boundedPosition = Math.max(
      0,
      Math.min(newPosition, tiles.length - 1)
    );

    // Insert the dragged item at the new position
    newTiles.splice(boundedPosition, 0, draggedItem);

    // Update the order of all tiles based on their new positions
    let updatedTiles: Tile[];
    if (boundedPosition < draggedItemIndex) {
      // Moving up: Increment orders of tiles between new and old position
      updatedTiles = newTiles.map((tile, index) => {
        if (index === boundedPosition) {
          // This is our dragged tile
          return { ...tile, order: index };
        } else if (index > boundedPosition && index <= draggedItemIndex) {
          // These tiles need to move down
          return { ...tile, order: index };
        } else {
          // Other tiles keep their current order
          return { ...tile, order: index };
        }
      });
    } else {
      // Moving down: Decrement orders of tiles between old and new position
      updatedTiles = newTiles.map((tile, index) => {
        if (index === boundedPosition) {
          // This is our dragged tile
          return { ...tile, order: index };
        } else if (index >= draggedItemIndex && index < boundedPosition) {
          // These tiles need to move up
          return { ...tile, order: index };
        } else {
          // Other tiles keep their current order
          return { ...tile, order: index };
        }
      });
    }

    setTiles(updatedTiles);
  };

  const updateSingleTile = async (tile: Tile): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("tiles")
        .update({
          order: tile.order,
          card_id: tile.card_id, // Ensure card_id is included
        })
        .eq("tile_id", tile.tile_id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Error updating tile ${tile.tile_id}:`, err);
      return false;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSaveProgress(0);

      let failedUpdates = 0;
      const totalUpdates = tiles.length;

      for (let i = 0; i < tiles.length; i++) {
        const success = await updateSingleTile(tiles[i]);
        if (!success) {
          failedUpdates++;
        }
        setSaveProgress(Math.round(((i + 1) / totalUpdates) * 100));
      }

      if (failedUpdates > 0) {
        throw new Error(`Failed to update ${failedUpdates} tiles`);
      }
      const mapData = await getMapData(mapId);
      if (mapData) {
        dispatch(setCards(mapData.cards));
      }

      setOriginalTiles(tiles);
      dispatch(setMapSettings("none"));
      toast.success("Tiles Reordered");
    } catch (err) {
      console.error("Error saving tile order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSaveProgress(0);
    }
  };

  const handleDiscard = () => {
    setTiles(originalTiles);
    dispatch(setMapSettings("none"));
  };

  if (!cardId) {
    return (
      <div className="p-4 text-center text-gray-500">No card selected</div>
    );
  }

  const mapSettings = useSelector(
    (state: RootState) => state.mapSettings.value
  );

  return (
    <Sheet
      open={mapSettings === "reorder"}
      onOpenChange={() => dispatch(setMapSettings("none"))}
    >
      <SheetContent
        className="w-[360px] shadow-none h-[calc(100vh-60px)] mt-12 pt-0 p-0"
        side="right"
      >
        <div className="px-4 py-2 flex justify-between items-center pb-2 border-b-[1.2px] border-gray-200">
          <div className="text-lg font-medium">Reorder Tiles</div>
          <Button variant="ghost" size="icon" onClick={handleDiscard}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-140px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Loader className="animate-spin h-6 w-6 text-gray-400" />
              {saveProgress > 0 && (
                <div className="text-sm text-gray-500">
                  Saving... {saveProgress}%
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 text-red-500 text-center rounded bg-red-50">
              Error: {error}
            </div>
          )}

          {!loading && !error && tiles.length === 0 && (
            <div className="p-4 text-gray-500 text-center">No tiles found</div>
          )}

          {!loading && !error && tiles.length > 0 && (
            <div
              className="relative w-full transition-all duration-200"
              style={{ height: `${tiles.length * TILE_HEIGHT}px` }}
            >
              {tiles.map((tile: Tile) => (
                <Rnd
                  key={tile.tile_id}
                  position={{
                    x: 0,
                    y: tile.order * TILE_HEIGHT,
                  }}
                  bounds="parent"
                  enableResizing={false}
                  onDragStart={handleDragStart}
                  onDragStop={(e, d) => handleDragStop(tile.tile_id, d)}
                  dragAxis="y"
                  className={`w-full transition-shadow ${
                    isDragging ? "z-50" : "z-0"
                  }`}
                >
                  <div className="flex items-center w-full gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-move transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {tile.logo || tile.url ? (
                      <img
                        className="h-8 w-8 rounded-md object-contain"
                        src={
                          tile.logo ||
                          `https://icons.duckduckgo.com/ip3/www.${tile.url}.ico`
                        }
                        alt={tile.name}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${tile.name}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center">
                        {tile.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">{tile.name}</span>
                  </div>
                </Rnd>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="animate-spin h-4 w-4" />
                {saveProgress > 0 ? `Saving ${saveProgress}%` : "Saving..."}
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDiscard}
            disabled={loading}
          >
            Discard Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Reordering;
