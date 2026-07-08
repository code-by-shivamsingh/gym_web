import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState: any = {
 language:"de",
};
 
const languagesSlice = createSlice({
  name: "languages",
  initialState,
  reducers: {
      setLanguage: (state, action: PayloadAction<any>) => {
      state.language = action.payload;
    },
    

  },
});

export const {  setLanguage } = languagesSlice.actions;
export default languagesSlice.reducer;
