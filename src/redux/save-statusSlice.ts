import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SaveStatus = 'saved' | 'saving' | 'idle';

interface SaveStatusState {
  status: SaveStatus;
}

const initialState: SaveStatusState = {
  status: 'idle'
};

export const saveStatusSlice = createSlice({
  name: 'saveStatus',
  initialState,
  reducers: {
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.status = action.payload;
    }
  }
});

export const { setSaveStatus } = saveStatusSlice.actions;
export default saveStatusSlice.reducer;