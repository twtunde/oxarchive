"use client"

import { useActionState } from "react"

import { adminLoginAction, type AdminLoginState } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

const initialState: AdminLoginState = {}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    adminLoginAction,
    initialState
  )

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin access</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret">Admin secret</Label>
              <Input
                id="secret"
                name="secret"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {state.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? (
                <Skeleton className="h-4 w-20 bg-primary-foreground/30" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
