// src/types.ts

export type Gender = 'M' | 'F';
export type EvaluationType = 'interrogation' | 'tp' | 'examen';
export type SalleType = 'auditoire' | 'labo' | 'salle decoference';

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
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: Gender;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  faculty_id?: string;
  promotion_id?: string;
  // UI helper fields
  avatar?: string;
  token?: string;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  secretary?: User;
}

export interface Promotion {
  id: string;
  name: string;
  faculty_id: string;
  level: number;
  code?: string;
  faculty?: Faculty;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  matricule: string;
  birth_date: string;
  phone_number: string;
  faculty_id: string;
  promotion_id?: string;
  academic_year_id?: string;
  faculty?: Faculty;
  user?: User;
}

// Keeping Student alias for backward compatibility in components
export type Student = StudentProfile & {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: Gender;
  email?: string;
  promotion?: Promotion;
  status?: "active" | "suspended" | "excluded" | "pending";
  average?: number;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  title: string;
  faculty_id: string;
  faculty?: Faculty;
  user?: User;
}

// Keeping Teacher alias
export type Teacher = TeacherProfile & {
  matricule?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: Gender;
  email?: string;
  status?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  promotion_id: string;
  teacher_id?: string;
  faculty_id?: string;
  // UI preloads
  promotion?: Promotion;
  teacher?: Teacher;
  hours?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: SalleType;
  description?: string;
}

export interface ScheduleSlot {
  id: string;
  course_id: string;
  promotion_id: string;
  teacher_id?: string;
  salle_id?: string;
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi";
  start_time: string;
  end_time: string;
  // UI helpers for backward compatibility
  start?: string;
  end?: string;
  start_date?: string;
  end_date?: string;
  room?: string;
  salle?: Room;
  course?: Course;
}

export interface Evaluation {
  id: string;
  course_id: string;
  history_ref_id: string;
  title: string;
  type: EvaluationType;
  max_score: number;
  weight: number;
}

export interface Grade {
  id: string;
  evaluation_id: string;
  student_id: string;
  score_obtained: number;
  is_published: boolean;
  observation?: string;
  // Legacy/UI helpers
  score?: number;
  status?: string;
  type?: string;
  session?: string;
  course_id?: string;
  promotion_id?: string;
  assessment_title?: string;
}

export interface StudentAnnualAverage {
  student_id: string;
  student_name: string;
  promotion_code: string;
  academic_year: string;
  general_average_s1: number;
  general_average_s2: number;
  general_average_annual: number;
  semester_1_units: UnitAverage[];
  semester_2_units: UnitAverage[];
  total_capitalized_credits: number;
}

export interface UnitAverage {
  unit_id: string;
  unit_code: string;
  unit_name: string;
  semester: number;
  unit_average: number; // Moyenne sur 20
  capitalized_credits: number;
  course_averages: CourseAverage[];
}

export interface CourseAverage {
  course_id: string;
  course_code: string;
  course_name: string;
  average: number;
  credits: number;
  is_capitalized: boolean; // Si moyenne >= 10
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  audience: Role | "all";
  priority: "info" | "important" | "urgent";
  scope: "global" | "faculty" | "course";
  target_id?: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  type: "Formulaire" | "PDF" | "Lien";
  deadline_time?: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
}

export interface GradeAppeal {
  id: string;
  student_id: string;
  course_id: string;
  grade_id: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  response?: string;
  created_at: string;
  estimated_grade: number;
  proof_url?: string;
  status_message?: string;
}

export interface CourseResource {
  id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  type: "pdf" | "video" | "link" | "doc";
  url: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, string>;
  target_role?: Role;
}

export interface AcademicYear {
  id: string;
  name: string;
  is_active: boolean;
}

export interface AppData {
  teacherTitles: string[];
  users: User[];
  faculties: Faculty[];
  promotions: Promotion[];
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  schedules: ScheduleSlot[];
  grades: Grade[];
  announcements: Announcement[];
  assignments: Assignment[];
  submissions: Submission[];
  gradeAppeals: GradeAppeal[];
  courseResources: CourseResource[];
  notifications: Notification[];
  rooms: Room[];
  academicYears: AcademicYear[];
}

export type StatusValue =
  | "active"
  | "pending"
  | "validated"
  | "suspended"
  | "rejected"
  | "info"
  | "important" | "urgent"

export interface PortalInfo {
  role: RoleName;
  label: string;
  description: string;
}
