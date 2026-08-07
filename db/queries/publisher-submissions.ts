import "server-only"

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"

import { db } from "@/db"
import { categories, publisherEarnings, publisherSubmissions } from "@/db/schema"

export async function listSubmissionQueueForAdmin() {
    return db.query.publisherSubmissions.findMany({
        where: inArray(publisherSubmissions.status, ["draft", "pending_review"]),
        orderBy: [asc(publisherSubmissions.status), desc(publisherSubmissions.createdAt)],
        with: {
            category: {
                columns: {
                    id: true,
                    name: true,
                },
            },
        },
    })
}

export async function getSubmissionById(submissionId: string) {
    return db.query.publisherSubmissions.findFirst({
        where: eq(publisherSubmissions.id, submissionId),
        with: {
            category: {
                columns: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            approvedEbook: {
                columns: {
                    id: true,
                    slug: true,
                    title: true,
                    priceInKobo: true,
                },
            },
        },
    })
}

export async function listMonthEndPayouts(payoutMonth: string) {
    return db
        .select({
            submissionId: publisherEarnings.submissionId,
            pseudonym: publisherSubmissions.pseudonym,
            contactEmail: publisherSubmissions.contactEmail,
            payoutMethod: publisherSubmissions.payoutMethod,
            bankName: publisherSubmissions.bankName,
            bankAccountName: publisherSubmissions.bankAccountName,
            bankAccountNumber: publisherSubmissions.bankAccountNumber,
            bankCodeSwift: publisherSubmissions.bankCodeSwift,
            paypalEmail: publisherSubmissions.paypalEmail,
            payoneerEmail: publisherSubmissions.payoneerEmail,
            grossSaleInKobo: sql<number>`sum(${publisherEarnings.grossSaleInKobo})`,
            platformFeeInKobo: sql<number>`sum(${publisherEarnings.platformFeeInKobo})`,
            publisherNetInKobo: sql<number>`sum(${publisherEarnings.publisherNetInKobo})`,
            salesCount: sql<number>`count(${publisherEarnings.id})`,
            currency: publisherEarnings.currency,
        })
        .from(publisherEarnings)
        .innerJoin(
            publisherSubmissions,
            eq(publisherSubmissions.id, publisherEarnings.submissionId),
        )
        .where(
            and(
                eq(publisherEarnings.payoutMonth, payoutMonth),
                eq(publisherEarnings.payoutStatus, "pending"),
            ),
        )
        .groupBy(
            publisherEarnings.submissionId,
            publisherSubmissions.pseudonym,
            publisherSubmissions.contactEmail,
            publisherSubmissions.payoutMethod,
            publisherSubmissions.bankName,
            publisherSubmissions.bankAccountName,
            publisherSubmissions.bankAccountNumber,
            publisherSubmissions.bankCodeSwift,
            publisherSubmissions.paypalEmail,
            publisherSubmissions.payoneerEmail,
            publisherEarnings.currency,
        )
}

export async function listPublisherSubmissionCategories() {
    return db.query.categories.findMany({
        orderBy: asc(categories.name),
        columns: {
            id: true,
            name: true,
        },
    })
}