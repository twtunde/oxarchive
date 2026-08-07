import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  type PublisherSubmissionFormPayload,
  submitPublisherSubmission,
} from "@/lib/publisher-submission-client"

function createFileList(file: File): FileList {
  return {
    0: file,
    length: 1,
    item: (index: number) => (index === 0 ? file : null),
    [Symbol.iterator]: function* iterator() {
      yield file
    },
  } as unknown as FileList
}

function createPayload(): PublisherSubmissionFormPayload {
  const ebookFile = new File([new Uint8Array([1, 2, 3])], "draft.pdf", {
    type: "application/pdf",
  })

  return {
    pseudonym: "Night Scribe",
    contactEmail: "scribe@example.com",
    title: "Signals in Rust",
    authorDisplayName: "Night Scribe",
    description:
      "A deeply technical manuscript for backend engineers in distributed systems.",
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    edition: "1st",
    format: "pdf",
    suggestedPriceInMainUnit: 2500,
    payoutMethod: "bank",
    bankAccountName: "Night Scribe",
    bankAccountNumber: "0123456789",
    bankCodeSwift: "ABNGNGLA",
    ebookFile: createFileList(ebookFile),
  }
}

describe("publisher submission mutation", () => {
  it("resolves success payload from API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "success", submissionId: "sub_123" }),
      })
    )

    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: submitPublisherSubmission,
        }),
      { wrapper }
    )

    result.current.mutate(createPayload())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    vi.unstubAllGlobals()
  })

  it("throws on API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          status: "error",
          message: "Fix the highlighted fields.",
        }),
      })
    )

    await expect(submitPublisherSubmission(createPayload())).rejects.toThrow(
      "Fix the highlighted fields."
    )

    vi.unstubAllGlobals()
  })
})
