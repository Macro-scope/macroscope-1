// tileSettingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    } | null;
    description: string;
    descriptionHtml?: string;
    logo: string;
    last_updated: string;
}

interface TileSettingsState {
    data: TileData | null;
}

const initialState: TileSettingsState = {
    data: null
};

export const tileSettingsSlice = createSlice({
    name: 'tileSettings',
    initialState,
    reducers: {
        setTileData: (state, action: PayloadAction<TileData>) => {
            state.data = action.payload;
        },
        clearTileData: (state) => {
            state.data = null;
        },
        updateTileField: (state, action: PayloadAction<{ field: keyof TileData; value: any }>) => {
            if (state.data) {
                state.data[action.payload.field] = action.payload.value;
            }
        }
    }
});

export const { setTileData, clearTileData, updateTileField } = tileSettingsSlice.actions;

export default tileSettingsSlice.reducer;