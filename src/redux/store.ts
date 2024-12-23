// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { currProjectSlice } from "./currProjectSlice";
import {
  handToolSlice,
  mapSettingsSlice,
  mapSizeSlice,
} from "./mapSettingsSlice";
import { mapCardsSlice } from "./mapCardsSlice";
import { localCardIdSlice, localSettingsSlice } from "./localSettingsSlice";
import { globalSettingsSlice } from "./globalSettingsSlice";
import { publishedMapNavSlice } from "./publishedMapSlice";
import { userSlice } from "./userSlice";
import { imagesSlice } from "./imagesSlice";
import saveStatusReducer from "./save-statusSlice";
import { canvasSizeSlice } from "./canvasSizeSlice";
import {
  localParentCategoryIdSlice,
  localParentCategorySettingsSlice,
} from "./localParentCategorySlice";
import tileSettingsReducer from "./tileSettingsSlice"; // Changed import

export const store = configureStore({
  reducer: {
    currProject: currProjectSlice.reducer,
    mapSettings: mapSettingsSlice.reducer,
    mapSize: mapSizeSlice.reducer,
    mapCards: mapCardsSlice.reducer,
    localSettings: localSettingsSlice.reducer,
    globalSettings: globalSettingsSlice.reducer,
    handTool: handToolSlice.reducer,
    localCardId: localCardIdSlice.reducer,
    publishedMapNav: publishedMapNavSlice.reducer,
    user: userSlice.reducer,
    images: imagesSlice.reducer,
    saveStatus: saveStatusReducer,
    canvasSize: canvasSizeSlice.reducer,
    localParentCategoryId: localParentCategoryIdSlice.reducer,
    localParentCategorySettings: localParentCategorySettingsSlice.reducer,
    tileSettings: tileSettingsReducer, // Changed reducer name
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;