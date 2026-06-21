// src/pages/apparitorat/EditStudentDialog.tsx
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/usePageData";
import { studentApi, userApi } from "@/api/endpoints/users";
import type { Student } from "@/types";
import { toast } from "sonner";
import { i18n } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";

interface EditStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentDialog({
  student,
  open,
  onOpenChange,
}: EditStudentDialogProps) {
  const store = useStore();
  const { role } = useAuth();
  const [form, setForm] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        ...student,
        // Map nested user data to flat fields for the form if they are missing
        first_name: student.first_name || student.user?.first_name || "",
        middle_name: student.middle_name || student.user?.middle_name || "",
        last_name: student.last_name || student.user?.last_name || "",
        email: student.email || student.user?.email || "",
        phone_number: student.phone_number || "",
        // Ensure academic IDs are correctly mapped
        faculty_id: student.faculty_id || student.promotion?.faculty?.id || "",
        promotion_id: student.promotion_id || student.promotion?.id || "",
        academic_year_id:
          student.academic_year_id || student.academic_year?.id || "",
      } as Student);
    }
  }, [student]);

  const promotions = useMemo(() => {
    if (!form?.faculty_id) return [];
    return store.promotions.filter((p) => p.faculty_id === form.faculty_id);
  }, [form?.faculty_id, store.promotions]);

  if (!form) return null;

  const set = <K extends keyof Student>(key: K, value: Student[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : null));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name?.trim()) e.first_name = "Le prénom est requis.";
    if (!form.last_name?.trim()) e.last_name = "Le nom est requis.";
    if (!form.email?.trim()) e.email = "L'email est requis.";
    if (!form.faculty_id) e.faculty_id = "La faculté est requise.";
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form || !form.user_id) return;
    // only validate fields we intend to send
    if (!validate()) return;

    setIsLoading(true);
    try {
      const userPayload = {
        first_name: form.first_name,
        middle_name: form.middle_name || "",
        last_name: form.last_name,
        email: form.email,
        gender: form.gender,
      };

      const profilePayload = {
        phone_number: form.phone_number || "",
        faculty_id: form.faculty_id,
        promotion_id: form.promotion_id || undefined,
        academic_year_id: form.academic_year_id || undefined,
        status: form.status,
      };

      // Try updating user core fields first, then profile fields.
      const results = await Promise.allSettled([
        // Update core user info if backend exposes /users/:id
        (async () => {
          try {
            await userApi.update(form.user_id, userPayload);
            return { ok: true };
          } catch (e) {
            return { ok: false, err: e };
          }
        })(),
        (async () => {
          try {
            await studentApi.updateProfile(form.user_id, profilePayload);
            return { ok: true };
          } catch (e) {
            return { ok: false, err: e };
          }
        })(),
      ]);

      const failed = results.filter((r) => {
        if (r.status === "rejected") return true;
        return !r.value.ok;
      });
      if (failed.length > 0) {
        toast.error(
          "La mise à jour a partiellement échoué. Vérifiez les permissions et le format des données.",
        );
      } else {
        toast.success(`${i18n.apparitorat.student} mis à jour avec succès`);
      }

      onOpenChange(false);
      window.location.reload();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{i18n.apparitorat.edit_student_title}</DialogTitle>
          <DialogDescription>
            {i18n.apparitorat.edit_student_desc}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-last_name">Nom</Label>
              <Input
                id="edit-last_name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-middle_name">Postnom</Label>
              <Input
                id="edit-middle_name"
                value={form.middle_name || ""}
                onChange={(e) => set("middle_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-first_name">Prénom</Label>
              <Input
                id="edit-first_name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={form.phone_number}
                onChange={(e) => set("phone_number", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status || "active"}
                onValueChange={(v) => set("status", v)}
                disabled={role?.nom !== "secretariat_general"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {i18n.apparitorat.status_active}
                  </SelectItem>
                  <SelectItem value="suspended">
                    {i18n.apparitorat.status_suspended}
                  </SelectItem>
                  <SelectItem value="excluded">
                    {i18n.apparitorat.status_excluded}
                  </SelectItem>
                </SelectContent>
              </Select>
              {role?.nom !== "secretariat_general" && (
                <p className="text-[10px] text-muted-foreground italic">
                  Modification réservée au Secrétariat Général
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Genre</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => set("gender", v as "M" | "F")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Faculté</Label>
              <Select
                value={form.faculty_id || "none"}
                onValueChange={(v) => {
                  setForm((f) =>
                    f
                      ? {
                          ...f,
                          faculty_id: v === "none" ? "" : v,
                          promotion_id: "",
                        }
                      : null,
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Faculté..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {store.faculties.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Promotion</Label>
              <Select
                value={form.promotion_id || "none"}
                onValueChange={(v) => {
                  set("promotion_id", v === "none" ? "" : v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Promotion..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {promotions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Année Académique</Label>
              <Select
                value={form.academic_year_id || "none"}
                onValueChange={(v) => {
                  set("academic_year_id", v === "none" ? "" : v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Année..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {(store.academicYears || []).map((ay) => (
                    <SelectItem key={ay.id} value={ay.id}>
                      {ay.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : i18n.apparitorat.save_button}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
