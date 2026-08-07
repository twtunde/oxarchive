import Link from "next/link"
import type { Metadata } from "next"

import {
  approveSubmissionAction,
  queueSubmissionForReviewAction,
  rejectSubmissionAction,
  sendPayoutSummaryAction,
} from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  listMonthEndPayouts,
  listSubmissionQueueForAdmin,
} from "@/db/queries/publisher-submissions"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = {
  title: "Publisher submissions",
  description:
    "Review anonymous publisher drafts, approve listings, set final prices, and run payout summaries.",
}

function currentPayoutMonth() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${`${now.getUTCMonth() + 1}`.padStart(2, "0")}`
}

type AdminPublisherSubmissionsPageProps = {
  searchParams: Promise<{ payoutMonth?: string }>
}

export default async function AdminPublisherSubmissionsPage({
  searchParams,
}: AdminPublisherSubmissionsPageProps) {
  const params = await searchParams
  const payoutMonth = params.payoutMonth ?? currentPayoutMonth()

  const submissions = await listSubmissionQueueForAdmin()
  const payoutRows = await listMonthEndPayouts(payoutMonth)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Anonymous publisher submissions
        </h1>
        <p className="text-sm text-muted-foreground">
          All non-admin publisher books remain in draft or pending review until
          approved. On approval, Oxarchive publishes the listing and emails the
          listing URL.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Queue size: {submissions.length}</Badge>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/orders">Orders</Link>
        </Button>
      </div>

      <section className="space-y-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No drafts are waiting for review.
            </CardContent>
          </Card>
        ) : null}

        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                <span>{submission.title}</span>
                <Badge variant="outline">{submission.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Pseudonym:</span>{" "}
                  {submission.pseudonym}
                </p>
                <p>
                  <span className="text-muted-foreground">Contact email:</span>{" "}
                  {submission.contactEmail}
                </p>
                <p>
                  <span className="text-muted-foreground">Author display:</span>{" "}
                  {submission.authorDisplayName}
                </p>
                <p>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  {submission.category?.name ?? "Uncategorized"}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Suggested price:
                  </span>{" "}
                  {formatPrice(
                    submission.suggestedPriceInKobo,
                    submission.currency
                  )}
                </p>
                <p>
                  <span className="text-muted-foreground">Payout:</span>{" "}
                  {submission.payoutMethod}
                </p>
              </div>

              <div className="rounded-sm border border-border p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  Publisher payout details
                </p>
                <p>Bank name: {submission.bankName ?? "-"}</p>
                <p>Bank account name: {submission.bankAccountName ?? "-"}</p>
                <p>
                  Bank account number: {submission.bankAccountNumber ?? "-"}
                </p>
                <p>Bank code/SWIFT: {submission.bankCodeSwift ?? "-"}</p>
                <p>PayPal email: {submission.paypalEmail ?? "-"}</p>
                <p>Payoneer email: {submission.payoneerEmail ?? "-"}</p>
              </div>

              {submission.status === "draft" ? (
                <form action={queueSubmissionForReviewAction}>
                  <input
                    type="hidden"
                    name="submissionId"
                    value={submission.id}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Move to pending review
                  </Button>
                </form>
              ) : null}

              <form
                action={approveSubmissionAction}
                className="space-y-2 border-t pt-3"
              >
                <input
                  type="hidden"
                  name="submissionId"
                  value={submission.id}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1 text-xs">
                    <span className="font-medium uppercase">
                      Final price (NGN)
                    </span>
                    <input
                      name="finalPriceInMainUnit"
                      type="number"
                      min={100}
                      step={1}
                      defaultValue={Math.round(
                        submission.suggestedPriceInKobo / 100
                      )}
                      className="w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-medium uppercase">
                      Review notes (optional)
                    </span>
                    <input
                      name="reviewNotes"
                      className="w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs"
                    />
                  </label>
                </div>

                <Button type="submit" size="sm">
                  Approve, publish, and send listing email
                </Button>
              </form>

              <form
                action={rejectSubmissionAction}
                className="space-y-2 border-t pt-3"
              >
                <input
                  type="hidden"
                  name="submissionId"
                  value={submission.id}
                />
                <label className="space-y-1 text-xs">
                  <span className="font-medium uppercase">
                    Rejection reason
                  </span>
                  <input
                    name="reviewNotes"
                    required
                    minLength={8}
                    className="w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs"
                  />
                </label>
                <Button type="submit" variant="destructive" size="sm">
                  Reject and notify publisher
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4 border-t pt-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Month-end payout summaries</h2>
          <p className="text-sm text-muted-foreground">
            Payout fee split: 15% platform fee and 85% publisher net for all
            approved anonymous listings.
          </p>
        </div>

        <form
          className="flex flex-wrap items-end gap-2"
          action="/admin/publisher-submissions"
        >
          <label className="space-y-1 text-xs">
            <span className="font-medium uppercase">Payout month</span>
            <input
              type="month"
              name="payoutMonth"
              defaultValue={payoutMonth}
              className="rounded-none border border-input bg-transparent px-2.5 py-2 text-xs"
            />
          </label>
          <Button type="submit" variant="outline" size="sm">
            Load month
          </Button>
        </form>

        <div className="space-y-3">
          {payoutRows.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-sm text-muted-foreground">
                No pending payouts for {payoutMonth}.
              </CardContent>
            </Card>
          ) : null}

          {payoutRows.map((row) => (
            <Card key={row.submissionId}>
              <CardContent className="space-y-2 py-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Publisher:</span>{" "}
                  {row.pseudonym} ({row.contactEmail})
                </p>
                <p>
                  <span className="text-muted-foreground">Sales:</span>{" "}
                  {row.salesCount}
                </p>
                <p>
                  <span className="text-muted-foreground">Gross:</span>{" "}
                  {formatPrice(row.grossSaleInKobo, row.currency)}
                </p>
                <p>
                  <span className="text-muted-foreground">Platform fee:</span>{" "}
                  {formatPrice(row.platformFeeInKobo, row.currency)}
                </p>
                <p>
                  <span className="text-muted-foreground">Net payout:</span>{" "}
                  {formatPrice(row.publisherNetInKobo, row.currency)}
                </p>
                <p>
                  <span className="text-muted-foreground">Bank name:</span>{" "}
                  {row.bankName ?? "-"}
                </p>

                <form action={sendPayoutSummaryAction} className="pt-2">
                  <input type="hidden" name="payoutMonth" value={payoutMonth} />
                  <input type="hidden" name="pseudonym" value={row.pseudonym} />
                  <input
                    type="hidden"
                    name="contactEmail"
                    value={row.contactEmail}
                  />
                  <input
                    type="hidden"
                    name="grossSaleInKobo"
                    value={row.grossSaleInKobo}
                  />
                  <input
                    type="hidden"
                    name="platformFeeInKobo"
                    value={row.platformFeeInKobo}
                  />
                  <input
                    type="hidden"
                    name="publisherNetInKobo"
                    value={row.publisherNetInKobo}
                  />
                  <input
                    type="hidden"
                    name="salesCount"
                    value={row.salesCount}
                  />
                  <input type="hidden" name="currency" value={row.currency} />
                  <Button type="submit" size="sm" variant="outline">
                    Send payout summary email
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
