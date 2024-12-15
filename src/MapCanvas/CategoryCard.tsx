"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, DrawerProps } from "antd";
import TileInfoDrawer from "./TileInfoDrawer";
import { Rnd } from "react-rnd";
import { useParams } from "next/navigation";
import { setHandTool, setMapSettings } from "@/redux/mapSettingsSlice";
import { setLocalCard, setLocalSettings } from "@/redux/localSettingsSlice";
import { populateCardLocalSettings } from "@/hooks/populateCardLocalSettings";
import { supabase } from "@/lib/supabaseClient";
import { getMapData } from "@/hooks/getMapData";
import { setCards } from "@/redux/mapCardsSlice";
import debounce from "lodash/debounce";
import TileImage from "./TileImage";
import EditItemForm from "@/components/forms/database-form";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MdSettings } from "react-icons/md";

type Props = {
  tagId: string;
  settings: any;
  tiles: string[];
  tagName: string;
  isViewer?: boolean;
  cardId: string;
  isDoubleClick?: boolean;
  dimension: [number, number];
};

const ResizableNode: React.FC<Props> = (props) => {
  const { title, group, tileStyle, mapCards } = useSelector((state: any) => ({
    title: state.globalSettings.title,
    group: state.globalSettings.group,
    tileStyle: state.globalSettings.tile,
    mapCards: state.mapCards, // Add this line
  }));

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [placement] = useState<DrawerProps["placement"]>("right");
  const [tileId, setTileId] = useState("");
  const resizableRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const mapId = typeof params.id === "string" ? params.id : "";

  // Resize state
  const [size, setSize] = useState({
    width: props.dimension[0],
    height: props.dimension[1],
  });
  const [isResizing, setIsResizing] = useState(false);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const openLocalSettings = async () => {
    dispatch(setMapSettings("local"));
    dispatch(setLocalCard(props.cardId));
    const cardSettings = await populateCardLocalSettings(props.cardId);
    dispatch(setLocalSettings(cardSettings));
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartSize({ width: size.width, height: size.height });
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaWidth = e.clientX - startPosition.x;
      const deltaHeight = e.clientY - startPosition.y;

      // Snap to grid
      const gridSize = 10;
      const newWidth =
        Math.round((startSize.width + deltaWidth) / gridSize) * gridSize;
      const newHeight =
        Math.round((startSize.height + deltaHeight) / gridSize) * gridSize;

      // Minimum size constraints
      const minSize = 200;
      const width = Math.max(minSize, newWidth);
      const height = Math.max(minSize, newHeight);

      setSize({ width, height });
    },
    [isResizing, startPosition, startSize]
  );

  const handleResizeEnd = useCallback(async () => {
    if (!isResizing) return;
    setIsResizing(false);

    try {
      await supabase
        .from("cards")
        .update({ dimension: [size.width, size.height] })
        .eq("card_id", props.cardId);

      if (mapId) {
        const data = await getMapData(mapId);
        if (data) {
          dispatch(setCards(data.cards));
        }
      }
    } catch (error) {
      console.error("Error updating card dimensions:", error);
    }
  }, [isResizing, size, props.cardId, mapId, dispatch]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const showDrawer = async (tileId: string, name: string) => {
    try {
      setTileId(tileId);
      const signupButton = document.getElementById("signup-button");
      if (signupButton) {
        signupButton.setAttribute("data-umami-event", name);
        signupButton.click();
      }

      const { data, error } = await supabase
        .from("tiles")
        .select(
          `
          *,
          tags (
            tag_id,
            name,
            color
          )
        `
        )
        .eq("tile_id", tileId)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        category: {
          value: data.tag_id,
          label: data.tags?.name || "",
          color: data.tags?.color || "",
        },
      };

      setTile(transformedData);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching tile data:", error);
    }
  };

  const onClose = () => {
    setOpen(false);
  };

  const [tile, setTile] = useState<any>();

  useEffect(() => {
    const getTileInfo = async (tileId: string) => {
      const { data } = await supabase
        .from("tiles")
        .select()
        .eq("tile_id", tileId)
        .single();

      setTile(data);
    };

    if (tileId) {
      getTileInfo(tileId);
    }
  }, [tileId]);

  return (
    <>
      {props.isViewer ? (
        <Drawer
          title="More info"
          placement={placement}
          onClose={onClose}
          open={open}
          key={placement}
          width={500}
        >
          <TileInfoDrawer tileId={tileId} />
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={() => setOpen(false)}>
          <SheetContent className="z-[99]" onWheel={(e) => e.stopPropagation()}>
            <EditItemForm
              mapId={mapId}
              data={{
                tile_id: tile?.tile_id || "",
                name: tile?.name || "",
                url: tile?.url || "",
                category: {
                  value: tile?.tag_id || "",
                  label: tile?.tags?.name || "",
                  color: tile?.tags?.color || "",
                },
                description: tile?.description_markdown || "",
                descriptionHtml: tile?.description || "",
                logo: tile?.logo || "",
                last_updated: tile?.updated_at || new Date().toISOString(),
              }}
              onSave={async (updatedData: any) => {
                try {
                  const { data: updatedTile, error: updateError } =
                    await supabase
                      .from("tiles")
                      .update({
                        name: updatedData.name,
                        url: updatedData.url,
                        logo: updatedData.logo,
                        description_markdown: updatedData.description,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("tile_id", tileId)
                      .select()
                      .single();

                  if (updateError) throw updateError;

                  if (updatedData.tag_id) {
                    const { data: existingCard, error: cardError } =
                      await supabase
                        .from("cards")
                        .select("card_id")
                        .eq("tag_id", updatedData.tag_id)
                        .eq("map_id", mapId)
                        .single();

                    let cardId;

                    if (cardError) {
                      const { data: newCard, error: createError } =
                        await supabase
                          .from("cards")
                          .insert({
                            map_id: mapId,
                            tag_id: updatedData.tag_id,
                          })
                          .select("card_id")
                          .single();

                      if (createError) throw createError;
                      cardId = newCard.card_id;
                    } else {
                      cardId = existingCard.card_id;
                    }

                    const { error: tileUpdateError } = await supabase
                      .from("tiles")
                      .update({
                        tag_id: updatedData.tag_id,
                        card_id: cardId,
                      })
                      .eq("tile_id", tileId);

                    if (tileUpdateError) throw tileUpdateError;
                  }

                  if (mapId) {
                    const mapData: any = await getMapData(mapId);
                    if (mapData) {
                      dispatch(setCards(mapData.cards));
                    }
                  }

                  setOpen(false);
                } catch (error) {
                  console.error("Error updating tile:", error);
                }
              }}
              onCancel={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      <Rnd
        enableDragging={false}
        size={{
          width: props.dimension[0],
          height: props.dimension[1],
        }}
        position={{ x: 0, y: 0 }}
        enableResizing={{
          bottom: true,
          bottomLeft: true,
          bottomRight: true,
          left: false,
          right: true,
          top: false,
          topLeft: true,
          topRight: true,
        }}
        resizeHandleStyles={{
          bottom: { display: "none" },
          bottomLeft: { display: "none" },
          bottomRight: { display: "none" },
          left: { display: "none" },
          right: { display: "none" },
          top: { display: "none" },
          topLeft: { display: "none" },
          topRight: { display: "none" },
        }}
        onResizeStop={(_e, _direction, ref, _delta, _position) => {
          const width = parseInt(ref.style.width);
          const height = parseInt(ref.style.height);

          const updatedCards = mapCards?.data?.map((c: any) =>
            c.card_id === props.cardId
              ? {
                  ...c,
                  dimension: [width, height],
                }
              : c
          );
          dispatch(setCards(updatedCards));
        }}
        resizeGrid={[10, 10]}
      >
        <div
          ref={resizableRef}
          className="group relative min-w-[200px] h-full"
          onDoubleClick={openLocalSettings}
          style={{
            borderRadius: `${group.corner}`,
            zIndex: 1000,
            width: `${size.width}px`,
            height: `${size.height}px`,
            position: "relative",
          }}
        >
          {/* Resize handles */}
          {!props.isViewer && (
            <>
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-white border border-gray-300 rounded-bl opacity-0 group-hover:opacity-100"
                onMouseDown={handleResizeStart}
                style={{ zIndex: 1001 }}
              />
              <div
                className="absolute right-0 top-1/2 w-4 h-4 -mt-2 cursor-e-resize bg-white border border-gray-300 rounded-l opacity-0 group-hover:opacity-100"
                onMouseDown={handleResizeStart}
                style={{ zIndex: 1001 }}
              />
              <div
                className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 cursor-s-resize bg-white border border-gray-300 rounded-t opacity-0 group-hover:opacity-100"
                onMouseDown={handleResizeStart}
                style={{ zIndex: 1001 }}
              />
            </>
          )}

          {!props.isViewer && (
            <button
              onClick={openLocalSettings}
              className="absolute text-slate-500 z-50 right-0 -top-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <MdSettings className="text-xl" />
            </button>
          )}
          <div
            className={`p-2 relative h-full w-full`}
            style={{
              border: `${group.borderWeight} solid ${props.settings.group.borderColor}`,
              background: `${props.settings.group.fillColor}`,
              borderRadius: `${group.corner}`,
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className={`font-semibold absolute -top-5 flex justify-center items-center text-center text-lg px-2 ${
                title.alignment === "center"
                  ? "text-center left-[50%] transform -translate-x-1/2"
                  : title.alignment === "right"
                  ? "text-right right-2"
                  : "text-left"
              }`}
              style={{
                color: `${
                  title.fontColor === "default"
                    ? props.settings.group.borderColor
                    : title.fontColor
                }`,
                borderRadius: `${title.corner}`,
                background: `${
                  title.border === "fill"
                    ? props.settings.group.borderColor
                    : props.settings.group.fillColor
                }`,
                border: `${group.borderWeight} solid ${props.settings.group.borderColor}`,
              }}
            >
              <p className="h-fit w-fit">{props.tagName || "Default"}</p>
            </div>
            <div
              className={`flex flex-wrap gap-2 p-5 rounded-md`}
              style={{ zIndex: 1000 }}
            >
              {props.tiles
                .slice()
                .sort((a: any, b: any) => a.position - b.position)
                .map((tile: any, index) =>
                  props.tagId == tile.tag_id && !tile.hidden ? (
                    <div
                      onDoubleClick={(e) => {
                        if (props.isDoubleClick) {
                          e.stopPropagation();
                          showDrawer(tile.tile_id, tile.name);
                          dispatch(setHandTool(false));
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!props.isDoubleClick) {
                          showDrawer(tile.tile_id, tile.name);
                        }
                        dispatch(setHandTool(false));
                      }}
                      key={index}
                      className="bg-white shadow-lg p-2 gap-2 flex items-center justify-center z-50 w-fit cursor-pointer"
                      style={{
                        border: `${tileStyle.borderWeight} solid ${props.settings.tile.borderColor}`,
                        background: `${props.settings.tile.fillColor}`,
                        borderRadius: `${tileStyle.corner}`,
                      }}
                    >
                      <div className="h-7 w-7 flex items-center">
                        <TileImage
                          imageUrl={
                            tile.logo
                              ? tile.logo
                              : `https://icons.duckduckgo.com/ip3/www.${tile.url}.ico`
                          }
                        />
                      </div>
                      <p className="flex justify-center items-center m-0">
                        {tile.name}
                      </p>
                    </div>
                  ) : null
                )}
            </div>
          </div>
          <button id="signup-button"></button>
        </div>
      </Rnd>
    </>
  );
};

export default ResizableNode;
