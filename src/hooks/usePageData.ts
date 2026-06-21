import { 
  useFaculties, usePromotions, useStudents, useTeachers, useCourses, 
  useSchedules, useRooms, useGrades, useAppeals, useAssignments, 
  useSubmissions, useResources, useAnnouncements, useNotifications,
  useAcademicYears
} from "./api"

import type { AppData, Promotion } from "@/types"

/** 
 * Replaces the old local store. Now fetches data from the real backend APIs.
 * Note: Since this fetches on every mount, it acts as a transitional layer. 
 */
export function useStore(): AppData {
  const facultiesData = useFaculties().data || []
  const promotionsData = usePromotions().data || []
  const studentsData = useStudents().data || []
  const teachersData = useTeachers().data || []
  const coursesData = useCourses().data || []
  const schedulesData = useSchedules().data || []
  const roomsData = useRooms().data || []
  const gradesData = useGrades().data || []
  const appealsData = useAppeals().data || []
  const assignmentsData = useAssignments().data || []
  const submissionsData = useSubmissions().data || []
  const resourcesData = useResources().data || []
  const announcementsData = useAnnouncements().data || []
  const notificationsData = useNotifications().data || []
  const academicYearsData = useAcademicYears().data || []

  // Ensure promotions have a code if missing (for legacy or partial data)
  const promotions: Promotion[] = promotionsData.map(p => ({
    ...p,
    code: p.code || p.name.substring(0, 3).toUpperCase(),
    faculty_id: p.faculty_id || ""
  }))

  return { 
    faculties: facultiesData, 
    promotions,
    students: studentsData, 
    teachers: teachersData, 
    courses: coursesData, 
    schedules: schedulesData, 
    rooms: roomsData, 
    grades: gradesData, 
    gradeAppeals: appealsData, 
    assignments: assignmentsData, 
    submissions: submissionsData, 
    courseResources: resourcesData, 
    announcements: announcementsData, 
    notifications: notificationsData,
    academicYears: academicYearsData,
    users: [],
    teacherTitles: ["Professeur", "Professeure", "Assistant", "Assistante", "Chef de Travaux", "Maître de Conférences"]
  }
}

export function usePageData<T>(selector: (data: AppData) => T) {
  const store = useStore()
  
  try {
    const data = selector(store)
    return { data, loading: false, error: null }
  } catch (e) {
    return { data: null, loading: false, error: e instanceof Error ? e.message : "Erreur" }
  }
}
