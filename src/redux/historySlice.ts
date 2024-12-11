"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  past: [],
  future: [],
  isUndoRedo: false,
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addToHistory: (state, action) => {
      state.past.push(action.payload);
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length === 0) return;
      const previous = state.past[state.past.length - 1];
      state.past = state.past.slice(0, -1);
      state.future.push(previous);
      state.isUndoRedo = true;
    },
    redo: (state) => {
      if (state.future.length === 0) return;
      const next = state.future[state.future.length - 1];
      state.future = state.future.slice(0, -1);
      state.past.push(next);
      state.isUndoRedo = true;
    },
    setIsUndoRedo: (state, action) => {
      state.isUndoRedo = action.payload;
    },
  },
});

export const { addToHistory, undo, redo, setIsUndoRedo } = historySlice.actions;
export default historySlice.reducer;