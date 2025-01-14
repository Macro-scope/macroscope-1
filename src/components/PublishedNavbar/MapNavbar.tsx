"use client"
import { getMapData } from "@/hooks/getMapData";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

export type NavData = {
  title: string | null;
  description: string | null;
  suggestion_form_link: string | null;
  navbar_logo: string | null;
};

const MapNavbar = ({setSelectedTags,selectedTags}:{selectedTags:string[],setSelectedTags?: React.Dispatch<React.SetStateAction<string[]>>}) => {
  const { id: mapId } = useParams();
  const [nav, setNav] = useState<NavData>();
  const [tags, setTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const { data, error } = await supabase
          .from("publish_settings")
          .select("*")
          .eq("map_id", mapId)
          .single();
        if (error) throw error;
        setNav(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    const fetchMap = async () => {
      const data = await getMapData(Array.isArray(mapId) ? mapId[0] : mapId);
      const set = new Set<string>();
      if (data.cards && Array.isArray(data.cards)) {
        data.cards.forEach((card: any) => {
          if (card.tiles && Array.isArray(card.tiles)) {
            card.tiles.forEach((tile: any) => {
              if (tile.tags && Array.isArray(tile.tags)) {
                tile.tags.forEach((tag: any) => {
                  set.add(tag);
                });
              }
            });
          }
        });
        setTags(Array.from(set));
      }
    };

    fetchMap();
    fetchNav();
  }, [mapId]);

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex justify-between items-center bg-white px-2 pb-1">
      <a href="https://macroscope.so">
        <img
          src={nav?.navbar_logo ?? "/logosmallblack.png"}
          alt="logo"
          className="h-10 w-10 rounded-full"
        />
      </a>
      
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-xl font-semibold">{nav?.title}</h1>
        <p className="text-sm">{nav?.description}</p>
      </div>

      <div className="flex items-center gap-2">
        {nav?.suggestion_form_link && (
          <a
            href={`${
              nav?.suggestion_form_link?.startsWith("http")
                ? nav?.suggestion_form_link
                : `https://${nav?.suggestion_form_link}`
            }`}
            target="_blank"
          >
            <p className="text-white text-sm px-3 pb-0.5 h-[35px] w-[80px] flex items-center justify-center bg-black rounded-full">
              Suggest
            </p>
          </a>
        )}

        {/* Custom Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between min-w-[200px] px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 focus:outline-none"
          >
            <div className="flex items-center gap-2 overflow-x-hidden">
              <span className="whitespace-nowrap">
                {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Filter by tags"}
              </span>
              {selectedTags.length > 0 && (
                <div className="flex gap-1">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center px-2 py-0.5 bg-gray-100 rounded-md text-xs"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-10 w-[250px] mt-1 bg-white border rounded-lg shadow-lg">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="max-h-[200px] overflow-y-auto">
                {filteredTags.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No tags found</div>
                ) : (
                  filteredTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span className="text-sm">{tag}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapNavbar;