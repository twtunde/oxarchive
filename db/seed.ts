import { neon } from "@neondatabase/serverless"
import { inArray } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"

import { categories, ebookFormatEnum, ebooks } from "@/db/schema"
import { slugify } from "@/lib/slugify"

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Run with --env-file=.env")
}

const client = neon(process.env.DATABASE_URL)
const db = drizzle({ client })

const CATEGORIES = [
    {
        name: "Software & Engineering",
        slug: "software-engineering",
        description: "Programming languages, architecture, and engineering practice.",
    },
    {
        name: "Data & AI",
        slug: "data-ai",
        description: "Machine learning, data science, and applied AI.",
    },
    {
        name: "Business & Finance",
        slug: "business-finance",
        description: "Strategy, operations, and financial analysis.",
    },
    {
        name: "Design & UX",
        slug: "design-ux",
        description: "Product design, interaction design, and research.",
    },
    {
        name: "Research & Academic",
        slug: "research-academic",
        description: "Peer-reviewed research and academic references.",
    },
    {
        name: "Industry Reports",
        slug: "industry-reports",
        description: "Market analysis and sector-specific reporting.",
    },
]

type EbookFormat = (typeof ebookFormatEnum.enumValues)[number]

type EbookSeed = {
    title: string
    author: string
    edition?: string
}

const EBOOKS_BY_CATEGORY: Record<string, EbookSeed[]> = {
    "software-engineering": [
        { title: "Systems Design at Scale", author: "Aisha Bello" },
        { title: "The Pragmatic Backend", author: "Tomiwa Adeyemi", edition: "2nd Edition" },
        { title: "Concurrency in Practice", author: "Daniel Okoro" },
        { title: "Clean Architecture Patterns", author: "Ngozi Umeh" },
        { title: "Distributed Systems Primer", author: "Chidi Obi" },
        { title: "Refactoring Legacy Code", author: "Wale Fashola" },
        { title: "Modern API Design", author: "Farida Yusuf", edition: "3rd Edition" },
        { title: "The Rust Programmer's Handbook", author: "Efe Igbinovia" },
        { title: "Kubernetes in Depth", author: "Chinedu Okafor" },
        { title: "Testing Strategies for Teams", author: "Amara Nwosu" },
        { title: "Event-Driven Architecture", author: "Bayo Aluko" },
        { title: "Compilers from First Principles", author: "Zainab Sule" },
    ],
    "data-ai": [
        { title: "Foundations of Machine Learning", author: "Dr. Kunle Adisa" },
        { title: "Applied Deep Learning", author: "Ifeoma Chukwu", edition: "2nd Edition" },
        { title: "The Data Engineer's Toolkit", author: "Segun Balogun" },
        { title: "Statistics for Practitioners", author: "Halima Bako" },
        { title: "Natural Language Processing in Practice", author: "Tunde Ogunleye" },
        { title: "Reinforcement Learning Explained", author: "Chiamaka Eze" },
        { title: "MLOps: Shipping Models Reliably", author: "Femi Owolabi" },
        { title: "Time Series Forecasting", author: "Blessing Etim" },
        { title: "Computer Vision Fundamentals", author: "Abiodun Kareem" },
        { title: "Feature Engineering Handbook", author: "Grace Nnamdi" },
        { title: "The Ethics of AI", author: "Musa Danladi" },
        { title: "Graph Neural Networks", author: "Ope Adebisi" },
    ],
    "business-finance": [
        { title: "Corporate Finance Essentials", author: "Adaeze Okonkwo" },
        { title: "The Lean Startup Playbook", author: "Yemi Sanya" },
        { title: "Valuation Made Simple", author: "Ibrahim Musa", edition: "4th Edition" },
        { title: "Strategic Operations Management", author: "Nneka Onyema" },
        { title: "Negotiation for Executives", author: "Kelechi Anya" },
        { title: "Financial Modelling in Practice", author: "Damilola Kuti" },
        { title: "The Economics of Platforms", author: "Rasheedat Bello" },
        { title: "Scaling African Markets", author: "Chukwuemeka Ike" },
        { title: "Risk Management Fundamentals", author: "Fatima Lawal" },
        { title: "Investment Analysis Handbook", author: "Obinna Chukwu" },
        { title: "Leadership Under Pressure", author: "Simisola Ajayi" },
        { title: "Mergers and Acquisitions Playbook", author: "Uche Nwankwo" },
    ],
    "design-ux": [
        { title: "The Interaction Design Field Guide", author: "Toyin Fagbenle" },
        { title: "Design Systems That Scale", author: "Kemi Durodola", edition: "2nd Edition" },
        { title: "Research Methods for Product Teams", author: "Amaka Obiora" },
        { title: "Accessible by Default", author: "Seyi Ojo" },
        { title: "Visual Hierarchy and Typography", author: "Nkechi Anyaoku" },
        { title: "Prototyping for Product Teams", author: "Dare Alabi" },
        { title: "The Psychology of Interfaces", author: "Bimbo Adisa" },
        { title: "Service Design in Practice", author: "Chidinma Okeke" },
        { title: "Motion Design Principles", author: "Lanre Ogundipe" },
        { title: "Inclusive Design Handbook", author: "Aduke Bamigboye" },
        { title: "Design Critique and Feedback", author: "Yusuf Garba" },
        { title: "From Wireframes to Prototypes", author: "Ronke Salako" },
    ],
    "research-academic": [
        { title: "Research Methods in Social Science", author: "Prof. Adebayo Falana" },
        { title: "Writing for Academic Journals", author: "Dr. Chinwe Obasi" },
        { title: "Quantitative Analysis for Researchers", author: "Dr. Suleiman Bako" },
        { title: "Ethics in Human Subject Research", author: "Prof. Amina Yusuf" },
        { title: "Literature Review Techniques", author: "Dr. Ekene Nwachukwu" },
        { title: "Survey Design and Sampling", author: "Dr. Folake Ajibade" },
        { title: "Case Study Research Methods", author: "Prof. Emeka Nduka" },
        { title: "Bibliometrics and Citation Analysis", author: "Dr. Zubaida Ahmed" },
        { title: "Grant Writing Essentials", author: "Dr. Olumide Fabiyi" },
        { title: "Mixed Methods Research", author: "Prof. Ngozi Eze" },
        { title: "Peer Review: A Practical Guide", author: "Dr. Tayo Adegoke" },
        { title: "Academic Publishing in the Digital Age", author: "Dr. Hauwa Ibrahim" },
    ],
    "industry-reports": [
        { title: "The State of African Fintech 2026", author: "Oxarchive Research Desk" },
        { title: "Renewable Energy Markets Outlook", author: "Oxarchive Research Desk" },
        { title: "E-commerce Logistics in West Africa", author: "Oxarchive Research Desk" },
        { title: "Telecom Infrastructure Trends", author: "Oxarchive Research Desk" },
        { title: "Consumer Spending Patterns Report", author: "Oxarchive Research Desk" },
        { title: "The Future of Remote Work", author: "Oxarchive Research Desk" },
        { title: "Agritech Investment Landscape", author: "Oxarchive Research Desk" },
        { title: "Digital Payments Adoption Report", author: "Oxarchive Research Desk" },
        { title: "Healthtech Market Analysis", author: "Oxarchive Research Desk" },
        { title: "Cybersecurity Threat Landscape", author: "Oxarchive Research Desk" },
        { title: "Real Estate Investment Trends", author: "Oxarchive Research Desk" },
        { title: "The Creator Economy Report", author: "Oxarchive Research Desk" },
    ],
}

