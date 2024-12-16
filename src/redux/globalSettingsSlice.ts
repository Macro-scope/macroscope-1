import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Update interface for type safety
interface TitleSettings {
    border: string;
    corner: string;
    alignment: string;
    fontColor: string;
    font: string;
    fontSize: string;  // Add this
    bold: boolean;
    italic: boolean;
    underline: boolean;
    borderWeight: string;
}


interface ElementSettings {
    borderWeight: string;
    corner: string;
}


interface StyleSettings {
    title: TitleSettings;
    group: ElementSettings;
    tile: ElementSettings;
    canvasBackground: string;
}

const initialState: StyleSettings = {
    title: {
        border: 'fill',
        corner: '10px',
        alignment: 'left',
        fontColor: '000000',
        font: 'Inter',
        fontSize: '16px',  // Add default font size
        bold: false,
        italic: false,
        underline: false,
        borderWeight: '2px'
    },
    group: {
        borderWeight: '2px',
        corner: '10px'
    },
    tile: {
        borderWeight: '2px',
        corner: '2px'
    },
    canvasBackground: '#ffffff'
};

export const globalSettingsSlice = createSlice({
    name: 'style-settings',
    initialState,
    reducers: {
        // Existing reducers
        setGlobalSettings: (_state, action: PayloadAction<any>) => {
            return action.payload;
        },

        // Title settings
        setTitleBorder: (state, action: PayloadAction<string>) => {
            state.title.border = action.payload;
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

        // New title formatting reducers
        setTitleFont: (state, action: PayloadAction<string>) => {
            state.title.font = action.payload;
        },
        setTitleBold: (state, action: PayloadAction<boolean>) => {
            state.title.bold = action.payload;
        },
        setTitleItalic: (state, action: PayloadAction<boolean>) => {
            state.title.italic = action.payload;
        },
        setTitleUnderline: (state, action: PayloadAction<boolean>) => {
            state.title.underline = action.payload;
        },

        setTitleBorderWeight: (state, action: PayloadAction<string>) => {
            state.title.borderWeight = action.payload;
        },

        setTitleFontSize: (state, action: PayloadAction<string>) => {
            state.title.fontSize = action.payload;
        },

        // Canvas background
        setCanvasBackground: (state, action: PayloadAction<string>) => {
            state.canvasBackground = action.payload;
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
    setTitleFont,
    setTitleBold,
    setTitleItalic,
    setTitleUnderline,
    setTitleBorderWeight, 
    setTitleFontSize,// Add this
    setGroupBorderWeight,
    setGroupCorner,
    setGroupSettings,
    setTileBorderWeight,
    setTileCorner,
    setTileSettings,
    setAllCorners,
    setAllBorderWeights,
    setCanvasBackground,
    resetToDefault
} = globalSettingsSlice.actions;

export default globalSettingsSlice.reducer;