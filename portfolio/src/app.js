const path = require("path");
const express = require("express");
const content = require("./content");
const {
  buildProfileResponse,
  orderJourney,
  buildSkillMatrix,
  normalizeUrl,
  formatDateRange,
} = require("./utils/portfolio");

function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "../public")));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/profile", (_req, res) => {
    res.json(buildProfileResponse(content));
  });

  app.get("/api/journey", (_req, res) => {
    const items = orderJourney(content.careerJourney).map((entry) => ({
      ...entry,
      displayPeriod: formatDateRange(entry.period),
    }));

    res.json({ items });
  });

  app.get("/api/skills", (_req, res) => {
    res.json({ categories: buildSkillMatrix(content.skillMatrix) });
  });

  app.get("/api/featured-work", (_req, res) => {
    const items = content.featuredWork.map((project) => ({
      ...project,
      link: normalizeUrl(project.link),
    }));

    res.json({ items });
  });

  app.get("/api/future-portfolio", (_req, res) => {
    res.json({ items: content.futurePortfolio });
  });

  app.get("/api/education", (_req, res) => {
    res.json(content.education);
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  return app;
}

module.exports = { createApp };
