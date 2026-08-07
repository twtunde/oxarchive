"use client"

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { cn } from "@/lib/utils"

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  as?: "div" | "li" | "section" | "article"
  index?: number
  intervalMs?: number
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  as = "div",
  index = 0,
  intervalMs = 90,
  threshold = 0.2,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) {
          return
        }

        if (entry.isIntersecting) {
          setIsVisible(true)

          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [once, rootMargin, threshold])

  const style = useMemo<CSSProperties>(
    () => ({
      transitionDelay: `${Math.max(0, index) * Math.max(0, intervalMs)}ms`,
    }),
    [index, intervalMs]
  )

  const Component = as

  return (
    <Component
      ref={ref as never}
      style={style}
      className={cn(
        "transform-gpu transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none",
        isVisible
          ? "blur-0 translate-y-0 opacity-100"
          : "translate-y-5 opacity-0 blur-[2px]",
        className
      )}
    >
      {children}
    </Component>
  )
}
