import { test, expect, devices } from "@playwright/test";

// test.use() must be top-level, not inside describe
test.use({ ...devices["iPhone SE"] });

test.describe("mobile responsiveness", () => {
  test("home page actions remain visible on small screens", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /cognitive learning platform/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /explore world map/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /continue progress/i })).toBeVisible();
  });

  test("settings page exposes the progress import/export tools", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: /ayarlar/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /copy progress code to clipboard/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /progress code/i })).toBeVisible();
  });
});
