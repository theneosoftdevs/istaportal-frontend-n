import { api } from "../client"
import type { Faculty, Promotion, Course, ScheduleSlot, Room, Grade, GradeAppeal, Assignment, Submission, CourseResource } from "@/types"

export const ENDPOINTS = {
  faculties: { base: "/academics/faculties", detail: (id: string) => `/academics/faculties/${id}` },
  promotions: { base: "/academics/promotions", detail: (id: string) => `/academics/promotions/${id}` },
  courses: { base: "/academics/courses", detail: (id: string) => `/academics/courses/${id}`, teacher: (id: string) => `/academics/courses/${id}/teacher` },
  schedules: { base: "/schedules", detail: (id: string) => `/schedules/${id}` },
  rooms: { base: "/academics/salles", detail: (id: string) => `/academics/salles/${id}` },
  grades: { base: "/grades", detail: (id: string) => `/grades/${id}`, status: (id: string) => `/grades/${id}/status` },
  appeals: { base: "/appeals", resolve: (id: string) => `/appeals/${id}/resolve` },
  assignments: { base: "/assignments", detail: (id: string) => `/assignments/${id}` },
  submissions: { base: "/submissions", grade: (id: string) => `/submissions/${id}/grade` },
  resources: { base: "/resources", detail: (id: string) => `/resources/${id}` },
  averages: { student: (id: string) => `/academics/averages/students/${id}` },
}

export interface FacultyPayload {
  name: string;
  code: string;
}

export const facultyApi = {
  list:   ()               => api.get<Faculty[]>(ENDPOINTS.faculties.base),
  get:    (id: string)     => api.get<Faculty>(ENDPOINTS.faculties.detail(id)),
  create: (body: FacultyPayload)  => api.post<Faculty>(ENDPOINTS.faculties.base, body),
  update: (id: string, b: unknown) => api.put<Faculty>(ENDPOINTS.faculties.detail(id), b),
  delete: (id: string)     => api.delete<void>(ENDPOINTS.faculties.detail(id)),
}

export interface PromotionPayload {
  name: string;
  faculty_id: string;
}

export const promotionApi = {
  list:   (faculty_id?: string) => {
    const qs = faculty_id ? `?faculty_id=${faculty_id}` : ""
    return api.get<Promotion[]>(`${ENDPOINTS.promotions.base}${qs}`)
  },
  get:    (id: string)         => api.get<Promotion>(ENDPOINTS.promotions.detail(id)),
  create: (body: unknown)      => api.post<Promotion>(ENDPOINTS.promotions.base, body),
  update: (id: string, b: unknown) => api.put<Promotion>(ENDPOINTS.promotions.detail(id), b),
  delete: (id: string)         => api.delete<void>(ENDPOINTS.promotions.detail(id)),
}

export const courseApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Course[]>(`${ENDPOINTS.courses.base}${qs}`)
  },
  get:    (id: string)         => api.get<Course>(ENDPOINTS.courses.detail(id)),
  create: (body: unknown)      => api.post<Course>(ENDPOINTS.courses.base, body),
  update: (id: string, b: unknown) => api.put<Course>(ENDPOINTS.courses.detail(id), b),
  delete: (id: string)         => api.delete<void>(ENDPOINTS.courses.detail(id)),
  assignTeacher: (course_id: string, teacher_id: string) =>
    api.patch<Course>(ENDPOINTS.courses.teacher(course_id), { teacher_id }),
}

export const scheduleApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<ScheduleSlot[]>(`${ENDPOINTS.schedules.base}${qs}`)
  },
  create: (body: unknown) => api.post<ScheduleSlot>(ENDPOINTS.schedules.base, body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.schedules.detail(id)),
}

export const roomApi = {
  list:   ()              => api.get<Room[]>(ENDPOINTS.rooms.base),
  create: (body: unknown) => api.post<Room>(ENDPOINTS.rooms.base, body),
  update: (id: string, body: unknown) => api.put<Room>(ENDPOINTS.rooms.detail(id), body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.rooms.detail(id)),
}

export const gradeApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Grade[]>(`${ENDPOINTS.grades.base}${qs}`)
  },
  upsert: (body: unknown)       => api.post<Grade>(ENDPOINTS.grades.base, body),
  updateStatus: (id: string, status: string) =>
    api.patch<Grade>(ENDPOINTS.grades.status(id), { status }),
  getStudentAverage: (student_id: string, history_id?: string) => {
    const qs = history_id ? `?history_id=${history_id}` : ""
    return api.get<any>(`${ENDPOINTS.averages.student(student_id)}${qs}`)
  }
}

export const appealApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<GradeAppeal[]>(`${ENDPOINTS.appeals.base}${qs}`)
  },
  create: (body: unknown)      => api.post<GradeAppeal>(ENDPOINTS.appeals.base, body),
  resolve:(id: string, status: "approved" | "rejected", response: string) =>
    api.patch<GradeAppeal>(ENDPOINTS.appeals.resolve(id), { status, response }),
}

export const assignmentApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Assignment[]>(`${ENDPOINTS.assignments.base}${qs}`)
  },
  create: (body: unknown) => api.post<Assignment>(ENDPOINTS.assignments.base, body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.assignments.detail(id)),
}

export const submissionApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Submission[]>(`${ENDPOINTS.submissions.base}${qs}`)
  },
  create: (body: unknown) => api.post<Submission>(ENDPOINTS.submissions.base, body),
  grade:  (id: string, grade: number, feedback: string) =>
    api.patch<Submission>(ENDPOINTS.submissions.grade(id), { grade, feedback }),
}

export const resourceApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<CourseResource[]>(`${ENDPOINTS.resources.base}${qs}`)
  },
  create: (body: unknown) => api.post<CourseResource>(ENDPOINTS.resources.base, body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.resources.detail(id)),
}
