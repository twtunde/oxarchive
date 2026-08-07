"use client"

import { useEffect, useRef } from "react"

import Lottie, { type LottieRefCurrentProps } from "lottie-react"

import clickBurstAnimation from "@/components/lottie/click-burst.json"
import { cn } from "@/lib/utils"

type ClickLottieFeedbackProps = {
  playToken: number
  className?: string
}

export function ClickLottieFeedback({
  playToken,
  className,
}: ClickLottieFeedbackProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    if (playToken <= 0) {
      return
    }

    lottieRef.current?.goToAndStop(0, true)
    lottieRef.current?.play()
  }, [playToken])

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-1 z-20 grid place-items-center",
        className
      )}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={clickBurstAnimation}
        autoplay={false}
        loop={false}
        className="size-10"
      />
    </span>
  )
}
