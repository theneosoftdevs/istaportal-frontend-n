// src/components/ui/StudentSelect.tsx
import * as React from "react"
import { Check, ChevronsUpDown, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useStore } from "@/hooks/usePageData"
import type { Student } from "@/types"

interface StudentSelectProps {
  value?: string // student id
  onSelect: (student: Student | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function StudentSelect({
  value,
  onSelect,
  placeholder = "Sélectionner un étudiant...",
  className,
  disabled,
}: StudentSelectProps) {
  const [open, setOpen] = React.useState(false)
  const store = useStore()
  
  const selectedStudent = React.useMemo(() => {
    return store.students.find((s) => s.id === value)
  }, [store.students, value])

  const label = selectedStudent 
    ? `${selectedStudent.first_name || selectedStudent.user?.first_name} ${selectedStudent.middle_name || selectedStudent.user?.middle_name || ""} ${selectedStudent.last_name || selectedStudent.user?.last_name || ""}`.replace(/\s+/g, ' ').trim() + ` (${selectedStudent.matricule})`
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <User className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{label}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher par nom ou matricule..." />
          <CommandList>
            <CommandEmpty>Aucun étudiant trouvé.</CommandEmpty>
            <CommandGroup>
              {store.students.map((student) => {
                const name = `${student.first_name || student.user?.first_name} ${student.middle_name || student.user?.middle_name || ""} ${student.last_name || student.user?.last_name || ""}`.replace(/\s+/g, ' ').trim()
                return (
                  <CommandItem
                    key={student.id}
                    value={`${name} ${student.matricule}`}
                    onSelect={() => {
                      onSelect(student.id === value ? null : student)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === student.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        {student.matricule} · {student.promotion?.name || "Sans promotion"}
                      </span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
