import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Oxarchive protects readers, anonymous publishers, and literary works on our platform.",
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
          Last updated: August 7, 2026
        </p>
      </header>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Oxarchive is built to help publishers share literary work with
          privacy, control, and dignity. We collect only the data required to
          run the platform, process purchases, deliver digital products, and
          support publication management.
        </p>
        <p>
          We do not sell personal information, manuscript data, or publication
          metadata to third parties for advertising.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          What We Collect
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Account and contact details such as email address, username, and
            support communications.
          </li>
          <li>
            Transaction data such as order records, pricing history, and payment
            transfer confirmations.
          </li>
          <li>
            Publication data such as manuscript files, cover assets, publishing
            settings, catalog metadata, and moderation status.
          </li>
          <li>
            Operational security data such as access logs, abuse reports, and
            fraud prevention signals.
          </li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          Publisher Privacy and Pseudonymity
        </h2>
        <p>
          We support pseudonymous publishing. Unless required by law or needed
          to enforce our Terms, we do not publicly disclose legal identity,
          private contact details, or unpublished manuscript information.
        </p>
        <p>
          Internal access to publisher data is limited to authorized personnel
          with a legitimate operational, legal, or security need.
        </p>
        <p>
          If a publisher requests account closure, we remove or anonymize
          personal profile data where possible, while preserving records that
          must be retained for legal, payment, fraud, or dispute obligations.
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
          <li>
            To provide copyright services for works listed on Oxarchive,
            including claim processing and publication proofing support.
          </li>
          <li>To improve catalog quality and platform reliability.</li>
          <li>
            To prevent abuse, unauthorized distribution, plagiarism, and fraud.
          </li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          Literary Work Protection and Copyright Services
        </h2>
        <p>
          We treat manuscripts and publication materials as protected content.
          Files and metadata are stored with technical and administrative
          safeguards designed to reduce unauthorized access, modification, or
          disclosure.
        </p>
        <p>
          Copyright-related submissions, ownership declarations, infringement
          complaints, and resolution records may be retained to establish
          publication history, process disputes, and comply with applicable law.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">
          Data Sharing and Legal Disclosure
        </h2>
        <p>
          We share limited data only when required to operate essential services
          such as payment processing, email delivery, infrastructure security,
          or legal compliance. Service providers are expected to process data
          only for the contracted purpose.
        </p>
        <p>
          We may disclose information when required by lawful request, court
          order, or to protect the rights, safety, and intellectual property of
          publishers, readers, and Oxarchive.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">Data Retention</h2>
        <p>
          We retain transaction, account, publication, and copyright service
          records only for as long as needed for service operations, legal
          obligations, fraud prevention, and dispute resolution.
        </p>
        <p>
          Where practical, we apply deletion or anonymization workflows after
          retention periods expire.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-muted-foreground">
        <h2 className="font-display text-xl text-foreground">Your Rights</h2>
        <p>
          Subject to local law, you may request access, correction, deletion, or
          export of your personal data, and may object to specific processing.
        </p>
        <p>
          For privacy, copyright, or publication-data requests, contact the
          Oxarchive support team through your account or purchase email thread.
        </p>
      </section>
    </div>
  )
}