const FORMATS: EbookFormat[] = ["pdf", "epub", "pdf_epub"]
const ONE_HOUR_MS = 60 * 60 * 1000
const CATEGORIES_ONLY_FLAG = "--categories-only"

function getSeedMode() {
    const categoriesOnly = process.argv.includes(CATEGORIES_ONLY_FLAG)
    return {
        categoriesOnly,
    }
}

async function seedCategories() {
    const insertedCategories = await db
        .insert(categories)
        .values(CATEGORIES)
        .onConflictDoNothing({ target: categories.slug })
        .returning({ slug: categories.slug })

    console.log(`Seeded ${insertedCategories.length} new categories (of ${CATEGORIES.length} total).`)
}

async function seedEbooks() {

    const allCategories = await db
        .select({ id: categories.id, slug: categories.slug })
        .from(categories)
        .where(
            inArray(
                categories.slug,
                CATEGORIES.map((category) => category.slug),
            ),
        )
    const categoryIdBySlug = new Map(allCategories.map((category) => [category.slug, category.id]))

    const totalBooks = Object.values(EBOOKS_BY_CATEGORY).reduce((sum, books) => sum + books.length, 0)

    const now = new Date()
    let globalIndex = 0
    const ebookRows = Object.entries(EBOOKS_BY_CATEGORY).flatMap(([categorySlug, books]) =>
        books.map((book) => {
            const index = globalIndex++
            const slug = slugify(book.title)

            return {
                categoryId: categoryIdBySlug.get(categorySlug) ?? null,
                title: book.title,
                slug,
                author: book.author,
                description: `A practitioner-focused guide to ${book.title.toLowerCase()}, published in the Oxarchive catalogue.`,
                coverImageUrl: `https://picsum.photos/seed/${slug}/400/600`,
                cloudinaryPublicId: `seed/${slug}`,
                format: FORMATS[index % FORMATS.length],
                edition: book.edition ?? null,
                priceInKobo: 1_200_000 + (index % 8) * 350_000,
                currency: "NGN",
                isPublished: index % 20 !== 19,
                createdAt: new Date(now.getTime() - (totalBooks - index) * ONE_HOUR_MS),
            }
        }),
    )

    const inserted = await db
        .insert(ebooks)
        .values(ebookRows)
        .onConflictDoNothing({ target: ebooks.slug })
        .returning({ slug: ebooks.slug })

    console.log(`Seeded ${inserted.length} new ebooks (of ${ebookRows.length} total).`)
}

async function seed() {
    const mode = getSeedMode()

    await seedCategories()

    if (mode.categoriesOnly) {
        console.log("Skipped ebook seeding (categories-only mode).")
        return
    }

    await seedEbooks()
}

seed().catch(async (error) => {
    console.error("Seed failed:", error)
    process.exitCode = 1
})
