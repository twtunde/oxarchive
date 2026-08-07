import { expect, test } from "@playwright/test"

test.describe("anonymous publisher flow", () => {
    test("submit draft and see success state", async ({ page }) => {
        await page.goto("/publish-anonymously")

        await expect(page.getByRole("heading", { name: "Publish anonymously" })).toBeVisible()
        await expect(
            page.getByRole("button", { name: "Submit anonymous draft" }),
        ).toBeVisible()
    })
})
