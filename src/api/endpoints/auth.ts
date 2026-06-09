import { api } from "../client"
import type { User } from "@/types"

export const ENDPOINTS = {
  login:          "/auth/login",
  register:       "/auth/register",
  profile:        "/me/profile",
  logout:         "/auth/logout",
  forgotPassword: "/auth/forgot-password",
  resetPassword:  "/auth/reset-password",
  activate:       "/auth/activate",
}

export interface LoginPayload   { email: string; password: string }
export interface RegisterPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: "M" | "F";
  email: string;
  password?: string;
  role_id: number;
}
export interface RegisterResponse {
  user_id?: string;
  id?: string;
  message?: string;
  [key: string]: any;
}
export type LoginResponse = User
export type MeResponse = User

export const authApi = {
  login:          (payload: LoginPayload)          => api.post<LoginResponse>(ENDPOINTS.login, payload),
  register:       (payload: RegisterPayload)       => api.post<RegisterResponse>(ENDPOINTS.register, payload),
  me:             ()                               => api.get<MeResponse>(ENDPOINTS.profile),
  logout:         ()                               => api.post<void>(ENDPOINTS.logout, {}),
  forgotPassword: (email: string)                  => api.post<void>(ENDPOINTS.forgotPassword, { email }),
  resetPassword:  (token: string, password: string) => api.post<void>(ENDPOINTS.resetPassword, { token, password }),
  activateAccount:(token: string, password: string) => api.post<LoginResponse>(ENDPOINTS.activate, { token, password }),
}
