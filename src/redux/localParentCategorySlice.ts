import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ColorSettings {
    borderColor: string;
    fillColor: string;
    borderWeight?: string;
    corner?: string;
    fontColor?: string;
    font?: string;
    fontSize?: string;
    alignment?: string;
}

interface ParentCategorySettings {
    container: ColorSettings;
    title: ColorSettings;
}

const initialState: ParentCategorySettings = {
    container: {
        borderColor: 'black',
        fillColor: 'rgba(255, 255, 255, 0)',
        borderWeight: '2px',
        corner: '8px'
    },
    title: {
        borderColor: '#E2E8F0',
        fillColor: 'white',
        fontColor: '#000000',
        borderWeight: '2px',
        corner: '8px',
        font: 'Inter',
        fontSize: '16px',
        alignment: 'left'
    }
};

export const localParentCategorySettingsSlice = createSlice({
    name: 'localParentCategorySettings',
    initialState,
    reducers: {
        setParentCategoryLocalSettings: (_state, action: PayloadAction<ParentCategorySettings>) => {
            return action.payload;
        },
        setContainerBorderColor: (state, action: PayloadAction<string>) => {
            state.container.borderColor = action.payload;
        },
        setContainerFillColor: (state, action: PayloadAction<string>) => {
            state.container.fillColor = action.payload;
        },
        setTitleBorderColor: (state, action: PayloadAction<string>) => {
            state.title.borderColor = action.payload;
        },
        setTitleFillColor: (state, action: PayloadAction<string>) => {
            state.title.fillColor = action.payload;
        },
        setTitleFontColor: (state, action: PayloadAction<string>) => {
            state.title.fontColor = action.payload;
        },
        resetToDefault: () => initialState,
    },
});

export const localParentCategoryIdSlice = createSlice({
    name: 'localParentCategoryId',
    initialState: { categoryId: null as string | null },
    reducers: {
        setLocalParentCategory: (state, action: PayloadAction<string>) => {
            state.categoryId = action.payload;
        },
        clearLocalParentCategory: (state) => {
            state.categoryId = null;
        }
    },
});

export const {
    setParentCategoryLocalSettings,
    setContainerBorderColor,
    setContainerFillColor,
    setTitleBorderColor,
    setTitleFillColor,
    setTitleFontColor,
    resetToDefault
} = localParentCategorySettingsSlice.actions;

export const { 
    setLocalParentCategory,
    clearLocalParentCategory 
} = localParentCategoryIdSlice.actions;