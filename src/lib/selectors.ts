// src/lib/selectors.ts
import type {
  AppData,
  Student,
  Teacher,
  Course,
  ScheduleSlot,
  Grade,
  Announcement,
  RoleName,
} from "../types";
import { isPendingStudentStatus } from "./studentStatus";

/**
 * Enriches a student object with faculty code and promotion name.
 * Handles both the new nested structure and flat legacy structure.
 */
export function enrichStudent(d: AppData, student: Student) {
  const user = student.user || {
    first_name: (student as any).first_name || "",
    last_name: (student as any).last_name || "",
    middle_name: (student as any).middle_name || "",
    gender: (student as any).gender || "M",
    email: (student as any).email || "",
  };

  // If the backend provides academic histories, prefer the current history to derive promotion/academic year
  const histories =
    (student as any).histories || (student as any).academic_histories || [];
  const currentHistory = Array.isArray(histories)
    ? histories.find(
        (h: any) => (h.status || h.state || h.statut) === "en_cours",
      ) || histories[0]
    : undefined;

  const promotion =
    student.promotion ||
    (currentHistory &&
      (currentHistory.promotion ||
        d.promotions.find(
          (p) =>
            p.id ===
            (currentHistory.promotion_id || currentHistory.promotion?.id),
        ))) ||
    d.promotions.find((p) => p.id === student.promotion_id);

  const faculty =
    student.faculty ||
    (currentHistory &&
      (currentHistory.faculty ||
        d.faculties.find(
          (f) =>
            f.id === (currentHistory.faculty_id || currentHistory.faculty?.id),
        ))) ||
    d.faculties.find((f) => f.id === student.faculty_id);

  const academicYears = d.academicYears || [];
  const academicYear =
    student.academic_year ||
    (currentHistory &&
      (currentHistory.academic_year ||
        academicYears.find(
          (ay) =>
            ay.id ===
            (currentHistory.academic_year_id ||
              currentHistory.academic_year?.id),
        ))) ||
    academicYears.find((ay) => ay.id === student.academic_year_id);

  const promotionName =
    (promotion as any)?.name ||
    (promotion as any)?.display_name ||
    (promotion as any)?.code ||
    (promotion as any)?.title ||
    "—";

  const academicYearName =
    (academicYear as any)?.display_name || (academicYear as any)?.name || "—";

  return {
    ...student,
    first_name: user.first_name || (student as any).first_name || "",
    middle_name: user.middle_name || (student as any).middle_name || "",
    last_name: user.last_name || (student as any).last_name || "",
    gender: (user.gender as any) || (student as any).gender || "M",
    email: user.email || (student as any).email || "",
    phone_number:
      student.phone_number ||
      (student as any).phone ||
      (student as any).phone_number ||
      "",
    faculty_id: student.faculty_id || "",
    promotion_id: student.promotion_id || "",
    academic_year_id: student.academic_year_id || "",
    facultyCode: faculty?.code || "—",
    promotionName,
    academicYearName,
  };
}

/**
 * Gets enriched students list.
 */
export function getEnrichedStudents(d: AppData) {
  return d.students.map((s) => enrichStudent(d, s));
}

/**
 * Enriches a course object with promotion name, teacher info and schedules.
 */
export function enrichCourse(d: AppData, course: Course) {
  const promotion = d.promotions.find((p) => p.id === course.promotion_id);
  const teacher = d.teachers.find((t) => t.id === course.teacher_id);
  const room = d.rooms.find((r) => r.id === (course as any).roomId); // roomId might be in schedules or separate
  const schedules = d.schedules.filter((s) => s.course_id === course.id);

  return {
    ...course,
    promotionName: promotion?.name ?? "—",
    teacherName: teacher
      ? `${teacher.user?.first_name} ${teacher.user?.middle_name || ""} ${teacher.user?.last_name || ""}`.trim()
      : "Non attribué",
    teacherTitle: teacher?.title ?? "",
    roomName: room?.name ?? "Non attribuée",
    schedules,
  };
}

/**
 * Gets enriched courses list.
 */
export function getEnrichedCourses(d: AppData) {
  return d.courses.map((c) => enrichCourse(d, c));
}

/**
 * Filters announcements by audience and sorts them by date.
 */
