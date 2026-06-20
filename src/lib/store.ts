// src/lib/store.ts
// Compatibility layer for mutations to point directly to real APIs
import { studentApi, teacherApi } from "@/api/endpoints/users"
import { facultyApi, promotionApi, courseApi, roomApi, scheduleApi, gradeApi, appealApi, assignmentApi, submissionApi, resourceApi } from "@/api/endpoints/academic"
import { announcementApi, notificationApi } from "@/api/endpoints/communications"

export async function addStudent(student: any) { return await studentApi.createProfile(student) }
export async function updateStudent(student: any) { return await studentApi.update(student.id, student) }
export async function updateGradeStatus(id: string, status: any) { return await gradeApi.updateStatus(id, status) }
export async function setGradeScore(id: string, score: number) { return await gradeApi.upsert({ id, score }) }
export async function upsertGrade(grade: any) { return await gradeApi.upsert(grade) }
export async function addTeacher(teacher: any) { return await teacherApi.create(teacher) }
export async function addFaculty(faculty: any) { return await facultyApi.create(faculty) }
export async function addPromotion(promotion: any) { return await promotionApi.create(promotion) }
export async function assignCourseToTeacher(course_id: string, teacher_id: string) { return await courseApi.assignTeacher(course_id, teacher_id) }
export async function addAssignment(assignment: any) { return await assignmentApi.create(assignment) }
export async function removeAssignment(id: string) { return await assignmentApi.delete(id) }
export async function addSubmission(submission: any) { return await submissionApi.create(submission) }
export async function gradeSubmission(id: string, grade: number, feedback: string) { return await submissionApi.grade(id, grade, feedback) }
export async function addGrade(grade: any) { return await gradeApi.upsert(grade) }
export async function addGradeAppeal(appeal: any) { return await appealApi.create(appeal) }
export async function resolveGradeAppeal(id: string, status: any, response: string) { return await appealApi.resolve(id, status, response) }
export async function addCourseResource(resource: any) { return await resourceApi.create(resource) }
export async function removeCourseResource(id: string) { return await resourceApi.delete(id) }
export async function addRoom(room: any) { return await roomApi.create(room) }
export async function removeRoom(id: string) { return await roomApi.delete(id) }
export async function addScheduleSlot(slot: any) { return await scheduleApi.create(slot) }
export async function removeScheduleSlot(id: string) { return await scheduleApi.delete(id) }
export async function addAnnouncement(announcement: any) { return await announcementApi.create(announcement) }
export async function markNotificationRead(id: string) { return await notificationApi.markRead(id) }
export async function markAllNotificationsRead(role?: any) { return await notificationApi.markAllRead() }

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}
