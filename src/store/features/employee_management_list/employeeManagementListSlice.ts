import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  designation?: string;
}

interface EmployeeListState {
  users: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeListState = {
  users: [],
  loading: false,
  error: null,
};

const employeeManagementListSlice = createSlice({
  name: "employeeManagementList",
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.users = action.payload;
    },

    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.users.unshift(action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearEmployees: (state) => {
      state.users = [];
    },
  },
});

export const {
  setEmployees,
  addEmployee,
  setLoading,
  setError,
  clearEmployees,
} = employeeManagementListSlice.actions;

export default employeeManagementListSlice.reducer;