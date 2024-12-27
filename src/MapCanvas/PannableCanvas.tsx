"use client";
import React, { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import ResizableNode from "./CategoryCard";
import { useDispatch, useSelector } from "react-redux";
import { CiMaximize2 } from "react-icons/ci";
import { LuMinus, LuPlus } from "react-icons/lu";
import { RiExportFill } from "react-icons/ri";
import { getMapData } from "@/hooks/getMapData";
import { setCards } from "@/redux/mapCardsSlice";
import { getGlobalMapStyles } from "@/hooks/getGlobalMapStyles";
import { setGlobalSettings } from "@/redux/globalSettingsSlice";
import { setImages } from "@/redux/imagesSlice";
import { getImages } from "@/hooks/getImages";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { deleteImage } from "@/hooks/deleteImage";
import { IoClose } from "react-icons/io5";
import { useUpdateImagePosition } from "@/hooks/useUpdateImagePosition";
import ParentCategory from "./ParentCategory";
import ParentCategoryLocalSettings from "@/components/MapSettings/ParentLocalSettings";
import Watermark from "@/components/Watermark";

// var CANVAS_WIDTH = 3000;
// var CANVAS_HEIGHT = 2000;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.1;
const ZOOM_BUTTON_STEP = 0.1;
const SCROLLBAR_SIZE = 8;
const SCROLLBAR_THUMB_MIN_SIZE = 16;
// type TypeImage = [{
//   map_id: string;
//   img_id: string;
//   position: string[];
//   dimension: string[];
//   url: string;
// }]

const ImageCard = ({ src, onDelete }: any) => {
  return (
    <div className="group relative rounded-md">
      {/* Border that only shows on hover */}
      <div className="absolute inset-0 border-2 border-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image */}
      <img
        src={src}
        alt="Uploaded content"
        className="w-full h-full object-contain"
        draggable="false"
      />

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute text-slate-500 z-50 right-0 -top-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <IoClose className="text-xl" />
      </button>

      {/* Resize handles that show on hover */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner handles */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Middle handles */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default function PannableCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [parentCategories, setParentCategories] = useState([]);
  const { updateImagePosition } = useUpdateImagePosition();

  // const [canvasWidth, setCanvasWidth] = useState(3000);
  // const [canvasHeight, setCanvasHeight] = useState(3000);

  const { canvasWidth, canvasHeight } = useSelector((state: any) => ({
    canvasWidth: state.canvasSize.width,
    canvasHeight: state.canvasSize.height,
  }));

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
  }, [offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      setIsDragging(true);
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const newOffset = {
      x: Math.min(
        0,
        Math.max(
          e.clientX - startPan.x,
          viewportSize.width - canvasWidth * zoom
        )
      ),
      y: Math.min(
        0,
        Math.max(
          e.clientY - startPan.y,
          viewportSize.height - canvasHeight * zoom
        )
      ),
    };

    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, zoom + (e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED))
    );

    updateZoom(newZoom, mouseX, mouseY);
  };

  const updateZoom = (
    newZoom: number,
    pointX: number = viewportSize.width / 2,
    pointY: number = viewportSize.height / 2
  ) => {
    const newOffset = {
      x: Math.min(
        0,
        Math.max(
          viewportSize.width - canvasWidth * newZoom,
          offset.x + pointX * (zoom - newZoom)
        )
      ),
      y: Math.min(
        0,
        Math.max(
          viewportSize.height - canvasHeight * newZoom,
          offset.y + pointY * (zoom - newZoom)
        )
      ),
    };

    setZoom(newZoom);
    setOffset(newOffset);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_BUTTON_STEP);
    updateZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_BUTTON_STEP);
    updateZoom(newZoom);
  };

  const handleFitContent = () => {
    if (!mapCards?.data?.length) return;

    // Calculate the horizontal bounding box of all cards
    let minX = 0;
    let maxX = 0;

    mapCards.data.forEach((card: any) => {
      minX = Math.min(minX, Number(card.position[0]));
      maxX = Math.max(
        maxX,
        Number(card.position[0]) + Number(card.dimension[0])
      );
    });

    // Add horizontal padding
    const padding = -20;
    minX -= padding;
    maxX += padding;

    // Calculate required zoom based only on width
    const contentWidth = maxX - minX;
    const zoomX = viewportSize.width / contentWidth;

    // Ensure zoom stays within bounds
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomX));

    // Update zoom with focus on x-axis
    updateZoom(newZoom, maxX, 100);
  };

  let { id: mapId } = useParams();
  mapId = String(mapId);
  const {
    mapCards,
    handTool,
    images,
    localSettings,
    localCardId,
    mapSettings,
    globalSettings,
    localParentCategorySettings,
    localParentCategoryId,
  } = useSelector((state: any) => ({
    mapCards: state.mapCards,
    handTool: state.handTool.value,
    images: state.images,
    localSettings: state.localSettings,
    localCardId: state.localCardId.cardId,
    mapSettings: state.mapSettings,
    globalSettings: state.globalSettings,
    localParentCategorySettings: state.localParentCategorySettings,
    localParentCategoryId: state.localParentCategory?.categoryId,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    handleFitContent();
  }, [mapCards]);

  const [currCards, setCurrCards] = useState([]);

  useEffect(() => {
    const getCards = async (mapId: string) => {
      try {
        const data: any = await getMapData(mapId);
        if (data) {
          // Include parent_category_id in the card data
          const cardsWithParentCategories = data.cards.map((card) => ({
            ...card,
            parent_category_id: card.parent_category_id || null,
          }));
          dispatch(setCards(cardsWithParentCategories));
        }
      } catch (error) {
        console.error("Fetching error:", error);
      }
    };

    const setGlobalStyles = async (mapId: string) => {
      const globalStyles: any = await getGlobalMapStyles(mapId);
      dispatch(setGlobalSettings(globalStyles!.settings));
    };

    if (mapId) {
      getCards(mapId);
      console.log("hi");
      setGlobalStyles(mapId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localParentCategorySettings && localParentCategoryId) {
      setParentCategories((prevCategories) => {
        return prevCategories.map((category) => {
          if (category.category_id === localParentCategoryId) {
            // Create a completely new object to ensure React detects the change
            return {
              ...category,
              settings: {
                ...category.settings,
                container: {
                  ...category.settings.container,
                  ...localParentCategorySettings.container,
                },
                title: {
                  ...category.settings.title,
                  ...localParentCategorySettings.title,
                },
              },
            };
          }
          return category;
        });
      });
    }
  }, [localParentCategorySettings, localParentCategoryId]);

  // Deleteing images

  useEffect(() => {
    const refreshParentCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("parent_categories")
          .select("*")
          .eq("map_id", mapId);

        if (error) throw error;

        const processedCategories = (data || []).map((category) => ({
          ...category,
          settings: category.local_settings || {
            container: {
              borderColor: category.color,
              fillColor: "rgba(255, 255, 255, 0.5)",
              borderWeight: "2px",
              corner: "8px",
            },
            title: {
              borderColor: category.color,
              fillColor: "white",
              fontColor: category.color,
              borderWeight: "2px",
              corner: "8px",
              font: "Inter",
              fontSize: "16px",
              alignment: "left",
            },
          },
        }));

        setParentCategories(processedCategories);
      } catch (error) {
        console.error("Error refreshing parent categories:", error);
      }
    };

    if (mapSettings === "none") {
      refreshParentCategories();
    }
  }, [mapSettings, mapId]);

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("parent_categories")
          .select("*")
          .eq("map_id", mapId);

        if (error) throw error;

        // Process each parent category to ensure it has settings
        const processedCategories = (data || []).map((category) => ({
          ...category,
          settings: category.local_settings || {
            container: {
              borderColor: category.color,
              fillColor: "rgba(255, 255, 255, 0.5)",
              borderWeight: "2px",
              corner: "8px",
            },
            title: {
              borderColor: category.color,
              fillColor: "white",
              fontColor: category.color,
              borderWeight: "2px",
              corner: "8px",
              font: "Inter",
              fontSize: "16px",
              alignment: "left",
            },
          },
        }));

        setParentCategories(processedCategories);
        console.log("Parent categories with settings:", processedCategories);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
      }
    };

    fetchParentCategories();
  }, [mapId]);

  const handleDeleteImage = async (imageId: string) => {
    if (!images) return;

    try {
      const isDeleted = await deleteImage(imageId);

      if (isDeleted) {
        const updatedImages = images.filter(
          (image: any) => image.image_id !== imageId
        );
        dispatch(setImages(updatedImages));

        console.log("Image deleted successfully!");
      } else {
        console.log("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  useEffect(() => {
    setCurrCards(mapCards.data);
    console.log("Woahhh ===== ", currCards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCards]);

  useEffect(() => {
    setCurrCards(mapCards.data);
    console.log(currCards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSettings]);

  // image position changes

  useEffect(() => {
    const { updateImagePosition } = useUpdateImagePosition();

    const updateImage = async () => {
      if (!images || !Array.isArray(images)) return;

      console.log("Updating all image positions...");

      // Iterate over each image and update its position in Supabase
      const updatedImagesPromises = images.map(async (image: any) => {
        const success = await updateImagePosition(image.image_id, [
          image.position[0],
          image.position[1],
        ]);

        if (success) {
          console.log(`Position updated for image: ${image.image_id}`);
        } else {
          console.error(
            `Failed to update position for image: ${image.image_id}`
          );
        }

        return image; // Returning the image as is (you can customize if needed)
      });

      // Wait for all updates to complete
      await Promise.all(updatedImagesPromises);

      console.log("All image positions updated in Supabase!");
    };

    if (images) {
      updateImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  useEffect(() => {
    const updateCardSettings = (targetCardId: string) => {
      setCurrCards((prevCards: any) => {
        if (!Array.isArray(prevCards)) return prevCards;

        const updatedCards = prevCards.map((card: any) => {
          if (card.card_id === targetCardId) {
            return {
              ...card,
              settings: {
                group: localSettings.group,
                tile: localSettings.tile,
              },
            };
          }
          return card;
        });
        return updatedCards;
      });
    };

    if (localSettings && localCardId) {
      console.log("Local settings updated:", localSettings);
      updateCardSettings(localCardId);
      console.log("Cards after update:", currCards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSettings, localCardId]);

  // const [images, setImages] = useState<any>();

  useEffect(() => {
    const getImage = async () => {
      const data = await getImages(mapId!);
      console.log("imgaes - ", data);
      dispatch(setImages(data));
      // console.log(images)
    };
    getImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const handleDynamicSizeChange = (
  //   size: { width: 0; height: 0 },
  //   cardId: string
  // ) => {
  //   const updatedCards = mapCards?.data?.map((card: any) =>
  //     cardId === card.card_id
  //       ? {
  //           ...card,
  //           dimension: [size.width, size.height],
  //         }
  //       : card
  //   );
  //   dispatch(setCards(updatedCards));
  // };

  // Add new state for scrollbar interaction
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);

  // Add these helper functions before the return statement
  const getScrollbarDimensions = () => {
    const contentWidth = canvasWidth * zoom;
    const contentHeight = canvasHeight * zoom;

    // Only show scrollbars if content is larger than viewport
    const showHorizontal = contentWidth > viewportSize.width;
    const showVertical = contentHeight > viewportSize.height;

    const horizontalThumbSize = Math.max(
      (viewportSize.width / contentWidth) *
        (viewportSize.width - SCROLLBAR_SIZE),
      SCROLLBAR_THUMB_MIN_SIZE
    );

    const verticalThumbSize = Math.max(
      (viewportSize.height / contentHeight) *
        (viewportSize.height - SCROLLBAR_SIZE),
      SCROLLBAR_THUMB_MIN_SIZE
    );

    const horizontalThumbPosition = showHorizontal
      ? (-offset.x / (contentWidth - viewportSize.width)) *
        (viewportSize.width - horizontalThumbSize - SCROLLBAR_SIZE)
      : 0;

    const verticalThumbPosition = showVertical
      ? (-offset.y / (contentHeight - viewportSize.height)) *
        (viewportSize.height - verticalThumbSize - SCROLLBAR_SIZE)
      : 0;

    return {
      horizontalThumbSize,
      verticalThumbSize,
      horizontalThumbPosition,
      verticalThumbPosition,
      showHorizontal,
      showVertical,
    };
  };

  const handleScrollbarDrag = (e: React.MouseEvent, isHorizontal: boolean) => {
    e.preventDefault(); // Prevent default behavior

    if (isHorizontal) {
      const scrollTrackStart = SCROLLBAR_SIZE;
      const scrollTrackLength = viewportSize.width - SCROLLBAR_SIZE * 2;
      const clickPosition = e.clientX - scrollTrackStart;
      const percentage = Math.max(
        0,
        Math.min(1, clickPosition / scrollTrackLength)
      );
      const newX = -(canvasWidth * zoom - viewportSize.width) * percentage;
      setOffset((prev) => ({ ...prev, x: Math.min(0, newX) }));
    } else {
      const scrollTrackStart = SCROLLBAR_SIZE;
      const scrollTrackLength = viewportSize.height - SCROLLBAR_SIZE * 2;
      const clickPosition = e.clientY - scrollTrackStart;
      const percentage = Math.max(
        0,
        Math.min(1, clickPosition / scrollTrackLength)
      );
      const newY = -(canvasHeight * zoom - viewportSize.height) * percentage;
      setOffset((prev) => ({ ...prev, y: Math.min(0, newY) }));
    }
  };

  // Add to your existing useEffect that handles window events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHorizontal) {
        handleScrollbarDrag(e as any, true);
      }
      if (isDraggingVertical) {
        handleScrollbarDrag(e as any, false);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHorizontal(false);
      setIsDraggingVertical(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingHorizontal, isDraggingVertical]);

  return (
    <div
      className="w-full h-[calc(100vh-56px)] overflow-hidden relative cursor-grab"
      style={{
        backgroundColor: globalSettings?.canvasBackground || "#ffffff",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        id="capture"
        ref={containerRef}
        className="top-0 left-0 absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          width: canvasWidth,
          height: canvasHeight,
          transformOrigin: "0 0",
        }}
      >
        <a
          className="absolute flex justify-center items-center bottom-3 right-3 h-8"
          style={{ zIndex: "2000" }}
          href="https://macroscope.so"
          target="_blank"
        >
          <img src="/branding.svg" alt="Macroscope" className="ml-2 mr-1 h-7" />
        </a>
        <img
          src="/watermark.svg"
          alt="Macroscope"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
          style={{zIndex: 9000}}
          // SVG is black by default, so no filter needed
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        />
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute top-0 left-0"
          style={{
            zIndex: handTool ? 1000 : 1,
            // backgroundColor: globalSettings?.canvasBackground || "#ffffff",
          }}
          id="canvasID"
        />

        {parentCategories.map((category) => {
          const categoryCards = currCards?.filter(
            (card) => card.parent_category_id === category.category_id
          );

          return (
            <ParentCategory
              key={category.category_id}
              id={category.category_id}
              name={category.name}
              childCards={categoryCards}
              initialPosition={{
                x: Number(category.position?.[0] || 0),
                y: Number(category.position?.[1] || 0),
              }}
              initialDimension={{
                width: Number(category.dimension?.[0] || 800),
                height: Number(category.dimension?.[1] || 600),
              }}
              color={category.color}
              mapId={mapId}
              settings={category.settings}
              onUpdate={async (updates) => {
                try {
                  if (updates.settings) {
                    const { error } = await supabase
                      .from("parent_categories")
                      .update({
                        ...updates,
                        local_settings: updates.settings,
                      })
                      .eq("category_id", category.category_id);

                    if (error) throw error;
                  } else {
                    const { error } = await supabase
                      .from("parent_categories")
                      .update(updates)
                      .eq("category_id", category.category_id);

                    if (error) throw error;
                  }

                  setParentCategories((prevCategories) =>
                    prevCategories.map((cat) =>
                      cat.category_id === category.category_id
                        ? { ...cat, ...updates }
                        : cat
                    )
                  );
                } catch (error) {
                  console.error("Error updating parent category:", error);
                }
              }}
            />
          );
        })}

        {currCards?.map((card: any) =>
          card.tiles.length > 0 ? (
            <Rnd
              disableDragging={handTool}
              key={card.card_id}
              default={{
                x: Number(card.position[0]),
                y: Number(card.position[1]),
                width: Number(card.dimension[0]),
                height: Number(card.dimension[1]),
              }}
              size={{
                width: Number(card.dimension[0]),
                height: Number(card.dimension[1]),
              }}
              position={{
                x: Number(card.position[0]),
                y: Number(card.position[1]),
              }}
              enableResizing={{
                bottom: true,
                bottomLeft: true,
                bottomRight: true,
                left: true,
                right: true,
                top: true,
                topLeft: true,
                topRight: true,
              }}
              minHeight={card.tiles.length * 100}
              style={
                handTool
                  ? { zIndex: 1, height: "auto", minHeight: "100%" }
                  : { zIndex: 1000, height: "auto", minHeight: "100%" }
              }
              bounds="parent"
              scale={zoom}
              onDragStop={(_e, d) => {
                const updatedCards = mapCards?.data?.map((c: any) =>
                  c.card_id === card.card_id
                    ? { ...c, position: [d.x, d.y] }
                    : c
                );
                dispatch(setCards(updatedCards));

                // Also update in Supabase to persist position
                supabase
                  .from("cards")
                  .update({ position: [d.x, d.y] })
                  .eq("card_id", card.card_id)
                  .then(({ error }) => {
                    if (error) console.error("Error updating position:", error);
                  });
              }}
              onResizeStop={(_e, _direction, ref, _delta, position) => {
                const updatedCards = mapCards?.data?.map((c: any) =>
                  c.card_id === card.card_id
                    ? {
                        ...c,
                        dimension: [
                          parseInt(ref.style.width),
                          parseInt(ref.style.height),
                        ],
                        position: [position.x, position.y],
                      }
                    : c
                );
                dispatch(setCards(updatedCards));

                // Update dimensions in Supabase
                supabase
                  .from("cards")
                  .update({
                    dimension: [
                      parseInt(ref.style.width),
                      parseInt(ref.style.height),
                    ],
                    position: [position.x, position.y],
                  })
                  .eq("card_id", card.card_id)
                  .then(({ error }) => {
                    if (error)
                      console.error("Error updating dimensions:", error);
                  });
              }}
              resizeGrid={[10, 10]}
              dragGrid={[2, 2]}
              className="mappedCards z-50"
            >
              <ResizableNode
                tagId={card.tag_id}
                settings={card.settings}
                tiles={card.tiles}
                tagName={card.name}
                tagNameLen={card.name.length}
                cardId={card.card_id}
                isDoubleClick={false}
              />
            </Rnd>
          ) : null
        )}
        {images &&
          images?.map((image: any) => (
            <Rnd
              key={image.img_id}
              size={{
                width: Number(image.dimension[0]),
                height: Number(image.dimension[1]),
              }}
              position={{
                x: Number(image.position[0]),
                y: Number(image.position[1]),
              }}
              style={{ zIndex: 1000 }}
              bounds="parent"
              scale={zoom}
              onDragStop={(_e, d) => {
                const updatedImages = images?.map((c: any) =>
                  c.image_id === image.image_id
                    ? { ...c, position: [d.x, d.y] }
                    : c
                );
                dispatch(setImages(updatedImages));
              }}
              onResizeStop={(_e, _direction, ref, _delta, _position) => {
                const updatedImages = images?.map((c: any) =>
                  c.image_id === image.image_id
                    ? {
                        ...c,
                        dimension: [
                          parseInt(ref.style.width),
                          parseInt(ref.style.height),
                        ],
                      }
                    : c
                );
                dispatch(setImages(updatedImages));
              }}
              enableResizing={{
                bottom: true,
                bottomLeft: true,
                bottomRight: true,
                left: true,
                right: true,
                top: true,
                topLeft: true,
                topRight: true,
              }}
              resizeGrid={[10, 10]}
              dragGrid={[10, 10]}
            >
              <ImageCard
                src={image.url}
                onDelete={() => handleDeleteImage(image.image_id)}
              />
            </Rnd>
          ))}
      </div>

      {/* Zoom Controls */}
      <div
        className="absolute bottom-6 left-5 flex gap-2 bg-white rounded-md shadow-lg zoom-controls h-[40px] overflow-hidden"
        style={{ zIndex: 1000 }}
      >
        <button
          onClick={handleFitContent}
          className="hover:bg-gray-100 p-2 transition-colors"
          title="Fit to Content"
        >
          <CiMaximize2 className="w-5 h-5" />
        </button>
        <div className="w-px bg-gray-200" />
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 transition-colors"
          title="Zoom Out"
        >
          <LuMinus />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 transition-colors"
          title="Zoom In"
        >
          <LuPlus />
        </button>
      </div>

      {getScrollbarDimensions().showHorizontal && (
        <div
          className="absolute bottom-0 left-0 right-[8px] bg-secondary/10"
          style={{
            height: SCROLLBAR_SIZE,
            zIndex: 1001,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDraggingHorizontal(true);
            handleScrollbarDrag(e, true);
          }}
        >
          <div
            className="absolute cursor-pointer bg-secondary/50 hover:bg-secondary/70 transition-all duration-200"
            style={{
              width: getScrollbarDimensions().horizontalThumbSize,
              height: SCROLLBAR_SIZE - 4,
              left: getScrollbarDimensions().horizontalThumbPosition,
              top: 2,
              borderRadius: SCROLLBAR_SIZE / 2,
            }}
          />
        </div>
      )}

      {getScrollbarDimensions().showVertical && (
        <div
          className="absolute top-0 right-0 bottom-[8px] bg-secondary/10"
          style={{
            width: SCROLLBAR_SIZE,
            zIndex: 1001,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDraggingVertical(true);
            handleScrollbarDrag(e, false);
          }}
        >
          <div
            className="absolute cursor-pointer bg-secondary/50 hover:bg-secondary/70 transition-all duration-200"
            style={{
              height: getScrollbarDimensions().verticalThumbSize,
              width: SCROLLBAR_SIZE - 4,
              top: getScrollbarDimensions().verticalThumbPosition,
              left: 2,
              borderRadius: SCROLLBAR_SIZE / 2,
            }}
          />
        </div>
      )}
    </div>
  );
}
