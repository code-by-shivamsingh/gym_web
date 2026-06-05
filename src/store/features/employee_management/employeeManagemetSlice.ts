import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, USER_DEFAULT_DATA } from "@/utils/adminPanel";

const initialState: any = {
  createDialogOpen: false,
  editDialogOpen: false,
  deleteDialogOpen: false,

  users: [],

  selectedUser: null,

  userFormData: USER_DEFAULT_DATA,

  isRefreshUsers: false,

  userPage: 0,
};

const employeeManagementSlice = createSlice({
  name: "employeeManagement",

  initialState,

  reducers: {

    // CREATE DIALOG
    setCreateDialogOpen: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.createDialogOpen = action.payload;
    },

    // EDIT DIALOG
    setEditDialogOpen: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.editDialogOpen = action.payload;
    },

    // DELETE DIALOG
    setDeleteDialogOpen: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.deleteDialogOpen = action.payload;
    },

    // USERS
    setUsers: (
      state,
      action: PayloadAction<User[]>
    ) => {
      state.users = action.payload;
    },

    // SELECTED USER
    setSelectedUser: (
      state,
      action: PayloadAction<User | null>
    ) => {
      state.selectedUser = action.payload;
    },

    // FORM DATA
    setUserFormData: (
      state,
      action: PayloadAction<any>
    ) => {
      state.userFormData = action.payload;
    },

    // REFRESH USERS
    setIsRefreshUsers: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isRefreshUsers = action.payload;
    },

    // PAGINATION
    setUserPage: (
      state,
      action: PayloadAction<number>
    ) => {
      state.userPage = action.payload;
    },

    // ADD USER
    addUser: (
      state,
      action: PayloadAction<any>
    ) => {
      state.users.unshift(action.payload);
    },

    // UPDATE USER
    updateUser: (
      state,
      action: PayloadAction<any>
    ) => {

      const index = state.users.findIndex(
        (user: any) =>
          user._id === action.payload._id
      );

      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },

    // DELETE USER
    deleteUser: (
      state,
      action: PayloadAction<string>
    ) => {

      state.users = state.users.filter(
        (user: any) =>
          user._id !== action.payload
      );
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

  addUser,

  updateUser,

  deleteUser,

} = employeeManagementSlice.actions;

export default employeeManagementSlice.reducer;