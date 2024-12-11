import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const userSlice = createSlice({
    name: 'map-nav',
    initialState: { value: null },
    reducers: {
        setUser: (state, action: PayloadAction<any>) => {
            state.value = action.payload;
        },
    },
});

// Export actions
export const { setUser } = userSlice.actions;