import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const canvasSizeSlice = createSlice({
  name: 'canvasSize',
  initialState: {
    width: 3000,
    height: 3000
  },
  reducers: {
    setCanvasSize: (state, action: PayloadAction<{ width: number; height: number; }>) => {
      state = action.payload;
    }
  }
});

export const { setCanvasSize } = canvasSizeSlice.actions;