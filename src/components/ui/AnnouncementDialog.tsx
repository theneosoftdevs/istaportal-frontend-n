// src/components/AnnouncementDialog.tsx
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addAnnouncement } from "@/lib/store"
import { useAuth } from "@/contexts/AuthContext"
import { usePageData } from "@/hooks/usePageData"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Role } from "@/types"
import { i18n } from "@/lib/i18n"

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnnouncementDialog({ open, onOpenChange }: AnnouncementDialogProps) {
  const { user, roleName } = useAuth()
  const { data } = usePageData(d => d)

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState<"info" | "important" | "urgent">("info")
  const [scope, setScope] = useState<"global" | "faculty" | "course">("global")
  const [target_id, setTargetId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const teacher = roleName === "teacher" ? data?.teachers.find(t => t.user_id === user?.id) : null

  const canCreateGlobal = ["rectorat", "secretariat_general", "apparitorat"].includes(roleName || "")
  const canCreateFacultyAnnouncement = roleName === "secretariat_faculte"
  const canCreateCourse = roleName === "teacher"

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const newAnnouncement = {
      id: `a-${Date.now()}`,
      title,
      body,
      author: `${user?.first_name} ${user?.middle_name || ""} ${user?.last_name}`,
      date: new Date().toISOString().split("T")[0],
      audience: (scope === "global" ? "all" : "student") as any,
      priority,
      scope,
      target_id: scope === "global" ? undefined : target_id,
    }

    setTimeout(() => {
      addAnnouncement(newAnnouncement)
      setIsLoading(false)
      onOpenChange(false)
      toast.success(i18n.announcement_dialog.success_toast)
      setTitle("")
      setBody("")
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{i18n.announcement_dialog.title}</DialogTitle>
          <DialogDescription>
            {i18n.announcement_dialog.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{i18n.announcement_dialog.label_title}</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">{i18n.announcement_dialog.label_message}</Label>
            <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{i18n.announcement_dialog.label_priority}</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">{i18n.status.info}</SelectItem>
                  <SelectItem value="important">{i18n.status.important}</SelectItem>
                  <SelectItem value="urgent">{i18n.status.urgent}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{i18n.announcement_dialog.label_scope}</Label>
              <Select value={scope} onValueChange={(v: any) => setScope(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {canCreateGlobal && <SelectItem value="global">Global</SelectItem>}
                  {canCreateFacultyAnnouncement && <SelectItem value="faculty">Faculté</SelectItem>}
                  {canCreateCourse && <SelectItem value="course">Cours</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {scope === "faculty" && data && (
            <div className="space-y-2">
              <Label>{i18n.announcement_dialog.label_faculty}</Label>
              <Select value={target_id} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder={i18n.announcement_dialog.placeholder_faculty} />
                </SelectTrigger>
                <SelectContent>
                  {data.faculties.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scope === "course" && data && (
            <div className="space-y-2">
              <Label>{i18n.announcement_dialog.label_course}</Label>
              <Select value={target_id} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder={i18n.announcement_dialog.placeholder_course} />
                </SelectTrigger>
                <SelectContent>
                  {data.courses.filter(c => c.teacher_id === teacher?.id).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {i18n.announcement_dialog.submit_button}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
