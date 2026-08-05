import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Return Policy",
  description:
    "Read Oxarchive return and refund policy for digital ebook purchases.",
  alternates: {
    canonical: "/return-policy",
  },
}

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Legal
        </p>
        <h1 className="font-display text-3xl sm:text-4xl">Return Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: August 5, 2026
        </p>
      </header>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Because Oxarchive sells digital goods, returns are generally not
          available once access has been granted or a download link has been
          used.
        </p>
        <p>
          We review refund requests on a case-by-case basis for duplicate
          payments, failed delivery due to platform issues, or proven file
          defects.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          Refund Request Window
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Submit requests within 7 days of purchase.</li>
          <li>Include your order token and purchase email.</li>
          <li>Describe the issue and any attempted troubleshooting.</li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">Resolution</h2>
        <p>
          If approved, refunds are processed to the original payment source when
          possible. Processing time depends on your financial provider.
        </p>
      </section>
    </div>
  )
}
