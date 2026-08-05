import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Oxarchive collects, uses, and protects your personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Legal
        </p>
        <h1 className="font-display text-3xl sm:text-4xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: August 5, 2026
        </p>
      </header>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Oxarchive collects only the information required to process orders,
          deliver purchased digital products, and provide customer support.
        </p>
        <p>
          We may collect your name, email address, billing details, and order
          records. We do not sell your personal data to third parties.
        </p>
        <p>
          Payment transfer confirmations and related operational logs may be
          stored for fraud prevention, dispute handling, and compliance.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          How We Use Data
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>To verify and fulfill ebook purchases.</li>
          <li>To provide download access and order notifications.</li>
          <li>To respond to support requests and service issues.</li>
          <li>To improve catalog quality and platform reliability.</li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">Data Retention</h2>
        <p>
          We retain transaction and account-related records only for as long as
          needed for business operations, legal obligations, and dispute
          resolution.
        </p>
        <p>
          For privacy requests, contact the Oxarchive support team through your
          purchase email thread.
        </p>
      </section>
    </div>
  )
}
