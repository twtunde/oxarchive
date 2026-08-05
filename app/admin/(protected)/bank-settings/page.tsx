import Link from "next/link"
import type { Metadata } from "next"

import {
  createBankAccountAction,
  deleteBankAccountAction,
  toggleBankAccountActiveAction,
} from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { listBankAccountsForAdmin } from "@/db/queries/bank-settings"

export const metadata: Metadata = {
  title: "Bank settings",
  description: "Manage bank transfer accounts used at checkout.",
}

export default async function BankSettingsPage() {
  const accounts = await listBankAccountsForAdmin()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bank transfer settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Active accounts are shown on checkout pages for buyers making
          transfers.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/orders">Orders</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/ebooks/new">Upload ebook</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add bank account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createBankAccountAction}
            className="grid gap-3 sm:grid-cols-3"
          >
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank name</Label>
              <Input id="bankName" name="bankName" required maxLength={160} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                required
                maxLength={32}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                name="accountName"
                required
                maxLength={160}
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit">Save bank account</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bank accounts yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {accounts.map((account) => (
                <li key={account.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{account.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.accountNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {account.accountName}
                      </p>
                    </div>

                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                    <form action={toggleBankAccountActiveAction}>
                      <input type="hidden" name="id" value={account.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={String(account.isActive)}
                      />
                      <Button size="sm" variant="outline" type="submit">
                        {account.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </form>

                    <form action={deleteBankAccountAction}>
                      <input type="hidden" name="id" value={account.id} />
                      <Button size="sm" variant="destructive" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
