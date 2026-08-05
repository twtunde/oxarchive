"use client"

import { useActionState } from "react"

import { confirmTransferAction, type ConfirmTransferState } from "./actions"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type ConfirmTransferFormProps = {
  orderToken: string
  alreadyConfirmed: boolean
  isPaid: boolean
}

export function ConfirmTransferForm({
  orderToken,
  alreadyConfirmed,
  isPaid,
}: ConfirmTransferFormProps) {
  const initialConfirmTransferState: ConfirmTransferState = {
    status: "idle",
  }

  const [state, formAction, pending] = useActionState(
    confirmTransferAction,
    initialConfirmTransferState
  )

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderToken" value={orderToken} />

      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : undefined}
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending || isPaid}
        className="w-full sm:w-auto"
      >
        {pending ? (
          <Skeleton className="h-4 w-44 bg-primary-foreground/30" />
        ) : alreadyConfirmed ? (
          "I have made this transfer (notify admin again)"
        ) : (
          "I have made this transfer"
        )}
      </Button>
    </form>
  )
}
