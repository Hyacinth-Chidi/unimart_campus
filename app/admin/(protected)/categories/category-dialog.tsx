"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createCategory, updateCategory } from "@/actions/categories"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusIcon, EditIcon } from "lucide-react"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
})

interface CategoryDialogProps {
  category?: { id: string; name: string } // If provided, we are in Edit mode
}

export function CategoryDialog({ category }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const isEditing = !!category

  const form = useForm<z.infer<typeof categorySchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema as any),
    defaultValues: {
      name: category?.name || "",
    },
  })

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    setIsPending(true)
    setError(null)

    const formData = new FormData()
    formData.append("name", values.name)

    let result
    if (isEditing) {
      result = await updateCategory(category.id, formData)
    } else {
      result = await createCategory(formData)
    }

    setIsPending(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEditing ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <EditIcon className="size-4" />
              <span className="sr-only">Edit category</span>
            </Button>
          ) : (
            <Button>
              <PlusIcon className="size-4 mr-2" />
              New Category
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "Create Category"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the name of this category. Changes will reflect across all connected listings." 
              : "Add a new category for students to classify their listings."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {error && (
              <div className="p-3 text-sm font-medium bg-destructive/15 text-destructive rounded-md">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Textbooks" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
