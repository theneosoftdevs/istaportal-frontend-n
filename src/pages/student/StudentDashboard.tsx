// src/pages/student/StudentDashboard.tsx
import { BookOpen, GaugeCircle, CalendarClock, Award } from "lucide-react"
import { KPICard } from "@/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { ScheduleGrid } from "@/components/ui/ScheduleGrid"
import { AnnouncementList } from "@/components/ui/AnnouncementList"
import { DashboardLayout } from "@/components/ui/DashboardLayout"
import { usePageData } from "@/hooks/usePageData"
import { useAuth } from "@/contexts/AuthContext"
import { i18n } from "@/lib/i18n"
import { getStudentDashboardData } from "@/lib/selectors"

export function StudentDashboard() {
  const { user } = useAuth()

  const { data, loading } = usePageData((d) =>
    getStudentDashboardData(d, user?.id)
  )

  if (loading || !data) return <Loader fullHeight />

  const { student, courses, schedules, announcements, grades, validated } = data
  const average = student.average ?? 0

  return (
    <DashboardLayout
      title={`${i18n.common.greeting}, ${student.user?.first_name || student.first_name || ""}`}
      subtitle={`${student.matricule} · ${(student.promotion_id || "").toUpperCase()} ${student.phone_number ? `· ${student.phone_number}` : ""}`}
      stats={
        <>
          <KPICard
            title={i18n.student.courses_enrolled}
            value={courses.length}
            subtitle={i18n.student.current_semester}
            icon={BookOpen}
            colorClass="bg-chart-1/10 text-chart-1"
          />
          <KPICard
            title={i18n.student.general_average}
            value={`${average.toFixed(1)}/20`}
            subtitle={i18n.common.session_in_progress}
            icon={GaugeCircle}
            colorClass="bg-chart-2/10 text-chart-2"
          />
          <KPICard
            title={i18n.rectorat.validated_grades_label}
            value={`${validated}/${grades.length}`}
            subtitle={i18n.rectorat.validated}
            icon={Award}
            colorClass="bg-chart-3/15 text-chart-3"
          />
          <KPICard
            title={i18n.teacher.weekly_sessions}
            value={schedules.length}
            subtitle={i18n.student.schedule}
            icon={CalendarClock}
            colorClass="bg-chart-4/10 text-chart-4"
          />
        </>
      }
    >
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{i18n.student.next_courses}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleGrid slots={schedules} courses={courses} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{i18n.student.latest_announcements}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementList items={announcements.slice(0, 3)} />
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
