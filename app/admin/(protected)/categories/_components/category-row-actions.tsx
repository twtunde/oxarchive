"use client"

import { useActionState } from "react"

import {
  deleteCategoryAction,
  type CategoryMutationState,
  updateCategoryAction,
} from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CategoryRowActionsProps = {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
  }
}

const initialState: CategoryMutationState = { status: "idle" }

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

export function CategoryRowActions({ category }: CategoryRowActionsProps) {
  const [updateState, updateAction, updating] = useActionState(
    updateCategoryAction,
    initialState
  )
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCategoryAction,
    initialState
  )

  return (
    <div className="mt-3 grid gap-3 border-t border-border pt-3">
      <form action={updateAction} className="grid gap-2">
        <input type="hidden" name="id" value={category.id} />

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={`name-${category.id}`}>Name</Label>
            <Input
              id={`name-${category.id}`}
              name="name"
              defaultValue={category.name}
              required
            />
            <FieldError messages={updateState.fieldErrors?.name} />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`slug-${category.id}`}>Slug</Label>
            <Input
              id={`slug-${category.id}`}
              name="slug"
              defaultValue={category.slug}
            />
            <FieldError messages={updateState.fieldErrors?.slug} />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`description-${category.id}`}>Description</Label>
          <Textarea
            id={`description-${category.id}`}
            name="description"
            defaultValue={category.description ?? ""}
            rows={2}
          />
          <FieldError messages={updateState.fieldErrors?.description} />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={updating}>
            {updating ? "Saving..." : "Save"}
          </Button>
          {updateState.message ? (
            <p
              className={
                updateState.status === "error"
                  ? "text-xs text-destructive"
                  : "text-xs text-primary"
              }
            >
              {updateState.message}
            </p>
          ) : null}
        </div>
      </form>

      <form
        action={deleteAction}
        className="flex items-center gap-2"
        onSubmit={(event) => {
          const confirmed = window.confirm(
            `Delete category "${category.name}"? This cannot be undone.`
          )

          if (!confirmed) {
            event.preventDefault()
          }
        }}
      >
        <input type="hidden" name="id" value={category.id} />
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
        {deleteState.message ? (
          <p
            className={
              deleteState.status === "error"
                ? "text-xs text-destructive"
                : "text-xs text-primary"
            }
          >
            {deleteState.message}
          </p>
        ) : null}
      </form>
    </div>
  )
}
