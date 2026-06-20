// src/pages/teacher/TeacherAssignments.tsx
import { useState } from "react"
import { Plus, ClipboardCheck, Trash2, Star, Users } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/hooks/usePageData"
import { useCurrentTeacher } from "@/hooks/useCurrentUser"
import { toast } from "sonner"
import {
  addAssignment,
  removeAssignment,
  gradeSubmission,
  generateId,
} from "@/lib/store"

export function TeacherAssignments() {
  const store   = useStore()
  const teacher = useCurrentTeacher(store)

  const myCourses     = store.courses.filter((c) => c.teacher_id === teacher.id)
  const myAssignments = store.assignments.filter((a) => a.teacher_id === teacher.id)
  const mySubmissions = store.submissions.filter((s) =>
    myAssignments.some((a) => a.id === s.assignment_id),
  )

  const [createOpen, setCreateOpen] = useState(false)
  const [gradeOpen, setGradeOpen]   = useState<string | null>(null)
  const [gradeValue, setGradeValue] = useState("")
  const [feedback, setFeedback]     = useState("")
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    due_date: "",
    type: "PDF" as import("@/types").Assignment["type"],
    deadline_time: "23:59",
    duration_minutes: 0,
  })

  async function handleCreate() {
    if (!form.course_id || !form.title.trim() || !form.due_date) return
    try {
      await addAssignment({
        id:          generateId(),
        course_id:    form.course_id,
        teacher_id:   teacher.id,
        title:       form.title.trim(),
        description: form.description.trim(),
        due_date:     form.due_date,
        created_at:   new Date().toISOString().slice(0, 10),
        type:        form.type,
        deadline_time: form.deadline_time,
        duration_minutes: form.duration_minutes > 0 ? form.duration_minutes : undefined,
      })
      toast.success("Travail créé avec succès")
      setForm({ course_id: "", title: "", description: "", due_date: "", type: "PDF", deadline_time: "23:59", duration_minutes: 0 })
      setCreateOpen(false)
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création")
    }
  }

  async function handleGrade(subId: string) {
    const score = Number(gradeValue)
    if (isNaN(score) || score < 0 || score > 20) return
    try {
      await gradeSubmission(subId, score, feedback.trim())
      toast.success("Note enregistrée")
      setGradeOpen(null)
      setGradeValue("")
      setFeedback("")
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement")
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeAssignment(id)
      toast.success("Travail supprimé")
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression")
    }
  }

  function closeGradeDialog() {
    setGradeOpen(null)
    setGradeValue("")
    setFeedback("")
  }

  return (
    <>
      <PageHeader
        title="Travaux"
        subtitle="Créez des travaux et corrigez les remises des étudiants."
        action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Nouveau travail
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Travaux créés"
          value={myAssignments.length}
          icon={ClipboardCheck}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="Remises reçues"
          value={mySubmissions.length}
          icon={Users}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="Corrigées"
          value={mySubmissions.filter((s) => s.grade !== undefined).length}
          icon={Star}
          colorClass="bg-chart-3/15 text-chart-3"
        />
      </div>

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments">Mes travaux ({myAssignments.length})</TabsTrigger>
          <TabsTrigger value="submissions">Remises reçues ({mySubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-4 space-y-3">
          {myAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Aucun travail créé. Cliquez sur « Nouveau travail » pour commencer.
              </CardContent>
            </Card>
          ) : (
            myAssignments.map((a) => {
              const course    = store.courses.find((c) => c.id === a.course_id)
              const subCount  = store.submissions.filter((s) => s.assignment_id === a.id).length
              return (
                <Card key={a.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base">{a.title}</CardTitle>
                        <CardDescription>
                          {course?.name ?? "Cours"} · Échéance : {a.due_date}
                        </CardDescription>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="secondary">
                          {subCount} remise{subCount !== 1 ? "s" : ""}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {a.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="submissions" className="mt-4 space-y-3">
          {mySubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Aucune remise reçue pour l'instant.
              </CardContent>
            </Card>
          ) : (
            mySubmissions.map((s) => {
              const assignment = store.assignments.find((a) => a.id === s.assignment_id)
              const student    = store.students.find((st) => st.id === s.student_id)
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {student ? `${student.first_name} ${student.middle_name} ${student.last_name}` : s.student_id}
                        </CardTitle>
                        <CardDescription>
                          {assignment?.title ?? "Travail"} · Remis le{" "}
                          {new Date(s.submitted_at).toLocaleDateString("fr-FR")}
                        </CardDescription>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {s.grade !== undefined ? (
                          <Badge
                            variant="outline"
                            className={
                              s.grade >= 10
                                ? "border-success text-success"
                                : "border-destructive text-destructive"
                            }
                          >
                            {s.grade}/20
                          </Badge>
                        ) : (
                          <Badge variant="secondary">À corriger</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGradeOpen(s.id)
                            setGradeValue(s.grade?.toString() ?? "")
                            setFeedback(s.feedback ?? "")
                          }}
                        >
                          {s.grade !== undefined ? "Modifier" : "Corriger"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
                      {s.content}
                    </p>
                    {s.feedback && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Retour :</span> {s.feedback}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Create assignment dialog ─────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau travail</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Cours</Label>
              <Select
                value={form.course_id}
                onValueChange={(v) => setForm((f) => ({ ...f, course_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cours…" />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Titre du travail</Label>
              <Input
                placeholder="Ex : TP1 — Application CRUD"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description / Consignes</Label>
              <Textarea
                placeholder="Décrivez les consignes…"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type d'évaluation</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: any) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">Document PDF</SelectItem>
                    <SelectItem value="Formulaire">Formulaire / QCM</SelectItem>
                    <SelectItem value="Lien">Lien externe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date limite</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Heure limite</Label>
                <Input
                  type="time"
                  value={form.deadline_time}
                  onChange={(e) => setForm((f) => ({ ...f, deadline_time: e.target.value }))}
                />
              </div>
              {form.type === "Formulaire" && (
                <div className="space-y-1.5">
                  <Label>Durée (minutes)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ex : 15"
                    value={form.duration_minutes || ""}
                    onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.course_id || !form.title.trim() || !form.due_date}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Grade submission dialog ──────────────────────────────────────── */}
      <Dialog open={gradeOpen !== null} onOpenChange={(open) => !open && closeGradeDialog()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Corriger la remise</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Note /20</Label>
              <Input
                type="number"
                min={0}
                max={20}
                step={0.5}
                placeholder="Ex : 14.5"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Commentaire (optionnel)</Label>
              <Textarea
                placeholder="Retour à l'étudiant…"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => gradeOpen && handleGrade(gradeOpen)}
              disabled={!gradeValue || Number(gradeValue) < 0 || Number(gradeValue) > 20}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
