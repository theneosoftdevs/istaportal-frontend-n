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
import locales from "@/lib/locales.json"

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnnouncementDialog({ open, onOpenChange }: AnnouncementDialogProps) {
  const { user } = useAuth()
  const { data } = usePageData(d => d)

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState<"info" | "important" | "urgent">("info")
  const [scope, setScope] = useState<"global" | "faculty" | "course">("global")
  const [targetId, setTargetId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const canCreateGlobal = ["rectorat", "secretariat_general", "apparitorat"].includes(user?.role || "")
  const canCreateFacultyAnnouncement = user?.role === "secretariat_faculte"
  const canCreateCourse = user?.role === "teacher"

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const newAnnouncement = {
      id: `a-${Date.now()}`,
      title,
      body,
      author: `${user?.firstName} ${user?.familyName} ${user?.lastName}`,
      date: new Date().toISOString().split("T")[0],
      audience: (scope === "global" ? "all" : "student") as any,
      priority,
      scope,
      targetId: scope === "global" ? undefined : targetId,
    }

    setTimeout(() => {
      addAnnouncement(newAnnouncement)
      setIsLoading(false)
      onOpenChange(false)
      toast.success(locales.announcement_dialog.success_toast)
      setTitle("")
      setBody("")
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{locales.announcement_dialog.title}</DialogTitle>
          <DialogDescription>
            {locales.announcement_dialog.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{locales.announcement_dialog.label_title}</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">{locales.announcement_dialog.label_message}</Label>
            <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{locales.announcement_dialog.label_priority}</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">{locales.status.info}</SelectItem>
                  <SelectItem value="important">{locales.status.important}</SelectItem>
                  <SelectItem value="urgent">{locales.status.urgent}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{locales.announcement_dialog.label_scope}</Label>
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
              <Label>{locales.announcement_dialog.label_faculty}</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder={locales.announcement_dialog.placeholder_faculty} />
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
              <Label>{locales.announcement_dialog.label_course}</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder={locales.announcement_dialog.placeholder_course} />
                </SelectTrigger>
                <SelectContent>
                  {data.courses.filter(c => c.teacherId === user?.refId).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {locales.announcement_dialog.submit_button}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
