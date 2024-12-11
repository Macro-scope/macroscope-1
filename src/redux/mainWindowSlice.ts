import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const windowSlice = createSlice({
    name: 'main-window',
    initialState: { value: "home" }, //website, 
    reducers: {
        setWindow: (state, action: PayloadAction<string>) => {
            state.value = action.payload;
        }
    },
});

export const { setWindow } = windowSlice.actions