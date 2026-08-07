"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { Controller, type Path, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { submitAnonymousPublisherDraftAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  payoutMethodSchema,
  publisherSubmissionSchema,
} from "@/lib/publisher-submission-schema"
import { NIGERIAN_BANKS } from "@/lib/nigerian-banks"

const isFileListAvailable = typeof FileList !== "undefined"

const fileListSchema = z.custom<FileList>(
  (value) => !isFileListAvailable || value instanceof FileList,
  {
    message: "Invalid file input",
  }
)

const formSchema = publisherSubmissionSchema.extend({
  ebookFile: fileListSchema.refine(
    (value) => !isFileListAvailable || value.length > 0,
    {
      message: "Ebook file is required",
    }
  ),
  coverImage: fileListSchema.optional(),
})

type FormValues = z.infer<typeof formSchema>
type FormInputValues = z.input<typeof formSchema>
type FormOutputValues = z.output<typeof formSchema>

type CategoryOption = {
  id: string
  name: string
}

type AnonymousPublisherFormProps = {
  categories: CategoryOption[]
}

const payoutMethodDescriptions: Record<
  z.infer<typeof payoutMethodSchema>,
  string
> = {
  bank: "Bank transfer details",
  paypal: "PayPal email",
  payoneer: "Payoneer email",
}

