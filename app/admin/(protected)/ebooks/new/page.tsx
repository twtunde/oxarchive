import type { Metadata } from "next"

import { db } from "@/db"
import { categories } from "@/db/schema"

import { EbookUploadForm } from "./_components/ebook-upload-form"

export const metadata: Metadata = {
  title: "Upload ebook",
  description: "Add and publish new ebooks to the Oxarchive catalog.",
}

export default async function NewEbookPage() {
  const categoryOptions = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.name)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Upload an ebook
        </h1>
      </header>

      <EbookUploadForm categories={categoryOptions} />
    </main>
  )
}
