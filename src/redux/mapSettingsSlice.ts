import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type MapSettingsType =
  | "none"
  | "local"
  | "global"
  | "parentCategoryLocal"
  | "tile"
  | "reorder"
  | "addTile";

export const mapSettingsSlice = createSlice({
  name: "map-settings",
  initialState: { value: "none" as MapSettingsType },
  reducers: {
    setMapSettings: (state, action: PayloadAction<MapSettingsType>) => {
      state.value = action.payload;
    },
  },
});

export const mapSizeSlice = createSlice({
  name: "map-size",
  initialState: { size: { width: 3000, height: 2000 } },
  reducers: {
    setMapSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.size = action.payload;
    },
  },
});

export const handToolSlice = createSlice({
  name: "hand-tool",
  initialState: { value: false },
  reducers: {
    setHandTool: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
  },
});

// New interface for tile data
interface TileData {
  tile_id: string;
  name: string;
  url: string;
  category: {
    value: string;
    label: string;
    color: string;
  };
  parentCategory: {
    value: string;
    label: string;
  };
  description: string;
  descriptionHtml?: string;
  logo: string;
  last_updated: string;
}

// New slice for edit item form
export const editItemFormSlice = createSlice({
  name: "editItemForm",
  initialState: {
    data: null as TileData | null,
  },
  reducers: {
    setTileData: (state, action: PayloadAction<TileData>) => {
      state.data = action.payload;
    },
    clearTileData: (state) => {
      state.data = null;
    },
  },
});

export const { setMapSettings } = mapSettingsSlice.actions;
export const { setMapSize } = mapSizeSlice.actions;
export const { setHandTool } = handToolSlice.actions;
export const { setTileData, clearTileData } = editItemFormSlice.actions;

// Export reducers
export const mapSettingsReducer = mapSettingsSlice.reducer;
export const mapSizeReducer = mapSizeSlice.reducer;
export const handToolReducer = handToolSlice.reducer;
export const editItemFormReducer = editItemFormSlice.reducer;