export function AnonymousPublisherForm({
  categories,
}: AnonymousPublisherFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputValues, unknown, FormOutputValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payoutMethod: "bank",
      format: "pdf",
      suggestedPriceInMainUnit: 2500,
    },
  })

  const payoutMethod = watch("payoutMethod")

  const payoutHelpText = useMemo(() => {
    if (!payoutMethod) {
      return null
    }

    return payoutMethodDescriptions[payoutMethod]
  }, [payoutMethod])

  function appendIfPresent(formData: FormData, key: string, value?: string) {
    const normalized = value?.trim()
    if (normalized) {
      formData.set(key, normalized)
    }
  }

  async function onSubmit(values: FormOutputValues) {
    clearErrors()

    const payload = new FormData()
    payload.set("pseudonym", values.pseudonym)
    payload.set("contactEmail", values.contactEmail)
    payload.set("title", values.title)
    payload.set("authorDisplayName", values.authorDisplayName)
    payload.set("description", values.description)
    payload.set("categoryId", values.categoryId)
    payload.set("format", values.format)
    payload.set(
      "suggestedPriceInMainUnit",
      String(values.suggestedPriceInMainUnit)
    )
    payload.set("payoutMethod", values.payoutMethod)

    appendIfPresent(payload, "edition", values.edition)
    appendIfPresent(payload, "bankName", values.bankName)
    appendIfPresent(payload, "bankAccountName", values.bankAccountName)
    appendIfPresent(payload, "bankAccountNumber", values.bankAccountNumber)
    appendIfPresent(payload, "bankCodeSwift", values.bankCodeSwift)
    appendIfPresent(payload, "paypalEmail", values.paypalEmail)
    appendIfPresent(payload, "payoneerEmail", values.payoneerEmail)

    const ebookFile = values.ebookFile?.item(0)
    if (ebookFile) {
      payload.set("ebookFile", ebookFile)
    }

    const coverImage = values.coverImage?.item(0)
    if (coverImage) {
      payload.set("coverImage", coverImage)
    }

    let result: Awaited<ReturnType<typeof submitAnonymousPublisherDraftAction>>

    try {
      result = await submitAnonymousPublisherDraftAction(payload)
    } catch {
      toast.error("Submission failed. Please try again.")
      return
    }

    if (result.status === "success") {
      toast.success(result.message)
      reset({
        payoutMethod: "bank",
        format: "pdf",
        suggestedPriceInMainUnit: 2500,
      })
      return
    }

    if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([key, messages]) => {
        const firstMessage = messages?.[0]
        if (!firstMessage) {
          return
        }

        setError(key as Path<FormInputValues>, {
          type: "server",
          message: firstMessage,
        })
      })
    }

    toast.error(result.message)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Anonymous publisher submission
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="pseudonym"
              >
                Pseudonym
              </label>
              <Input id="pseudonym" {...register("pseudonym")} />
              {errors.pseudonym?.message ? (
                <p className="text-xs text-destructive">
                  {errors.pseudonym.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="contactEmail"
              >
                Contact email
              </label>
              <Input
                id="contactEmail"
                type="email"
                {...register("contactEmail")}
              />
              {errors.contactEmail?.message ? (
                <p className="text-xs text-destructive">
                  {errors.contactEmail.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase" htmlFor="title">
                Book title
              </label>
              <Input id="title" {...register("title")} />
              {errors.title?.message ? (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="authorDisplayName"
              >
                Author name (display)
              </label>
              <Input
                id="authorDisplayName"
                {...register("authorDisplayName")}
              />
              {errors.authorDisplayName?.message ? (
                <p className="text-xs text-destructive">
                  {errors.authorDisplayName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium uppercase"
              htmlFor="description"
            >
              Description
            </label>
            <Textarea id="description" rows={5} {...register("description")} />
            {errors.description?.message ? (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="categoryId"
              >
                Category
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="categoryId" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId?.message ? (
                <p className="text-xs text-destructive">
                  {errors.categoryId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase" htmlFor="format">
                Format
              </label>
              <Controller
                name="format"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="format" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="epub">EPUB</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="suggestedPriceInMainUnit"
              >
                Suggested price (NGN)
              </label>
              <Input
                id="suggestedPriceInMainUnit"
                type="number"
                min={100}
                step={1}
                {...register("suggestedPriceInMainUnit", {
                  valueAsNumber: true,
                })}
              />
              {errors.suggestedPriceInMainUnit?.message ? (
                <p className="text-xs text-destructive">
                  {errors.suggestedPriceInMainUnit.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="ebookFile"
              >
                Ebook file
              </label>
              <Input
                id="ebookFile"
                type="file"
                accept=".pdf,.epub,application/pdf,application/epub+zip"
                {...register("ebookFile")}
              />
              {errors.ebookFile?.message ? (
                <p className="text-xs text-destructive">
                  {errors.ebookFile.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="coverImage"
              >
                Cover image (optional)
              </label>
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                {...register("coverImage")}
              />
            </div>
          </div>

          <div className="space-y-3 border border-border p-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase"
                htmlFor="payoutMethod"
              >
                Payout method
              </label>
              <Select
                value={payoutMethod}
                onValueChange={(value) =>
                  setValue(
                    "payoutMethod",
                    value as FormInputValues["payoutMethod"],
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }
              >
                <SelectTrigger id="payoutMethod" className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="payoneer">Payoneer</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("payoutMethod")} />
              {errors.payoutMethod?.message ? (
                <p className="text-xs text-destructive">
                  {errors.payoutMethod.message}
                </p>
              ) : null}
              {payoutHelpText ? (
                <p className="text-xs text-muted-foreground">
                  {payoutHelpText}
                </p>
              ) : null}
            </div>

            {payoutMethod === "bank" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium uppercase"
                    htmlFor="bankName"
                  >
                    Bank name
                  </label>
                  <Controller
                    name="bankName"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="bankName" className="w-full sm:w-96">
                          <SelectValue placeholder="Select Nigerian bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_BANKS.map((bankName) => (
                            <SelectItem key={bankName} value={bankName}>
                              {bankName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.bankName?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.bankName.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-medium uppercase"
                      htmlFor="bankAccountName"
                    >
                      Account name
                    </label>
                    <Input
                      id="bankAccountName"
                      {...register("bankAccountName")}
                    />
                    {errors.bankAccountName?.message ? (
                      <p className="text-xs text-destructive">
                        {errors.bankAccountName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-medium uppercase"
                      htmlFor="bankAccountNumber"
                    >
                      Account number
                    </label>
                    <Input
                      id="bankAccountNumber"
                      {...register("bankAccountNumber")}
                    />
                    {errors.bankAccountNumber?.message ? (
                      <p className="text-xs text-destructive">
                        {errors.bankAccountNumber.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-medium uppercase"
                      htmlFor="bankCodeSwift"
                    >
                      Bank code / SWIFT
                    </label>
                    <Input id="bankCodeSwift" {...register("bankCodeSwift")} />
                    {errors.bankCodeSwift?.message ? (
                      <p className="text-xs text-destructive">
                        {errors.bankCodeSwift.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {payoutMethod === "paypal" ? (
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium uppercase"
                  htmlFor="paypalEmail"
                >
                  PayPal email
                </label>
                <Input
                  id="paypalEmail"
                  type="email"
                  {...register("paypalEmail")}
                />
                {errors.paypalEmail?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.paypalEmail.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            {payoutMethod === "payoneer" ? (
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium uppercase"
                  htmlFor="payoneerEmail"
                >
                  Payoneer email
                </label>
                <Input
                  id="payoneerEmail"
                  type="email"
                  {...register("payoneerEmail")}
                />
                {errors.payoneerEmail?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.payoneerEmail.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              By submitting, you agree that Oxarchive can set final publication
              pricing based on your suggested price and internal market
              analysis.
            </p>
            <p>
              Anonymous publisher books approved for listing are subject to a
              15% platform fee per paid sale, with the remaining 85% credited
              for month-end disbursement.
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit anonymous draft"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
