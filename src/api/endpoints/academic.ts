import { api } from "../client"
import type {
  Faculty,
  Promotion,
  Course,
  ScheduleSlot,
  Room,
  Grade,
  Evaluation,
  StudentAnnualAverage,
  AcademicYear,
  GradeAppeal,
  Assignment,
  Submission,
  CourseResource
} from "@/types"

export const ENDPOINTS = {
  faculties: {
    base: "/academics/faculties",
    detail: (id: string) => `/academics/faculties/${id}`
  },
  promotions: {
    base: "/academics/promotions",
    detail: (id: string) => `/academics/promotions/${id}`,
    transition: "/academics/promotions/transition"
  },
  courses: {
    base: "/academics/courses",
    detail: (id: string) => `/academics/courses/${id}`
  },
  rooms: {
    base: "/academics/salles",
    detail: (id: string) => `/academics/salles/${id}`
  },
  schedules: {
    base: "/academics/schedules",
    detail: (id: string) => `/academics/schedules/${id}`
  },
  evaluations: {
    base: "/academics/evaluations",
    byHistory: (historyId: string) => `/academics/evaluations/history/${historyId}`
  },
  grades: {
    base: "/academics/grades",
    detail: (id: string) => `/academics/grades/${id}`,
    byEvaluation: (evaluationId: string) => `/academics/grades/evaluations/${evaluationId}`,
    publish: "/academics/grades/publish",
  },
  averages: {
    student: (id: string) => `/academics/averages/students/${id}`,
    promotion: (id: string) => `/academics/averages/promotions/${id}`,
  },
  academicYears: {
    base: "/academics/academic-years",
    active: "/academics/academic-years/active",
    activate: (id: string) => `/academics/academic-years/${id}/activate`,
  },
  appeals: {
    base: "/appeals",
    resolve: (id: string) => `/appeals/${id}/resolve`
  },
  assignments: {
    base: "/assignments",
    detail: (id: string) => `/assignments/${id}`
  },
  submissions: {
    base: "/submissions",
    grade: (id: string) => `/submissions/${id}/grade`
  },
  resources: {
    base: "/resources",
    detail: (id: string) => `/resources/${id}`
  },
}

export const facultyApi = {
  list: () => api.get<Faculty[]>(ENDPOINTS.faculties.base),
  get: (id: string) => api.get<Faculty>(ENDPOINTS.faculties.detail(id)),
  create: (payload: { name: string; code: string }) => api.post<Faculty>(ENDPOINTS.faculties.base, payload),
  update: (id: string, payload: any) => api.put<Faculty>(ENDPOINTS.faculties.detail(id), payload),
  delete: (id: string) => api.delete<void>(ENDPOINTS.faculties.detail(id)),
}

export const promotionApi = {
  list: (facultyId?: string) => {
    const qs = facultyId ? `?faculty_id=${facultyId}` : ""
    return api.get<Promotion[]>(`${ENDPOINTS.promotions.base}${qs}`)
  },
  get: (id: string) => api.get<Promotion>(ENDPOINTS.promotions.detail(id)),
  create: (payload: { name: string; faculty_id: string }) => api.post<Promotion>(ENDPOINTS.promotions.base, payload),
  update: (id: string, payload: any) => api.put<Promotion>(ENDPOINTS.promotions.detail(id), payload),
  delete: (id: string) => api.delete<void>(ENDPOINTS.promotions.detail(id)),
  transition: (payload: {
    current_year: string;
    next_year: string;
    transitions: { student_id: string; new_promotion_id: string; has_passed: boolean }[]
  }) => api.post<void>(ENDPOINTS.promotions.transition, payload),
}

export const courseApi = {
  list: () => api.get<Course[]>(ENDPOINTS.courses.base),
  get: (id: string) => api.get<Course>(ENDPOINTS.courses.detail(id)),
  create: (payload: { unit_id: string; name: string; credits: number; promotion_id: string; teacher_id: string }) =>
    api.post<Course>(ENDPOINTS.courses.base, payload),
  update: (id: string, payload: any) => api.put<Course>(ENDPOINTS.courses.detail(id), payload),
  delete: (id: string) => api.delete<void>(ENDPOINTS.courses.detail(id)),
}

