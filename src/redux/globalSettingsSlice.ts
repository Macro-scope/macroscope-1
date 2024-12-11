import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for type safety
interface TitleSettings {
    border: string;
    corner: string;
    alignment: string;
    fontColor: string;
}

interface ElementSettings {
    borderWeight: string;
    corner: string;
}

interface StyleSettings {
    title: TitleSettings;
    group: ElementSettings;
    tile: ElementSettings;
}

const initialState: StyleSettings = {
    title: {
        border: 'fill',
        corner: '10px',
        alignment: 'left',
        fontColor: '000000'
    },
    group: {
        borderWeight: '2px',
        corner: '10px'
    },
    tile: {
        borderWeight: '2px',
        corner: '2px'
    }
};

export const globalSettingsSlice = createSlice({
    name: 'style-settings',
    initialState,
    reducers: {
        // Complete settings update
        setGlobalSettings: (_state, action: PayloadAction<any>) => {
            return action.payload;
        },

        // Title settings
        setTitleBorder: (state, action: PayloadAction<string>) => {
            state.title.border = action.payload; //fill no-fill
        },
        setTitleCorner: (state, action: PayloadAction<string>) => {
            state.title.corner = action.payload;
        },
        setTitleAlignment: (state, action: PayloadAction<string>) => {
            state.title.alignment = action.payload;
        },
        setTitleFontColor: (state, action: PayloadAction<string>) => {
            state.title.fontColor = action.payload;
        },
        setTitleSettings: (state, action: PayloadAction<TitleSettings>) => {
            state.title = action.payload;
        },

        // Group settings
        setGroupBorderWeight: (state, action: PayloadAction<string>) => {
            state.group.borderWeight = action.payload;
        },
        setGroupCorner: (state, action: PayloadAction<string>) => {
            state.group.corner = action.payload;
        },
        setGroupSettings: (state, action: PayloadAction<ElementSettings>) => {
            state.group = action.payload;
        },

        // Tile settings
        setTileBorderWeight: (state, action: PayloadAction<string>) => {
            state.tile.borderWeight = action.payload;
        },
        setTileCorner: (state, action: PayloadAction<string>) => {
            state.tile.corner = action.payload;
        },
        setTileSettings: (state, action: PayloadAction<ElementSettings>) => {
            state.tile = action.payload;
        },

        // Global settings
        setAllCorners: (state, action: PayloadAction<string>) => {
            state.title.corner = action.payload;
            state.group.corner = action.payload;
            state.tile.corner = action.payload;
        },
        setAllBorderWeights: (state, action: PayloadAction<string>) => {
            state.group.borderWeight = action.payload;
            state.tile.borderWeight = action.payload;
        },

        // Reset settings
        resetToDefault: () => initialState,
    },
});

// Export actions
export const {
    setGlobalSettings,
    setTitleBorder,
    setTitleCorner,
    setTitleAlignment,
    setTitleFontColor,
    setTitleSettings,
    setGroupBorderWeight,
    setGroupCorner,
    setGroupSettings,
    setTileBorderWeight,
    setTileCorner,
    setTileSettings,
    setAllCorners,
    setAllBorderWeights,
    resetToDefault
} = globalSettingsSlice.actions;