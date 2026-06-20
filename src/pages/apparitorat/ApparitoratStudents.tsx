import { useMemo, useState } from "react"
import { Search, FileDown, FileSpreadsheet } from "lucide-react"
import istaLogo from "@/assets/ista.jpeg"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePageData } from "@/hooks/usePageData"
import { enrichStudent } from "@/lib/selectors"
import type { Student } from "@/types"
import { toast } from "sonner"
import { EditStudentDialog } from "./EditStudentDialog"
import { i18n } from "@/lib/i18n"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import ExcelJS from "exceljs"

interface StudentRow extends Student {
  facultyCode: string
  promotionName: string
}

export function ApparitoratStudents() {
  const [query, setQuery] = useState("")
  const [faculty, setFaculty] = useState("all")
  const [status, setStatus] = useState("all")
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null)

  const { data, loading } = usePageData((d) => {
    const students: StudentRow[] = d.students.map(s => enrichStudent(d, s))
    return { students, faculties: d.faculties, promotions: d.promotions }
  })

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.students.filter((s) => {
      const matchQ =
        !q ||
        [s.first_name, s.middle_name, s.last_name, s.matricule, s.email].join(" ").toLowerCase().includes(q)
      const matchF = faculty === "all" || s.faculty_id === faculty
      const matchS = status === "all" || s.status === status
      return matchQ && matchF && matchS
    })
  }, [data, query, faculty, status])

  const exportToPDF = () => {
    const doc = new jsPDF()
    const promotionName = i18n.apparitorat.list_type_all
    const facultyName = faculty !== "all"
      ? data?.faculties.find(f => f.id === faculty)?.name
      : i18n.apparitorat.all_faculties

    const img = new Image()
    img.src = istaLogo
    img.onload = () => {
      doc.addImage(img, "JPEG", 14, 10, 25, 25)
      finalizePDF(doc, promotionName ?? "", facultyName ?? "")
    }
    img.onerror = () => {
      finalizePDF(doc, promotionName ?? "", facultyName ?? "")
    }
  }

  const finalizePDF = (doc: jsPDF, promotionName: string, facultyName: string) => {
    doc.setFontSize(20)
    doc.setTextColor(0, 102, 204)
    doc.text(i18n.apparitorat.university_name, 50, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("INSTITUT SUPÉRIEUR DES TECHNIQUES APPLIQUÉES", 50, 26)

    doc.setDrawColor(0, 102, 204)
    doc.line(14, 35, 196, 35)

    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text(i18n.apparitorat.student_list.toUpperCase(), 14, 45)

    doc.setFontSize(11)
    doc.text(`${i18n.apparitorat.faculty}: ${facultyName}`, 14, 52)
    doc.text(`${i18n.apparitorat.promotion}: ${promotionName}`, 14, 58)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 64)

    const tableData = filtered.map(s => [
      s.matricule,
      `${s.first_name} ${s.middle_name || ""} ${s.last_name || ""}`.replace(/\s+/g, ' ').trim(),
      s.facultyCode,
      s.phone_number || "",
      s.status
    ])

    ;(doc as any).autoTable({
      startY: 70,
      head: [[
        i18n.apparitorat.matricule,
        i18n.apparitorat.student_label,
        i18n.apparitorat.faculty,
        i18n.apparitorat.phone_label,
        i18n.apparitorat.status
      ]],
      body: tableData,
    })

    doc.save(`liste_etudiants_${promotionName}.pdf`)
    toast.success("PDF généré avec succès")
  }

  const exportToExcel = async () => {
    const promotionName = i18n.apparitorat.list_type_all
    const facultyName = faculty !== "all"
      ? data?.faculties.find(f => f.id === faculty)?.name
      : i18n.apparitorat.all_faculties

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Students")

    worksheet.addRow([i18n.apparitorat.university_name])
    worksheet.addRow(["INSTITUT SUPÉRIEUR DES TECHNIQUES APPLIQUÉES"])
    worksheet.addRow([])
    worksheet.addRow([i18n.apparitorat.student_list.toUpperCase()])
    worksheet.addRow([`${i18n.apparitorat.faculty}: ${facultyName}`])
    worksheet.addRow([`${i18n.apparitorat.promotion}: ${promotionName}`])
    worksheet.addRow([`Date: ${new Date().toLocaleDateString()}`])
    worksheet.addRow([])

    worksheet.addRow([
      i18n.apparitorat.matricule,
      i18n.apparitorat.student_label,
      i18n.apparitorat.faculty,
      i18n.apparitorat.promotion,
      i18n.apparitorat.phone_label,
      i18n.apparitorat.status,
    ])

    const headerRow = worksheet.lastRow
    if (headerRow) {
      headerRow.eachCell((cell: import("exceljs").Cell) => {
        cell.font = { bold: true }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0066CC" } }
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      })
    }

    filtered.forEach(s => {
      worksheet.addRow([
        s.matricule,
        `${s.first_name} ${s.middle_name || ""} ${s.last_name || ""}`.replace(/\s+/g, ' ').trim(),
        s.facultyCode,
        s.promotionName,
        s.phone_number || "",
        s.status,
      ])
    })

    worksheet.columns.forEach((col: Partial<import("exceljs").Column>) => { col.width = 20 })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `liste_etudiants_${promotionName}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Excel généré avec succès")
  }

  const columns: Column<StudentRow>[] = [
    {
      key: "matricule",
      header: i18n.apparitorat.matricule,
      render: (s) => <span className="font-mono text-xs">{s.matricule}</span>,
    },
    {
      key: "name",
      header: i18n.apparitorat.student_label,
      render: (s) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {`${s.first_name} ${s.middle_name || ""} ${s.last_name || ""}`.replace(/\s+/g, ' ').trim()}
          </p>
          <p className="truncate text-xs text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    { key: "phone", header: i18n.apparitorat.phone_label, render: (s) => s.phone_number || "—" },
    { key: "faculty", header: i18n.apparitorat.faculty, render: (s) => s.facultyCode },
,
    {
      key: "status",
      header: "Statut",
      align: "right",
      render: (s) => (
        <div className="flex justify-end">
          <StatusBadge status={s.status || "active"} />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) => (
        <Button variant="ghost" size="sm" onClick={() => setEditingStudent(s)}>
          {i18n.apparitorat.modify_button}
        </Button>
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
        title={i18n.apparitorat.students_title}
        subtitle={i18n.apparitorat.students_subtitle}
        action={
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Button variant="outline" size="sm" onClick={exportToExcel} className="flex-1 sm:flex-none">
              <FileSpreadsheet className="mr-2 size-4 shrink-0" />
              <span className="truncate">{i18n.apparitorat.export_excel}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF} className="flex-1 sm:flex-none">
              <FileDown className="mr-2 size-4 shrink-0" />
              <span className="truncate">{i18n.apparitorat.export_pdf}</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={i18n.apparitorat.search_placeholder}
            className="pl-9"
            aria-label={i18n.apparitorat.search_aria}
          />
        </div>
        <Select value={faculty} onValueChange={(v) => { setFaculty(v); setPromotion("all") }}>
          <SelectTrigger className="flex-1 sm:w-48 sm:flex-none">
            <SelectValue placeholder={i18n.apparitorat.faculty} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{i18n.apparitorat.all_faculties}</SelectItem>
            {data?.faculties.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="flex-1 sm:w-36 sm:flex-none">
            <SelectValue placeholder={i18n.apparitorat.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{i18n.apparitorat.all_status}</SelectItem>
            <SelectItem value="active">{i18n.apparitorat.status_active}</SelectItem>
            <SelectItem value="pending">{i18n.apparitorat.status_pending}</SelectItem>
            <SelectItem value="suspended">{i18n.apparitorat.status_suspended}</SelectItem>
            <SelectItem value="finished">{i18n.apparitorat.status_finished}</SelectItem>
            <SelectItem value="dropped">{i18n.apparitorat.status_dropped}</SelectItem>
            <SelectItem value="excluded">{i18n.apparitorat.status_excluded}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(s) => s.id}
        loading={loading}
        emptyTitle={i18n.apparitorat.no_student_found}
        emptyDescription={i18n.apparitorat.no_student_found_desc}
      />
    </>
  )
}
