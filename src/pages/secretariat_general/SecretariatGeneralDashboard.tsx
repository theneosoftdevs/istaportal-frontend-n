// src/pages/secretariat_general/SecretariatGeneralDashboard.tsx
import { Users, Building2, BookOpen, UserSquare2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { AnnouncementList } from "@/components/ui/AnnouncementList"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { usePageData } from "@/hooks/usePageData"
import { i18n } from "@/lib/i18n"
import { getSecretariatGeneralDashboardData } from "@/lib/selectors"

interface FacultyRow {
  id: string
  name: string
  code: string
  studentCount: number
  courseCount: number
  teacherCount: number
}

export function SecretariatGeneralDashboard() {
  const { data, loading } = usePageData(getSecretariatGeneralDashboardData)

  const columns: Column<FacultyRow>[] = [
    {
      key: "name",
      header: i18n.secretariat_general.faculty_col,
      render: (f) => (
        <div>
          <p className="font-medium text-foreground">{f.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{f.code}</p>
        </div>
      ),
    },
    {
      key: "secretary",
      header: "Secrétaire de Faculté",
      render: (f: any) => f.secretary ? `${f.secretary.first_name} ${f.secretary.last_name}` : "—"
    },
    {
      key: "studentCount",
      header: i18n.secretariat_general.students_col,
      align: "center",
      render: (f) => <span className="font-semibold text-foreground">{f.studentCount}</span>,
    },
    {
      key: "courseCount",
      header: i18n.secretariat_general.courses_col,
      align: "center",
      className: "text-muted-foreground",
    },
    {
      key: "teacherCount",
      header: i18n.secretariat_general.teachers_col,
      align: "right",
      className: "text-muted-foreground",
    },
  ]

  if (loading || !data) return <Loader fullHeight />

  return (
    <>
      <PageHeader
        title={i18n.secretariat_general.dashboard_title}
        subtitle={i18n.secretariat_general.dashboard_subtitle}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title={i18n.secretariat_general.enrolled_students}
          value={data.totalStudents}
          subtitle={`${data.activeStudents} ${i18n.common.active}`}
          icon={Users}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title={i18n.secretariat_general.faculties}
          value={data.totalFaculties}
          subtitle={i18n.secretariat_general.academic_entities}
          icon={Building2}
          colorClass="bg-chart-5/10 text-chart-5"
        />
        <KPICard
          title={i18n.secretariat_general.teachers}
          value={data.totalTeachers}
          subtitle={i18n.secretariat_general.teaching_staff}
          icon={UserSquare2}
          colorClass="bg-chart-3/15 text-chart-3"
        />
        <KPICard
          title={i18n.secretariat_general.courses}
          value={data.totalCourses}
          subtitle={i18n.secretariat_general.teaching_units}
          icon={BookOpen}
          colorClass="bg-chart-4/10 text-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{i18n.secretariat_general.faculty_distribution}</CardTitle>
            <CardDescription>{i18n.secretariat_general.faculty_dist_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data.byFaculty}
              rowKey={(f) => f.id}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{i18n.secretariat_general.recent_announcements}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementList items={data.recentAnnouncements} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
