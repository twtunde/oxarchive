"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-background px-6 py-10 text-foreground">
        <main className="w-full max-w-xl space-y-4 border border-border bg-card p-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Fatal error
          </p>
          <h1 className="font-display text-2xl sm:text-3xl">
            We hit a critical problem
          </h1>
          <p className="text-sm text-muted-foreground">
            The app ran into an unexpected state. You can retry or return to the
            homepage.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Retry
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.assign("/")}
            >
              Go to homepage
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
