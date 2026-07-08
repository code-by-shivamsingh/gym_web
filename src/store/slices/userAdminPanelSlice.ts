import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  mobile?: string;
  profileImage?: string;
  specialization?: string;
  experience?: string;
}

export const USER_DEFAULT_DATA: User = {
  name: "",
  email: "",
  role: "Member",
  mobile: "",
};

interface UserAdminPanelState {
  createDialogOpen: boolean;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  users: User[];
  selectedUser: User | null;
  userFormData: User;
  isRefreshUsers: boolean;
  userPage: number;
}

const initialState: UserAdminPanelState = {
  createDialogOpen: false,
  editDialogOpen: false,
  deleteDialogOpen: false,
  users: [],
  selectedUser: null,
  userFormData: USER_DEFAULT_DATA,
  isRefreshUsers: false,
  userPage: 0,
};

const userAdminPanelSlice = createSlice({
  name: "userAdminPanel",
  initialState,
  reducers: {
    setCreateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.createDialogOpen = action.payload;
    },
    setEditDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.editDialogOpen = action.payload;
    },
    setDeleteDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.deleteDialogOpen = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setUserFormData: (state, action: PayloadAction<User>) => {
      state.userFormData = action.payload;
    },
    setIsRefreshUsers: (state, action: PayloadAction<boolean>) => {
      state.isRefreshUsers = action.payload;
    },
    setUserPage: (state, action: PayloadAction<number>) => {
      state.userPage = action.payload;
    },
  },
});

export const {
  setCreateDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setUsers,
  setSelectedUser,
  setUserFormData,
  setIsRefreshUsers,
  setUserPage,
} = userAdminPanelSlice.actions;

export default userAdminPanelSlice.reducer;
