export type PublisherSubmissionFormPayload = {
    pseudonym: string
    contactEmail: string
    title: string
    authorDisplayName: string
    description: string
    categoryId: string
    edition?: string
    format: "pdf" | "epub"
    suggestedPriceInMainUnit: number
    payoutMethod: "bank" | "paypal" | "payoneer"
    bankAccountName?: string
    bankAccountNumber?: string
    bankCodeSwift?: string
    paypalEmail?: string
    payoneerEmail?: string
    ebookFile: FileList
    coverImage?: FileList
}

export type SubmissionApiResult = {
    status: "success" | "error"
    submissionId?: string
    message?: string
    fieldErrors?: Record<string, string[]>
}

export async function submitPublisherSubmission(
    values: PublisherSubmissionFormPayload,
): Promise<SubmissionApiResult> {
    const payload = new FormData()
    payload.set("pseudonym", values.pseudonym)
    payload.set("contactEmail", values.contactEmail)
    payload.set("title", values.title)
    payload.set("authorDisplayName", values.authorDisplayName)
    payload.set("description", values.description)
    payload.set("categoryId", values.categoryId)
    payload.set("format", values.format)
    payload.set("suggestedPriceInMainUnit", `${values.suggestedPriceInMainUnit}`)
    payload.set("payoutMethod", values.payoutMethod)

    if (values.edition) {
        payload.set("edition", values.edition)
    }

    if (values.bankAccountName) {
        payload.set("bankAccountName", values.bankAccountName)
    }

    if (values.bankAccountNumber) {
        payload.set("bankAccountNumber", values.bankAccountNumber)
    }

    if (values.bankCodeSwift) {
        payload.set("bankCodeSwift", values.bankCodeSwift)
    }

    if (values.paypalEmail) {
        payload.set("paypalEmail", values.paypalEmail)
    }

    if (values.payoneerEmail) {
        payload.set("payoneerEmail", values.payoneerEmail)
    }

    const ebookFile = values.ebookFile?.item(0)
    if (ebookFile) {
        payload.set("ebookFile", ebookFile)
    }

    const coverImage = values.coverImage?.item(0)
    if (coverImage) {
        payload.set("coverImage", coverImage)
    }

    const response = await fetch("/api/publisher-submissions", {
        method: "POST",
        body: payload,
    })

    const result = (await response.json()) as SubmissionApiResult
    if (!response.ok || result.status === "error") {
        const serverMessage = result.message ?? "Submission failed."
        throw new Error(serverMessage)
    }

    return result
}