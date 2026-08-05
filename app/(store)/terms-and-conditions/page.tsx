import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Review the terms governing purchases and use of Oxarchive digital products.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
}

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Legal
        </p>
        <h1 className="font-display text-3xl sm:text-4xl">
          Terms and Conditions
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: August 5, 2026
        </p>
      </header>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          By accessing or purchasing from Oxarchive, you agree to these terms.
          If you do not agree, please do not use the service.
        </p>
        <p>
          All ebooks are sold as licensed digital content for personal or
          approved organizational use, subject to copyright and licensing
          restrictions.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          Purchases and Access
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Orders are fulfilled after transfer verification.</li>
          <li>Download access is provided via secure, time-limited links.</li>
          <li>You are responsible for safeguarding your download access.</li>
          <li>Unauthorized redistribution is prohibited.</li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          Service Availability
        </h2>
        <p>
          We may update, suspend, or discontinue features to improve security
          and reliability. We aim to minimize disruptions but do not guarantee
          uninterrupted availability.
        </p>
      </section>
    </div>
  )
}
