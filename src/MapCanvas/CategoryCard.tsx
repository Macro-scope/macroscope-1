'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer } from 'antd';
import TileInfoDrawer from './TileInfoDrawer';
import { useParams } from 'next/navigation';
import { setHandTool, setMapSettings } from '@/redux/mapSettingsSlice';
import { setLocalCard, setLocalSettings } from '@/redux/localSettingsSlice';
import { setTileData } from '@/redux/tileSettingsSlice';
import { populateCardLocalSettings } from '@/hooks/populateCardLocalSettings';
import { supabase } from '@/lib/supabaseClient';
import { getMapData } from '@/hooks/getMapData';
import { setCards } from '@/redux/mapCardsSlice';
import debounce from 'lodash/debounce';
import TileImage from './TileImage';
import { Settings2, Maximize2,List,Book } from 'lucide-react';
import Image from 'next/image';
import CategoryDescription from '@/components/ui/description';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

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

  // Add state for preview mode drawer
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [selectedPreviewTileId, setSelectedPreviewTileId] = useState(null);
  const [selectedTileName, setSelectedTileName] = useState('');
  const [enrichedTiles, setEnrichedTiles] = useState([]);

  const openLocalSettings = async () => {
    dispatch(setMapSettings('local'));
    dispatch(setLocalCard(props.cardId));
    const cardSettings = await populateCardLocalSettings(props.cardId);

    dispatch(setLocalSettings({group: {
      name: cardSettings?.name,
      description: cardSettings?.description,
      borderColor: cardSettings?.settings?.group?.borderColor,
      fillColor: cardSettings?.settings?.group?.fillColor,
    }, tile: cardSettings?.settings?.tile,cardId:props.cardId}));
  };

  const showTileSettings = async (tileId: string, name: string) => {
    try {
      const signupButton = document.getElementById('signup-button');
      if (signupButton) {
        signupButton.setAttribute('data-umami-event', name);
        signupButton.click();
      }

      const { data, error } = await supabase
        .from('tiles')
        .select(
          `
          *,
          categories:category_id (
            category_id,
            name,
            color
          )
        `
        )
        .eq('tile_id', tileId)
        .single();

      if (error) throw error;

      const tileData = {
        tile_id: data.tile_id,
        name: data.name,
        url: data.url,
        category: {
          value: data.categories?.category_id,
          label: data.categories?.name || '',
          color: data.categories?.color || '',
        },
        parentCategory: {
          value: data.parent_category_id,
          label: data.parent_category_name,
        },
        description: data.description_markdown,
        descriptionHtml: data.description,
        logo: data.logo,
        tags: data.tags || [],
        last_updated: data.updated_at,
      };

      dispatch(setTileData(tileData));
      dispatch(setMapSettings('tile'));
    } catch (error) {
      console.error('Error fetching tile data:', error);
    }
  };

  // New function to handle tile clicks in both modes
  const handleTileClick = (
    tileId: string,
    name: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (props.isViewer) {
      setSelectedPreviewTileId(tileId);
      setSelectedTileName(name);
      setPreviewDrawerOpen(true);
      dispatch(setMapSettings('none'));
      return;
    }

    if (!props.isDoubleClick) {
      showTileSettings(tileId, name);
    }
    dispatch(setHandTool(false));
  };

  const updateCardSize = async (width: number, height: number) => {
    await supabase
      .from('cards')
      .update({ dimension: [width, height] })
      .eq('card_id', props.cardId)
      .select();

    if (mapId) {
      try {
        const data: any = await getMapData(mapId);
        if (data) {
          dispatch(setCards(data.cards));
        }
      } catch (error) {
        console.error('Fetching error:', error);
      }
    }
  };

  const debouncedResizeStop = useCallback(
    debounce((size: { width: number; height: number }) => {
      if (typeof size.width === 'number' && typeof size.height === 'number') {
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

  useEffect(() => {
    const fetchTilesData = async () => {
      try {
        const tilePromises = props.tiles.map(async (tile) => {
          const { data, error } = await supabase
            .from('tiles')
            .select(
              `
              *,
              categories:category_id (
                name,
                color
              )
            `
            )
            .eq('tile_id', tile.tile_id)
            .single();

          if (error) throw error;
          return { ...tile, ...data };
        });

        const enrichedTilesData = await Promise.all(tilePromises);
        setEnrichedTiles(enrichedTilesData);
      } catch (error) {
        console.error('Error fetching tiles data:', error);
      }
    };

    if (props.tiles?.length > 0) {
      fetchTilesData();
    }
  }, [props.tiles]);
  console.log(props)
  return (
    <>
      <Drawer
        title={null}
        placement="right"
        onClose={() => {
          setPreviewDrawerOpen(false);
          setSelectedPreviewTileId(null);
        }}
        open={previewDrawerOpen && props.isViewer}
        width={600}
        className="preview-drawer"
        styles={{
          body: { padding: 0 },
          header: { display: 'none' },
        }}
      >
        {selectedPreviewTileId && (
          <TileInfoDrawer
            tileId={selectedPreviewTileId}
            onClose={() => {
              setPreviewDrawerOpen(false);
              setSelectedPreviewTileId(null);
            }}
          />
        )}
      </Drawer>

      <div
        ref={resizableRef}
        className="group relative min-w-[200px] h-full"
        onDoubleClick={!props.isViewer ? openLocalSettings : undefined}
        style={{
          borderRadius: `${group.corner}`,
          zIndex: 1000,
          height: '100%',
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
            <button
              onClick={openLocalSettings}
              className="absolute text-slate-500 z-50 right-5 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <List className="text-xl" size={16} />
            </button>
            <button
              onClick={openLocalSettings}
              className="absolute text-slate-500 z-50 right-10 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Book className="text-xl" size={16} />
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

        <div
          className="p-2 relative h-full"
          style={{
            border: `${group.borderWeight} solid ${props.settings.group.borderColor}`,
            background: `${props.settings.group.fillColor}`,
            borderRadius: `${group.corner}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="w-full min-h-[40px] px-5 mt-4 mb-2">
            <CategoryDescription
              description={
                props.description ||
                'This category contains resources related to AI platforms and tools.'
              }
              maxLines={2}
              className="text-sm text-gray-600"
            />
          </div>

          <div
            className={`font-semibold absolute -top-5 text-center text-lg px-2 w-fit ${
              title.alignment === 'center'
                ? 'left-[50%] transform -translate-x-1/2'
                : title.alignment === 'right'
                ? 'right-2'
                : 'left-2'
            }`}
            style={{
              color: `${
                title.fontColor === 'default'
                  ? props.settings.group.borderColor
                  : title.fontColor
              }`,
              borderRadius: `${title.corner}`,
              background: `${
                title.border === 'fill'
                  ? props.settings.group.borderColor
                  : props.settings.group.fillColor
              }`,
              border: `${title.borderWeight} solid ${props.settings.group.borderColor}`,
              fontFamily: title.font || 'Inter',
              fontSize: title.fontSize || '16px',
              fontWeight: title.bold ? 'bold' : 'normal',
              fontStyle: title.italic ? 'italic' : 'normal',
              textDecoration: title.underline ? 'underline' : 'none',
              minWidth: '120px',
            }}
          >
            <div className="w-full h-full flex justify-center items-center">
              <p className="">{props.tagName || 'Default'}</p>
            </div>
          </div>

          <div
            className="flex flex-wrap gap-2 p-5 rounded-md"
            style={{ zIndex: 1000 }}
          >
            {enrichedTiles
              .slice()
              .sort((a: any, b: any) => a.position - b.position)
              .map((tile: any, index) =>
                props.cardId == tile.card_id && !tile.hidden ? (
                  // Only render HoverCard in preview mode
                  props.isViewer ? (
                    <HoverCard key={index} openDelay={0} closeDelay={200}>
                      <HoverCardTrigger>
                        <div
                          onClick={(e) =>
                            handleTileClick(tile.tile_id, tile.name, e)
                          }
                          className="bg-white shadow-lg p-2 gap-2 flex items-center justify-center z-50 w-fit cursor-pointer hover:bg-gray-50 transition-colors"
                          style={{
                            border: `${tileStyle.borderWeight} solid ${props.settings.tile.borderColor}`,
                            background: `${props.settings.tile.fillColor}`,
                            borderRadius: `${tileStyle.corner}`,
                          }}
                        >
                          <div className="h-7 w-7 flex items-center">
                            <TileImage
                              imageUrl={
                                tile.logo ||
                                `https://icons.duckduckgo.com/ip3/www.${tile.url}.ico`
                              }
                            />
                          </div>
                          <p className="m-0 min-h-full">{tile.name}</p>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        align="start"
                        className="w-[300px] p-0 rounded-lg shadow-lg border border-gray-200"
                      >
                        <div className="relative">
                          <div className="p-4">
                            {/* Image at top */}
                            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden  mb-3">
                              <img
                                src={
                                  tile.logo ||
                                  `https://icons.duckduckgo.com/ip3/www.${tile.url}.ico`
                                }
                                alt={tile.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Title with expand button */}
                            <div className=" mb-2">
                              <div className="flex">
                                <h3 className="text-lg font-semibold w-full pr-8">
                                  {tile.name}
                                </h3>
                                <button
                                  onClick={(e) =>
                                    handleTileClick(tile.tile_id, tile.name, e)
                                  }
                                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <Maximize2 className="w-5 h-5 text-gray-500" />
                                </button>
                              </div>
                            </div>

                            {/* Category */}
                            <div className="flex  gap-2 mb-3">
                              {tile.parent_category && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {tile.parent_category}
                                </span>
                              )}
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tile.categories?.name || 'Category'}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                              {tile.description_markdown ||
                                'Description text goes here...'}
                            </p>

                            {/* Meta Tags */}
                            <div className="border-gray-100 pt-1 mt-3">
                              <div className="flex flex-wrap gap-1.5">
                                {tile.tags && tile.tags.length > 0 ? (
                                  tile.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    No tags available
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    // Simple tile without HoverCard for edit mode
                    <div
                      key={index}
                      onClick={(e) =>
                        handleTileClick(tile.tile_id, tile.name, e)
                      }
                      className="bg-white shadow-lg p-2 gap-2 flex items-center justify-center z-50 w-fit cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        border: `${tileStyle.borderWeight} solid ${props.settings.tile.borderColor}`,
                        background: `${props.settings.tile.fillColor}`,
                        borderRadius: `${tileStyle.corner}`,
                      }}
                    >
                      <div className="h-7 w-7 flex items-center">
                        <TileImage
                          imageUrl={
                            tile.logo ||
                            `https://icons.duckduckgo.com/ip3/www.${tile.url}.ico`
                          }
                        />
                      </div>
                      <p className="m-0 min-h-full">{tile.name}</p>
                    </div>
                  )
                ) : null
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResizableNode;
