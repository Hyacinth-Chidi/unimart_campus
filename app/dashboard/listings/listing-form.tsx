"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2Icon, UploadCloudIcon, XIcon, ShieldAlertIcon, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createListing, updateListing } from "@/actions/listings"
import { listingSchema, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/validations/listing"

type Category = {
  id: string
  name: string
}

type ListingFormProps = {
  categories: Category[]
  initialData?: {
    id: string
    title: string
    description: string
    price: number
    categoryId: string
    condition: "NEW" | "USED_LIKE_NEW" | "USED_FAIR"
    location?: string | null
    images: string[]
  }
}

export function ListingForm({ categories, initialData }: ListingFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  
  // Image state
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const form = useForm<z.infer<typeof listingSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(listingSchema as any),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || ("" as any),
      categoryId: initialData?.categoryId || "",
      condition: initialData?.condition || undefined,
      location: initialData?.location || "",
    },
  })

  const totalImages = existingImages.length + newImageFiles.length

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    const files = Array.from(e.target.files)
    
    if (totalImages + files.length > 4) {
      setError("You can only upload up to 4 images in total.")
      return
    }

    const validFiles: File[] = []
    const previews: string[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is too large. Max 5MB.`)
        return
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`File ${file.name} is unsupported. Use JPG, PNG, or WebP.`)
        return
      }
      validFiles.push(file)
      previews.push(URL.createObjectURL(file))
    }

    setError(null)
    setNewImageFiles(prev => [...prev, ...validFiles])
    setNewImagePreviews(prev => [...prev, ...previews])
    
    // Reset input value so same files can be selected again if removed
    e.target.value = ""
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(values: z.infer<typeof listingSchema>) {
    if (totalImages < 1) {
      setError("Please upload at least 1 image.")
      return
    }
    
    setIsPending(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("description", values.description)
    formData.append("price", values.price.toString())
    formData.append("categoryId", values.categoryId)
    formData.append("condition", values.condition)
    if (values.location) formData.append("location", values.location)
    
    existingImages.forEach(img => formData.append("existingImages", img))
    newImageFiles.forEach(file => formData.append("images", file))
    
    try {
      let result
      if (isEditing && initialData) {
        result = await updateListing(initialData.id, formData)
      } else {
        result = await createListing(formData)
      }
      
      if (result.error) {
        setError(result.error)
      } else {
        router.push("/dashboard/listings")
      }
    } catch (e: any) {
      setError("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md flex items-center gap-2 font-medium">
            <ShieldAlertIcon className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Engineering Mathematics Textbook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₦)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your item in detail. Mention any flaws or important details."
                    className="h-28 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="USED_LIKE_NEW">Used - Like New</SelectItem>
                      <SelectItem value="USED_FAIR">Used - Fair</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Queen Idia Hall, Faculty of Science" {...field} />
                </FormControl>
                <FormDescription>Where can buyers meet you on campus?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Images ({totalImages}/4)</h2>
          <p className="text-sm text-muted-foreground">Upload up to 4 images. JPG, PNG, WebP up to 5MB each.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {existingImages.map((img, i) => (
              <div key={`exist-${i}`} className="relative aspect-square rounded-md overflow-hidden border bg-muted group">
                <Image src={img} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
            
            {newImagePreviews.map((preview, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-md overflow-hidden border bg-muted group">
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                  <XIcon className="size-4" />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-1 text-[10px] text-center font-medium bg-primary text-primary-foreground">
                  NEW
                </div>
              </div>
            ))}

            {totalImages < 4 && (
              <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-muted-foreground hover:text-primary">
                <UploadCloudIcon className="size-6 mb-2" />
                <span className="text-xs font-medium">Add Image</span>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isPending}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2Icon className="size-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Post Listing"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
