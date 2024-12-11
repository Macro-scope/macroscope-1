import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const imagesSlice = createSlice({
    name: 'map-images',
    initialState: null,
    reducers: {
        setImages: (_state, action: PayloadAction<any>) => {
            return action.payload;
        }
    },
});

export const { setImages } = imagesSlice.actions