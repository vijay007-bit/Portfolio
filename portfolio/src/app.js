const path = require("path");
const express = require("express");
const content = require("./content");
const { createDigitalTwinService } = require("./services/digitalTwin");
const {
  buildProfileResponse,
  orderJourney,
  buildSkillMatrix,
  normalizeUrl,
  formatDateRange,
} = require("./utils/portfolio");

function createApp(options = {}) {
  const app = express();
  const digitalTwinService =
    options.digitalTwinService || createDigitalTwinService({ profileContent: content });

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

  app.post("/api/chat", async (req, res) => {
    const message = req.body?.message;
    const history = req.body?.history;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    try {
      const result = await digitalTwinService.askCareerQuestion({ message, history });
      return res.json(result);
    } catch (error) {
      const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 502;
      return res.status(statusCode).json({
        error: error.message || "Digital Twin request failed.",
      });
    }
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  return app;
}

module.exports = { createApp };
