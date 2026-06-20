import { api } from "../client"
import type { Faculty, Promotion, Course, ScheduleSlot, Room, Grade, GradeAppeal, Assignment, Submission, CourseResource, Evaluation, StudentAnnualAverage } from "@/types"

export const ENDPOINTS = {
  faculties: { base: "/academics/faculties", detail: (id: string) => `/academics/faculties/${id}` },
  promotions: { base: "/academics/promotions", detail: (id: string) => `/academics/promotions/${id}` },
  courses: { base: "/academics/courses", detail: (id: string) => `/academics/courses/${id}`, teacher: (id: string) => `/academics/courses/${id}/teacher` },
  schedules: { base: "/academics/schedules", detail: (id: string) => `/academics/schedules/${id}` },
  rooms: { base: "/academics/salles", detail: (id: string) => `/academics/salles/${id}` },
  evaluations: { base: "/academics/evaluations", byHistory: (historyId: string) => `/academics/evaluations/history/${historyId}` },
  grades: {
    base: "/academics/grades",
    detail: (id: string) => `/academics/grades/${id}`,
    byEvaluation: (evaluationId: string) => `/academics/grades/evaluations/${evaluationId}`,
    publish: "/academics/grades/publish",
  },
  appeals: { base: "/appeals", resolve: (id: string) => `/appeals/${id}/resolve` },
  assignments: { base: "/assignments", detail: (id: string) => `/assignments/${id}` },
  submissions: { base: "/submissions", grade: (id: string) => `/submissions/${id}/grade` },
  resources: { base: "/resources", detail: (id: string) => `/resources/${id}` },
  averages: {
    student: (id: string) => `/academics/averages/students/${id}`,
    promotion: (id: string) => `/academics/averages/promotions/${id}`,
  },
  academicYears: {
    base: "/academics/academic-years",
    active: "/academics/academic-years/active",
    activate: (id: string) => `/academics/academic-years/${id}/activate`,
  },
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

export interface EvaluationPayload {
  course_id: string;
  history_ref_id: string;
  title: string;
  type: Evaluation["type"];
  max_score: number;
  weight: number;
}

export const evaluationApi = {
  create: (body: EvaluationPayload) => api.post<Evaluation>(ENDPOINTS.evaluations.base, body),
  listByHistory: (historyId: string) => api.get<Evaluation[]>(ENDPOINTS.evaluations.byHistory(historyId)),
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
  listByEvaluation: (evaluationId: string) => api.get<Grade[]>(ENDPOINTS.grades.byEvaluation(evaluationId)),
  upsert: (body: unknown)       => api.post<Grade>(ENDPOINTS.grades.base, body),
  updateStatus: (id: string, status: string) =>
    api.patch<Grade>(ENDPOINTS.grades.detail(id), { status }),
  publish: (evaluation_id: string) => api.post<void>(ENDPOINTS.grades.publish, { evaluation_id }),
  getStudentAverage: (student_id: string, history_id?: string) => {
    const qs = history_id ? `?history_id=${history_id}` : ""
    return api.get<StudentAnnualAverage>(`${ENDPOINTS.averages.student(student_id)}${qs}`)
  },
  getPromotionAverages: (promotion_id: string, history_id?: string) => {
    const qs = history_id ? `?history_id=${history_id}` : ""
    return api.get<StudentAnnualAverage[]>(`${ENDPOINTS.averages.promotion(promotion_id)}${qs}`)
  }
}

export const academicYearApi = {
  list: () => api.get<unknown[]>(ENDPOINTS.academicYears.base),
  active: () => api.get<unknown>(ENDPOINTS.academicYears.active),
  activate: (id: string) => api.post<unknown>(ENDPOINTS.academicYears.activate(id), {}),
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
