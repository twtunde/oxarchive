"use client"

import { Feather } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function PublishAnonymouslyFab() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) {
        return false
      }

      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "a") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      event.preventDefault()
      router.push("/publish-anonymously")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [router])

  if (pathname === "/publish-anonymously") {
    return null
  }

  return (
    <Link
      href="/publish-anonymously"
      aria-label="Publish anonymously"
      title="Publish anonymously"
      className="group/fab fixed right-4 bottom-44 z-2147483646 inline-flex size-14.5 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_14px_34px_rgba(0,0,0,0.45)] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none md:right-5 md:bottom-24"
    >
      <Feather
        className="size-5 transition-transform duration-300 ease-out group-hover/fab:scale-110 group-hover/fab:-rotate-6"
        aria-hidden
      />
      <kbd className="pointer-events-none absolute right-0 bottom-2 inline-flex size-4 items-center justify-center rounded-[3px] border border-border bg-linear-to-b from-card to-muted/60 font-mono text-[9px] leading-none text-foreground/85 shadow-[0_1px_0_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-transform duration-300 ease-out group-hover/fab:translate-x-0.5 group-hover/fab:translate-y-0.5">
        A
      </kbd>
      <span className="sr-only">Publish anonymously</span>
    </Link>
  )
}
