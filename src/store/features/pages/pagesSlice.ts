import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  aboutData: null,
};

const pagesSlice = createSlice({
  name: "pages",
  initialState,

  reducers: {
    setAboutData: (state, action: PayloadAction<any>) => {
      state.aboutData = action.payload;
    },
  },
});

export const { setAboutData } = pagesSlice.actions;

export default pagesSlice.reducer;