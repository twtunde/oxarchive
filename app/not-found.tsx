import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-10">
      <Card className="w-full max-w-xl border-border bg-card">
        <CardHeader className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            404
          </p>
          <CardTitle className="font-display text-2xl sm:text-3xl">
            Page not found
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            The page you requested does not exist or may have moved.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/catalog">Browse all books</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go to featured</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
