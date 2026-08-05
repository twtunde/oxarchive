import type { Metadata } from "next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { TestEmailForms } from "./test-email-forms"

export const metadata: Metadata = {
  title: "Email test",
  description:
    "Admin-only email template test page for Resend delivery checks.",
}

export default function AdminEmailTestPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">Email test</h1>
        <p className="text-sm text-muted-foreground">
          Send both transactional templates to verify Resend delivery,
          rendering, and mailbox placement.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Template delivery checks</CardTitle>
        </CardHeader>
        <CardContent>
          <TestEmailForms />
        </CardContent>
      </Card>
    </main>
  )
}
