import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapNavState {
    title: string;
    subtext: string;
    suggest: string;
}

export const publishedMapNavSlice = createSlice({
    name: 'map-nav',
    initialState: {
        title: "",
        subtext: "",
        suggest: ""
    } as MapNavState,
    reducers: {
        setTitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload;
        },
        setSubtext: (state, action: PayloadAction<string>) => {
            state.subtext = action.payload;
        },
        setSuggest: (state, action: PayloadAction<string>) => {
            state.suggest = action.payload;
        },
        // Optional: Add a reducer to update multiple values at once
        setPublishMapSettings: (state, action: PayloadAction<Partial<MapNavState>>) => {
            return { ...state, ...action.payload };
        }
    },
});

// Export actions
export const { 
    setTitle, 
    setSubtext, 
    setSuggest,
    setPublishMapSettings 
} = publishedMapNavSlice.actions;