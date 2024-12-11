import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = [
    {
      "color": "ff3a3a",
      "tiles": [
        {
          "url": "google.com",
          "logo": null,
          "name": "Google",
          "hidden": false,
          "tag_id": "6c2b9b0f-55a6-4afa-9984-30610d100caa",
          "card_id": "da546b20-dbe2-4fa9-b6c5-ab0af5e4901c",
          "tile_id": "648c0520-44ac-42a7-a238-1c210468107c",
          "created_at": "2024-10-22T13:06:06.293803+00:00"
        }
      ],
      "hidden": false,
      "map_id": "3a4b80d1-246a-42fd-8fa8-35d1b9b14b21",
      "tag_id": "6c2b9b0f-55a6-4afa-9984-30610d100caa",
      "card_id": "da546b20-dbe2-4fa9-b6c5-ab0af5e4901c",
      "position": [
        "500",
        "300"
      ],
      "dimension": [
        "200",
        "300"
      ],
      "created_at": "2024-10-22T13:04:03.64132+00:00"
    },
    {
      "color": "256EFF",
      "tiles": [
        {
          "url": "duckduckgo.com",
          "logo": null,
          "name": "DuckDuckGo",
          "hidden": false,
          "tag_id": "8d37a470-0e85-4883-b364-c923af486a69",
          "card_id": "78e3a674-c0bb-4488-9ab5-426fe856c407",
          "tile_id": "cc5b245c-5f40-4226-ae18-0907f6612190",
          "created_at": "2024-10-22T15:22:23.76868+00:00"
        }
      ],
      "hidden": false,
      "map_id": "3a4b80d1-246a-42fd-8fa8-35d1b9b14b21",
      "tag_id": "8d37a470-0e85-4883-b364-c923af486a69",
      "card_id": "78e3a674-c0bb-4488-9ab5-426fe856c407",
      "position": [
        "100",
        "100"
      ],
      "dimension": [
        "200",
        "300"
      ],
      "created_at": "2024-10-22T15:20:38.088119+00:00"
    }
  ]
export const currProjectSlice = createSlice({
    name: 'curr-project',
    initialState: initialState,
    reducers: {
        setCurrProjectData: (_state, action: PayloadAction<any>) => {
            // state = action.payload;
            return action.payload;
        },
        setCurrCards: (_state, action: PayloadAction<any>) => {
            // state = action.payload;
            return action.payload;
        }
    },
});

export const { setCurrProjectData, setCurrCards } = currProjectSlice.actions