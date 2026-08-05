"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
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
    <main className="flex min-h-svh items-center justify-center px-6 py-10">
      <Card className="w-full max-w-xl border-border bg-card">
        <CardHeader className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Runtime error
          </p>
          <CardTitle className="font-display text-2xl sm:text-3xl">
            Something went wrong
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            A temporary issue prevented this page from loading correctly.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.assign("/")}
            >
              Back to homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
