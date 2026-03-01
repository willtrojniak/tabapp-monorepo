import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import React from "react"

export function DialogDeleteForm({ title, onDelete, open, onOpenChange }: {
  title: string,
  onDelete: () => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [intOpen, setIntOpen] = React.useState(false)
  const onChange = onOpenChange ?? setIntOpen

  const handleDelete = React.useCallback(async () => {
    try {
      await onDelete()
      onChange(false)
    } catch (e) { }

  }, [onDelete])

  return <Dialog open={onOpenChange ? open : intOpen} onOpenChange={onChange}>
    {!onOpenChange &&
      <DialogTrigger asChild>
        <Button variant="ghost"> <Trash2 className="h-4 w-4" /> </Button>
      </DialogTrigger>
    }
    <DialogContent>
      <DialogHeader>
        <DialogTitle> {title} </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleDelete} variant="destructive">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
