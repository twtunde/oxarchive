import { Skeleton } from "@/components/ui/skeleton"

export function StorePageSkeleton() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border p-4">
            <Skeleton className="mb-4 aspect-2/3 w-full" />
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="mb-2 h-3 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EbookDetailSkeleton() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <div className="grid gap-8 sm:grid-cols-[240px_1fr]">
        <Skeleton className="aspect-2/3 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-5/6" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border p-3">
              <Skeleton className="mb-3 aspect-2/3 w-full" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminPageSkeleton() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border p-4">
            <Skeleton className="mb-3 h-5 w-44" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </main>
  )
}

export function FormPageSkeleton() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-6 py-10">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="space-y-4 rounded-xl border p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-full" />
      </div>
    </main>
  )
}

export function CartPageSkeleton() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3 rounded-xl border p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-md border p-3">
              <Skeleton className="mb-2 h-4 w-2/3" />
              <Skeleton className="mb-2 h-3 w-1/3" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-xl border p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}
