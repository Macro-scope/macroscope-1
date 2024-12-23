"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Drawer } from "antd";
import TileInfoDrawer from "./TileInfoDrawer";
import { useParams } from "next/navigation";
import { setHandTool, setMapSettings } from "@/redux/mapSettingsSlice";
import { setLocalCard, setLocalSettings } from "@/redux/localSettingsSlice";
import { setTileData } from "@/redux/tileSettingsSlice"; 
import { populateCardLocalSettings } from "@/hooks/populateCardLocalSettings";
import { supabase } from "@/lib/supabaseClient";
import { getMapData } from "@/hooks/getMapData";
import { setCards } from "@/redux/mapCardsSlice";
import debounce from "lodash/debounce";
import TileImage from "./TileImage";
import { Settings2 } from "lucide-react";
import Image from "next/image";
import CategoryDescription from "@/components/ui/description";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const ResizableNode = (props) => {
  const { title, group, tileStyle } = useSelector((state: any) => ({
    title: state.globalSettings.title,
    group: state.globalSettings.group,
    tileStyle: state.globalSettings.tile,
  }));

  const dispatch = useDispatch();
  const resizableRef = useRef<HTMLDivElement>(null);
  let { id: mapId } = useParams();
  mapId = String(mapId);

  const openLocalSettings = async () => {
    dispatch(setMapSettings("local"));
    dispatch(setLocalCard(props.cardId));
    const cardSettings = await populateCardLocalSettings(props.cardId);
    dispatch(setLocalSettings(cardSettings));
  };

  const showTileSettings = async (tileId: string, name: string) => {
    try {
      const signupButton = document.getElementById("signup-button");
      if (signupButton) {
        signupButton.setAttribute("data-umami-event", name);
        signupButton.click();
      }

      const { data, error } = await supabase
        .from("tiles")
        .select(`*, tags (tag_id, name, color)`)
        .eq("tile_id", tileId)
        .single();

      if (error) throw error;

      const tileData = {
        tile_id: data.tile_id,
        name: data.name,
        url: data.url,
        category: {
          value: data.tag_id,
          label: data.tags?.name || "",
          color: data.tags?.color || "",
        },
        parentCategory: {
          value: data.parent_tag_id,
          label: data.parent_tag_name,
        },
        description: data.description_markdown,
        descriptionHtml: data.description,
        logo: data.logo,
        last_updated: data.updated_at,
      };

      dispatch(setTileData(tileData));
      dispatch(setMapSettings("tile"));

    } catch (error) {
      console.error("Error fetching tile data:", error);
    }
  };

  const updateCardSize = async (width: number, height: number) => {
    await supabase
      .from("cards")
      .update({ dimension: [width, height] })
      .eq("card_id", props.cardId)
      .select();

    if (mapId) {
      try {
        const data: any = await getMapData(mapId);
        if (data) {
          dispatch(setCards(data.cards));
        }
      } catch (error) {
        console.error("Fetching error:", error);
      }
    }
  };

  const debouncedResizeStop = useCallback(
    debounce((size: { width: number; height: number }) => {
      if (typeof size.width === "number" && typeof size.height === "number") {
        if (size.width !== 0 && size.height !== 0) {
          updateCardSize(size.width, size.height);
        }
      }
    }, 2000),
    []
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        debouncedResizeStop({ width, height });

        if (props.handleDynamicSizeChange) {
          props.handleDynamicSizeChange({ width, height }, props.cardId);
        }
      }
    });

    if (resizableRef.current) {
      resizeObserver.observe(resizableRef.current);
    }

    return () => {
      if (resizableRef.current) {
        resizeObserver.unobserve(resizableRef.current);
      }
      debouncedResizeStop.cancel();
    };
  }, [debouncedResizeStop, props]);

  return (
    <>
      {props.isViewer && (
        <Drawer
          title="More info"
          placement="right"
          onClose={() => dispatch(setMapSettings("none"))}
          open={false}
          width={500}
        >
          <TileInfoDrawer tileId={props.tileId} />
        </Drawer>
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
        {!props.isViewer && (
          <>
            <button
              onClick={openLocalSettings}
              className="absolute text-slate-500 z-50 right-0 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Settings2 className="text-xl" size={16} />
            </button>
            <div className="absolute text-slate-500 z-50 right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Image
                className="invert-[0.5] brightness-0"
                src="/drag-handle-corner.svg"
                alt="Drag handle"
                width={24}
                height={24}
                draggable={false}
              />
            </div>
          </>
        )}

        {/* Category Card Content */}
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
          <div className="w-full min-h-[40px] px-5 mt-4 mb-2">
            <CategoryDescription
              description={props.description || "This category contains resources related to AI platforms and tools."}
              maxLines={2}
              className="text-sm text-gray-600"
            />
          </div>

          {/* Category Title */}
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
              fontFamily: title.font || "Inter",
              fontSize: title.fontSize || "16px",
              fontWeight: title.bold ? "bold" : "normal",
              fontStyle: title.italic ? "italic" : "normal",
              textDecoration: title.underline ? "underline" : "none",
              minWidth: "120px",
            }}
          >
            <div className="w-full h-full flex justify-center items-center">
              <p className="">{props.tagName || "Default"}</p>
            </div>
          </div>

          {/* Tiles */}
          <div className="flex flex-wrap gap-2 p-5 rounded-md" style={{ zIndex: 1000 }}>
            {props.tiles
              .slice()
              .sort((a: any, b: any) => a.position - b.position)
              .map((tile: any, index) =>
                props.tagId == tile.tag_id && !tile.hidden ? (
                  <HoverCard key={index} openDelay={0} closeDelay={0}>
                    <HoverCardTrigger>
                      <div
                        onDoubleClick={(e) => {
                          if (props.isDoubleClick) {
                            e.stopPropagation();
                            showTileSettings(tile.tile_id, tile.name);
                            dispatch(setHandTool(false));
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!props.isDoubleClick) {
                            showTileSettings(tile.tile_id, tile.name);
                          }
                          dispatch(setHandTool(false));
                        }}
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
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-80 bg-white rounded-lg shadow-lg p-4"
                      sideOffset={5}
                      align="start"
                    >
                      <div className="absolute -top-2 left-5 w-4 h-4 bg-white rotate-45 transform -translate-x-1/2 border-t border-l border-gray-200" />
                      <div className="relative z-10">
                        <h4 className="text-base font-semibold mb-2">
                          {tile.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {tile.description_markdown ||
                            "Platform for Multi AI Agents System for complex task execution."}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
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