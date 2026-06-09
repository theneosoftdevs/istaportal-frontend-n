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
  role_id: number
  role: Role
  is_active: boolean
  created_at: string
  updated_at?: string
  // UI helper fields (if needed)
  avatar?: string
  token?: string
  token_type?: string
}

export interface Faculty {
  id: string
  name: string
  code: string
  promotion_id?: string
  secretariat_faculte_id?: string
  // Preloads
  promotion?: Promotion
}

export interface Promotion {
  id: string
  name: string
  faculty_id?: string
  // Preloads
  faculty?: Faculty
}

export interface Student {
  id: string
  user_id: string
  matricule: string
  birth_date: string
  phone_number: string
  promotion_id: string
  faculty_id?: string
  // Preloads
  user?: User
  promotion?: Promotion
  faculty?: Faculty
  // UI helpers
  status?: "active" | "suspended" | "excluded" | "pending"
}

export interface Teacher {
  id: string
  user_id: string
  matricule: string
  title: string
  faculty_id: string
  // Preloads
  user?: User
  faculty?: Faculty
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
  teacher_id: string
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi"
  start: string
  end: string
  room: string
  startDate?: string
  endDate?: string
}

export interface Grade {
  id: string
  student_id: string
  course_id: string
  promotion_id: string
  score: number
  status: "validated" | "pending" | "rejected"
  session: string
  type: "TD" | "TP" | "Interro" | "Examen"
  assessmentTitle?: string
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
  targetId?: string // facultyId or courseId
}

export interface Assignment {
  id: string
  courseId: string
  teacherId: string
  title: string
  description: string
  dueDate: string
  createdAt: string
  type: "Formulaire" | "PDF" | "Lien"
  deadlineTime?: string
  durationMinutes?: number // For timed forms
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  content: string
  submittedAt: string
  grade?: number
  feedback?: string
}

export interface GradeAppeal {
  id: string
  studentId: string
  courseId: string
  gradeId: string
  reason: string
  status: "pending" | "approved" | "rejected"
  response?: string
  createdAt: string
  estimatedGrade: number
  proofUrl?: string
  statusMessage?: string
}

export interface CourseResource {
  id: string
  courseId: string
  teacherId: string
  title: string
  type: "pdf" | "video" | "link" | "doc"
  url: string
  createdAt: string
}

export interface Notification {
  id: string
  type: "grade_modified" | "new_appeal" | "appeal_resolved" | "course_assigned"
  message: string
  targetRole: Role
  read: boolean
  createdAt: string
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
