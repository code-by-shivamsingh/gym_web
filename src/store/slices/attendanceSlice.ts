import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AttendanceLog {
  _id?: string;
  checkIn: string;
  checkOut: string | null;
  dateLabel: string;
}

interface AttendanceState {
  logs: AttendanceLog[];
  isCheckedIn: boolean;
  activeSession: AttendanceLog | null;
}

const initialState: AttendanceState = {
  logs: [],
  isCheckedIn: false,
  activeSession: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setLogs: (state, action: PayloadAction<AttendanceLog[]>) => {
      state.logs = action.payload;
    },
    setCheckedIn: (state, action: PayloadAction<boolean>) => {
      state.isCheckedIn = action.payload;
    },
    setActiveSession: (state, action: PayloadAction<AttendanceLog | null>) => {
      state.activeSession = action.payload;
      state.isCheckedIn = !!action.payload;
    },
  },
});

export const { setLogs, setCheckedIn, setActiveSession } = attendanceSlice.actions;
export default attendanceSlice.reducer;
