// src/hooks/api/index.ts
import { useFetch } from "../useFetch"
import { facultyApi, promotionApi, courseApi, roomApi, scheduleApi, gradeApi, appealApi, assignmentApi, submissionApi, resourceApi } from "@/api/endpoints/academic"
import { studentApi, teacherApi } from "@/api/endpoints/users"
import { announcementApi, notificationApi } from "@/api/endpoints/communications"

export const useFaculties = () => useFetch(() => facultyApi.list(), [])
export const usePromotions = (facultyId?: string) => useFetch(() => promotionApi.list(facultyId), [facultyId])
export const useCourses = (params?: Record<string, string>) => useFetch(() => courseApi.list(params), [JSON.stringify(params)])
export const useRooms = () => useFetch(() => roomApi.list(), [])
export const useSchedules = (params?: Record<string, string>) => useFetch(() => scheduleApi.list(params), [JSON.stringify(params)])
export const useGrades = (params?: Record<string, string>) => useFetch(() => gradeApi.list(params), [JSON.stringify(params)])
export const useAppeals = (params?: Record<string, string>) => useFetch(() => appealApi.list(params), [JSON.stringify(params)])
export const useAssignments = (params?: Record<string, string>) => useFetch(() => assignmentApi.list(params), [JSON.stringify(params)])
export const useSubmissions = (params?: Record<string, string>) => useFetch(() => submissionApi.list(params), [JSON.stringify(params)])
export const useResources = (params?: Record<string, string>) => useFetch(() => resourceApi.list(params), [JSON.stringify(params)])

export const useStudents = (params?: Record<string, string>) => useFetch(() => studentApi.list(params), [JSON.stringify(params)])
export const useTeachers = (params?: Record<string, string>) => useFetch(() => teacherApi.list(params), [JSON.stringify(params)])

export const useAnnouncements = (params?: Record<string, string>) => useFetch(() => announcementApi.list(params), [JSON.stringify(params)])
export const useNotifications = () => useFetch(() => notificationApi.list(), [])