export function getAnnouncementsFor(
  d: AppData,
  audience: RoleName | "all" | "global",
) {
  return d.announcements
    .filter((a) => {
      const aAudience =
        typeof a.audience === "string" ? a.audience : a.audience.nom;
      return aAudience === "all" || aAudience === audience;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Gets dashboard metrics for a teacher.
 */
export function getTeacherDashboardData(
  d: AppData,
  userId?: string,
  todayDayName?: string,
) {
  const teacher = d.teachers.find(
    (t) => t.user_id === userId || t.id === userId,
  );
  if (!teacher) return null;

  const courses = d.courses.filter((c) => c.teacher_id === teacher.id);
  const promotionIds = new Set(courses.map((c) => c.promotion_id));
  const students = d.students.filter(
    (s) => s.promotion_id && promotionIds.has(s.promotion_id),
  );
  const courseIds = new Set(courses.map((c) => c.id));
  const pendingGrades = d.grades.filter(
    (g) => courseIds.has(g.course_id) && g.status === "pending",
  );
  const schedules = d.schedules.filter((s) => s.teacher_id === teacher.id);
  const todaySlots = todayDayName
    ? schedules.filter((s) => s.day === todayDayName)
    : [];

  return { teacher, courses, students, pendingGrades, schedules, todaySlots };
}

/**
 * Gets dashboard metrics for a student.
 */
export function getStudentDashboardData(d: AppData, userId?: string) {
  const student = d.students.find(
    (s) => s.user_id === userId || s.id === userId,
  );
  if (!student) return null;

  const courses = d.courses.filter(
    (c) => c.promotion_id === student.promotion_id,
  );
  const schedules = d.schedules.filter(
    (s) => s.promotion_id === student.promotion_id,
  );
  const grades = d.grades.filter((g) => g.student_id === student.id);
  const announcements = getAnnouncementsFor(d, "student");
  const validated = grades.filter((g) => g.status === "validated").length;

  return { student, courses, schedules, announcements, grades, validated };
}

/**
 * Gets global stats for Apparitorat.
 */
export function getApparitoratStats(d: AppData) {
  const total = d.students.length;
  let girls = 0;
  let boys = 0;
  const pending: any[] = [];

  d.students.forEach((s) => {
    const user = s.user;
    if (user?.gender === "F") girls++;
    if (user?.gender === "M") boys++;
    if (isPendingStudentStatus(s.status)) {
      pending.push(enrichStudent(d, s));
    }
  });

  const pendingCount = pending.length;
  const totalMax = d.rooms.reduce((acc, r) => acc + r.capacity, 0);

  const byFaculty = d.faculties.map((f) => ({
    name: f.name,
    code: f.code,
    count: d.students.filter((s) => s.faculty_id === f.id).length,
  }));

  return { total, girls, boys, pendingCount, totalMax, pending, byFaculty };
}

/**
 * Gets dashboard metrics for Secretariat General.
 */
export function getSecretariatGeneralDashboardData(d: AppData) {
  const totalStudents = d.students.length;
  const activeStudents = d.students.filter((s) => s.status === "active").length;
  const byFaculty = d.faculties.map((f) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    secretary: (f as any).secretary,
    studentCount: d.students.filter((s) => s.faculty_id === f.id).length,
    courseCount: d.courses.filter(
      (c) =>
        c.promotion_id &&
        d.promotions.find((p) => p.id === c.promotion_id)?.faculty_id === f.id,
    ).length,
    teacherCount: d.teachers.filter((t) => t.faculty_id === f.id).length,
  }));
  const recentAnnouncements = d.announcements
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return {
    totalStudents,
    activeStudents,
    totalFaculties: d.faculties.length,
    totalTeachers: d.teachers.length,
    totalCourses: d.courses.length,
    byFaculty,
    recentAnnouncements,
  };
}

/**
 * Gets dashboard metrics for a specific Faculty.
 */
export function getFacultyDashboardData(d: AppData, faculty_id: string) {
  const faculty =
    d.faculties.find((f) => f.id === faculty_id) ?? d.faculties[0];
  const promotions = d.promotions.filter((p) => p.faculty_id === faculty.id);
  const students = d.students.filter((s) => s.faculty_id === faculty.id);
  const courses = d.courses.filter(
    (c) =>
      d.promotions.find((p) => p.id === c.promotion_id)?.faculty_id ===
      faculty.id,
  );
  const teachers = d.teachers.filter((t) => t.faculty_id === faculty.id);

  return {
    faculties: d.faculties,
    faculty,
    promotions,
    students,
    courses,
    teachers,
  };
}

/**
 * Gets dashboard metrics for Rectorat.
 */
export function getRectoratDashboardData(d: AppData) {
  const totalStudents = d.students.length;
  const activeStudents = d.students.filter((s) => s.status === "active").length;
  const validatedGrades = d.grades.filter(
    (g) => g.status === "validated",
  ).length;
  const pendingGrades = d.grades.filter((g) => g.status === "pending").length;

  const byFaculty = d.faculties.map((f) => ({
    name: f.code,
    fullName: f.name,
    etudiants: d.students.filter((s) => s.faculty_id === f.id).length,
  }));

  const recentActivity = [
    {
      label: "validated_grades_label", // These will be used as keys for i18n in the component
      value: validatedGrades,
      total: d.grades.length,
      percent: d.grades.length
        ? Math.round((validatedGrades / d.grades.length) * 100)
        : 0,
      color: "bg-chart-3",
    },
    {
      label: "active_students_label",
      value: activeStudents,
      total: totalStudents,
      percent: totalStudents
        ? Math.round((activeStudents / totalStudents) * 100)
        : 0,
      color: "bg-chart-1",
    },
  ];

  return {
    totalStudents,
    activeStudents,
    totalFaculties: d.faculties.length,
    totalCourses: d.courses.length,
    validatedGrades,
    pendingGrades,
    byFaculty,
    recentActivity,
  };
}
