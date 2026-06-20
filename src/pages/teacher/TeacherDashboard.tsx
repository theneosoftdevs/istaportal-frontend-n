// src/pages/teacher/TeacherDashboard.tsx
import { Users, FileClock, BookOpen, CalendarDays } from "lucide-react"
import { KPICard } from "@/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { ScheduleGrid } from "@/components/ui/ScheduleGrid"
import { DashboardLayout } from "@/components/ui/DashboardLayout"
import { usePageData } from "@/hooks/usePageData"
import { useAuth } from "@/contexts/AuthContext"
import { WEEK_DAYS_FULL } from "@/lib/constants"
import { i18n } from "@/lib/i18n"
import { getTeacherDashboardData } from "@/lib/selectors"

export function TeacherDashboard() {
  const { user } = useAuth()
  const todayName = WEEK_DAYS_FULL[new Date().getDay()]

  const { data, loading } = usePageData((d) =>
    getTeacherDashboardData(d, user?.id, todayName)
  )

  if (loading || !data) return <Loader fullHeight />

  const { teacher, courses, students, pendingGrades, schedules, todaySlots } = data
  const hasToday = todaySlots.length > 0

  return (
    <DashboardLayout
      title={`${i18n.common.greeting}, ${teacher.title} ${teacher.user?.last_name || ""}`}
      subtitle={`${teacher.matricule} · ${courses.length} ${i18n.teacher.active_courses.toLowerCase()}`}
      stats={
        <>
          <KPICard
            title={i18n.teacher.total_students}
            value={students.length}
            subtitle={i18n.teacher.all_promotions}
            icon={Users}
            colorClass="bg-chart-1/10 text-chart-1"
          />
          <KPICard
            title={i18n.teacher.pending_grades}
            value={pendingGrades.length}
            subtitle={i18n.teacher.to_validate}
            icon={FileClock}
            colorClass="bg-chart-3/15 text-chart-3"
          />
          <KPICard
            title={i18n.teacher.taught_courses}
            value={courses.length}
            subtitle={i18n.student.current_semester}
            icon={BookOpen}
            colorClass="bg-chart-2/10 text-chart-2"
          />
          <KPICard
            title={i18n.teacher.weekly_sessions}
            value={schedules.length}
            subtitle={i18n.teacher.today_schedule}
            icon={CalendarDays}
            colorClass="bg-chart-4/10 text-chart-4"
          />
        </>
      }
    >
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{i18n.teacher.today_schedule}</CardTitle>
          <CardDescription>
            {hasToday
              ? `${i18n.student.schedule} ${todayName.toLowerCase()}`
              : `${i18n.student.no_classes} (${todayName.toLowerCase()}) — ${i18n.teacher.schedule_overview}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleGrid
            slots={hasToday ? todaySlots : schedules}
            courses={courses}
            showDay={!hasToday}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{i18n.teacher.my_courses}</CardTitle>
          <CardDescription>{i18n.teacher.courses_charge}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {courses.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{c.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  {c.credits} {i18n.teacher.credits}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
