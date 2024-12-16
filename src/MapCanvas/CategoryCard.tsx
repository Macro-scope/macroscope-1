"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, DrawerProps } from "antd";
import TileInfoDrawer from "./TileInfoDrawer";
import { useParams } from "next/navigation";
import { setHandTool, setMapSettings } from "@/redux/mapSettingsSlice";
import { setLocalCard, setLocalSettings } from "@/redux/localSettingsSlice";
import { populateCardLocalSettings } from "@/hooks/populateCardLocalSettings";
import { supabase } from "@/lib/supabaseClient";
import { getMapData } from "@/hooks/getMapData";
import { setCards } from "@/redux/mapCardsSlice";
import debounce from "lodash/debounce";
import TileImage from "./TileImage";
import TileEditDrawer from "@/MapCanvas/TileEditDrawer";
import EditItemForm from "@/components/forms/database-form";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MdSettings } from "react-icons/md";
import {  Settings2 } from "lucide-react";
import Image from "next/image";

type Props = {
  tagId: string;
  settings: any;
  tiles: string[];
  tagName: string;
  isViewer?: boolean;
  cardId: string;
  handleDynamicSizeChange?: (
    size: { width: number; height: number },
    cardId: string
  ) => void;
  isDoubleClick?: boolean;
};

const ResizableNode: React.FC<Props> = (props) => {
  const { title, group, tileStyle } = useSelector((state: any) => ({
    title: state.globalSettings.title,
    group: state.globalSettings.group,
    tileStyle: state.globalSettings.tile,
  }));

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [placement] = useState<DrawerProps["placement"]>("right");
  const [tileId, setTileId] = useState("");
  const resizableRef = useRef<HTMLDivElement>(null);

  const openLocalSettings = async () => {
    dispatch(setMapSettings("local"));
    dispatch(setLocalCard(props.cardId));
    const cardSettings = await populateCardLocalSettings(props.cardId);
    dispatch(setLocalSettings(cardSettings));
  };

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

      console.log("Fetched tile data:", transformedData);
    } catch (error) {
      console.error("Error fetching tile data:", error);
    }
  };

  const onClose = () => {
    setOpen(false);
  };

  let { id: mapId } = useParams();
  mapId = String(mapId);

  const updateCardSize = async (width: number, height: number) => {
    await supabase
      .from("cards")
      .update({ dimension: [width, height] })
      .eq("card_id", props.cardId)
      .select();

    if (mapId) {
      try {
        const data: any = await getMapData(mapId!);
        if (data) {
          dispatch(setCards(data.cards));
          console.log(data);
        }
      } catch (error) {
        console.error("Fetching error:", error);
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedResizeStop = useCallback(
    debounce((size: { width: number; height: number }) => {
      // console.log("Resize stopped. Final size:", size);

      if (typeof size.width === "number" && typeof size.height === "number")
        if (size.width !== 0 && size.height !== 0)
          updateCardSize(size.width, size.height);
    }, 2000),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        console.log("Div width:", width);
        console.log("Div height:", height);
        debouncedResizeStop({ width, height });

        if (props.handleDynamicSizeChange) {
          props.handleDynamicSizeChange({ width, height }, props.cardId);
        }
      }
    });

    if (resizableRef.current) {
      resizeObserver.observe(resizableRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      if (resizableRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(resizableRef.current);
      }
      debouncedResizeStop.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedResizeStop]);

  const [tile, setTile] = useState<any>();

  useEffect(() => {
    const getTileInfo = async (tileId: string) => {
      const { data } = await supabase
        .from("tiles")
        .select()
        .eq("tile_id", tileId)
        .single();

      setTile(data);
      console.log(data);
    };

    getTileInfo(tileId);
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
        // <Drawer
        //   title="Edit Tile Info"
        //   placement={placement}
        //   closable={false}
        //   onClose={onClose}
        //   closeIcon
        //   open={open}
        //   key={placement}
        //   width={640}
        // >
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
                  // Update the tile data
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

                  // If category (tag) is being changed
                  if (updatedData.tag_id) {
                    // Check if a card already exists for this tag in this map
                    const { data: existingCard, error: cardError } =
                      await supabase
                        .from("cards")
                        .select("card_id")
                        .eq("tag_id", updatedData.tag_id)
                        .eq("map_id", mapId)
                        .single();

                    let cardId;

                    if (cardError) {
                      // Create new card if none exists
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

                    // Update the tile with the new tag_id and card_id
                    const { error: tileUpdateError } = await supabase
                      .from("tiles")
                      .update({
                        tag_id: updatedData.tag_id,
                        card_id: cardId,
                      })
                      .eq("tile_id", tileId);

                    if (tileUpdateError) throw tileUpdateError;
                  }

                  // Refresh map data
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
          {/* <TileEditDrawer tileId={tileId} /> */}
        </Sheet>
        // </Drawer>
      )}
      <div
        ref={resizableRef}
        className="group relative min-w-[200px] h-full"
        onDoubleClick={openLocalSettings}
        style={{
          borderRadius: `${group.corner}`,
          zIndex: 1000,
          height: "100%",
        }}
      >
       {props.isViewer ? (
      <></>
    ) : (
      <>
        <button
      onClick={openLocalSettings}
      className="absolute text-slate-500 z-50 right-0 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
      <Settings2 className="text-xl" />
        </button>
        <div className="absolute text-slate-500 z-50 right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Image className="invert-[0.5] brightness-0"
            src="/drag-handle-corner.svg"
            alt="Drag handle"
            width={42}
            height={42}
            draggable={false}
          />
        </div>
      </>
    )}
        <div
          className="p-2 relative h-full"
          style={{
            border: `${group.borderWeight} solid ${props.settings.group.borderColor}`,
            background: `${props.settings.group.fillColor}`,
            borderRadius: `${group.corner}`,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className={`font-semibold absolute -top-5 text-center text-lg px-2 w-fit ${
              title.alignment === "center"
                ? "left-[50%] transform -translate-x-1/2"
                : title.alignment === "right"
                ? "right-2"
                : "left-2"
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
              border: `${title.borderWeight} solid ${props.settings.group.borderColor}`,
              // Add these new style properties
              fontFamily: title.font || "Inter",
              fontSize: title.fontSize || "16px",
              fontWeight: title.bold ? "bold" : "normal",
              fontStyle: title.italic ? "italic" : "normal",
              textDecoration: title.underline ? "underline" : "none",
            }}
          >
            <div className="w-full h-full flex justify-center items-center">
              <p className="">{props.tagName || "Default"}</p>
            </div>
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
                    <p className="m-0 min-h-full">{tile.name}</p>
                  </div>
                ) : null
              )}
          </div>
        </div>
        <button id="signup-button"></button>
      </div>
    </>
  );
};

export default ResizableNode;
