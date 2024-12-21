import React, { useEffect, useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Settings2 } from "lucide-react";
import { useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

const ParentCategory = ({
  id,
  name,
  childCards = [],
  onUpdate,
  initialPosition = { x: 0, y: 0 },
  initialDimension = { width: 800, height: 600 },
  mapId,
  color = '#E2E8F0'
}) => {
  const [bounds, setBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  const [dimension, setDimension] = useState(initialDimension);
  const [position, setPosition] = useState(initialPosition);
  const containerRef = useRef(null);
  
  const { zoom, handTool } = useSelector((state: any) => ({
    zoom: state.mapSettings?.zoom || 1,
    handTool: state.handTool?.value
  }));

  const { title, group } = useSelector((state: any) => ({
    title: state.globalSettings?.title || {},
    group: state.globalSettings?.group || {}
  }));
  // Calculate container bounds based on child positions
  useEffect(() => {
    if (!childCards?.length) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const categoryChildren = childCards.filter(card => 
      card.parent_category_id === id
    );

     categoryChildren.forEach(card => {
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
    
    // Add padding around the content
    const padding = 40;
    const newWidth = Math.max(maxX - minX + (padding * 2), 300);
    const newHeight = Math.max(maxY - minY + (padding * 2), 200);
    
    setDimension({ width: newWidth, height: newHeight });
    setPosition({ x: minX - padding, y: minY - padding });

    // Update the parent category in the database
    updateParentCategory({ 
      position: [minX - padding, minY - padding],
      dimension: [newWidth, newHeight]
    });
  }, [childCards, id]);

  const updateParentCategory = async (updates) => {
    try {
      const { error } = await supabase
        .from('parent_categories')
        .update(updates)
        .eq('category_id', id);
        
      if (error) throw error;
      onUpdate?.(updates);
    } catch (error) {
      console.error('Error updating parent category:', error);
    }
  };

  return (
    <Rnd
      disableDragging={handTool}
      size={dimension}
      position={position}
      onDragStop={(_e, d) => {
        const deltaX = d.x - position.x;
        const deltaY = d.y - position.y;
    
        // Update all child cards' positions
        childCards?.forEach(card => {
          if (card.parent_category_id !== id) return;
    
          const newX = Number(card.position[0]) + deltaX;
          const newY = Number(card.position[1]) + deltaY;
          
          supabase
            .from("cards")
            .update({ position: [newX, newY] })
            .eq("card_id", card.card_id)
            .then(({ error }) => {
              if (error) console.error("Error updating card position:", error);
            });
        });
    
        setPosition({ x: d.x, y: d.y });
        updateParentCategory({ position: [d.x, d.y] });
      }}
      onResize={(_e, _direction, ref, _delta, position) => {
        const newSize = {
          width: ref.offsetWidth,
          height: ref.offsetHeight
        };
        setDimension(newSize);
        setPosition(position);
        updateParentCategory({ 
          position: [position.x, position.y],
          dimension: [newSize.width, newSize.height]
        });
      }}
      scale={zoom}
      bounds="parent"
      minHeight={200}
      style={
        handTool
          ? { zIndex: 1 }
          : { zIndex: 2 } // Set lower than child cards but higher than canvas
      }
      dragGrid={[2, 2]}
      resizeGrid={[10, 10]}
      enableResizing={{
        bottom: true,
        bottomLeft: true,
        bottomRight: true,
        left: true,
        right: true,
        top: true,
        topLeft: true,
        topRight: true
      }}
      className="group"
      ref={containerRef}
    >
      <div className="relative h-full min-w-[200px]">
        {/* Settings Button */}
        <button
          className="absolute text-slate-500 z-50 right-0 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={() => {/* Add settings handler */}}
        >
          <Settings2 className="text-xl" size={16} />
        </button>

        {/* Resize Handle */}
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

        {/* Main Container */}
        <div
          className="p-2 relative h-full"
          style={{
            border: `${group.borderWeight || '2px'} solid ${color}`,
            background: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background
            borderRadius: `${group.corner || '8px'}`,
            height: "100%",
            backdropFilter: 'blur(2px)', // Slight blur effect
          }}
        >
          {/* Title */}
          <div
            className={`font-semibold absolute -top-5 text-center text-lg px-2 w-fit ${
              title.alignment === "center"
                ? "left-[50%] transform -translate-x-1/2"
                : title.alignment === "right"
                ? "right-2"
                : "left-2"
            }`}
            style={{
              color: title.fontColor === "default" ? color : title.fontColor,
              borderRadius: title.corner || '8px',
              background: 'white',
              border: `${title.borderWeight || '2px'} solid ${color}`,
              fontFamily: title.font || "Inter",
              fontSize: title.fontSize || "16px",
              fontWeight: title.bold ? "bold" : "normal",
              fontStyle: title.italic ? "italic" : "normal",
              textDecoration: title.underline ? "underline" : "none",
              minWidth: "120px",
              zIndex: 3
            }}
          >
            <div className="w-full h-full flex justify-center items-center">
              <p className="m-0">{name || "Parent Category"}</p>
            </div>
          </div>
        </div>
      </div>
    </Rnd>
  );
};

export default ParentCategory;