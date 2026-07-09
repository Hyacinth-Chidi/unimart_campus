"use client"

import { useState } from "react"
import { deleteCategory } from "@/actions/categories"
import { CategoryDialog } from "./category-dialog"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CategoryActionsProps {
  category: { id: string; name: string }
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteCategory(category.id)
    setIsDeleting(false)

    if (result?.error) {
      toast.error("Error", {
        description: result.error,
      })
    } else {
      toast.success("Success", {
        description: "Category deleted successfully.",
      })
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <CategoryDialog category={category} />
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2Icon className="size-4" />
            <span className="sr-only">Delete category</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category &quot;{category.name}&quot;. This action cannot be undone. 
              If there are any listings using this category, the deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault() // prevent dialog from closing instantly so we can show loading if we wanted, but simple wait is fine
                handleDelete()
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
