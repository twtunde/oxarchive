"use client"

import { useActionState, useEffect, useRef } from "react"

import { createCategoryAction, type CreateCategoryState } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type NewCategoryFormProps = {
  onCreated?: () => void
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null
  }

  return (
    <p role="alert" className="text-xs text-destructive">
      {messages[0]}
    </p>
  )
}

export function NewCategoryForm({ onCreated }: NewCategoryFormProps) {
  const initialState: CreateCategoryState = { status: "idle" }
  const [state, action, pending] = useActionState(
    createCategoryAction,
    initialState
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset()
      onCreated?.()
    }
  }, [onCreated, state.status])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-primary"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Category name</Label>
        <Input id="name" name="name" required maxLength={120} />
        <FieldError messages={state.fieldErrors?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input id="slug" name="slug" placeholder="auto-generated from name" />
        <FieldError messages={state.fieldErrors?.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={4} />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create category"}
      </Button>
    </form>
  )
}
