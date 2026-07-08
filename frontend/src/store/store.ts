import { configureStore } from "@reduxjs/toolkit";
import languagesReducer from "./features/languages/languagesSlice";
import employeeManagementReducer from "./features/employee_management/employeeManagemetSlice";
import companyManagementReducer from "./features/company_management/companyManagementSlice";
import userDetailsReducer from "./features/user_details/userDetailsSlice";
import userAdminPanelReducer from "./features/user_admin_panel/userAdminPanelSlice";
import attendanceReducer from "./features/attendance/attendanceSlice";
import apiStatusReducer from "./features/api_status/apiStatusSlice";
import pagesReducer from "./features/pages/pagesSlice";
import employeeManagementListReducer from "./features/employee_management_list/employeeManagementListSlice";
export const makeStore = () =>
  configureStore({
    reducer: {
      languages: languagesReducer,
    employeeManagement: employeeManagementReducer,
    companyManagement: companyManagementReducer,
    userDetails: userDetailsReducer,
     userAdminPanel: userAdminPanelReducer,
      attendance: attendanceReducer,
      apiStatus:apiStatusReducer,
      pages:  pagesReducer,
      employeeManagementList: employeeManagementListReducer
    },
  });

// Types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
