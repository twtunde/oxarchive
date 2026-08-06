import Link from "next/link"
import type { Metadata } from "next"

import { markOrderFailedAction, markOrderPaidAction } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listOrdersForAdmin } from "@/db/queries/orders"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = {
  title: "Orders",
  description: "Admin order verification queue for bank transfer purchases.",
}

type AdminOrdersPageProps = {
  searchParams: Promise<{ orderToken?: string }>
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { orderToken } = await searchParams
  const orders = await listOrdersForAdmin()

  const urgentCount = orders.filter(
    (order) => order.status === "pending" && order.buyerConfirmedAt
  ).length

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Orders & transfer verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Prioritize orders where buyers clicked transfer confirmation. Use the
          purchase code to verify transfers in your bank statement.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">Total orders: {orders.length}</Badge>
        <Badge variant={urgentCount > 0 ? "default" : "outline"}>
          Awaiting verification: {urgentCount}
        </Badge>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/ebooks/new">Upload ebook</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/bank-settings">Bank settings</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/categories">Categories</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/email-test">Email test</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const highlight = orderToken && order.orderToken === orderToken
          const isUrgent = order.status === "pending" && order.buyerConfirmedAt

          return (
            <Card
              key={order.id}
              className={highlight ? "ring-2 ring-primary" : undefined}
            >
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <span>{order.orderToken}</span>
                  <Badge
                    variant={order.status === "paid" ? "default" : "secondary"}
                  >
                    {order.status}
                  </Badge>
                  {isUrgent ? (
                    <Badge variant="outline">Buyer claims transfer sent</Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">Buyer:</span>{" "}
                    {order.buyerName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {order.buyerEmail}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    {formatPrice(order.totalAmountInKobo, order.currency)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Created:</span>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-muted-foreground">Items</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {order.items.map((item) => (
                      <li key={item.id}>{item.ebook.title}</li>
                    ))}
                  </ul>
                </div>

                {order.buyerConfirmedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Buyer clicked transfer confirmation at{" "}
                    {new Date(order.buyerConfirmedAt).toLocaleString()}.
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 border-t pt-3">
                  {order.status !== "paid" ? (
                    <form action={markOrderPaidAction}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input
                        type="hidden"
                        name="orderToken"
                        value={order.orderToken}
                      />
                      <Button type="submit" size="sm">
                        Mark as paid & unlock downloads
                      </Button>
                    </form>
                  ) : null}

                  {order.status === "pending" ? (
                    <form action={markOrderFailedAction}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input
                        type="hidden"
                        name="orderToken"
                        value={order.orderToken}
                      />
                      <Button type="submit" size="sm" variant="destructive">
                        Mark as failed
                      </Button>
                    </form>
                  ) : null}

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/checkout/${order.orderToken}`}>
                      Open buyer checkout page
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
