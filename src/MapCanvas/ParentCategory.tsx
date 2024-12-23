"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Settings2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import debounce from "lodash/debounce";

import {
  setLocalParentCategory,
  setParentCategoryLocalSettings,
} from "@/redux/localParentCategorySlice";
import { setMapSettings } from "@/redux/mapSettingsSlice";
import { populateParentCategoryLocalSettings } from "@/hooks/populateParentCategoryLocalSettings";

interface ParentCategoryProps {
  id: string;
  name: string;
  childCards?: any[];
  onUpdate: (updates: any) => Promise<void>;
  initialPosition?: { x: number; y: number };
  initialDimension?: { width: number; height: number };
  mapId: string;
  color?: string;
  settings: any;
}

const ParentCategory: React.FC<ParentCategoryProps> = (props) => {
  const { title, group } = useSelector((state: any) => ({
    title: state.globalSettings.title,
    group: state.globalSettings.group,
  }));
  const dispatch = useDispatch();
  
  useEffect(() => {
    const loadInitialSettings = async () => {
      const settings = await populateParentCategoryLocalSettings(props.id);
      dispatch(setParentCategoryLocalSettings(settings));
    };
    loadInitialSettings();
  }, [props.id, dispatch]);

  const [bounds, setBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  const [dimension, setDimension] = useState(props.initialDimension);
  const [position, setPosition] = useState(props.initialPosition);
  const containerRef = useRef(null);

  const openLocalSettings = async () => {
    dispatch(setMapSettings("parentCategoryLocal"));
    dispatch(setLocalParentCategory(props.id));
    const settings = await populateParentCategoryLocalSettings(props.id);
    dispatch(setParentCategoryLocalSettings(settings));
  };

  const { zoom } = useSelector((state: any) => ({
    zoom: state.mapSettings?.zoom || 1,
  }));

  const localSettings = useSelector((state: any) => 
    state.localParentCategorySettings
  );

  const updateParentCategory = useCallback(
    debounce(async (updates) => {
      try {
        const { error } = await supabase
          .from("parent_categories")
          .update(updates)
          .eq("category_id", props.id);

        if (error) throw error;
        props.onUpdate?.(updates);
      } catch (error) {
        console.error("Error updating parent category:", error);
      }
    }, 500),
    [props.id, props.onUpdate]
  );

  useEffect(() => {
    return () => {
      updateParentCategory.cancel();
    };
  }, [updateParentCategory]);

  useEffect(() => {
    if (!props.childCards?.length) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const categoryChildren = props.childCards.filter(
      (card) => card.parent_category_id === props.id
    );

    categoryChildren.forEach((card) => {
      const cardX = Number(card.position[0]);
      const cardY = Number(card.position[1]);
      const cardWidth = Number(card.dimension[0]);
      const cardHeight = Number(card.dimension[1]);

      minX = Math.min(minX, cardX);
      minY = Math.min(minY, cardY);
      maxX = Math.max(maxX, cardX + cardWidth);
      maxY = Math.max(maxY, cardY + cardHeight);
    });

    setBounds({ minX, minY, maxX, maxY });

    const topPadding = 40;
    const sidePadding = 20;
    const bottomPadding = 20;

    const newWidth = Math.max(maxX - minX + sidePadding * 2, 300);
    const newHeight = Math.max(maxY - minY + topPadding + bottomPadding, 200);

    if (
      dimension.width !== newWidth ||
      dimension.height !== newHeight ||
      position.x !== minX - sidePadding ||
      position.y !== minY - topPadding
    ) {
      setDimension({ width: newWidth, height: newHeight });
      setPosition({ x: minX - sidePadding, y: minY - topPadding });

      updateParentCategory({
        position: [minX - sidePadding, minY - topPadding],
        dimension: [newWidth, newHeight],
      });
    }
  }, [
    props.childCards,
    props.id,
    dimension,
    position,
    updateParentCategory,
    props.settings,
  ]);

  return (
    <Rnd
      disableDragging={true}
      size={dimension}
      position={position}
      scale={zoom}
      bounds="parent"
      minHeight={200}
      style={{ zIndex: 1 }}
      enableResizing={false}
      className="group"
      ref={containerRef}
    >
      <div className="relative h-full min-w-[200px]">
        <button
          className="absolute text-slate-500 z-50 right-0 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={openLocalSettings}
        >
          <Settings2 className="text-xl" size={16} />
        </button>

        <div
          className="pt-2 px-1 pb-1 relative h-full"
          style={{
            border: `${localSettings?.container?.borderWeight || group.borderWeight || "2px"} solid ${
              localSettings?.container?.borderColor 
            }`,
            background: localSettings?.container?.fillColor || "rgba(255, 255, 255, 0.5)",
            borderRadius: `${localSettings?.container?.corner || group.corner || "8px"}`,
            height: "100%",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className={`font-semibold absolute -top-5 text-center text-lg px-2 w-fit ${
              (localSettings?.title?.alignment || title.alignment) === "center"
                ? "left-[50%] transform -translate-x-1/2"
                : (localSettings?.title?.alignment || title.alignment) === "right"
                ? "right-2"
                : "left-2"
            }`}
            style={{
              color: localSettings?.title?.fontColor || (title.fontColor === "default" ),
              borderRadius: localSettings?.title?.corner || title.corner || "8px",
              background: localSettings?.title?.fillColor || "white",
              border: `${localSettings?.title?.borderWeight || title.borderWeight || "2px"} solid ${
                localSettings?.container?.borderColor 
              }`,
              fontFamily: localSettings?.title?.font || title.font || "Inter",
              fontSize: localSettings?.title?.fontSize || title.fontSize || "16px",
              fontWeight: title.bold ? "bold" : "normal",
              fontStyle: title.italic ? "italic" : "normal",
              textDecoration: title.underline ? "underline" : "none",
              minWidth: "120px",
              zIndex: 3,
            }}
          >
            <div className="w-full h-full flex justify-center items-center">
              <p className="m-0">{props.name || "Parent Category"}</p>
            </div>
          </div>
        </div>
      </div>
    </Rnd>
  );
};

export default ParentCategory;