export const roomApi = {
  list: () => api.get<Room[]>(ENDPOINTS.rooms.base),
  create: (payload: { name: string; capacity: number; type: Room["type"] }) =>
    api.post<Room>(ENDPOINTS.rooms.base, payload),
  update: (id: string, payload: any) => api.put<Room>(ENDPOINTS.rooms.detail(id), payload),
  delete: (id: string) => api.delete<void>(ENDPOINTS.rooms.detail(id)),
}

export const scheduleApi = {
  list: () => api.get<ScheduleSlot[]>(ENDPOINTS.schedules.base),
  create: (payload: { course_id: string; salle_id: string; promotion_id: string; day: string; start_time: string; end_time: string }) =>
    api.post<ScheduleSlot>(ENDPOINTS.schedules.base, payload),
  delete: (id: string) => api.delete<void>(ENDPOINTS.schedules.detail(id)),
}

export const evaluationApi = {
  create: (payload: { course_id: string; history_ref_id: string; title: string; type: string; max_score: number; weight: number }) =>
    api.post<Evaluation>(ENDPOINTS.evaluations.base, payload),
  listByHistory: (historyId: string) => api.get<Evaluation[]>(ENDPOINTS.evaluations.byHistory(historyId)),
}

export const gradeApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Grade[]>(`${ENDPOINTS.grades.base}${qs}`)
  },
  create: (payload: { evaluation_id: string; student_id: string; score_obtained: number }) =>
    api.post<Grade>(ENDPOINTS.grades.base, payload),
  listByEvaluation: (evaluationId: string) => api.get<Grade[]>(ENDPOINTS.grades.byEvaluation(evaluationId)),
  publish: (evaluationId: string) => api.post<void>(ENDPOINTS.grades.publish, { evaluation_id: evaluationId }),
  getStudentAverage: (studentId: string, historyId?: string) => {
    const qs = historyId ? `?history_id=${historyId}` : ""
    return api.get<StudentAnnualAverage>(`${ENDPOINTS.averages.student(studentId)}${qs}`)
  },
  getPromotionAverages: (promotionId: string, historyId?: string) => {
    const qs = historyId ? `?history_id=${historyId}` : ""
    return api.get<StudentAnnualAverage[]>(`${ENDPOINTS.averages.promotion(promotionId)}${qs}`)
  }
}

export const academicYearApi = {
  list: () => api.get<AcademicYear[]>(ENDPOINTS.academicYears.base),
  active: () => api.get<AcademicYear>(ENDPOINTS.academicYears.active),
  activate: (id: string) => api.post<void>(ENDPOINTS.academicYears.activate(id), {}),
}

export const appealApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<GradeAppeal[]>(`${ENDPOINTS.appeals.base}${qs}`)
  },
  create: (body: unknown) => api.post<GradeAppeal>(ENDPOINTS.appeals.base, body),
  resolve: (id: string, status: "approved" | "rejected", response: string) =>
    api.patch<GradeAppeal>(ENDPOINTS.appeals.resolve(id), { status, response }),
}

export const assignmentApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Assignment[]>(`${ENDPOINTS.assignments.base}${qs}`)
  },
  create: (body: unknown) => api.post<Assignment>(ENDPOINTS.assignments.base, body),
  delete: (id: string) => api.delete<void>(ENDPOINTS.assignments.detail(id)),
}

export const submissionApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Submission[]>(`${ENDPOINTS.submissions.base}${qs}`)
  },
  create: (body: unknown) => api.post<Submission>(ENDPOINTS.submissions.base, body),
  grade: (id: string, grade: number, feedback: string) =>
    api.patch<Submission>(ENDPOINTS.submissions.grade(id), { grade, feedback }),
}

export const resourceApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<CourseResource[]>(`${ENDPOINTS.resources.base}${qs}`)
  },
  create: (body: unknown) => api.post<CourseResource>(ENDPOINTS.resources.base, body),
  delete: (id: string) => api.delete<void>(ENDPOINTS.resources.detail(id)),
}
