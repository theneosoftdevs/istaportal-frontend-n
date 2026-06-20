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
  faculty_id: string;
  birth_date: string;
  phone_number: string;
  academic_year_id?: string;
  promotion_id?: string;
}

export const studentApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    // Backend returns an array of items that often wrap the student profile under `profile`.
    return api.get<any[]>(`${ENDPOINTS.students.base}${qs}`).then((res) => {
      return (res || []).map((item: any) => {
        const profile = item.profile || item
        const user = profile.user || profile
        const student: Student = {
          id: profile.id || profile.user_id || user.id || "",
          user_id: profile.user_id || user.id || "",
          matricule: profile.matricule || profile.code || "",
          birth_date: profile.birth_date || "",
          phone_number: profile.phone_number || profile.phone || "",
          faculty_id: profile.faculty_id || "",
          promotion_id: (profile as any).promotion_id || "",
          user: profile.user || undefined,
          faculty: profile.faculty || undefined,
          first_name: user.first_name || "",
          middle_name: user.middle_name,
          last_name: user.last_name || "",
          email: user.email || "",
        }
        return student
      })
    })
  },

  get:    (userId: string)     => api.get<Student>(ENDPOINTS.students.detail(userId)),

  createProfile: (body: StudentProfilePayload) => api.post<Student>(ENDPOINTS.students.base, body),

  // Update profile fields (profile-level)
  update: (userId: string, b: unknown) => api.put<Student>(ENDPOINTS.students.detail(userId), b),

  updateProfile: (userId: string, b: unknown) => api.put<Student>(ENDPOINTS.students.detail(userId), b),

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

// Simple user API for updating core user fields when backend exposes /users/:id
export const userApi = {
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, body: unknown) => api.patch(`/users/${id}`, body),
}
