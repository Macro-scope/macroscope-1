"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import styled from "styled-components";

import {
  CompactSelection,
  DataEditor,
  DataEditorProps,
  DataEditorRef,
  GetRowThemeCallback,
  GridCellKind,
  GridColumn,
  GridMouseEventArgs,
  Theme,
} from "@glideapps/glide-data-grid";
import "@glideapps/glide-data-grid/dist/index.css";
import { allCells } from "@/components/test";
import { useResizeDetector } from "react-resize-detector";
import { useTableData } from "@/hooks/use-table-data";
import { useTableColumns } from "@/hooks/use-table-columns";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { addNewTag } from "@/hooks/addNewTag2";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import EditItemForm from "@/components/forms/database-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { debounce } from "lodash";
import DatabaseForm from "@/components/forms/database-form";
import { ImageUpload } from "@/components/database/image-upload";
// import { TiptapEditor } from '@/components/tiptap-editor';

import { FaUndo, FaRedo, FaFileExport, FaSort } from "react-icons/fa";
import { ListX, Redo, Trash2, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";

import { X, ArrowUpDown, ChevronLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import CustomLayout from "@/layout/CustomLayout";
import { addLogo } from "@/hooks/addLogo";
import { TiptapEditor } from "../editor/tiptap-editor";
import { ExportIcon } from "../icons";
import { Loader2 } from "lucide-react"; // Import loading icon
import { useDispatch, useSelector } from "react-redux";
import { getMapData } from "@/hooks/getMapData";
import { setCards } from "@/redux/mapCardsSlice";

const GridWrapper = styled.div`
  height: calc(100vh - 130px);
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: rgba(9, 30, 66, 0.25) 0px 4px 8px -2px,
    rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;
  overflow: hidden;
`;

const getRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#2ECC71",
    "#F1C40F",
    "#E74C3C",
    "#1ABC9C",
    "#9B59B6",
    "#34495E",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getFavicon = async (url: string) => {
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    if (!domain) {
      return null;
    }

    const faviconUrls = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://icon.horse/icon/${domain}`,
      `${urlObj.protocol}//${domain}/favicon.ico`,
    ];

    for (const faviconUrl of faviconUrls) {
      try {
        const response = await fetch(faviconUrl, {
          method: "GET",
          redirect: "follow", // Explicitly follow redirects
        });

        if (response.ok || response.status === 304) {
          // Check if the response actually contains an image
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.startsWith("image/")) {
            //save to db
            const link = await addLogo(faviconUrl);
            if (link) console.error(link);
            return link;
            return faviconUrl;
          }
        }
      } catch (e) {
        console.debug(`Failed to fetch favicon from ${faviconUrl}:`, e);
        continue;
      }
    }
    return null;
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-130px)] w-full">
    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    <p className="mt-2 text-sm text-gray-500">Loading data...</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4 p-4">
    {/* Header skeleton */}
    <div className="flex justify-end items-center mb-6">
      {/* <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" /> */}
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>

    {/* Table skeleton */}
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-10 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />

          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

