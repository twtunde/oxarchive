"use client"

import Link from "next/link"
import { useActionState, useEffect, useRef } from "react"

import { createEbookAction, type CreateEbookState } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

type EbookUploadFormProps = {
  categories: { id: string; name: string }[]
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

export function EbookUploadForm({ categories }: EbookUploadFormProps) {
  const initialCreateEbookState: CreateEbookState = { status: "idle" }

  const [state, formAction, pending] = useActionState(
    createEbookAction,
    initialCreateEbookState
  )
  const formRef = useRef<HTMLFormElement>(null)
  const lastSubmissionId = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (state.submissionId && state.submissionId !== lastSubmissionId.current) {
      lastSubmissionId.current = state.submissionId
      formRef.current?.reset()
    }
  }, [state.submissionId])

  return (
    <Card>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-5">
          {state.status === "success" ? (
            <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
              Uploaded. View it at{" "}
              <Link href={`/ebooks/${state.slug}`} className="underline">
                /ebooks/{state.slug}
              </Link>
              .
            </p>
          ) : null}

          {state.status === "error" && state.message ? (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required maxLength={240} />
            <FieldError messages={state.fieldErrors?.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="auto-generated from title"
            />
            <FieldError messages={state.fieldErrors?.slug} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" name="author" required maxLength={180} />
            <FieldError messages={state.fieldErrors?.author} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required rows={5} />
            <FieldError messages={state.fieldErrors?.description} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={state.fieldErrors?.categoryId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select name="format" defaultValue="pdf" required>
                <SelectTrigger id="format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="epub">EPUB</SelectItem>
                </SelectContent>
              </Select>
              <FieldError messages={state.fieldErrors?.format} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edition">Edition (optional)</Label>
              <Input id="edition" name="edition" maxLength={80} />
              <FieldError messages={state.fieldErrors?.edition} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceInMainUnit">Price (NGN)</Label>
              <Input
                id="priceInMainUnit"
                name="priceInMainUnit"
                type="number"
                min="0"
                step="0.01"
                required
              />
              <FieldError messages={state.fieldErrors?.priceInMainUnit} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover image (optional)</Label>
            <Input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
            />
            <FieldError messages={state.fieldErrors?.coverImage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ebookFile">Ebook file (.pdf or .epub)</Label>
            <Input
              id="ebookFile"
              name="ebookFile"
              type="file"
              accept=".pdf,.epub"
              required
            />
            <FieldError messages={state.fieldErrors?.ebookFile} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="publish" name="publish" defaultChecked />
            <Label htmlFor="publish" className="font-normal">
              Publish immediately
            </Label>
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
              <Skeleton className="h-4 w-24 bg-primary-foreground/30" />
            ) : (
              "Upload ebook"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
