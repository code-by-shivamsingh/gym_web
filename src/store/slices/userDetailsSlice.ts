import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThemeMode } from "../../utils/theme";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Trainer" | "Member";
  mobile?: string;
  profileImage?: string;
  memberDetails?: {
    plan: "Basic" | "Premium" | "Elite";
    status: "Active" | "Expired";
    joinedDate: string;
    expiryDate: string;
    trainer?: any;
  };
}

interface UserDetailsState {
  userProfile: UserProfile | null;
  firebaseId: string | null;
  firebaseToken: string | null;
  themeMode: ThemeMode;
}

const initialState: UserDetailsState = {
  userProfile: null,
  firebaseId: null,
  firebaseToken: null,
  themeMode: "dark", // default theme mode matches website dark look
};

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
    },
    setFirebaseId: (state, action: PayloadAction<string | null>) => {
      state.firebaseId = action.payload;
    },
    setFirebaseToken: (state, action: PayloadAction<string | null>) => {
      state.firebaseToken = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
  },
});

export const { setUserProfile, setFirebaseId, setFirebaseToken, setThemeMode } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