const DataTable = ({ mapId }: { mapId: string }) => {
  // const { id: mapId } = useParams<{ id: string }>();
  if (!mapId) {
    return <div>No map ID provided</div>;
  }
  // const { mapId } = useParams<{ mapId: string }>(); // Replace with actual map ID
  const {
    data,
    setData,
    loading,
    error,
    addRow,
    updateRow,
    deleteRow,
    reorderRow,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTableData({ mapId });
  const { columns, refreshTags } = useTableColumns(mapId);
  const { ref, width, height } = useResizeDetector();
  const [columnSizes, setColumnSizes] = useState(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.width }), {})
  );
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [lastClickedRow, setLastClickedRow] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    direction: "asc" | "desc" | null;
    originalOrder: number[] | null;
  }>({
    column: null,
    direction: null,
    originalOrder: null,
  });
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
  const [showSortWarning, setShowSortWarning] = useState(false);
  const [pendingSortConfig, setPendingSortConfig] = useState<{
    column: string | null;
    direction: "asc" | "desc" | null | undefined;
  }>({
    column: null,
    direction: null,
  });
  const [pendingReorder, setPendingReorder] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [activeSort, setActiveSort] = useState<{
    column: string | null;
    direction: "asc" | "desc" | null;
  }>({
    column: null,
    direction: null,
  });

  const onColumnResize = useCallback((column: GridColumn, newSize: number) => {
    setColumnSizes((prev) => ({ ...prev, [column.id as string]: newSize }));
  }, []);
  const columnsWithSizes = columns.map((col) => ({
    ...col,
    width: (columnSizes as Record<string, number>)[col.id] ?? col.width,
  }));
  const [hoverRow, setHoverRow] = useState<number | undefined>(undefined);

  const onItemHovered = useCallback((args: GridMouseEventArgs) => {
    const [_, row] = args.location;
    setHoverRow(args.kind !== "cell" ? undefined : row);
  }, []);

  const getRowThemeOverride = useCallback(
    (row: number): Partial<Theme> | undefined => {
      if (searchResults.includes(row)) {
        return {
          bgCell: "#fff9c4",
          bgCellMedium: "#fff59d",
        };
      }
      if (row === hoverRow) {
        return {
          bgCell: "#f7f7f7",
          bgCellMedium: "#f0f0f0",
        };
      }
      return undefined;
    },
    [hoverRow, searchResults]
  );

  useEffect(() => {
    const portalRoot = document.createElement("div");
    portalRoot.id = "portal";
    document.body.appendChild(portalRoot);

    return () => {
      document.body.removeChild(portalRoot);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F for search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (e.key === "Escape" && searchText) {
        setSearchText("");
        setSearchResults([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchText]);

  const getCellContent = React.useCallback(
    ([col, row]: readonly [number, number]) => {
      // console.log('Getting cell content:', { col, row });
      const handleCellClick = () => {
        setLastClickedRow(row);
      };

      const column = columns[col];
      const rowData = data[row];

      if (!rowData) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          data: "",
          displayData: "",
          onClick: handleCellClick,
        };
      }

      const value = rowData[column.id];

      switch (column.type) {
        case "multiselect":
          return {
            kind: GridCellKind.Custom,
            allowOverlay: true,
            copyData: value?.label ?? "",
            data: {
              kind: "multi-select-cell",
              values: value ? [value.label] : [],
              options: column.options?.map((opt: any) => ({
                value: opt.value,
                label: opt.label,
                color: opt.color,
              })),
              allowDuplicates: false,
              allowCreation: true,
              isMulti: false,
            },
            onClick: handleCellClick,
          };

        case "boolean":
          return {
            kind: GridCellKind.Boolean,
            allowOverlay: true,
            data: value ?? false,
            onClick: handleCellClick,
          };

        case "uri":
          return {
            kind: GridCellKind.Uri,
            allowOverlay: true,
            data: value ?? "",
            onClick: handleCellClick,
          };

        case "url":
          return {
            kind: GridCellKind.Uri,
            allowOverlay: true,
            data: value || "",
            onClick: handleCellClick,
          };

        case "image":
          return {
            kind: GridCellKind.Image,
            allowOverlay: false,
            data: value ? [value] : [],
            displayData: value ? [value] : [],
            onClick: () => {
              console.log("Image clicked:", value);
              if (value) {
                setSelectedRow({
                  ...rowData,
                  activeField: "logo",
                  logo: value,
                });
              } else {
                handleCellClick();
              }
            },
            allowAdd: false,
            readonly: true,
            contentAlign: "center",
            theme: {
              cellHeight: 36,
              imagePlaceholder: "🖼️",
              imageHeight: 32,
              padding: 2,
            },
          };

        case "date":
          return {
            kind: GridCellKind.Text,
            allowOverlay: true,
            data: value ? new Date(value).toLocaleString() : "",
            displayData: value ? new Date(value).toLocaleString() : "",
            onClick: handleCellClick,
          };

        case "button":
          return {
            kind: GridCellKind.Custom,
            allowOverlay: true,
            copyData: "",
            readonly: true,
            data: {
              kind: "button-cell",
              backgroundColor: ["#f3f4f6", "#e5e7eb"],
              color: ["#374151", "#1f2937"],
              borderColor: "#d1d5db",
              borderRadius: 6,
              title: "Edit",
              onClick: () => {
                setSelectedRow(rowData);
              },
            },
            onClick: handleCellClick,
          };

        case "article":
          return {
            kind: GridCellKind.Text,
            allowOverlay: true,
            data: value?.markdown ?? "",
            displayData: value?.markdown ?? "",
            onClick: () => {
              setSelectedRow({
                ...rowData,
                activeField: "description",
                description: value,
              });
            },
          };

        default:
          return {
            kind: GridCellKind.Text,
            allowOverlay: true,
            data: value?.toString() ?? "",
            displayData: value?.toString() ?? "",
            onClick: handleCellClick,
          };
      }
    },
    [columns, data]
  );

  const { mapCards, images } = useSelector((state: any) => ({
    mapCards: state.mapCards,
    images: state.images,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    const getCards = async (mapId: string) => {
      try {
        const data: any = await getMapData(mapId);
        if (data) {
          dispatch(setCards(data.cards));
          console.log(data);
        }
      } catch (error) {
        console.error("Fetching error:", error);
      }
    };
    const getdata = async(mapId:string) => {
      const data = await getMapData(mapId);
      console.log(data.cards)
    }

    if (mapId) {
      console.log(mapId)
      getCards(mapId);
      getdata(mapId);
    }
  }, [mapId]);
  

  const getCanvasSize = () => {
    console.log("hi");
    console.log("Pedro Pedro Pedro ---- ",mapCards);
    console.log(images);
    if (!mapCards?.data?.length && (!images || !Array.isArray(images))) return;
    console.log("hey");

    // Calculate the bounding box of all cards and images
    let maxX = 0;
    let maxY = 0;

    //mapCards.data.card.tiles length >0
    const filteredCards = mapCards?.data?.filter((card:any) => {
      return card.tiles && card.tiles.length > 0
      // console.log(card.tiles)
    } 
    );
    console.log(filteredCards)

    // Update maxX and maxY based on card dimensions and positions
    filteredCards.forEach((card: any) => {
      maxX = Math.max(
        maxX,
        Number(card.position[0]) + Number(card.dimension[0])
      );
      maxY = Math.max(
        maxY,
        Number(card.position[1]) + Number(card.dimension[1])
      );
    });

    // Update maxX and maxY based on image dimensions and positions
    images?.forEach((image: any) => {
      maxX = Math.max(
        maxX,
        Number(image.position[0]) + Number(image.dimension[0])
      );
      maxY = Math.max(
        maxY,
        Number(image.position[1]) + Number(image.dimension[1])
      );
    });

    // Add padding
    const padding = 50;
    maxX += padding;
    maxY += padding;
    console.log(maxX, maxY);
    return { maxX, maxY };
  };

  const onCellEdited = React.useCallback(
    async ([col, row]: readonly [number, number], newValue: any) => {
      const column = columns[col];
      const rowData = data[row];

      if (!rowData) return;

      let value = newValue.data;

      if (column.id === "url") {
        try {
          let urlToUse = value;
          if (
            !urlToUse.startsWith("http://") &&
            !urlToUse.startsWith("https://")
          ) {
            urlToUse = "https://" + urlToUse;
            value = urlToUse;
          }

          new URL(urlToUse); // Validate URL format

          const updateData = {
            [column.id]: value,
          };
          console.log("Updating URL:", updateData);
          await updateRow(rowData.id, updateData);
          return;
        } catch (error) {
          console.error("Invalid URL:", error);
          return;
        }
      } else if (column.id === "logo") {
        try {
          const imageUrl = Array.isArray(value) ? value[0] : value;
          if (imageUrl) {
            const response = await fetch(imageUrl);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.startsWith("image/")) {
              throw new Error("Invalid image URL");
            }
          }

          const updateData = {
            logo: imageUrl || "",
          };
          await updateRow(rowData.id, updateData);
          return;
        } catch (error) {
          console.error("Invalid image URL:", error);
          return;
        }
      } else if (
        column.type === "multiselect" &&
        newValue.kind === GridCellKind.Custom
      ) {
        const selectedValue = newValue.data.values[0];

        const existingOption = column.options?.find(
          (opt: any) =>
            opt.value === selectedValue || opt.label === selectedValue
        );

        if (existingOption) {
          try {
            // First, fetch the card that corresponds to this tag
            const { data: cardData, error: cardError } = await supabase
              .from("cards")
              .select("card_id")
              .eq("tag_id", existingOption.value)
              .eq("map_id", mapId)
              .single();

            if (cardError) throw cardError;

            // Update with the correct card_id and tag_id
            const updateData = {
              card_id: cardData.card_id,
              tag_id: existingOption.value,
            };

            await updateRow(rowData.id, updateData);

            // Update local state to reflect the change
            setData((prevData) =>
              prevData.map((item) =>
                item.id === rowData.id
                  ? {
                      ...item,
                      category: {
                        value: cardData.card_id, // Use card_id for the value
                        label: existingOption.label,
                        color: existingOption.color,
                      },
                      card_id: cardData.card_id,
                      tag_id: existingOption.value,
                    }
                  : item
              )
            );
          } catch (error) {
            console.error("Error updating category:", error);
            throw error;
          }
        } else if (selectedValue && newValue.data.allowCreation) {
          try {
            const randomColor = getRandomColor();
            const position = getCanvasSize();
            const pos = [position.maxX, 50];
            const result = await addNewTag(
              mapId,
              selectedValue,
              randomColor,
              pos
            );
            await refreshTags();

            // Get the newly created card
            const { data: cardData, error: cardError } = await supabase
              .from("cards")
              .select("card_id, tags!inner(name, color)")
              .eq("tag_id", result.tag.tag_id)
              .single();

            if (cardError) throw cardError;

            const updateData = {
              card_id: cardData.card_id,
              tag_id: result.tag.tag_id,
            };

            await updateRow(rowData.id, updateData);

            // Update local state to reflect the new category
            setData((prevData) =>
              prevData.map((item) =>
                item.id === rowData.id
                  ? {
                      ...item,
                      category: {
                        value: cardData.card_id,
                        label: selectedValue, // Use the new tag name
                        color: randomColor, // Use the new tag color
                      },
                      card_id: cardData.card_id,
                      tag_id: result.tag.tag_id,
                    }
                  : item
              )
            );
          } catch (error) {
            console.error("Error creating new tag:", error);
            throw error;
          }
        } else {
          // Handle clearing the selection
          const updateData = {
            card_id: null,
            tag_id: null,
          };
          await updateRow(rowData.id, updateData);
        }
        return;
      } else {
        const updateData = {
          [column.id]: value,
        };
        await updateRow(rowData.id, updateData);
      }
    },
    [columns, data, updateRow, mapId, refreshTags, setData]
  );

  const onRowMoved = useCallback(
    async (from: number, to: number) => {
      // If sorting is active, show warning
      if (sortConfig.column) {
        setPendingReorder({ from, to });
        setShowSortWarning(true);
        return;
      }

      // Otherwise proceed with reorder
      await reorderRow(from, to);
    },
    [reorderRow, sortConfig]
  );

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (!text) {
        setSearchResults([]);
        return;
      }

      const results = data.reduce<number[]>((acc, row, index) => {
        const searchable = [
          row.name,
          row.url,
          row.description?.markdown,
          row.category?.label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (searchable.includes(text.toLowerCase())) {
          acc.push(index);
        }
        return acc;
      }, []);

      setSearchResults(results);
    }, 300), // 300ms delay
    [data]
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text); // Update input immediately
      debouncedSearch(text); // Debounce the actual search
    },
    [debouncedSearch]
  );

  const navigateSearch = useCallback(
    (direction: "next" | "prev") => {
      if (searchResults.length === 0) return;

      let newIndex;
      if (direction === "next") {
        newIndex = (currentSearchIndex + 1) % searchResults.length;
      } else {
        newIndex =
          (currentSearchIndex - 1 + searchResults.length) %
          searchResults.length;
      }

      setCurrentSearchIndex(newIndex);
      const rowIndex = searchResults[newIndex];

      // Scroll to the row
      const gridElement = document.querySelector(".dvn-scroller");
      if (gridElement) {
        const rowHeight = 35; // Adjust based on your row height
        gridElement.scrollTop = rowHeight * rowIndex;
      }
    },
    [searchResults, currentSearchIndex]
  );

  const onGridSelectionChange = useCallback((selection: any) => {
    console.log("Grid selection:", selection);
    // Extract selected rows from the selection object
    const selectedRowsArray = selection.rows.items.flat();
    console.log("Selected rows array:", selectedRowsArray);

    // Update selected rows state
    setSelectedRows(new Set(selectedRowsArray));

    // Update lastClickedRow
    if (selectedRowsArray.length > 0) {
      setLastClickedRow(selectedRowsArray[selectedRowsArray.length - 1]);
    } else {
      setLastClickedRow(null);
    }
  }, []);

  const handleDeleteRows = async () => {
    if (selectedRows.size === 0) {
      alert("Please select rows to delete");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedRows.size} item(s)?`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);

      // Delete all selected rows from Supabase
      for (const rowIndex of selectedRows) {
        const rowToDelete = data[rowIndex];
        if (rowToDelete?.id) {
          await deleteRow(rowToDelete.id);
        }
      }

      // Update local state by filtering out deleted rows
      setData((prevData) =>
        prevData.filter((_, index) => !selectedRows.has(index))
      );

      // Clear all selection states
      setSelectedRows(new Set());
      setLastClickedRow(null);

      // Update grid selection state
      // if (gridRef.current) {
      //   gridRef.current.
      //   // gridRef.current.gridSelection = {
      //   //   columns: CompactSelection.empty(),
      //   //   rows: CompactSelection.empty(),
      //   //   current: {
      //   //     cell: [0, 0],
      //   //     range: { x: 0, y: 0, width: 1, height: 1 },
      //   //     rangeStack: []
      //   //   }
      //   // };
      // }
      window.location.reload();
    } catch (error) {
      console.error("Error deleting rows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCsv = useCallback(() => {
    // Convert data to CSV format
    const headers = columns
      .filter((col) => col.type !== "button")
      .map((col) => col.title)
      .join(",");

    const rows = data
      .map((row) => {
        return columns
          .filter((col) => col.type !== "button")
          .map((col) => {
            const value = row[col.id];

            // Handle different types of values
            if (value === null || value === undefined) {
              return "";
            }

            if (col.type === "multiselect" && value?.label) {
              return `"${value.label}"`;
            }

            if (col.type === "article" && value?.markdown) {
              return `"${value.markdown.replace(/"/g, '""')}"`;
            }

            if (typeof value === "object") {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }

            // Escape quotes and wrap in quotes if contains comma
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }

            return value;
          })
          .join(",");
      })
      .join("\n");

    const csv = `${headers}\n${rows}`;

    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "database_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [columns, data]);

  const handleSort = useCallback(
    (columnId: string | null, direction?: "asc" | "desc") => {
      if (!columnId) {
        setSortConfig({
          column: null,
          direction: null,
          originalOrder: null,
        });
        setActiveSort({
          column: null,
          direction: null,
        });
        // Reset data to original order if it exists
        if (sortConfig.originalOrder) {
          const originalData = [...data];
          const sortedData = sortConfig.originalOrder.map(
            (index) => originalData[index]
          );
          setData(sortedData);
        }
        return;
      }

      // If there's been manual reordering, show warning
      if (sortConfig.originalOrder) {
        setShowSortWarning(true);
        return;
      }

      const newDirection =
        direction ||
        (sortConfig.column === columnId && sortConfig.direction === "asc"
          ? "desc"
          : "asc");

      setSortConfig((prevConfig) => ({
        column: columnId,
        direction: newDirection,
        originalOrder:
          prevConfig.originalOrder || data.map((_, index) => index),
      }));

      setActiveSort({
        column: columnId,
        direction: newDirection,
      });

      setData((prevData) => {
        const sortedData = [...prevData].sort((a, b) => {
          const aValue = a[columnId];
          const bValue = b[columnId];

          // Handle special cases
          if (columnId === "category") {
            return (a.category?.label ?? "").localeCompare(
              b.category?.label ?? ""
            );
          }
          if (columnId === "description") {
            return (a.description?.markdown ?? "").localeCompare(
              b.description?.markdown ?? ""
            );
          }

          // Handle null/undefined values
          if (aValue == null) return 1;
          if (bValue == null) return -1;

          // Default string comparison
          return String(aValue).localeCompare(String(bValue));
        });

        return newDirection === "desc" ? sortedData.reverse() : sortedData;
      });
    },
    [sortConfig, data]
  );

  if (loading) {
    return (
      <div className="relative">
        <LoadingSkeleton />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-130px)] w-full">
        <div className="text-red-500 mb-2">Error loading data</div>
        <p className="text-sm text-gray-500">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-black/80"
        >
          Retry
        </button>
      </div>
    );
  }

  const onHeaderMenuClick = (column: any) => {
    console.log("Header menu clicked for column:", column);
  };

  return (
    <div className="h-screen w-full bg-white">
      <div className="h-full w-full p-4 flex flex-col">
        {/* Toolbar */}
        <div className="mb-4 flex justify-end items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              onClick={undo}
              disabled={!canUndo}
              size="sm"
              className={`h-8 rounded-md transition-all duration-200 flex items-center gap-2
                ${
                  canUndo
                    ? "bg-transparent hover:bg-transparent text-gray-700"
                    : "bg-transparent text-gray-400 cursor-not-allowed"
                }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              disabled={!canRedo}
              size="sm"
              className={`h-8 rounded-md transition-all duration-200 flex items-center gap-2 text-sm
                ${
                  canRedo
                    ? "bg-transparent hover:bg-transparent text-gray-700"
                    : "bg-transparent text-gray-400 cursor-not-allowed"
                }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleDeleteRows}
              className={`px-4 h-8 text-sm rounded transition-colors
              ${
                selectedRows.size === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
              disabled={selectedRows.size === 0 || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">Deleting...</span>
              ) : (
                <>
                  <Trash2 />{" "}
                  {selectedRows.size > 0 ? `(${selectedRows.size})` : ""}
                </>
              )}
            </Button>

            <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 bg-transparent hover:bg-transparent text-gray-700 flex items-center gap-2"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  {sortConfig.column
                    ? ` ${
                        columns.find((col) => col.id === sortConfig.column)
                          ?.title
                      }`
                    : ""}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0 bg-white border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between p-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-900">
                    Sort by
                  </span>
                  <button
                    onClick={() => setSortPopoverOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-1.5">
                  <select
                    value={pendingSortConfig.column || ""}
                    onChange={(e) =>
                      setPendingSortConfig((prev) => ({
                        ...prev,
                        column: e.target.value || null,
                        direction: e.target.value
                          ? prev.direction || "asc"
                          : null,
                      }))
                    }
                    className="w-full bg-white text-[13px] text-gray-700 border border-gray-200 rounded-md 
                      px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300"
                  >
                    <option value="">Select a property</option>
                    {columns
                      .filter(
                        (col) => col.type !== "button" && col.type !== "image"
                      )
                      .map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                      ))}
                  </select>

                  {pendingSortConfig.column && (
                    <div className="mt-1.5 flex gap-1">
                      <button
                        onClick={() =>
                          setPendingSortConfig((prev) => ({
                            ...prev,
                            direction: "asc",
                          }))
                        }
                        className={cn(
                          "flex-1 px-2 py-1 text-[13px] rounded border",
                          pendingSortConfig.direction === "asc"
                            ? "bg-gray-100 border-gray-200 text-gray-900 font-medium"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        A → Z
                      </button>
                      <button
                        onClick={() =>
                          setPendingSortConfig((prev) => ({
                            ...prev,
                            direction: "desc",
                          }))
                        }
                        className={cn(
                          "flex-1 px-2 py-1 text-[13px] rounded border",
                          pendingSortConfig.direction === "desc"
                            ? "bg-gray-100 border-gray-200 text-gray-900 font-medium"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        Z → A
                      </button>
                    </div>
                  )}

                  {(activeSort.column || pendingSortConfig.column) && (
                    <button
                      onClick={() => {
                        handleSort(null);
                        setPendingSortConfig({
                          column: null,
                          direction: null,
                        });
                      }}
                      className="w-full mt-1.5 py-1 text-[13px] text-red-600 hover:bg-red-50 
                        rounded border border-transparent hover:border-red-100 transition-colors"
                    >
                      Remove sort
                    </button>
                  )}
                </div>

                <div className="p-1.5 border-t border-gray-100">
                  <Button
                    onClick={() => {
                      handleSort(
                        pendingSortConfig.column!,
                        pendingSortConfig.direction!
                      );
                      setSortPopoverOpen(false);
                    }}
                    className="w-full h-7 text-[13px] bg-black text-white rounded-md hover:bg-black/90"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <AlertDialog
              open={showSortWarning}
              onOpenChange={setShowSortWarning}
            >
              <AlertDialogContent className="bg-white p-4 max-w-[360px] rounded-lg">
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Do you want to remove the sorting?
                </div>
                <AlertDialogDescription className="text-sm text-gray-600 mb-4">
                  Removing the sorting will set the current order of rows as the
                  default.
                </AlertDialogDescription>
                <div className="flex justify-end gap-2">
                  <AlertDialogAction
                    onClick={() => {
                      if (pendingReorder) {
                        setSortConfig({
                          column: null,
                          direction: null,
                          originalOrder: null,
                        });
                        reorderRow(pendingReorder.from, pendingReorder.to);
                        setPendingReorder(null);
                      } else {
                        handleSort(
                          pendingSortConfig.column!,
                          pendingSortConfig.direction as "asc" | "desc"
                        );
                        setSortPopoverOpen(false);
                      }
                      setShowSortWarning(false);
                    }}
                    className="px-4 py-1.5 bg-white text-red-500 hover:bg-red-50 border border-red-500 rounded-md text-sm"
                  >
                    Remove Sorting
                  </AlertDialogAction>
                  <AlertDialogCancel
                    onClick={() => {
                      setShowSortWarning(false);
                      setPendingReorder(null);
                      if (pendingReorder) {
                        setData([...data]);
                      }
                      setPendingSortConfig({
                        column: null,
                        direction: null,
                      });
                    }}
                    className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-md text-sm"
                  >
                    Go Back
                  </AlertDialogCancel>
                </div>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={async () => {
                if (lastClickedRow !== null) {
                  await addRow(lastClickedRow + 1);
                } else {
                  await addRow(0);
                }
              }}
              className="px-4 h-8 text-sm bg-black text-white rounded hover:bg-black/80"
            >
              Add Item
            </Button>
            <div className="relative w-[18rem]">
              <input
                type="search"
                placeholder="Search... (Ctrl+F)"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-1 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {currentSearchIndex + 1}/{searchResults.length}
                  </span>
                  <button
                    onClick={() => navigateSearch("prev")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => navigateSearch("next")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>

            <Button
              onClick={exportToCsv}
              className="p-2 rounded-md h-8 transition-all duration-200 flex items-center gap-2 text-sm
              bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Export to CSV"
            >
              <ExportIcon className="w-4 h-8" />
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <GridWrapper ref={ref}>
            <DataEditor
              onPaste={true}
              width={width ?? 0}
              height={height ?? 0}
              onHeaderMenuClick={onHeaderMenuClick}
              rows={data.length}
              fillHandle={true}
              keybindings={{
                downFill: true,
                rightFill: true,
                copy: true,
                paste: true,
                search: true,
                selectAll: true,
              }}
              getCellsForSelection={true}
              rangeSelect="multi-rect"
              rowSelectionBlending="exclusive"
              columns={columnsWithSizes}
              getCellContent={getCellContent as any}
              onCellEdited={onCellEdited}
              customRenderers={allCells}
              smoothScrollX={true}
              smoothScrollY={true}
              rowMarkers="both"
              isDraggable={true}
              onRowMoved={onRowMoved}
              onColumnResize={onColumnResize}
              onCellClicked={([col, row]) => {
                console.log("Cell clicked:", { col, row });
                if (col === -1) {
                  // Row marker clicked
                  setSelectedRows((prev) => {
                    const newSelection = new Set(prev);
                    if (newSelection.has(row)) {
                      newSelection.delete(row);
                    } else {
                      newSelection.add(row);
                    }
                    console.log("Selected rows:", Array.from(newSelection));
                    return newSelection;
                  });
                  setLastClickedRow(row);
                  return;
                }
                // Check if the click is on a valid cell
                if (
                  col < 0 ||
                  row < 0 ||
                  col >= columns.length ||
                  row >= data.length
                ) {
                  console.log("Click outside valid cell range");
                  return;
                }

                const column = columns[col];
                // Check if column exists
                if (!column) {
                  console.log("No column found for index:", col);
                  return;
                }

                const rowData = data[row];
                // Check if row data exists
                if (!rowData) {
                  console.log("No row data found for index:", row);
                  return;
                }

                console.log("Column:", column);
                console.log("Row data:", rowData);

                // Handle different column types
                if (column.type === "image") {
                  console.log("Image cell clicked, logo value:", rowData?.logo);
                  setSelectedRow({
                    ...rowData,
                    activeField: "logo",
                    logo: rowData.logo,
                  });
                } else if (column.type === "article") {
                  console.log("Description cell clicked");
                  setSelectedRow({
                    ...rowData,
                    activeField: "description",
                    description: rowData.description,
                  });
                }
              }}
              onItemHovered={onItemHovered}
              getRowThemeOverride={getRowThemeOverride}
              rowSelectionMode="multi"
            />
          </GridWrapper>
        </div>
      </div>

      {/* Dialogs and Forms */}
      {selectedRow?.activeField === "logo" ? (
        <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
          <DialogContent className="sm:max-w-[680px] max-h-[80vh] flex flex-col overflow-hidden bg-white">
            <h2 className="text-lg font-medium shrink-0">Add Image</h2>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ImageUpload
                initialImage={selectedRow?.logo}
                initialUrl={selectedRow?.url}
                onImageSelect={async (imageUrl) => {
                  if (selectedRow) {
                    await updateRow(selectedRow.id, { logo: imageUrl });
                    setSelectedRow(null);
                  }
                }}
                onClose={() => setSelectedRow(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : selectedRow?.activeField === "description" ? (
        <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
          <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col bg-white">
            <h2 className="text-lg font-medium mb-4">Edit Description</h2>
            <div className="flex-1 overflow-hidden">
              <TiptapEditor
                initialContent={selectedRow?.description?.html || ""}
                onSave={async (content) => {
                  if (selectedRow) {
                    try {
                      await updateRow(selectedRow.id, {
                        description: {
                          html: content.html,
                          markdown: content.markdown,
                        },
                      });
                      setSelectedRow(null);
                    } catch (error) {
                      console.error("Error saving description:", error);
                    }
                  }
                }}
                onCancel={() => setSelectedRow(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : selectedRow ? (
        <>
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setSelectedRow(null)}
          />
          <div className="fixed right-0 top-0 h-screen w-[360px] bg-white border-l border-gray-200 shadow-lg z-40">
            <DatabaseForm
              mapId={mapId}
              data={{
                tile_id: selectedRow.id,
                name: selectedRow.name,
                url: selectedRow.url,
                category: {
                  value: selectedRow.tag_id || "",
                  label: selectedRow.category?.label || "",
                  color: selectedRow.category?.color || "",
                },
                description: selectedRow.description?.markdown || "",
                descriptionHtml: selectedRow.description?.html || "",
                logo: selectedRow.logo,
                last_updated: selectedRow.last_updated,
              }}
              onSave={async (updatedData: any) => {
                try {
                  if (updatedData.tag_id) {
                    // ... existing tag handling code ...
                  } else {
                    await updateRow(selectedRow.id, updatedData);
                  }
                  setSelectedRow(null);
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                } catch (error) {
                  console.error("Error updating row:", error);
                }
              }}
              onCancel={() => setSelectedRow(null)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DataTable;
