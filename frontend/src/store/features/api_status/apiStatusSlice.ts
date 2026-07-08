import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface ApiStatusState {
  loading: boolean;
  success: boolean;
  error: string | null;
  isApicalled: boolean;
}

const initialState: ApiStatusState = {
  loading: false,
  success: false,
  error: null,
  isApicalled: false,
};

const apiStatusSlice = createSlice({
  name: "apiStatus",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
     
    setIsApicalled: (state, action: PayloadAction<boolean>) => {
      state.isApicalled = action.payload;
    },
  },
});

export const { setLoading, setSuccess, setError, setIsApicalled } =
  apiStatusSlice.actions;

export default apiStatusSlice.reducer;