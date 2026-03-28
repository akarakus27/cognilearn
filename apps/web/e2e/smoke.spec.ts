import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("home shows title and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Cognitive Learning Platform/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /World map/i })).toBeVisible();
  });

  test("world map loads world 1", async ({ page }) => {
    await page.goto("/world/1");
    await expect(page.getByRole("heading", { name: /First Steps/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Level 1/i })).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: /Settings/i })).toBeVisible();
  });
});
