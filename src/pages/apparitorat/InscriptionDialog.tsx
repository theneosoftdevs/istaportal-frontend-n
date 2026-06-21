// src/pages/apparitorat/InscriptionDialog.tsx
import { useMemo, useState } from "react";
import { authApi } from "@/api/endpoints/auth";
import { studentApi } from "@/api/endpoints/users";
import { UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSelect } from "@/components/ui/StudentSelect";
import { useStore } from "@/hooks/usePageData";
import { toast } from "sonner";
import type { Student } from "@/types";

interface FormState {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: "M" | "F" | "";
  email: string;
  birth_date: string;
  phone_number: string;
  faculty_id: string;
  promotion_id: string;
  academic_year_id: string;
}

interface InscriptionDialogProps {
  onSuccess?: (student: Student) => void;
}

const EMPTY: FormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "",
  email: "",
  birth_date: "",
  phone_number: "",
  faculty_id: "",
  promotion_id: "",
  academic_year_id: "",
};

export function InscriptionDialog({ onSuccess }: InscriptionDialogProps) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Wizard state
  const [step, setStep] = useState<1 | 2>(1);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = "Le prénom est requis.";
    if (!form.last_name.trim()) e.last_name = "Le nom de famille est requis.";
    if (!form.gender) e.gender = "Le genre est requis.";
    if (!form.email.trim()) e.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email invalide.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.birth_date) e.birth_date = "La date de naissance est requise.";
    if (!form.phone_number.trim())
      e.phone_number = "Le numéro de téléphone est requis.";
    if (!form.faculty_id) e.faculty_id = "La faculté est requise.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const filteredPromotions = useMemo(() => {
    if (!form.faculty_id) return [];
    return store.promotions.filter((p) => p.faculty_id === form.faculty_id);
  }, [form.faculty_id, store.promotions]);

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    // If we already created the user and just went back to see info, we skip creation
    if (createdUserId) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create the User account without sending password
      const authRes = await authApi.register({
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim(),
        last_name: form.last_name.trim(),
        gender: form.gender as "M" | "F",
        email: form.email.trim(),
        role: "student",
      });

      const userId = authRes?.user_id || authRes?.id;
      const nestedUserId = (authRes as { user?: { id?: string } })?.user?.id;
      const resolvedUserId = userId || nestedUserId;

      if (!resolvedUserId) {
        throw new Error("L'ID utilisateur n'a pas été renvoyé par le serveur.");
      }

      setCreatedUserId(resolvedUserId);

      toast.success(
        "Utilisateur créé. Veuillez renseigner les informations académiques.",
      );
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la création du compte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2() || !createdUserId) return;

    setIsLoading(true);
    try {
      // Step 2: Create the Student Profile linking to promotion and faculty
      // Ensure birth_date is in ISO format if it's just a date string
      const birthDateISO = form.birth_date.includes("T")
        ? form.birth_date
        : `${form.birth_date}T00:00:00Z`;

      const student = await studentApi.createProfile({
        user_id: createdUserId,
        faculty_id: form.faculty_id,
        birth_date: birthDateISO,
        phone_number: form.phone_number.trim(),
        promotion_id: form.promotion_id || undefined,
        academic_year_id: form.academic_year_id || undefined,
      });

      toast.success(`Inscription complète pour ${form.email} !`);

      if (onSuccess) {
        onSuccess(student);
      }

      setForm(EMPTY);
      setCreatedUserId(null);
      setStep(1);
      setErrors({});
      setOpen(false);

      if (!onSuccess) {
        window.location.reload(); // Refresh list if no custom handler
      }
    } catch (err: any) {
      toast.error(
        err?.message || "Erreur lors de l'association à la promotion.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setForm(EMPTY);
          setCreatedUserId(null);
          setStep(1);
          setErrors({});
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4 mr-2" />
          Inscrire un étudiant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Nouvelle inscription {step === 1 ? "(1/2)" : "(2/2)"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Renseignez les informations de base de l'étudiant pour créer son compte."
              : "Renseignez la date de naissance, le téléphone et les informations académiques."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Nom de famille</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  aria-invalid={!!errors.last_name}
                  disabled={!!createdUserId}
                />
                {errors.last_name && (
                  <p className="text-xs text-destructive">{errors.last_name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="middle_name">Postnom (optionnel)</Label>
                <Input
                  id="middle_name"
                  value={form.middle_name}
                  onChange={(e) => set("middle_name", e.target.value)}
                  disabled={!!createdUserId}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  aria-invalid={!!errors.first_name}
                  disabled={!!createdUserId}
                />
                {errors.first_name && (
                  <p className="text-xs text-destructive">
                    {errors.first_name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  disabled={!!createdUserId}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Genre</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => set("gender", v as "M" | "F")}
                  disabled={!!createdUserId}
                >
                  <SelectTrigger aria-invalid={!!errors.gender}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-destructive">{errors.gender}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Création..." : "Suivant"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="space-y-4" noValidate>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
                Étudiant à inscrire
              </Label>
              {createdUserId && form.email ? (
                <div className="flex items-center gap-3 rounded-md bg-background p-2 border border-border">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {form.first_name[0]}
                    {form.last_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">
                      {form.first_name} {form.last_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {form.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[10px] h-7 px-2 font-bold uppercase tracking-widest text-primary"
                    onClick={() => {
                      setCreatedUserId(null);
                      setForm(EMPTY);
                    }}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <StudentSelect
                  value={undefined}
                  onSelect={(s) => {
                    if (s) {
                      setCreatedUserId(s.user_id);
                      setForm((f) => ({
                        ...f,
                        birth_date: s.birth_date
                          ? s.birth_date.split("T")[0]
                          : "",
                        phone_number: s.phone_number || "",
                        faculty_id:
                          s.faculty_id || s.promotion?.faculty_id || "",
                        first_name: s.first_name || s.user?.first_name || "",
                        middle_name: s.middle_name || s.user?.middle_name || "",
                        last_name: s.last_name || s.user?.last_name || "",
                        email: s.email || s.user?.email || "",
                        gender: (s.gender || s.user?.gender || "") as "M" | "F",
                        promotion_id: s.promotion_id || s.promotion?.id || "",
                        academic_year_id:
                          s.academic_year_id || s.academic_year?.id || "",
                      }));
                    }
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => set("birth_date", e.target.value)}
                  aria-invalid={!!errors.birth_date}
                />
                {errors.birth_date && (
                  <p className="text-xs text-destructive">
                    {errors.birth_date}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone_number">Téléphone</Label>
                <Input
                  id="phone_number"
                  value={form.phone_number}
                  onChange={(e) => set("phone_number", e.target.value)}
                  placeholder="Ex: 0123456789"
                  aria-invalid={!!errors.phone_number}
                />
                {errors.phone_number && (
                  <p className="text-xs text-destructive">
                    {errors.phone_number}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Faculté</Label>
                <Select
                  value={form.faculty_id || "none"}
                  onValueChange={(v) => {
                    setForm((f) => ({
                      ...f,
                      faculty_id: v === "none" ? "" : v,
                      promotion_id: "",
                    }));
                  }}
                >
                  <SelectTrigger aria-invalid={!!errors.faculty_id}>
                    <SelectValue placeholder="Choisir une faculté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {store.faculties.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty_id && (
                  <p className="text-xs text-destructive">
                    {errors.faculty_id}
                  </p>
                )}
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
                    <SelectValue placeholder="Choisir une promotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {filteredPromotions.map((p) => (
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
                    <SelectValue placeholder="Choisir une année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {(store.academicYears || []).map((ay) => (
                      <SelectItem key={ay.id} value={ay.id}>
                        {ay.display_name || ay.name || "—"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 size-4" />
                Retour
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Association..." : "Terminer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
