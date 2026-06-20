// src/pages/SettingsPage.tsx
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usePageData } from "@/hooks/usePageData"
import { i18n } from "@/lib/i18n"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, Save } from "lucide-react"
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  Badge,
} from "@/components/ui"
import { Shield, GraduationCap, BookOpen } from "lucide-react"
import { studentApi, teacherApi } from "@/api/endpoints/users"

export function SettingsPage() {
  const { user, roleName } = useAuth()
  const { data } = usePageData((d) => d)

  const student = roleName === "student" ? data?.students.find(s => s.user_id === user?.id) : null
  const teacher = roleName === "teacher" ? data?.teachers.find(t => t.user_id === user?.id) : null
  const faculty = (student || teacher) ? data?.faculties.find(f => f.id === (student?.faculty_id || teacher?.faculty_id)) : null
  const promotion = student ? data?.promotions.find(p => p.id === student.promotion_id) : null

  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize form when data or user changes
  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
    }
    const phoneVal = student?.phone_number || (teacher as any)?.phone_number || (user as any)?.phone_number || (user as any)?.phone || ""
    setPhone(phoneVal)
  }, [user, student, teacher])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (roleName === "student" && student) {
        await studentApi.update(user!.id, {
          phone_number: phone,
          promotion_id: student.promotion_id,
        })
      } else if (roleName === "teacher" && teacher) {
        await teacherApi.update(user!.id, {
          phone_number: phone,
        })
      }
      toast.success(i18n.common.success_update)
      // Small delay to allow seeing the toast before potential reload
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={i18n.settings.settings_title}
        subtitle={i18n.settings.profile_desc}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informations Professionnelles</CardTitle>
            <CardDescription>
              Détails liés à votre statut au sein de l'institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                {roleName === "student" ? <GraduationCap className="size-10" /> :
                 roleName === "teacher" ? <BookOpen className="size-10" /> :
                 <Shield className="size-10" />}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold uppercase italic">{user?.first_name} {user?.middle_name} {user?.last_name}</h3>
                <Badge variant="secondary" className="mt-1 font-bold uppercase tracking-widest text-[10px]">
                  {roleName && i18n.portals[roleName as keyof typeof i18n.portals]}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 rounded-xl bg-muted/30 p-4">
              {student && (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Matricule</span>
                    <span className="font-mono text-sm font-bold">{student.matricule}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Promotion</span>
                    <span className="text-sm font-bold uppercase">{promotion?.name || student.promotion_id}</span>
                  </div>
                </>
              )}
              {teacher && (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Matricule</span>
                    <span className="font-mono text-sm font-bold">{teacher.matricule}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Titre</span>
                    <span className="text-sm font-bold uppercase">{teacher.title}</span>
                  </div>
                </>
              )}
              {faculty && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Faculté</span>
                  <span className="text-sm font-bold uppercase">{faculty.name}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identifiant Système</span>
                <span className="font-mono text-[10px]">{user?.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{i18n.settings.profile_settings}</CardTitle>
            <CardDescription>
              {i18n.settings.profile_desc}
            </CardDescription>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-email">{i18n.settings.email_label}</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-phone">{i18n.settings.phone_label}</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-password">{i18n.settings.new_password_label}</Label>
              <div className="relative max-w-sm">
                <Input
                  id="settings-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={i18n.settings.password_placeholder}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? i18n.common.hide_password : i18n.common.show_password}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {i18n.settings.save_changes}
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
