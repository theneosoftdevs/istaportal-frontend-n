// src/pages/apparitorat/ApparitoratRooms.tsx
import { useState } from "react"
import { DoorOpen, Plus, Loader2, Trash2, Calendar, Pencil } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRooms } from "@/hooks/api"
import { roomApi } from "@/api/endpoints/academic"
import { generateId } from "@/lib/store"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { toast } from "sonner"
import type { Room } from "@/types"

export function ApparitoratRooms() {
  const { data: roomsData, isLoading, refetch } = useRooms()
  const rooms = roomsData || []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  
  const [form, setForm] = useState({
    name: "",
    capacity: "",
    description: "",
    type: "auditoire" as any
  })

  const openCreate = () => {
    setEditingRoom(null)
    setForm({ name: "", capacity: "", description: "", type: "auditoire" })
    setDialogOpen(true)
  }

  const openEdit = (room: Room) => {
    setEditingRoom(room)
    setForm({
      name: room.name,
      capacity: String(room.capacity),
      description: room.description || "",
      type: room.type
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cap = Number(form.capacity)
    if (cap < 0) {
      toast.error("Le nombre de places ne peut pas être négatif")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingRoom) {
        await roomApi.create({ 
          ...editingRoom,
          name: form.name,
          capacity: cap,
          description: form.description,
          type: form.type
        })
        toast.success("Salle modifiée avec succès")
      } else {
        await roomApi.create({
          id: generateId(),
          name: form.name,
          capacity: cap,
          description: form.description,
          type: form.type
        })
        toast.success("Salle ajoutée avec succès")
      }
      await refetch()
      setDialogOpen(false)
    } catch (e) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await roomApi.delete(deleteId)
      await refetch()
      toast.success("Salle supprimée")
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setDeleteId(null)
    }
  }

  const columns: Column<Room>[] = [
    { key: "name", header: "Nom de la salle", render: r => <span className="font-medium">{r.name}</span> },
    { key: "type", header: "Type", render: r => <Badge variant="secondary" className="capitalize">{r.type}</Badge> },
    { key: "capacity", header: "Places", align: "center", render: r => r.capacity },
    { key: "description", header: "Description", render: r => <span className="text-xs text-muted-foreground">{r.description}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: r => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(r)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(r.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des locaux"
        subtitle="Salles de cours, laboratoires et auditoires."
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" />
            Ajouter une salle
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Liste des salles</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={rooms}
              rowKey={r => r.id}
              loading={isLoading}
              emptyTitle="Aucune salle"
              emptyDescription="Commencez par ajouter une salle de cours ou un laboratoire."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Planning d'occupation
            </CardTitle>
            <CardDescription>Occupation en temps réel des locaux.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rooms.slice(0, 5).map((r, i) => (
              <div key={r.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {i % 2 === 0 ? "Occupée par L3 Info (P. Web)" : "Libre"}
                  </p>
                </div>
                <Badge variant={i % 2 === 0 ? "destructive" : "outline"} className="text-[10px]">
                  {i % 2 === 0 ? "Occupé" : "Disponible"}
                </Badge>
              </div>
            ))}
            {rooms.length === 0 && !isLoading && (
              <p className="text-xs text-muted-foreground text-center py-4 italic">Aucun local à afficher</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Modifier le local" : "Ajouter un local"}</DialogTitle>
            <DialogDescription>
              {editingRoom ? "Modifiez les informations de cette salle." : "Remplissez les champs ci-dessous pour créer une nouvelle salle."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la salle</Label>
              <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Salle A1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de places</Label>
                <Input 
                  required 
                  type="number" 
                  min="0"
                  value={form.capacity} 
                  onChange={e => setForm({...form, capacity: e.target.value})} 
                  placeholder="Ex: 50" 
                />
              </div>
              <div className="space-y-2">
                <Label>Type de salle</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auditoire">Auditoire</SelectItem>
                    <SelectItem value="labo">Laboratoire</SelectItem>
                    <SelectItem value="salle decoference">Salle de conférence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ex: Équipée de projecteur..." />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingRoom ? "Enregistrer les modifications" : "Ajouter la salle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce local ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les séances programmées dans cette salle pourraient être affectées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
