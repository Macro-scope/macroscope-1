import { createSlice, PayloadAction } from '@reduxjs/toolkit'


export interface ColorSettings {
    borderColor: string;
    fillColor: string;
}
export interface GroupSettings {
    name: string;
    description: string;
    borderColor: string;
    fillColor: string;
}
export interface MapSettings {
    cardId: string;
    group: GroupSettings;
    tile: ColorSettings;
}

const initialState = {
    group: {
        borderColor:null,
        fillColor: null,
        name:null,
        description:null
    },
    tile: {
        borderColor: null,
        fillColor: null
    }
}

export const localSettingsSlice = createSlice({
    name: 'map-local-settings',
    initialState,
    reducers: {
        //set card ID
        // Set all settings at once
        setLocalSettings: (_state, action: PayloadAction<MapSettings>) => {
            return action.payload;
        },
        // Group settings
        setGroupBorderColor: (state, action: PayloadAction<string>) => {
            state.group.borderColor = action.payload;
        },
        setGroupFillColor: (state, action: PayloadAction<string>) => {
            state.group.fillColor = action.payload;
        },
        setGroupColors: (state, action: PayloadAction<GroupSettings>) => {
            state.group = action.payload;
        },
        // Tile settings
        setTileBorderColor: (state, action: PayloadAction<string>) => {
            state.tile.borderColor = action.payload;
        },
        setTileFillColor: (state, action: PayloadAction<string>) => {
            state.tile.fillColor = action.payload;
        },
        setTileColors: (state, action: PayloadAction<ColorSettings>) => {
            state.tile = action.payload;
        },
        // Reset settings
        resetToDefault: () => initialState,
    },
});

export const {
    setLocalSettings,
    setGroupBorderColor,
    setGroupFillColor,
    setGroupColors,
    setTileBorderColor,
    setTileFillColor,
    setTileColors,
    resetToDefault
} = localSettingsSlice.actions;

export const localCardIdSlice = createSlice({
    name: 'local-card',
    initialState: {cardId: ""},
    reducers: {
        setLocalCard: (state, action: PayloadAction<string>) => {
            state.cardId = action.payload;
        }
    },
});

export const { setLocalCard } = localCardIdSlice.actions;