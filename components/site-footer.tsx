import Link from "next/link"

const FOOTER_LINKS = [
  {
    heading: "Browse",
    links: [
      { href: "/catalog", label: "All books" },
      { href: "/catalog?sort=newest", label: "New arrivals" },
      { href: "/publish-anonymously", label: "Publish anonymously" },
      { href: "/cart", label: "Your bag" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms-and-conditions", label: "Terms and conditions" },
      { href: "/return-policy", label: "Return policy" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <p className="font-display text-lg">Oxarchive</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            A working archive of professional and research-grade ebooks —
            industry docs, references, and technical reading, with stronger
            protections for anonymous publishers and their literary works.
          </p>
        </div>

        <div className="flex gap-12">
          {FOOTER_LINKS.map((group) => (
            <div key={group.heading} className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.heading}
              </p>
              <ul className="space-y-1.5 text-sm">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-5xl text-xs text-muted-foreground">
        © 2026 Oxarchive.
      </p>
    </footer>
  )
}
