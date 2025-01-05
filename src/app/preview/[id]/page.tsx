'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useDispatch, useSelector } from 'react-redux';
import { CiMaximize2 } from 'react-icons/ci';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MapNavbar from '@/components/PublishedNavbar/MapNavbar';
import ResizableNode from '@/MapCanvas/CategoryCard';
import { getMapData } from '@/hooks/getMapData';
import { setCards } from '@/redux/mapCardsSlice';
import { getGlobalMapStyles } from '@/hooks/getGlobalMapStyles';
import { setGlobalSettings } from '@/redux/globalSettingsSlice';
import { Loader2 } from 'lucide-react';
import { Card } from '@/types/data';

const PADDING = 10; // Padding around the content
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.1;
const ZOOM_BUTTON_STEP = 0.1;
const SCROLLBAR_SIZE = 8;
const SCROLLBAR_THUMB_MIN_SIZE = 16;
const ImageCard = ({ src, onDelete }: any) => {
  return (
    <div>
      <img
        src={src}
        alt="Uploaded content"
        className="w-full h-full object-contain"
        draggable="false"
      />
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        X
      </button>
    </div>
  );
};

export default function PublishedMap() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(3000);
  const [canvasHeight, setCanvasHeight] = useState(3000);
  const [handtool, setHandtool] = useState(true);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const params = useParams();
  const mapId = params.id as string;
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        setLoading(true); // Start loading
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const userId = session.user.id;

        const { data: mapData } = await supabase
          .from('maps')
          .select('user_id')
          .eq('map_id', mapId)
          .single();

        if (mapData && mapData.user_id === userId) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setLoading(false); // End loading
      }
    };

    checkOwnership();
  }, [mapId, router]);

  useEffect(() => {
    const getMapId = async () => {
      try {
        const { data } = await supabase
          .from('maps')
          .select('name')
          .eq('map_id', mapId)
          .single();

        if (!data) {
          setIsPublished(false);
          return;
        }

        const { data: publishInfo } = await supabase
          .from('maps')
          .select('is_published')
          .eq('map_id', mapId)
          .single();

        setIsPublished(publishInfo?.is_published ?? false);
      } catch (error) {
        console.error('Error fetching map data:', error);
        setIsPublished(false);
      }
    };

    getMapId();
  }, [mapId]);

  const { mapCards } = useSelector((state: any) => ({
    mapCards: state.mapCards,
  }));

  useEffect(() => {
    const getCards = async (mapId: string) => {
      try {
        const data: any = await getMapData(mapId);
        if (data) {
          dispatch(setCards(data.cards));
          console.log(data);
          updateCanvasSize(data.cards);
        }
      } catch (error) {
        console.error('Fetching error:', error);
      }
    };

    const setGlobalStyles = async (mapId: string) => {
      const globalStyles: any = await getGlobalMapStyles(mapId);
      dispatch(setGlobalSettings(globalStyles!.settings));
    };

    if (mapId) {
      getCards(mapId);
      setGlobalStyles(mapId);
    }
  }, [mapId, dispatch]);

  const updateCanvasSize = (cards: any[]) => {
    console.log('Iam here');
    if (cards.length === 0) return;
    console.log('Iam here');

    // Calculate the bounding box of all cards
    let maxX = 0;
    let maxY = 0;

    cards.forEach((card: any) => {
      maxX = Math.max(
        maxX,
        Number(card.position[0]) + Number(card.dimension[0])
      );
      maxY = Math.max(
        maxY,
        Number(card.position[1]) + Number(card.dimension[1])
      );
    });

    // Add padding
    const padding = 50;
    maxX += padding;
    maxY += padding;

    // Get the element to capture (with updated size)
    const element = document.getElementById('viewMap'); // Select the div
    if (!element) return;

    // Set the element's size to the calculated dimensions
    element.style.width = `${maxX}px`;
    element.style.height = `${maxY}px`;

    setCanvasHeight(maxY);
    setCanvasWidth(maxX);
  };

  const [images, setImages] = useState<
    Array<{
      id: string;
      src: string;
      position: [number, number];
      dimension: [number, number];
    }>
  >([]);



  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#e0e0e0';
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

    // Calculate the bounding box of all cards
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    mapCards.data.forEach((card: any) => {
      minX = Math.min(minX, Number(card.position[0]));
      minY = Math.min(minY, Number(card.position[1]));
      maxX = Math.max(
        maxX,
        Number(card.position[0]) + Number(card.dimension[0])
      );
      maxY = Math.max(
        maxY,
        Number(card.position[1]) + Number(card.dimension[1])
      );
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Calculate required zoom
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const zoomX = viewportSize.width / contentWidth;
    const zoomY = viewportSize.height / contentHeight;
    const newZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, Math.min(zoomX, zoomY))
    );

    // Calculate center position
    // const centerX = (minX + maxX) / 2;
    // const centerY = (minY + maxY) / 2;

    // Update zoom and offset to center content
    updateZoom(newZoom, maxX, maxY);
    // setOffset({
    //   x: viewportSize.width / 2 - centerX * newZoom,
    //   y: viewportSize.height / 2 - centerY * newZoom,
    // });
  };

  const { handTool, localSettings, localCardId, mapSettings } = useSelector(
    (state: any) => ({
      mapCards: state.mapCards,
      handTool: state.handTool.value,
      images: state.images,
      localSettings: state.localSettings,
      localCardId: state.localCardId.cardId,
      mapSettings: state.mapSettings,
    })
  );

  const [currCards, setCurrCards] = useState<Card[]>([]);

  useEffect(() => {
    const getCards = async (mapId: string) => {
      try {
        const data: any = await getMapData(mapId);
        if (data) {
          dispatch(setCards(data.cards));
          console.log(data);
        }
      } catch (error) {
        console.error('Fetching error:', error);
      }
    };

    const setGlobalStyles = async (mapId: string) => {
      const globalStyles: any = await getGlobalMapStyles(mapId);
      dispatch(setGlobalSettings(globalStyles!.settings));
    };

    if (mapId) {
      getCards(mapId);
      console.log('hi');
      setGlobalStyles(mapId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrCards(mapCards.data);
    console.log('Woahhh ===== ', currCards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCards]);

  useEffect(() => {
    setCurrCards(mapCards.data);
    console.log(currCards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSettings]);

  useEffect(() => {
    const updateCardSettings = (targetCardId: string) => {
      setCurrCards((prevCards: any) => {
        if (!Array.isArray(prevCards)) return prevCards;
        // Ensure deep cloning
        console.log('ok here');
        const updatedCards = prevCards.map((card: Card) => {
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

    updateCardSettings(localCardId);
    console.log('Here ---- ', currCards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSettings]);

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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHorizontal, isDraggingVertical]);

  // Loader component
  const Loader = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="h-4 w-4 animate-spin">
        <Loader2 />
      </div>{' '}
      {/* You can style this loader as needed */}
    </div>
  );

  return (
    <div>
     {currCards && (
        <MapNavbar
        />
      )}

      {/* <Watermark /> */}
      {loading ? ( // Show loader while checking ownership
        <Loader />
      ) : isOwner ? (
        <div>
          <div
            className="w-full h-[calc(100vh-65px)] overflow-hidden bg-gray-100 relative cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              id="viewMap"
              ref={containerRef}
              className="top-0 left-0 absolute"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                width: canvasWidth,
                height: canvasHeight,
                transformOrigin: '0 0',
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="absolute top-0 left-0"
                style={{ zIndex: 1 }}
                id="canvasID"
              />
              {currCards?.map((card: any) =>
                card.tiles.length > 0 ? (
                  <Rnd
                    disableDragging={true}
                    enableResizing={false}
                    key={card.card_id}
                    size={{
                      width: card.dimension[0] as number,
                      height: card.dimension[1] as number,
                    }}
                    position={{
                      x: card.position[0],
                      y: card.position[1],
                    }}
                    style={{ zIndex: 1000 }}
                    bounds="parent"
                    scale={zoom}
                    className="mappedCards z-50"
                  >
                    <ResizableNode
                      tagId={card.category_id}
                      settings={card.settings}
                      tiles={card.tiles}
                      tagName={card.name}
                      cardId={card.card_id}
                      isViewer={true}
                      isDoubleClick={false}
                      // handleDynamicSizeChange={handleDynamicSizeChange}
                    />
                  </Rnd>
                ) : (
                  <></>
                )
              )}
              {images &&
                images?.map((image: any) => (
                  <Rnd
                    key={image.img_id}
                    // default={{
                    //   x: Number(image.position[0]),
                    //   y: Number(image.position[1]),
                    //   width: image.dimension[0],
                    //   height: image.dimension[1],
                    // }}
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
                  >
                    <ImageCard
                      src={image.url}
                      // onDelete={() => handleDeleteImage(image.id)}
                    />
                  </Rnd>
                ))}
            </div>

            {/* Zoom Controls */}
            <div
              className="absolute bottom-6 left-5 flex gap-2 bg-white rounded-md shadow-lg zoom-controls h-[40px]"
              style={{ zIndex: 2000 }}
            >
              <button
                onClick={handleFitContent}
                className="hover:bg-gray-200 p-2"
                title="Fit to Content"
              >
                <CiMaximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-200"
                title="Zoom Out"
              >
                {/* <BsZoomOut className="w-5 h-5" /> */}
                <LuMinus />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-200"
                title="Zoom In"
              >
                <LuPlus />
                {/* <BsZoomIn className="w-5 h-5" /> */}
              </button>
            </div>

            <a
              className="flex justify-center items-center absolute bottom-3 right-3 h-8"
              style={{ zIndex: '2000' }}
              href="https://macroscope.so"
              target="_blank"
            >
              {/* Made with{" "} */}
              <img
                src="/branding.svg"
                alt="Macroscope"
                className="ml-2 mr-1 h-7"
              />
              {/* <span className="font-semibold">Macroscope</span> */}
            </a>

            {/* Horizontal Scrollbar */}
            {getScrollbarDimensions().showHorizontal && (
              <div
                className="absolute bottom-0 left-0 right-[8px] bg-gray-200"
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
                  className="absolute bg-gray-400 rounded cursor-pointer hover:bg-gray-500 transition-colors"
                  style={{
                    width: getScrollbarDimensions().horizontalThumbSize,
                    height: SCROLLBAR_SIZE - 2,
                    left: getScrollbarDimensions().horizontalThumbPosition,
                    top: 1,
                  }}
                />
              </div>
            )}

            {/* Vertical Scrollbar */}
            {getScrollbarDimensions().showVertical && (
              <div
                className="absolute top-0 right-0 bottom-[8px] bg-gray-200"
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
                  className="absolute bg-gray-400 rounded cursor-pointer hover:bg-gray-500 transition-colors"
                  style={{
                    height: getScrollbarDimensions().verticalThumbSize,
                    width: SCROLLBAR_SIZE - 2,
                    top: getScrollbarDimensions().verticalThumbPosition,
                    left: 1,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center mt-10">
          <h2>You do not have permission to view this map.</h2>
        </div>
      )}
    </div>
  );
}
