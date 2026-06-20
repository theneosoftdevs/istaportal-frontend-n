// src/pages/secretariat_faculte/FacultyDashboard.tsx
import { useState } from "react"
import { Users, GraduationCap, BookOpen, UserSquare2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePageData } from "@/hooks/usePageData"
import { i18n } from "@/lib/i18n"
import { getFacultyDashboardData } from "@/lib/selectors"
import { useAuth } from "@/contexts/AuthContext"

export function FacultyDashboard() {
  const { user } = useAuth()
  const [faculty_id, setFacultyId] = useState(user?.faculty_id || "")

  const { data, loading } = usePageData((d) => {
    const fallbackId = faculty_id || d.faculties[0]?.id
    return getFacultyDashboardData(d, fallbackId)
  })

  // Update faculty_id if it was empty and data loaded
  if (!faculty_id && data?.faculty?.id) {
    setFacultyId(data.faculty.id)
  }

  if (loading || !data) return <Loader fullHeight />

  const { faculty, faculties, students, promotions, courses, teachers } = data

  if (!faculty) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Aucune faculté trouvée.</p>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={i18n.secretariat_faculte.dashboard_title}
        subtitle={`${faculty.name} · Secrétaire de Faculté : ${faculty.secretary ? `${faculty.secretary.first_name} ${faculty.secretary.last_name}` : "—"}`}
        action={
          <Select value={faculty_id} onValueChange={setFacultyId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder={i18n.secretariat_faculte.faculty_select} />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title={i18n.secretariat_faculte.students} value={students.length} icon={Users} colorClass="bg-chart-1/10 text-chart-1" />
        <KPICard title={i18n.secretariat_faculte.promotions} value={promotions.length} icon={GraduationCap} colorClass="bg-chart-2/10 text-chart-2" />
        <KPICard title={i18n.secretariat_faculte.courses} value={courses.length} icon={BookOpen} colorClass="bg-chart-4/10 text-chart-4" />
        <KPICard title={i18n.secretariat_faculte.teachers} value={teachers.length} icon={UserSquare2} colorClass="bg-chart-3/15 text-chart-3" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{i18n.secretariat_faculte.promotions}</CardTitle>
            <CardDescription>{i18n.secretariat_faculte.promotions_effectifs}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {promotions.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{i18n.secretariat_faculte.level} {p.level}</p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold text-foreground">
                    {students.filter((s) => s.promotion_id === p.id).length}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{i18n.secretariat_faculte.faculty_teachers}</CardTitle>
            <CardDescription>{i18n.secretariat_faculte.faculty_teachers_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {teachers.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">
                      {t.first_name} {t.middle_name || ""} {t.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{t.matricule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
