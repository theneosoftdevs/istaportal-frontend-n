import { api } from "../client";
import type { RoleName, User, Notification } from "@/types";

export const ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  forgotPassword: "/auth/forgot-password",
  profile: "/me/profile",
  sessions: "/me/sessions",
  logoutAll: "/me/sessions/logout-all",
  notifications: "/me/notifications",
  readNotification: (id: string) => `/me/notifications/${id}/read`,
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse extends User {
  token: string;
  token_type: string;
  session_id: string;
  user_id: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  middle_name?: string;
  gender: "M" | "F";
  email: string;
  password?: string;
  role?: RoleName;
}

export interface RegisterResponse {
  id?: string;
  user_id?: string;
  email?: string;
}

export interface Session {
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>(ENDPOINTS.login, payload),

  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>(ENDPOINTS.register, payload),

  logout: () => api.post<void>(ENDPOINTS.logout, {}),

  forgotPassword: (email: string) =>
    api.post<void>(ENDPOINTS.forgotPassword, { email }),

  me: () => api.get<User>(ENDPOINTS.profile),

  sessions: () => api.get<Session[]>(ENDPOINTS.sessions),

  logoutAllSessions: () => api.post<void>(ENDPOINTS.logoutAll, {}),

  notifications: (unreadOnly = false) =>
    api.get<Notification[]>(
      unreadOnly
        ? `${ENDPOINTS.notifications}?unread=true`
        : ENDPOINTS.notifications,
    ),

  readNotification: (id: string) =>
    api.patch<void>(ENDPOINTS.readNotification(id), {}),
};
