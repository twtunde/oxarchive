import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ConfirmTransferForm } from "./confirm-transfer-form"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveBankAccounts } from "@/db/queries/bank-settings"
import { getOrderByToken } from "@/db/queries/orders"
import { formatPrice } from "@/lib/format"

type CheckoutStatusPageProps = {
  params: Promise<{ orderToken: string }>
}

export async function generateMetadata({
  params,
}: CheckoutStatusPageProps): Promise<Metadata> {
  const { orderToken } = await params

  return {
    title: `Checkout ${orderToken}`,
    description:
      "Bank transfer instructions and payment confirmation status for your Oxarchive order.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/checkout/${orderToken}`,
    },
  }
}

function statusLabel(status: "pending" | "paid" | "failed" | "cancelled") {
  switch (status) {
    case "pending":
      return "Awaiting verification"
    case "paid":
      return "Payment verified"
    case "failed":
      return "Payment failed"
    case "cancelled":
      return "Cancelled"
  }
}

export default async function CheckoutStatusPage({
  params,
}: CheckoutStatusPageProps) {
  const { orderToken } = await params

  const [order, bankAccounts] = await Promise.all([
    getOrderByToken(orderToken),
    getActiveBankAccounts(),
  ])

  if (!order) {
    notFound()
  }

  const total = formatPrice(order.totalAmountInKobo, order.currency)
  const purchasesByOrderItemId = new Map(
    order.purchases.map((purchase) => [purchase.orderItemId, purchase])
  )

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Transfer checkout
        </p>
        <h1 className="font-display text-3xl">Order {order.orderToken}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={order.status === "paid" ? "default" : "secondary"}>
            {statusLabel(order.status)}
          </Badge>
          {order.buyerConfirmedAt ? (
            <Badge variant="outline">Buyer marked transfer as sent</Badge>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {order.items.map((item, index) => {
                const purchase = purchasesByOrderItemId.get(item.id)

                return (
                  <ScrollReveal
                    key={item.id}
                    as="li"
                    index={index}
                    className="rounded-md border p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.ebook.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.ebook.author}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.unitPriceInKobo, order.currency)}
                      </p>
                    </div>

                    {order.status === "paid" && purchase ? (
                      <div className="mt-3 border-t pt-3">
                        <a
                          href={`/download/${purchase.accessToken}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Download ebook
                        </a>
                      </div>
                    ) : (
                      <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                        Download unlocks after admin confirms payment.
                      </p>
                    )}
                  </ScrollReveal>
                )
              })}
            </ul>

            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">Total</span>
              <strong>{total}</strong>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank transfer instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Transfer purpose/reference
                </p>
                <p className="font-mono text-base font-semibold tracking-wide">
                  {order.orderToken}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Transfer exactly <strong>{total}</strong> and include this code
                in your transfer reason so admin can verify quickly.
              </p>

              {bankAccounts.length === 0 ? (
                <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  No active bank account is configured yet. Please contact
                  support/admin.
                </p>
              ) : (
                <ul className="space-y-3">
                  {bankAccounts.map((account) => (
                    <li
                      key={account.id}
                      className="rounded-md border p-3 text-sm"
                    >
                      <p className="font-medium">{account.bankName}</p>
                      <p className="text-muted-foreground">
                        Acct No: {account.accountNumber}
                      </p>
                      <p className="text-muted-foreground">
                        Acct Name: {account.accountName}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Done with transfer?</CardTitle>
            </CardHeader>
            <CardContent>
              <ConfirmTransferForm
                orderToken={order.orderToken}
                alreadyConfirmed={Boolean(order.buyerConfirmedAt)}
                isPaid={order.status === "paid"}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
