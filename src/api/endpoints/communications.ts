import { api } from "../client"
import type { Announcement, Notification } from "@/types"

export const ENDPOINTS = {
  announcements: {
    base: "/notifications", // Doc says Staff creates notifications/announcements at /notifications
  },
  notifications: {
    base:    "/me/notifications",
    read:    (id: string) => `/me/notifications/${id}/read`,
    readAll: "/me/notifications/read-all", // Assuming this exists or will be added
  },
}

export const announcementApi = {
  list:   (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : ""
    return api.get<Announcement[]>(`${ENDPOINTS.announcements.base}${qs}`)
  },
  create: (body: unknown) => api.post<Announcement>(ENDPOINTS.announcements.base, body),
}

export const notificationApi = {
  list:       ()          => api.get<Notification[]>(ENDPOINTS.notifications.base),
  markRead:   (id: string)=> api.patch<void>(ENDPOINTS.notifications.read(id), {}),
  markAllRead:()          => api.patch<void>(ENDPOINTS.notifications.readAll, {}),
}
