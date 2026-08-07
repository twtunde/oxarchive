"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useMemo } from "react"

import {
  createTransferOrderAction,
  type CreateTransferOrderState,
} from "./actions"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { CatalogEbook } from "@/db/queries/catalog"
import { formatPrice } from "@/lib/format"
import { useCartStore } from "@/lib/stores/cart-store"

async function fetchCartEbooks(ids: string[]): Promise<CatalogEbook[]> {
  if (ids.length === 0) {
    return []
  }

  const params = new URLSearchParams({ ids: ids.join(",") })
  const response = await fetch(`/api/ebooks/by-ids?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to load bag items.")
  }

  const data = (await response.json()) as { items: CatalogEbook[] }
  return data.items
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

export default function CartPage() {
  const initialCreateTransferOrderState: CreateTransferOrderState = {
    status: "idle",
  }

  const router = useRouter()
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const cartIds = useCartStore((state) => state.ebookIds)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const clearCart = useCartStore((state) => state.clearCart)

  const [state, formAction, pending] = useActionState(
    createTransferOrderAction,
    initialCreateTransferOrderState
  )

  const { data, isLoading } = useQuery({
    queryKey: ["cart-ebooks", cartIds],
    queryFn: () => fetchCartEbooks(cartIds),
    enabled: hasHydrated,
  })

  const orderedEbooks = useMemo(() => {
    if (!data) {
      return []
    }

    const order = new Map(cartIds.map((id, index) => [id, index]))
    return [...data].sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
    )
  }, [data, cartIds])

  const totalInKobo = orderedEbooks.reduce(
    (sum, item) => sum + item.priceInKobo,
    0
  )
  const currency = orderedEbooks[0]?.currency ?? "NGN"
  const checkoutIds = orderedEbooks.map((item) => item.id).join(",")
  const isPending = !hasHydrated || isLoading

  useEffect(() => {
    if (state.status === "success" && state.orderToken) {
      clearCart()
      router.push(`/checkout/${state.orderToken}`)
    }
  }, [clearCart, router, state.orderToken, state.status])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Checkout
        </p>
        <h1 className="font-display text-3xl">Your bag</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          You&apos;ll pay by bank transfer. After you transfer, return to
          confirm payment using your purchase code.
        </p>
      </header>

      {isPending ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Loading your bag...
        </div>
      ) : orderedEbooks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
          <p className="font-display text-xl">Your bag is empty</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add ebooks to your bag before starting a transfer checkout.
          </p>
          <Button asChild className="rounded-full px-6">
            <Link href="/catalog">Browse the archive</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-3">
                {orderedEbooks.map((ebook, index) => (
                  <ScrollReveal
                    key={ebook.id}
                    as="li"
                    index={index}
                    className="flex items-start justify-between gap-4 rounded-md border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{ebook.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ebook.author}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {ebook.format.replace("_", "/")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold">
                        {formatPrice(ebook.priceInKobo, ebook.currency)}
                      </p>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => removeFromCart(ebook.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </ScrollReveal>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buyer details</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="ebookIds" value={checkoutIds} />

                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <strong>{formatPrice(totalInKobo, currency)}</strong>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    A unique purchase code will be generated as your transfer
                    purpose/reference.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerName">Full name</Label>
                  <Input
                    id="buyerName"
                    name="buyerName"
                    required
                    maxLength={160}
                  />
                  <FieldError messages={state.fieldErrors?.buyerName} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerEmail">Email address</Label>
                  <Input
                    id="buyerEmail"
                    name="buyerEmail"
                    type="email"
                    required
                    maxLength={320}
                    autoComplete="email"
                  />
                  <FieldError messages={state.fieldErrors?.buyerEmail} />
                </div>

                <FieldError messages={state.fieldErrors?.ebookIds} />

                {state.status === "error" && state.message ? (
                  <p role="alert" className="text-sm text-destructive">
                    {state.message}
                  </p>
                ) : null}

                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? (
                    <Skeleton className="h-4 w-36 bg-primary-foreground/30" />
                  ) : (
                    "Continue to transfer details"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
