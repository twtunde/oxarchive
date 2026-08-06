"use server"

import { count, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { categories, ebooks } from "@/db/schema"
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth"
import { invalidateCatalogCache } from "@/lib/redis"
import { slugify } from "@/lib/slugify"

const createCategorySchema = z.object({
    name: z.string().trim().min(2, "Name is required.").max(120),
    slug: z
        .string()
        .trim()
        .max(140)
        .optional()
        .transform((value) => (value ? value : undefined)),
    description: z
        .string()
        .trim()
        .optional()
        .transform((value) => (value ? value : undefined)),
})

export type CreateCategoryState = {
    status: "idle" | "success" | "error"
    message?: string
    fieldErrors?: Record<string, string[]>
}

const updateCategorySchema = z.object({
    id: z.uuid("Invalid category id."),
    name: z.string().trim().min(2, "Name is required.").max(120),
    slug: z
        .string()
        .trim()
        .max(140)
        .optional()
        .transform((value) => (value ? value : undefined)),
    description: z
        .string()
        .trim()
        .optional()
        .transform((value) => (value ? value : undefined)),
})

const deleteCategorySchema = z.object({
    id: z.uuid("Invalid category id."),
})

export type CategoryMutationState = {
    status: "idle" | "success" | "error"
    message?: string
    fieldErrors?: Record<string, string[]>
}

async function revalidateCategoryPaths() {
    revalidatePath("/catalog")
    revalidatePath("/admin/categories")
    revalidatePath("/admin/ebooks/new")
    await invalidateCatalogCache()
}

async function ensureAdminSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

    if (!verifyAdminSession(session)) {
        throw new Error("Unauthorized")
    }
}

export async function createCategoryAction(
    _prevState: CreateCategoryState,
    formData: FormData,
): Promise<CreateCategoryState> {
    await ensureAdminSession()

    const parsed = createCategorySchema.safeParse({
        name: formData.get("name"),
        slug: formData.get("slug"),
        description: formData.get("description"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: "Fix the highlighted fields.",
            fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
                string,
                string[]
            >,
        }
    }

    const payload = parsed.data
    const normalizedSlug = slugify(payload.slug ?? payload.name)

    if (!normalizedSlug) {
        return {
            status: "error",
            message: "Fix the highlighted fields.",
            fieldErrors: { name: ["Name must include letters or numbers."] },
        }
    }

    try {
        await db.insert(categories).values({
            name: payload.name,
            slug: normalizedSlug,
            description: payload.description ?? null,
        })

        await revalidateCategoryPaths()

        return {
            status: "success",
            message: "Category created successfully.",
        }
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "23505") {
            return {
                status: "error",
                message: "A category with that slug already exists.",
                fieldErrors: { slug: ["Use a different slug."] },
            }
        }

        throw error
    }
}

export async function updateCategoryAction(
    _prevState: CategoryMutationState,
    formData: FormData,
): Promise<CategoryMutationState> {
    await ensureAdminSession()

    const parsed = updateCategorySchema.safeParse({
        id: formData.get("id"),
        name: formData.get("name"),
        slug: formData.get("slug"),
        description: formData.get("description"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: "Fix the highlighted fields.",
            fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
        }
    }

    const payload = parsed.data
    const normalizedSlug = slugify(payload.slug ?? payload.name)

    if (!normalizedSlug) {
        return {
            status: "error",
            message: "Fix the highlighted fields.",
            fieldErrors: { name: ["Name must include letters or numbers."] },
        }
    }

    try {
        const updated = await db
            .update(categories)
            .set({
                name: payload.name,
                slug: normalizedSlug,
                description: payload.description ?? null,
            })
            .where(eq(categories.id, payload.id))
            .returning({ id: categories.id })

        if (updated.length === 0) {
            return {
                status: "error",
                message: "Category not found.",
            }
        }

        await revalidateCategoryPaths()

        return {
            status: "success",
            message: "Category updated.",
        }
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "23505") {
            return {
                status: "error",
                message: "A category with that slug already exists.",
                fieldErrors: { slug: ["Use a different slug."] },
            }
        }

        throw error
    }
}

export async function deleteCategoryAction(
    _prevState: CategoryMutationState,
    formData: FormData,
): Promise<CategoryMutationState> {
    await ensureAdminSession()

    const parsed = deleteCategorySchema.safeParse({
        id: formData.get("id"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: parsed.error.issues[0]?.message ?? "Invalid category.",
        }
    }

    const categoryId = parsed.data.id
    const [{ value: linkedCount }] = await db
        .select({ value: count() })
        .from(ebooks)
        .where(eq(ebooks.categoryId, categoryId))

    if (linkedCount > 0) {
        return {
            status: "error",
            message: `Cannot delete this category while ${linkedCount} ebook${linkedCount === 1 ? "" : "s"} still reference it.`,
        }
    }

    const deleted = await db
        .delete(categories)
        .where(eq(categories.id, categoryId))
        .returning({ id: categories.id })

    if (deleted.length === 0) {
        return {
            status: "error",
            message: "Category not found.",
        }
    }

    await revalidateCategoryPaths()

    return {
        status: "success",
        message: "Category deleted.",
    }
}
