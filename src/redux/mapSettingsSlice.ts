import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type MapSettingsType = 'none' | 'local' | 'global' | 'parentCategoryLocal';

export const mapSettingsSlice = createSlice({
    name: 'map-settings',
    initialState: { value: "none" as MapSettingsType },
    reducers: {
        setMapSettings: (state, action: PayloadAction<MapSettingsType>) => {
            state.value = action.payload;
        }
    },
});

export const mapSizeSlice = createSlice({
    name: 'map-size',
    initialState: { size: { width: 3000, height: 2000 } }, 
    reducers: {
        setMapSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
            state.size = action.payload;
        }
    },
});

export const handToolSlice = createSlice({
    name: 'hand-tool',
    initialState: { value: false },
    reducers: {
        setHandTool: (state, action: PayloadAction<boolean>) => {
            state.value = action.payload;
        }
    },
});

export const { setMapSettings } = mapSettingsSlice.actions;
export const { setMapSize } = mapSizeSlice.actions;
export const { setHandTool } = handToolSlice.actions;