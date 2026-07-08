import { configureStore } from "@reduxjs/toolkit";
import userDetailsReducer from "./slices/userDetailsSlice";
import userAdminPanelReducer from "./slices/userAdminPanelSlice";
import attendanceReducer from "./slices/attendanceSlice";
import apiStatusReducer from "./slices/apiStatusSlice";

export const store = configureStore({
  reducer: {
    userDetails: userDetailsReducer,
    userAdminPanel: userAdminPanelReducer,
    attendance: attendanceReducer,
    apiStatus: apiStatusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
