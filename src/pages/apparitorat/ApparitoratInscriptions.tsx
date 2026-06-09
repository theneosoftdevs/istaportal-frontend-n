// src/pages/apparitorat/ApparitoratInscriptions.tsx
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { KPICard } from "@/components/ui/KPICard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePageData } from "@/hooks/usePageData"
import { useStore } from "@/hooks/usePageData"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InscriptionDialog } from "@/pages/apparitorat/InscriptionDialog"
import { EditStudentDialog } from "@/pages/apparitorat/EditStudentDialog"
import { enrichStudent } from "@/lib/selectors"
import { Users, UserCheck, UserCog } from "lucide-react"
import type { Student } from "@/types"

export function ApparitoratInscriptions() {
  const store = useStore()
  const [query, setQuery] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [promotionFilter, setPromotionFilter] = useState("all")
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const { data, loading } = usePageData((d) => {
    const students = d.students.map(s => enrichStudent(d, s))
    const facultyName = (id: string) => d.faculties.find((f) => f.id === id)?.code ?? "—"
    const promotionName = (id: string) =>
      d.promotions.find((p) => p.id === id)?.name ?? "—"
    return {
      students,
      facultyName,
      promotionName,
    }
  })

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.students

    if (facultyFilter !== "all") {
      list = list.filter(s => s.facultyId === facultyFilter)
    }
    if (promotionFilter !== "all") {
      list = list.filter(s => s.promotionId === promotionFilter)
    }

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((s) =>
        [s.first_name, s.family_name, s.last_name, s.matricule, s.email]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    }
    return list
  }, [data, query, facultyFilter, promotionFilter])

  const counts = useMemo(() => {
    const list = data?.students ?? []
    return {
      total: list.length,
      active: list.filter((s) => s.status === "active").length,
      pending: list.filter((s) => s.status === "pending").length,
    }
  }, [data])

  const columns: Column<Student>[] = [
    {
      key: "matricule",
      header: "Matricule",
      render: (s) => <span className="font-mono text-xs">{s.matricule}</span>,
    },
    {
      key: "name",
      header: "Étudiant",
      render: (s) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {s.first_name} {s.family_name} {s.last_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      render: (s) => <span className="text-xs">{s.phone_number || "—"}</span>,
    },
    {
      key: "faculty",
      header: "Faculté",
      render: (s) => data?.facultyName(s.facultyId),
    },
    {
      key: "promotion",
      header: "Promotion",
      render: (s) => data?.promotionName(s.promotionId),
    },
    {
      key: "average",
      header: "Moyenne",
      align: "center",
      render: (s) => (s.average > 0 ? `${s.average.toFixed(1)}/20` : "—"),
    },
    {
      key: "status",
      header: "Statut",
      align: "right",
      render: (s) => (
        <div className="flex justify-end">
          <StatusBadge status={s.status} />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEditingStudent(s)}>
            Modifier
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <EditStudentDialog
        student={editingStudent}
        open={!!editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
      />
      <PageHeader
        title="Inscriptions"
        subtitle="Gestion des inscriptions et du suivi des étudiants."
        action={
          <InscriptionDialog
            onSuccess={(s) => {
              setQuery(s.matricule || "")
              // Optionally reload after a short delay or if reactive, skip reload
              setTimeout(() => window.location.reload(), 1500)
            }}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Total étudiants"
          value={counts.total}
          icon={Users}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="Inscriptions actives"
          value={counts.active}
          icon={UserCheck}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="En attente"
          value={counts.pending}
          icon={UserCog}
          colorClass="bg-chart-3/15 text-chart-3"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un étudiant..."
            className="pl-9"
            aria-label="Rechercher un étudiant"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Faculté" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes facultés</SelectItem>
              {store.faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.code}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={promotionFilter} onValueChange={setPromotionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Promotion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes promotions</SelectItem>
              {store.promotions.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(s) => s.id}
        loading={loading}
        emptyTitle="Aucun étudiant trouvé"
        emptyDescription="Essayez de modifier votre recherche ou inscrivez un nouvel étudiant."
      />
    </>
  )
}
