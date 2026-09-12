const request = require("supertest");
const { createApp } = require("../../src/app");

describe("portfolio app integration", () => {
  const app = createApp();

  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("serves profile payload", async () => {
    const response = await request(app).get("/api/profile");

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Vijay Vikram Singh");
    expect(response.body.role).toContain("iOS");
    expect(response.body.links.linkedin.startsWith("https://")).toBe(true);
  });

  it("returns ordered career journey", async () => {
    const response = await request(app).get("/api/journey");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items[0].period.present).toBe(true);
    expect(response.body.items[0].displayPeriod).toContain("Present");
  });

  it("returns a normalized skills matrix", async () => {
    const response = await request(app).get("/api/skills");

    expect(response.statusCode).toBe(200);
    expect(response.body.categories.length).toBeGreaterThan(0);
    expect(response.body.categories[0]).toHaveProperty("category");
    expect(response.body.categories[0]).toHaveProperty("items");
  });

  it("returns featured projects with links", async () => {
    const response = await request(app).get("/api/featured-work");

    expect(response.statusCode).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(2);
    response.body.items.forEach((item) => {
      expect(item.link.startsWith("https://")).toBe(true);
    });
  });

  it("returns future portfolio placeholders", async () => {
    const response = await request(app).get("/api/future-portfolio");

    expect(response.statusCode).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0]).toHaveProperty("status", "Planned");
  });

  it("serves the homepage", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Professional Portfolio");
    expect(response.text).toContain("Career Journey");
    expect(response.text).toContain("Future Portfolio Links");
  });

  it("returns 404 for unknown API routes", async () => {
    const response = await request(app).get("/api/missing");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: "API route not found" });
  });
});
