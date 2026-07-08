// store/attendanceSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttendanceLog {
  date: string;
  dayLabel: string;
  effectiveHours: string;
  grossHours: string;
  arrival: 'On Time' | 'Late' | 'Absent' | 'Weekend/Off';
  visualWidth: number; // percentage 0-100
  isToday?: boolean;
  isWeekend?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  avgHrsPerDay: string;
  onTimeArrival: number; // percentage
}

export interface AttendanceState {
  currentTime: string;
  currentDate: string;
  totalHoursEffective: string;
  totalHoursGross: string;
  hoursSinceLogin: string;
  isClockedIn: boolean;
  activeTab: 'log' | 'calendar' | 'requests';
  activePeriod: '30days' | 'MAR' | 'FEB' | 'JAN' | 'DEC' | 'NOV' | 'OCT';
  me: TeamMember;
  myTeam: TeamMember;
  logs: AttendanceLog[];
  timingsDuration: string;
}

const initialState: AttendanceState = {
  currentTime: '05:52:03 PM',
  currentDate: 'Thu, 30 Apr 2025',
  totalHoursEffective: '8h 40m',
  totalHoursGross: '8h 40m',
  hoursSinceLogin: '8h 40m',
  isClockedIn: true,
  activeTab: 'log',
  activePeriod: '30days',
  me: {
    id: 'me',
    name: 'Me',
    avgHrsPerDay: '9h 58m',
    onTimeArrival: 100,
  },
  myTeam: {
    id: 'team',
    name: 'My Team',
    avgHrsPerDay: '9h 41m',
    onTimeArrival: 100,
  },
  timingsDuration: '23h 59m',
  logs: [
    { date: 'Thu, 30 Apr', dayLabel: 'Thu', effectiveHours: '0h 0m +', grossHours: '0h 0m +', arrival: 'On Time', visualWidth: 5, isToday: true },
    { date: 'Wed, 29 Apr', dayLabel: 'Wed', effectiveHours: '10h 47m', grossHours: '10h 47m', arrival: 'On Time', visualWidth: 75 },
    { date: 'Tue, 28 Apr', dayLabel: 'Tue', effectiveHours: '10h 2m', grossHours: '10h 2m', arrival: 'On Time', visualWidth: 70 },
    { date: 'Mon, 27 Apr', dayLabel: 'Mon', effectiveHours: '10h 2m', grossHours: '10h 2m', arrival: 'On Time', visualWidth: 70 },
    { date: 'Sun, 26 Apr', dayLabel: 'Sun', effectiveHours: '—', grossHours: '—', arrival: 'Weekend/Off', visualWidth: 0, isWeekend: true },
    { date: 'Sat, 25 Apr', dayLabel: 'Sat', effectiveHours: '—', grossHours: '—', arrival: 'Weekend/Off', visualWidth: 0, isWeekend: true },
    { date: 'Fri, 24 Apr', dayLabel: 'Fri', effectiveHours: '9h 30m', grossHours: '9h 30m', arrival: 'On Time', visualWidth: 66 },
    { date: 'Thu, 23 Apr', dayLabel: 'Thu', effectiveHours: '10h 15m', grossHours: '10h 15m', arrival: 'On Time', visualWidth: 72 },
  ],
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clockOut(state) {
      state.isClockedIn = false;
    },
    clockIn(state) {
      state.isClockedIn = true;
    },
    setActiveTab(state, action: PayloadAction<AttendanceState['activeTab']>) {
      state.activeTab = action.payload;
    },
    setActivePeriod(state, action: PayloadAction<AttendanceState['activePeriod']>) {
      state.activePeriod = action.payload;
    },
    updateTime(state, action: PayloadAction<string>) {
      state.currentTime = action.payload;
    },
  },
});

export const { clockOut, clockIn, setActiveTab, setActivePeriod, updateTime } = attendanceSlice.actions;
export default attendanceSlice.reducer;
