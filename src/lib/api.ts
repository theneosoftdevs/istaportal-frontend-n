// src/lib/api.ts
// HTTP client for the ISTA-GOMA backend API.
// Base URL is read from VITE_API_URL (defaults to /api for same-origin proxying).

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"

// ─── Endpoints ──────────────────────────────────────────────────────────────

export const ENDPOINTS = {
  auth: {
    login:          "/auth/login",
    me:             "/me/profile",
    logout:         "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword:  "/auth/reset-password",
    activate:       "/auth/activate",
  },
  faculties: {
    base:   "/academics/faculties",
    detail: (id: string) => `/academics/faculties/${id}`,
  },
  promotions: {
    base:   "/academics/promotions",
    detail: (id: string) => `/academics/promotions/${id}`,
  },
  courses: {
    base:    "/academics/courses",
    detail:  (id: string) => `/academics/courses/${id}`,
    teacher: (id: string) => `/academics/courses/${id}/teacher`,
  },
  schedules: {
    base:   "/academics/schedules",
    detail: (id: string) => `/academics/schedules/${id}`,
  },
  rooms: {
    base:   "/academics/salles",
    detail: (id: string) => `/academics/salles/${id}`,
  },
  students: {
    base:   "/profiles/students",
    detail: (id: string) => `/profiles/students/${id}`,
    status: (id: string) => `/profiles/students/${id}/status`,
  },
  teachers: {
    base:   "/profiles/teachers",
    detail: (id: string) => `/profiles/teachers/${id}`,
    titles: "/profiles/teachers/titles",
  },
  grades: {
    base:   "/academics/grades",
    detail: (id: string) => `/academics/grades/${id}`,
    status: (id: string) => `/academics/grades/${id}`,
    byEvaluation: (id: string) => `/academics/grades/evaluations/${id}`,
    publish: "/academics/grades/publish",
  },
  appeals: {
    base:    "/appeals",
    resolve: (id: string) => `/appeals/${id}/resolve`,
  },
  assignments: {
    base:   "/assignments",
    detail: (id: string) => `/assignments/${id}`,
  },
  submissions: {
    base:   "/submissions",
    grade:  (id: string) => `/submissions/${id}/grade`,
  },
  resources: {
    base:   "/resources",
    detail: (id: string) => `/resources/${id}`,
  },
  announcements: {
    base: "/announcements",
  },
  notifications: {
    base:    "/me/notifications",
    read:    (id: string) => `/me/notifications/${id}/read`,
    readAll: "/me/notifications/read-all",
  },
} as const

// ─── Client ───────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = localStorage.getItem("fino_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
  credentials: 'include',
  body: body !== undefined ? JSON.stringify(body) : undefined,
  signal,
  })

  if (!res.ok) {
    let errorBody: unknown
    try {
      errorBody = await res.json()
    } catch {
      errorBody = await res.text()
    }
    throw new ApiError(res.status, `HTTP ${res.status} ${res.statusText}`, errorBody)
  }

  if (res.status === 204) return undefined as T

  const envelope = await res.json() as ApiEnvelope<T>
  if (envelope.data !== undefined) return envelope.data
  return envelope as unknown as T
}

export const api = {
  get:    <T>(path: string, signal?: AbortSignal) => request<T>("GET",    path, undefined, signal),
  post:   <T>(path: string, body: unknown)         => request<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown)         => request<T>("PUT",    path, body),
  patch:  <T>(path: string, body: unknown)         => request<T>("PATCH",  path, body),
  delete: <T>(path: string)                        => request<T>("DELETE", path),
}

export { ApiError }

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload   { email: string; password: string }
export type LoginResponse = import("@/types").User
export interface MeResponse     { user: import("@/types").User }

export const authApi = {
  login:          (payload: LoginPayload)          => api.post<LoginResponse>(ENDPOINTS.auth.login, payload),
  me:             ()                               => api.get<MeResponse>(ENDPOINTS.auth.me),
  logout:         ()                               => api.post<void>(ENDPOINTS.auth.logout, {}),
  forgotPassword: (email: string)                  => api.post<void>(ENDPOINTS.auth.forgotPassword, { email }),
  resetPassword:  (token: string, password: string) => api.post<void>(ENDPOINTS.auth.resetPassword, { token, password }),
  activateAccount:(token: string, password: string) => api.post<LoginResponse>(ENDPOINTS.auth.activate, { token, password }),
}

// ─── Academic entities ────────────────────────────────────────────────────────

export const facultyApi = {
  list:   ()               => api.get<import("@/types").Faculty[]>(ENDPOINTS.faculties.base),
  get:    (id: string)     => api.get<import("@/types").Faculty>(ENDPOINTS.faculties.detail(id)),
  create: (body: unknown)  => api.post<import("@/types").Faculty>(ENDPOINTS.faculties.base, body),
  update: (id: string, b: unknown) => api.put<import("@/types").Faculty>(ENDPOINTS.faculties.detail(id), b),
  delete: (id: string)     => api.delete<void>(ENDPOINTS.faculties.detail(id)),
}

export const promotionApi = {
  list:   (faculty_id?: string) => {
    const qs = faculty_id ? `?faculty_id=${faculty_id}` : ""
    return api.get<import("@/types").Promotion[]>(`${ENDPOINTS.promotions.base}${qs}`)
  },
  get:    (id: string)         => api.get<import("@/types").Promotion>(ENDPOINTS.promotions.detail(id)),
  create: (body: unknown)      => api.post<import("@/types").Promotion>(ENDPOINTS.promotions.base, body),
  update: (id: string, b: unknown) => api.put<import("@/types").Promotion>(ENDPOINTS.promotions.detail(id), b),
  delete: (id: string)         => api.delete<void>(ENDPOINTS.promotions.detail(id)),
}

