import { api } from "../client";
import type { User, StudentProfile, TeacherProfile, Student } from "@/types";

interface StudentProfilePayload {
  user_id: string;
  birth_date: string;
  phone_number: string;
  faculty_id: string;
  promotion_id?: string;
  academic_year_id?: string;
  status?: string;
}

interface TeacherProfilePayload {
  user_id: string;
  title: string;
  faculty_id: string;
}

export const ENDPOINTS = {
  users: {
    detail: (id: string) => `/users/${id}`,
  },
  profiles: {
    students: {
      base: "/profiles/students",
      promotions: "/profiles/students/promotions",
      histories: "/profiles/students/histories",
      detail: (userId: string) => `/profiles/students/${userId}`,
      status: (userId: string) => `/profiles/students/${userId}/status`,
    },
    teachers: {
      base: "/profiles/teachers",
      detail: (userId: string) => `/profiles/teachers/${userId}`,
      titles: "/profiles/teachers/titles",
    },
  },
};

export const userApi = {
  get: (id: string) => api.get<User>(ENDPOINTS.users.detail(id)),
  update: (id: string, payload: Partial<User>) =>
    api.patch<User>(ENDPOINTS.users.detail(id), payload),
};

export const studentApi = {
  list: async (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";

    const toArray = (input: any): any[] => {
      if (Array.isArray(input)) return input;
      if (!input || typeof input !== "object") return [];

      const candidates = [
        input.data,
        input.items,
        input.results,
        input.rows,
        input.students,
        input.histories,
        input.promotions,
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
      }

      return [];
    };

    // Endpoint principal: obligatoire. Si celui-ci tombe, on laisse l'erreur remonter.
    const studentsRows = toArray(
      await api.get<any[]>(`${ENDPOINTS.profiles.students.base}${qs}`),
    );

    // Endpoints complémentaires: optionnels. On les protège avec timeout pour éviter
    // de bloquer l'affichage des étudiants si /promotions ou /histories est indisponible.
    const safeGetArray = async (path: string, timeoutMs = 2500) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const result = await api.get<any[]>(path, controller.signal);
        return toArray(result);
      } catch {
        return [];
      } finally {
        clearTimeout(timer);
      }
    };

    const [promotionsRows, historiesRows] = await Promise.all([
      safeGetArray(`${ENDPOINTS.profiles.students.promotions}${qs}`),
      safeGetArray(`${ENDPOINTS.profiles.students.histories}${qs}`),
    ]);

    const normalizeStatus = (status?: string | null) =>
      (status || "").toString().trim().toLowerCase();

    const pickCurrentHistory = (rows: any[]) => {
      if (!Array.isArray(rows) || rows.length === 0) return undefined;
      const inProgress = rows.find(
        (h) =>
          normalizeStatus(h?.status || h?.state || h?.statut) === "en_cours",
      );
      if (inProgress) return inProgress;

      const sorted = [...rows].sort((a, b) => {
        const aDate = Date.parse(a?.updated_at || a?.created_at || "") || 0;
        const bDate = Date.parse(b?.updated_at || b?.created_at || "") || 0;
        return bDate - aDate;
      });

      return sorted[0];
    };

    const historyByStudentId = new Map<string, any[]>();

    [...promotionsRows, ...historiesRows].forEach((row: any) => {
      const keys = [
        row?.student_id,
        row?.student?.id,
        row?.student?.user_id,
      ].filter(Boolean) as string[];

      if (keys.length === 0) return;

      keys.forEach((key) => {
        const list = historyByStudentId.get(key) || [];
        list.push(row);
        historyByStudentId.set(key, list);
      });
    });

    return studentsRows.map((item: any) => {
      // Backend may return either a flat student object or an envelope like { profile: {...}, average: X }
      const profile = item.profile || item;
      const user = profile.user || item.user || profile;

      const embeddedHistoryCandidates = [
        profile.histories,
        profile.academic_histories,
        profile.history,
        profile.academic_history,
        profile.current_history,
        item.histories,
        item.academic_histories,
        item.history,
        item.academic_history,
        item.current_history,
      ].filter(Boolean);

      const embeddedHistories = Array.isArray(embeddedHistoryCandidates[0])
        ? embeddedHistoryCandidates[0]
        : embeddedHistoryCandidates.length > 0
          ? [embeddedHistoryCandidates[0]]
          : undefined;

      const fallbackHistories =
        historyByStudentId.get(profile.id) ||
        historyByStudentId.get(profile.student_id) ||
        historyByStudentId.get(profile.user_id) ||
        historyByStudentId.get(item.student_id) ||
        historyByStudentId.get(item.user_id) ||
        historyByStudentId.get(user?.id) ||
        [];

      const histories =
        Array.isArray(embeddedHistories) && embeddedHistories.length > 0
          ? embeddedHistories
          : fallbackHistories;

      const currentHistory = pickCurrentHistory(histories);

      const avg =
        item.average ??
        item.avg ??
        profile.average ??
        profile.avg ??
        item.general_average_annual ??
        item.general_average ??
        (item as any).moyenne ??
        undefined;

      const student: Student = {
        id:
          profile.id || profile.student_id || profile.user_id || user.id || "",
        user_id: profile.user_id || user.id || "",
        matricule: profile.matricule || profile.code || user.matricule || "",
        birth_date: profile.birth_date || "",
        phone_number: profile.phone_number || profile.phone || user.phone || "",
        faculty_id:
          profile.faculty_id ||
          (profile.faculty && profile.faculty.id) ||
          currentHistory?.promotion?.faculty_id ||
          currentHistory?.faculty_id ||
          currentHistory?.faculty?.id ||
          "",
        promotion_id:
          profile.promotion_id ||
          (profile.promotion &&
            (profile.promotion.id || (profile.promotion as any)._id)) ||
          profile.promotionId ||
          (currentHistory &&
            (currentHistory.promotion_id || currentHistory.promotion?.id)) ||
          "",
        academic_year_id:
          profile.academic_year_id ||
          (profile.academic_year &&
            (profile.academic_year.id || (profile.academic_year as any)._id)) ||
          profile.academicYearId ||
          item.academic_year_id ||
          (item.academic_year &&
            (item.academic_year.id || (item.academic_year as any)._id)) ||
          (currentHistory &&
            (currentHistory.academic_year_id ||
              currentHistory.academic_year?.id ||
              currentHistory.academicYearId)) ||
          "",
        user: profile.user || user || undefined,
        faculty:
          profile.faculty ||
          currentHistory?.promotion?.faculty ||
          currentHistory?.faculty ||
          undefined,
        promotion:
          profile.promotion ||
          (profile as any).promotion ||
          currentHistory?.promotion ||
          undefined,
        academic_year:
          profile.academic_year ||
          (profile as any).academic_year ||
          item.academic_year ||
          currentHistory?.academic_year ||
          undefined,
        ...(histories ? { histories: histories as any[] } : {}),
        first_name: user.first_name || "",
        middle_name: user.middle_name,
        last_name: user.last_name || "",
        email: user.email || "",
        status:
          profile.status ||
          (currentHistory &&
            (currentHistory.status ||
              currentHistory.state ||
              currentHistory.statut)) ||
          "",
        average: typeof avg === "number" ? avg : avg ? Number(avg) : undefined,
      };

      return student;
    });
  },
  listPromotions: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<any[]>(`${ENDPOINTS.profiles.students.promotions}${qs}`);
  },
  listHistories: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<any[]>(`${ENDPOINTS.profiles.students.histories}${qs}`);
  },
  listHistoriesByYear: (
    academicYearId: string,
    params?: Record<string, string>,
  ) => {
    const search = new URLSearchParams({
      academic_year_id: academicYearId,
      ...(params || {}),
    });
    return api.get<any[]>(
      `${ENDPOINTS.profiles.students.histories}?${search.toString()}`,
    );
  },
  create: (payload: StudentProfilePayload) =>
    api.post<StudentProfile>(ENDPOINTS.profiles.students.base, payload),
  createProfile: (payload: StudentProfilePayload) =>
    api.post<StudentProfile>(ENDPOINTS.profiles.students.base, payload),
  get: (userId: string) =>
    api.get<StudentProfile>(ENDPOINTS.profiles.students.detail(userId)),
  update: (userId: string, payload: Partial<StudentProfile>) =>
    api.put<StudentProfile>(
      ENDPOINTS.profiles.students.detail(userId),
      payload,
    ),
  updateProfile: (userId: string, payload: Partial<StudentProfilePayload>) =>
    api.put<StudentProfile>(
      ENDPOINTS.profiles.students.detail(userId),
      payload,
    ),
  updateStatus: (userId: string, status: string) =>
    api.patch<StudentProfile>(ENDPOINTS.profiles.students.status(userId), {
      status,
    }),
};

export const teacherApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<TeacherProfile[]>(
      `${ENDPOINTS.profiles.teachers.base}${qs}`,
    );
  },
  create: (payload: TeacherProfilePayload) =>
    api.post<TeacherProfile>(ENDPOINTS.profiles.teachers.base, payload),
  get: (userId: string) =>
    api.get<TeacherProfile>(ENDPOINTS.profiles.teachers.detail(userId)),
  update: (userId: string, payload: Partial<TeacherProfilePayload>) =>
    api.put<TeacherProfile>(
      ENDPOINTS.profiles.teachers.detail(userId),
      payload,
    ),
  titles: () => api.get<string[]>(ENDPOINTS.profiles.teachers.titles),
};
