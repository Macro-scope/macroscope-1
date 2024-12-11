import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = { data: [] }
export const mapCardsSlice = createSlice({
    name: 'map-cards',
    initialState: initialState,
    reducers: {
        setCards: (state, action: PayloadAction<any>) => {
            state.data = action.payload;
        }
    },
});

export const { setCards } = mapCardsSlice.actions