import { api } from "../client"
import type { Student, Teacher } from "@/types"

export const ENDPOINTS = {
  students: {
    base:   "/profiles/students",
    detail: (userId: string) => `/profiles/students/${userId}`,
    status: (userId: string) => `/profiles/students/${userId}/status`,
  },
  teachers: {
    base:   "/profiles/teachers",
    detail: (userId: string) => `/profiles/teachers/${userId}`,
    titles: "/profiles/teachers/titles",
  },
}

export interface StudentProfilePayload {
  user_id: string;
  promotion_id: string;
  faculty_id: string;
  birth_date: string;
  phone_number: string;
}

export const studentApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Student[]>(`${ENDPOINTS.students.base}${qs}`)
  },
  get:    (userId: string)     => api.get<Student>(ENDPOINTS.students.detail(userId)),
  createProfile: (body: StudentProfilePayload) => api.post<Student>(ENDPOINTS.students.base, body),
  update: (userId: string, b: unknown) => api.put<Student>(ENDPOINTS.students.detail(userId), b),
  updateStatus: (userId: string, status: string) =>
    api.patch<Student>(ENDPOINTS.students.status(userId), { status }),
}

export const teacherApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Teacher[]>(`${ENDPOINTS.teachers.base}${qs}`)
  },
  get:    (id: string)         => api.get<Teacher>(ENDPOINTS.teachers.detail(id)),
  create: (body: unknown)      => api.post<Teacher>(ENDPOINTS.teachers.base, body),
  update: (id: string, b: unknown) => api.put<Teacher>(ENDPOINTS.teachers.detail(id), b),
  titles: ()                   => api.get<string[]>(ENDPOINTS.teachers.titles),
}
