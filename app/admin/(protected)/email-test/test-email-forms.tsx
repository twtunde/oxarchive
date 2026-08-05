"use client"

import { useActionState } from "react"

import {
  sendAdminAlertTestAction,
  sendBuyerConfirmationTestAction,
  type TestEmailState,
} from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: TestEmailState = {
  status: "idle",
}

export function TestEmailForms() {
  const [adminState, adminAction, adminPending] = useActionState(
    sendAdminAlertTestAction,
    initialState
  )

  const [buyerState, buyerAction, buyerPending] = useActionState(
    sendBuyerConfirmationTestAction,
    initialState
  )

  return (
    <div className="space-y-6">
      <form action={adminAction} className="space-y-3 border border-border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Admin transfer-claimed alert</p>
          <p className="text-xs text-muted-foreground">
            Sends the admin-notification template to the configured
            ADMIN_NOTIFICATION_EMAIL.
          </p>
        </div>

        {adminState.message ? (
          <p
            className={
              adminState.status === "error"
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {adminState.message}
          </p>
        ) : null}

        <Button type="submit" size="sm" disabled={adminPending}>
          {adminPending ? "Sending admin test..." : "Send admin alert test"}
        </Button>
      </form>

      <form action={buyerAction} className="space-y-3 border border-border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Buyer payment-confirmed email</p>
          <p className="text-xs text-muted-foreground">
            Sends the buyer confirmation template to the email you provide
            below.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="buyerName">Buyer name</Label>
            <Input id="buyerName" name="buyerName" defaultValue="Test Buyer" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buyerEmail">Buyer email</Label>
            <Input
              id="buyerEmail"
              name="buyerEmail"
              type="email"
              placeholder="buyer@example.com"
              required
            />
          </div>
        </div>

        {buyerState.message ? (
          <p
            className={
              buyerState.status === "error"
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {buyerState.message}
          </p>
        ) : null}

        <Button type="submit" size="sm" disabled={buyerPending}>
          {buyerPending
            ? "Sending buyer test..."
            : "Send buyer confirmation test"}
        </Button>
      </form>
    </div>
  )
}
