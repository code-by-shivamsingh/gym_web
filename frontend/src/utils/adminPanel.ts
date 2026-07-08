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
  mobile: ""
};

export const AVAILABLE_MODULES = [
  "dashboard",
  "members",
  "trainers",
  "payments",
  "attendance",
  "settings"
];

export interface AdminCompany {
  _id?: string;
  name: string;
  email?: string;
  status?: string;
}