export const courseApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").Course[]>(`${ENDPOINTS.courses.base}${qs}`)
  },
  get:    (id: string)         => api.get<import("@/types").Course>(ENDPOINTS.courses.detail(id)),
  create: (body: unknown)      => api.post<import("@/types").Course>(ENDPOINTS.courses.base, body),
  update: (id: string, b: unknown) => api.put<import("@/types").Course>(ENDPOINTS.courses.detail(id), b),
  delete: (id: string)         => api.delete<void>(ENDPOINTS.courses.detail(id)),
  assignTeacher: (course_id: string, teacher_id: string) =>
    api.patch<import("@/types").Course>(ENDPOINTS.courses.teacher(course_id), { teacher_id }),
}

export const scheduleApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").ScheduleSlot[]>(`${ENDPOINTS.schedules.base}${qs}`)
  },
  create: (body: unknown) => api.post<import("@/types").ScheduleSlot>(ENDPOINTS.schedules.base, body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.schedules.detail(id)),
}

export const roomApi = {
  list:   ()              => api.get<import("@/types").Room[]>(ENDPOINTS.rooms.base),
  create: (body: unknown) => api.post<import("@/types").Room>(ENDPOINTS.rooms.base, body),
  update: (id: string, body: unknown) => api.put<import("@/types").Room>(ENDPOINTS.rooms.detail(id), body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.rooms.detail(id)),
}

// ─── Students ─────────────────────────────────────────────────────────────────

export const studentApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").Student[]>(`${ENDPOINTS.students.base}${qs}`)
  },
  get:    (id: string)         => api.get<import("@/types").Student>(ENDPOINTS.students.detail(id)),
  create: (body: unknown)      => api.post<import("@/types").Student>(ENDPOINTS.students.base, body),
  update: (id: string, b: unknown) => api.put<import("@/types").Student>(ENDPOINTS.students.detail(id), b),
  updateStatus: (id: string, status: string) =>
    api.patch<import("@/types").Student>(ENDPOINTS.students.status(id), { status }),
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export const teacherApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").Teacher[]>(`${ENDPOINTS.teachers.base}${qs}`)
  },
  get:    (id: string)         => api.get<import("@/types").Teacher>(ENDPOINTS.teachers.detail(id)),
  create: (body: unknown)      => api.post<import("@/types").Teacher>(ENDPOINTS.teachers.base, body),
  update: (id: string, b: unknown) => api.put<import("@/types").Teacher>(ENDPOINTS.teachers.detail(id), b),
  titles: ()                   => api.get<string[]>(ENDPOINTS.teachers.titles),
}

// ─── Grades ───────────────────────────────────────────────────────────────────

export const gradeApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").Grade[]>(`${ENDPOINTS.grades.base}${qs}`)
  },
  upsert: (body: unknown)       => api.post<import("@/types").Grade>(ENDPOINTS.grades.base, body),
  updateStatus: (id: string, status: string) =>
    api.patch<import("@/types").Grade>(ENDPOINTS.grades.status(id), { status }),
}

export const appealApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").GradeAppeal[]>(`${ENDPOINTS.appeals.base}${qs}`)
  },
  create: (body: unknown)      => api.post<import("@/types").GradeAppeal>(ENDPOINTS.appeals.base, body),
  resolve:(id: string, status: "approved" | "rejected", response: string) =>
    api.patch<import("@/types").GradeAppeal>(ENDPOINTS.appeals.resolve(id), { status, response }),
}

// ─── Assignments & Submissions ────────────────────────────────────────────────

export const assignmentApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").Assignment[]>(`${ENDPOINTS.assignments.base}${qs}`)
  },
  create: (body: unknown) => api.post<import("@/types").Assignment>(ENDPOINTS.assignments.base, body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.assignments.detail(id)),
}

export const submissionApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").Submission[]>(`${ENDPOINTS.submissions.base}${qs}`)
  },
  create: (body: unknown) => api.post<import("@/types").Submission>(ENDPOINTS.submissions.base, body),
  grade:  (id: string, grade: number, feedback: string) =>
    api.patch<import("@/types").Submission>(ENDPOINTS.submissions.grade(id), { grade, feedback }),
}

export const resourceApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").CourseResource[]>(`${ENDPOINTS.resources.base}${qs}`)
  },
  create: (body: unknown) => api.post<import("@/types").CourseResource>(ENDPOINTS.resources.base, body),
  delete: (id: string)    => api.delete<void>(ENDPOINTS.resources.detail(id)),
}

// ─── Announcements & Notifications ───────────────────────────────────────────

export const announcementApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<import("@/types").Announcement[]>(`${ENDPOINTS.announcements.base}${qs}`)
  },
  create: (body: unknown) => api.post<import("@/types").Announcement>(ENDPOINTS.announcements.base, body),
}

export const notificationApi = {
  list:       ()          => api.get<import("@/types").Notification[]>(ENDPOINTS.notifications.base),
  markRead:   (id: string)=> api.patch<void>(ENDPOINTS.notifications.read(id), {}),
  markAllRead:()          => api.patch<void>(ENDPOINTS.notifications.readAll, {}),
}
