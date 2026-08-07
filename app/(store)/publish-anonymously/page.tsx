import type { Metadata } from "next"

import { AnonymousPublisherForm } from "./_components/anonymous-publisher-form"
import { listPublisherSubmissionCategories } from "@/db/queries/publisher-submissions"

export const metadata: Metadata = {
  title: "Publish anonymously",
  description:
    "Submit your literary work with a pseudonym. Approved listings are published after review and paid out monthly.",
  alternates: {
    canonical: "/publish-anonymously",
  },
}

export default async function PublishAnonymouslyPage() {
  const categories = await listPublisherSubmissionCategories()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Publisher Portal
        </p>
        <h1 className="font-display text-3xl sm:text-4xl">
          Publish anonymously
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Share your work under a pseudonym. Submissions are stored as drafts,
          reviewed by our editorial team, and published only after approval. You
          will receive email updates for submission status, listing URL, pricing
          adjustments, and month-end payout summaries.
        </p>
      </header>

      <AnonymousPublisherForm categories={categories} />
    </div>
  )
}
