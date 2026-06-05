import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AVAILABLE_MODULES,User, USER_DEFAULT_DATA } from "@/utils/adminPanel";


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
    setUserFormData: (state, action: PayloadAction<any>) => {
      state.userFormData = action.payload;
    },
     setIsRefreshUsers: (state, action: PayloadAction<any>) => {
      state.isRefreshUsers = action.payload;
    },
    setUserPage: (state, action: PayloadAction<number>) => {
      state.userPage = action.payload;
    },
  },
});

export const {setIsRefreshUsers, setCreateDialogOpen, setEditDialogOpen, setDeleteDialogOpen, setUsers, setSelectedUser, setUserFormData,setUserPage } = userAdminPanelSlice.actions;
export default userAdminPanelSlice.reducer;
