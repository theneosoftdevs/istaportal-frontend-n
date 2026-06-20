import { api } from "../client"
import type { User, StudentProfile, TeacherProfile } from "@/types"

export const ENDPOINTS = {
  users: {
    detail: (id: string) => `/users/${id}`,
  },
  profiles: {
    students: {
      base: "/profiles/students",
      detail: (userId: string) => `/profiles/students/${userId}`,
    },
    teachers: {
      base: "/profiles/teachers",
      detail: (userId: string) => `/profiles/teachers/${userId}`,
    }
  }
}

export const userApi = {
  get: (id: string) => api.get<User>(ENDPOINTS.users.detail(id)),
  update: (id: string, payload: Partial<User>) =>
    api.patch<User>(ENDPOINTS.users.detail(id), payload),
}

export const studentApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<any[]>(`${ENDPOINTS.profiles.students.base}${qs}`)
  },
  create: (payload: any) =>
    api.post<StudentProfile>(ENDPOINTS.profiles.students.base, payload),
  createProfile: (payload: any) =>
    api.post<StudentProfile>(ENDPOINTS.profiles.students.base, payload),
  get: (userId: string) =>
    api.get<StudentProfile>(ENDPOINTS.profiles.students.detail(userId)),
  update: (userId: string, payload: Partial<StudentProfile>) =>
    api.put<StudentProfile>(ENDPOINTS.profiles.students.detail(userId), payload),
  updateProfile: (userId: string, payload: any) =>
    api.put<StudentProfile>(ENDPOINTS.profiles.students.detail(userId), payload),
}

export const teacherApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<TeacherProfile[]>(`${ENDPOINTS.profiles.teachers.base}${qs}`)
  },
  create: (payload: { user_id: string; title: string; faculty_id: string }) =>
    api.post<TeacherProfile>(ENDPOINTS.profiles.teachers.base, payload),
  get: (userId: string) =>
    api.get<TeacherProfile>(ENDPOINTS.profiles.teachers.detail(userId)),
  update: (userId: string, payload: any) =>
    api.put<TeacherProfile>(ENDPOINTS.profiles.teachers.detail(userId), payload),
}
