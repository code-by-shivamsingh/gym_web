import {createSlice,PayloadAction,} from "@reduxjs/toolkit";
import {AdminCompany,} from "@/utils/adminPanel";


const initialState: any = {
companiesData:[],
snackbarSeverity:<"success" | "error">("success"),
snackbarMessage:"",
companyToggleLoading:<Record<string, boolean>>({}),
selectedCompany: null as AdminCompany | null,
userToggleLoading:<Record<string, boolean>>({}),
isEditDialogOpen:false,
isLoading:false,
fetchError:"",
isCreateDialogOpen:false,
isSubmitting:false,
dialogMode: "create" as "create" | "edit",
companyDetails: null,
companyActivity: null,
servicesData: [],
servicesLoading: false,
servicesError: ""

};

  
  
  
  const companyManagementSlice = createSlice({
  name: "companyManagement",
  initialState,
  reducers: {
      setCompaniesData: (state, action: PayloadAction<any>) => {
          state.companiesData = action.payload;
        },
     
         setSnackbarSeverity: (state, action: PayloadAction<any>) => {
          state.snackbarSeverity = action.payload;
        },
         setSnackbarMessage: (state, action: PayloadAction<any>) => {
          state.snackbarMessage = action.payload;
        },
         setCompanyToggleLoading: (state, action: PayloadAction<any>) => {
          state.companyToggleLoading = action.payload;
        },
        setSelectedCompany: (state, action: PayloadAction<any>) => {
          state.selectedCompany = action.payload;
        },
              setUserToggleLoading: (state, action: PayloadAction<any>) => {
          state.userToggleLoading = action.payload;
        },
             setIsEditDialogOpen: (state, action: PayloadAction<any>) => {
          state.isEditDialogOpen = action.payload;
        },
            setIsLoading: (state, action: PayloadAction<any>) => {
          state.isLoading = action.payload;
        },
            setFetchError: (state, action: PayloadAction<any>) => {
          state.fetchError = action.payload;
        },
           setIsCreateDialogOpen: (state, action: PayloadAction<any>) => {
          state.isCreateDialogOpen = action.payload;
        },
        setIsSubmitting: (state, action: PayloadAction<any>) => {
          state.isSubmitting = action.payload;
        },
        setDialogMode: (state, action: PayloadAction<"create" | "edit">) => {
  state.dialogMode = action.payload;
},
  setCompanyDetails: (state, action: PayloadAction<any>) => {
      state.companyDetails = action.payload;
    },
setCompanyActivity: (state, action: PayloadAction<any>) => {
      state.companyActivity = action.payload;
},
setServicesData: (state,action: PayloadAction<any>) => {
  state.servicesData =action.payload;
},

setServicesLoading: (state,action: PayloadAction<boolean>) => {
  state.servicesLoading =action.payload;
},

setServicesError: (state,action: PayloadAction<string>) => {
  state.servicesError =action.payload;
},

  },


  
  

  

  

});



export const {setCompaniesData,setSnackbarSeverity,setSnackbarMessage,setCompanyToggleLoading,setSelectedCompany,
setUserToggleLoading,setIsEditDialogOpen,setIsLoading,setFetchError,setIsCreateDialogOpen,setIsSubmitting,setCompanyDetails,setCompanyActivity
 ,setDialogMode,setServicesData,setServicesLoading,setServicesError,} = companyManagementSlice.actions;

export default companyManagementSlice.reducer;
