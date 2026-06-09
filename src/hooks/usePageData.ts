import { 
  useFaculties, usePromotions, useStudents, useTeachers, useCourses, 
  useSchedules, useRooms, useGrades, useAppeals, useAssignments, 
  useSubmissions, useResources, useAnnouncements, useNotifications
} from "./api"

import type { AppData } from "@/types"

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

  return { 
    faculties: facultiesData, 
    promotions: (promotionsData.length > 0) 
      ? promotionsData.map((p) => ({
          ...p,
          facultyId: p.faculty_id || p.facultyId || p.faculty?.id || "",
        }))
      : facultiesData.filter(f => f.promotion || f.promotion_id).map(f => ({
          id: f.promotion?.id || f.promotion_id || "",
          name: f.promotion?.name || `Promotion ${f.code}`,
          facultyId: f.id,
          faculty: { id: f.id, name: f.name, code: f.code }
        })),
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
