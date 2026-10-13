import { test, expect } from "@playwright/test";

test("catalog recovers from one temporary server error", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/movies?**", async (route) => {
    calls++;
    if (calls === 1)
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"detail":"Temporary test outage"}',
      });
    else await route.continue();
  });
  await page.goto("/discover");
  await expect(
    page.getByRole("button", { name: "Explore Forrest Gump", exact: true }),
  ).toBeVisible();
  expect(calls).toBe(2);
});
test("profile preferences, export and dismissal persist", async ({ page }) => {
  await page.goto("/profile");
  await page.getByLabel("Display name").fill("Midnight Explorer");
  await page
    .getByLabel("A little about you")
    .fill("Science fiction and quiet dramas.");
  await page.getByRole("button", { name: "moon avatar", exact: true }).click();
  await page.getByRole("button", { name: "Sci-Fi", exact: true }).click();
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved");
  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue(
    "Midnight Explorer",
  );
  await expect(
    page.getByRole("button", { name: "moon avatar", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Sci-Fi", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export my data" }).click();
  expect((await download).suggestedFilename()).toBe("cineverse-my-data.json");
  await page.goto("/discover");
  await page
    .getByRole("button", { name: "Explore Forrest Gump", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Not for me", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("button", { name: "Allow recommendations again" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close movie" }).click();
  await page.getByRole("button", { name: "Not for me", exact: true }).click();
  await expect(page.locator(".movie")).toHaveCount(1);
  await page.getByLabel("Search your collection").fill("nonexistent");
  await expect(page.locator(".movie")).toHaveCount(0);
  await page.getByLabel("Search your collection").fill("Forrest");
  await expect(page.locator(".movie")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Explore Forrest Gump", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Allow recommendations again" })
    .click();
  await expect(
    page.getByRole("button", { name: "Not for me", exact: true }).last(),
  ).toBeVisible();
});
test("compact landing, guide and reduced motion on mobile", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Life’s too short for just okay movies.",
    }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollHeight)).toBeLessThan(
    1700,
  );
  await page
    .getByRole("link", { name: "How it works", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "What goes into a recommendation?" }),
  ).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByLabel("Display name")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
