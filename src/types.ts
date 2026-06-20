// src/types.ts

export type RoleName =
  | "student"
  | "teacher"
  | "apparitorat"
  | "secretariat_faculte"
  | "secretariat_general"
  | "rectorat"
  | "section"

export interface Role {
  id: number
  nom: RoleName
}

export interface User {
  id: string // UUID
  first_name: string
  middle_name?: string
  last_name: string
  gender: "M" | "F"
  email: string
  role: Role
  is_active: boolean
  created_at?: string
  updated_at?: string
  faculty_id?: string
  promotion_id?: string
  // UI helper fields
  avatar?: string
  token?: string
}

export interface Faculty {
  id: string
  name: string
  code: string
  secretary?: User
}

export interface Promotion {
  id: string
  name: string
  code: string
  faculty_id: string
  level?: number | string
}

export interface Student {
  id: string
  user_id: string
  matricule: string
  birth_date: string
  phone_number: string
  faculty_id: string
  promotion_id?: string // Kept for frontend logic
  // User properties (often preloaded or flattened)
  first_name?: string
  middle_name?: string
  last_name?: string
  gender?: "M" | "F"
  email?: string
  // Preloads
  user?: User
  faculty?: Faculty
  promotion?: Promotion
  // UI helpers
  status?: "active" | "suspended" | "excluded" | "pending"
  average?: number
}

export interface Teacher {
  id: string
  user_id: string
  matricule: string
  title: string
  faculty_id: string
  // User properties
  first_name?: string
  middle_name?: string
  last_name?: string
  gender?: "M" | "F"
  email?: string
  // Preloads
  user?: User
  faculty?: Faculty
}

export interface TeachingUnit { // Unite d'Enseignement
  id: string
  code: string
  name: string
  semester: 1 | 2
  total_credits: number
  courses?: Course[]
}

export interface Room {
  id: string
  name: string
  capacity: number
  type: "auditoire" | "labo" | "salle decoference"
}

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  hours: number
  promotion_id: string
  teacher_id?: string
  // Preloads
  promotion?: Promotion
  teacher?: Teacher
}

export interface ScheduleSlot {
  id: string
  course_id: string
  promotion_id: string
  teacher_id?: string
  salle_id?: string
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi"
  start?: string
  end?: string
  start_time?: string
  end_time?: string
  room?: string
  salle?: Room
  start_date?: string
  end_date?: string
}

export type EvaluationType = "interrogation" | "tp" | "examen"

export interface Evaluation {
  id: string
  course_id: string
  history_ref_id: string
  title: string
  type: EvaluationType
  max_score: number
  weight: number
}

export interface Grade {
  id: string
  evaluation_id?: string
  student_id: string
  score_obtained?: number
  is_published?: boolean
  observation?: string
  course_id?: string
  promotion_id?: string
  score?: number
  status?: "validated" | "pending" | "rejected"
  session?: string
  type?: "TD" | "TP" | "Interro" | "Examen"
  assessment_title?: string
}

export interface StudentAnnualAverage {
  student_id: string
  student_name: string
  promotion_code: string
  academic_year: string
  general_average_s1: number
  general_average_s2: number
  general_average_annual: number
  semester_1_units: UnitAverage[]
  semester_2_units: UnitAverage[]
  total_capitalized_credits: number
}

export interface UnitAverage {
  unit_id: string
  unit_code: string
  unit_name: string
  semester: number
  unit_average: number
  capitalized_credits: number
  course_averages: CourseAverage[]
}

export interface CourseAverage {
  course_id: string
  course_code: string
  course_name: string
  average: number
  credits: number
  is_capitalized: boolean
}

export interface Announcement {
  id: string
  title: string
  body: string
  author: string
  date: string
  audience: Role | "all"
  priority: "info" | "important" | "urgent"
  scope: "global" | "faculty" | "course"
  target_id?: string // faculty_id or course_id
}

export interface Assignment {
  id: string
  course_id: string
  teacher_id: string
  title: string
  description: string
  due_date: string
  created_at: string
  type: "Formulaire" | "PDF" | "Lien"
  deadline_time?: string
  duration_minutes?: number // For timed forms
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content: string
  submitted_at: string
  grade?: number
  feedback?: string
}

export interface GradeAppeal {
  id: string
  student_id: string
  course_id: string
  grade_id: string
  reason: string
  status: "pending" | "approved" | "rejected"
  response?: string
  created_at: string
  estimated_grade: number
  proof_url?: string
  status_message?: string
}

export interface CourseResource {
  id: string
  course_id: string
  teacher_id: string
  title: string
  type: "pdf" | "video" | "link" | "doc"
  url: string
  created_at: string
}

export interface Notification {
  id: string
  type: "grade_modified" | "new_appeal" | "appeal_resolved" | "course_assigned"
  message: string
  target_role: Role
  read: boolean
  created_at: string
  metadata?: Record<string, string>
}

export interface AppData {
  teacherTitles: string[]
  users: User[]
  faculties: Faculty[]
  promotions: Promotion[]
  students: Student[]
  teachers: Teacher[]
  courses: Course[]
  schedules: ScheduleSlot[]
  grades: Grade[]
  announcements: Announcement[]
  assignments: Assignment[]
  submissions: Submission[]
  gradeAppeals: GradeAppeal[]
  courseResources: CourseResource[]
  notifications: Notification[]
  rooms: Room[]
}

export type StatusValue =
  | "active"
  | "pending"
  | "validated"
  | "suspended"
  | "rejected"
  | "info"
  | "important"
  | "urgent"

export interface PortalInfo {
  role: RoleName
  label: string
  description: string
}
