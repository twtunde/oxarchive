import type { Metadata } from "next"
import Link from "next/link"

import { NewCategoryForm } from "./_components/new-category-form"
import { CategoryRowActions } from "./_components/category-row-actions"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Categories",
  description: "Create and manage ebook categories used across the catalog.",
}

export default async function AdminCategoriesPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .orderBy(categories.name)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Add catalog categories so ebooks can be grouped and filtered in the
          storefront.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/ebooks/new">Upload ebook</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/catalog">Open catalog</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create category</CardTitle>
          </CardHeader>
          <CardContent>
            <NewCategoryForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {rows.map((category) => (
                <li
                  key={category.id}
                  className="border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                >
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{category.slug}
                  </p>
                  {category.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}

                  <CategoryRowActions category={category} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
