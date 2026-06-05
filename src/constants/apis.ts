export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||"http://localhost:5000";

export const URL_AUTH_LOGIN = `${BASE_URL}/api/auth/login`;

export const URL_AUTH_REGISTER =`${BASE_URL}/api/auth/register`;

export const URL_USERS = `${BASE_URL}/api/users`;
export const URL_MEMBERS = `${BASE_URL}/api/members`;