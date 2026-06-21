import { useMemo, useState } from "react";
import { PlusCircle, History } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useFetch } from "@/hooks/useFetch";
import {
  useAcademicYears,
  useFaculties,
  usePromotions,
  useStudents,
} from "@/hooks/api";
import { academicYearApi } from "@/api/endpoints/academic";
import { studentApi } from "@/api/endpoints/users";
import type { AcademicYear } from "@/types";
import { toast } from "sonner";

interface HistoryRow {
  id: string;
  studentName: string;
  matricule: string;
  faculty: string;
  promotion: string;
  year: string;
  status: string;
}

const toArray = (input: any): any[] => {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];

  const candidates = [
    input.data,
    input.items,
    input.results,
    input.rows,
    input.histories,
    input.students,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

export function ApparitoratAnnees() {
  const [displayName, setDisplayName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeOnCreate, setActiveOnCreate] = useState("no");
  const [selectedYear, setSelectedYear] = useState("all");
  const [creating, setCreating] = useState(false);

  const yearsQuery = useAcademicYears();
  const studentsQuery = useStudents();
  const facultiesQuery = useFaculties();
  const promotionsQuery = usePromotions();

  const historiesQuery = useFetch(
    () =>
      selectedYear === "all"
        ? studentApi.listHistories()
        : studentApi.listHistoriesByYear(selectedYear),
    [selectedYear],
  );

  const academicYears = yearsQuery.data || [];
  const students = studentsQuery.data || [];
  const faculties = facultiesQuery.data || [];
  const promotions = promotionsQuery.data || [];

  const yearColumns: Column<AcademicYear>[] = [
    {
      key: "display_name",
      header: "Année académique",
      render: (y) => y.display_name || y.name || "—",
    },
    {
      key: "start_date",
      header: "Début",
      render: (y) =>
        y.start_date ? new Date(y.start_date).toLocaleDateString() : "—",
    },
    {
      key: "end_date",
      header: "Fin",
      render: (y) =>
        y.end_date ? new Date(y.end_date).toLocaleDateString() : "—",
    },
    {
      key: "is_active",
      header: "Statut",
      align: "right",
      render: (y) => (
        <div className="flex justify-end">
          <StatusBadge status={y.is_active ? "active" : "pending"} />
        </div>
      ),
    },
  ];

  const historyRows = useMemo<HistoryRow[]>(() => {
    const rows = toArray(historiesQuery.data);

    return rows.map((h: any, index: number) => {
      const studentId =
        h.student_id || h.student?.id || h.student?.user_id || "";
      const student = students.find(
        (s) => s.id === studentId || s.user_id === studentId,
      );

      const fullNameFromStudent = [
        student?.first_name,
        student?.middle_name,
        student?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const fullNameFromHistory = [
        h.student?.first_name,
        h.student?.middle_name,
        h.student?.last_name,
        h.student?.user?.first_name,
        h.student?.user?.middle_name,
        h.student?.user?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const promotionId =
        h.promotion_id || h.promotion?.id || student?.promotion_id || "";
      const facultyId =
        h.faculty_id ||
        h.faculty?.id ||
        h.promotion?.faculty_id ||
        student?.faculty_id ||
        "";
      const yearId =
        h.academic_year_id ||
        h.academic_year?.id ||
        student?.academic_year_id ||
        "";

      const promotionName =
        h.promotion?.name ||
        promotions.find((p) => p.id === promotionId)?.name ||
        "—";

      const facultyName =
        h.faculty?.code ||
        faculties.find((f) => f.id === facultyId)?.code ||
        "—";

      const yearName =
        h.academic_year?.display_name ||
        h.academic_year?.name ||
        academicYears.find((y) => y.id === yearId)?.display_name ||
        academicYears.find((y) => y.id === yearId)?.name ||
        "—";

      return {
        id: String(h.id || `${studentId}-${yearId}-${index}`),
        studentName: fullNameFromStudent || fullNameFromHistory || "—",
        matricule:
          student?.matricule || h.student?.matricule || h.student?.code || "—",
        faculty: facultyName,
        promotion: promotionName,
        year: yearName,
        status: h.status || h.state || h.statut || student?.status || "—",
      };
    });
  }, [historiesQuery.data, students, promotions, faculties, academicYears]);

  const historyColumns: Column<HistoryRow>[] = [
    { key: "studentName", header: "Étudiant" },
    {
      key: "matricule",
      header: "Matricule",
      render: (row) => (
        <span className="font-mono text-xs">{row.matricule}</span>
      ),
    },
    { key: "faculty", header: "Faculté" },
    { key: "promotion", header: "Promotion" },
    { key: "year", header: "Année" },
    {
      key: "status",
      header: "Statut",
      align: "right",
      render: (row) => (
        <div className="flex justify-end">
          <StatusBadge status={row.status || "pending"} />
        </div>
      ),
    },
  ];

  const onCreateAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Veuillez renseigner les dates de début et de fin.");
      return;
    }

    if (new Date(startDate).getTime() >= new Date(endDate).getTime()) {
      toast.error("La date de fin doit être postérieure à la date de début.");
      return;
    }

    const generatedName = `${new Date(startDate).getFullYear()}-${new Date(endDate).getFullYear()}`;
    const label = displayName.trim() || generatedName;

    setCreating(true);
    try {
      const created = await academicYearApi.create({
        display_name: label,
        name: label,
        start_date: startDate,
        end_date: endDate,
        is_active: activeOnCreate === "yes",
      });

      if (activeOnCreate === "yes" && created?.id) {
        await academicYearApi.activate(created.id);
      }

      toast.success("Année académique créée avec succès.");
      setDisplayName("");
      setStartDate("");
      setEndDate("");
      setActiveOnCreate("no");

      await yearsQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message || "Impossible de créer l'année académique.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Années académiques"
        subtitle="Créer des années académiques et consulter l'historique du parcours étudiant par année."
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <PlusCircle className="size-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Nouvelle année académique
          </h3>
        </div>

        <form
          onSubmit={onCreateAcademicYear}
          className="grid grid-cols-1 gap-3 md:grid-cols-5"
        >
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ex: 2026-2027"
            aria-label="Nom de l'année académique"
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Date de début"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="Date de fin"
          />
          <Select value={activeOnCreate} onValueChange={setActiveOnCreate}>
            <SelectTrigger>
              <SelectValue placeholder="Activer maintenant ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Créer sans activer</SelectItem>
              <SelectItem value="yes">Créer et activer</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={creating}
            className="w-full md:w-auto"
          >
            {creating ? "Création..." : "Créer"}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Années académiques
          </h3>
        </div>

        <DataTable
          columns={yearColumns}
          data={academicYears}
          rowKey={(y) => y.id}
          loading={yearsQuery.isLoading}
          emptyTitle="Aucune année académique"
          emptyDescription="Créez une année académique pour démarrer le suivi annuel."
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Historique du parcours étudiant
            </h3>
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filtrer par année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les années</SelectItem>
              {academicYears.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.display_name || y.name || "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={historyColumns}
          data={historyRows}
          rowKey={(row) => row.id}
          loading={historiesQuery.isLoading || studentsQuery.isLoading}
          emptyTitle="Aucun historique"
          emptyDescription="Aucun parcours étudiant disponible pour ce filtre d'année."
        />
      </div>
    </>
  );
}
