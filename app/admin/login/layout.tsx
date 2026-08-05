import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Admin login for order verification and catalog management.",
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
