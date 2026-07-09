import { getCategories } from "@/actions/categories"
import { PageHeader } from "@/components/common/page-header"
import { CategoryDialog } from "./category-dialog"
import { CategoryActions } from "./category-actions"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FolderOpenIcon } from "lucide-react"

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <PageHeader
          title="Categories"
          description="Manage the product categories available to students."
        />
        <CategoryDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpenIcon className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No Categories Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                You haven&apos;t created any categories yet. Create your first category to allow students to post listings.
              </p>
              <CategoryDialog />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Active Listings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-foreground">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal rounded-md">
                        {category._count.listings} listings
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryActions category={category} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
