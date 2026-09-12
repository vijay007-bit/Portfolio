const {
  normalizeUrl,
  dedupeAndSort,
  buildSkillMatrix,
  formatDateRange,
  orderJourney,
  buildProfileResponse,
} = require("../../src/utils/portfolio");

describe("portfolio utils", () => {
  describe("normalizeUrl", () => {
    it("adds https when scheme is missing", () => {
      expect(normalizeUrl("example.com")).toBe("https://example.com");
    });

    it("preserves explicit scheme", () => {
      expect(normalizeUrl("https://example.com")).toBe("https://example.com");
      expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    });

    it("returns empty string for invalid values", () => {
      expect(normalizeUrl("")).toBe("");
      expect(normalizeUrl(null)).toBe("");
    });
  });

  describe("dedupeAndSort", () => {
    it("trims, deduplicates, and sorts strings", () => {
      expect(dedupeAndSort([" Swift ", "Alamofire", "Swift", "", 123])).toEqual([
        "Alamofire",
        "Swift",
      ]);
    });

    it("returns empty for non-array values", () => {
      expect(dedupeAndSort("swift")).toEqual([]);
    });
  });

  describe("buildSkillMatrix", () => {
    it("builds sorted categories with deduped items", () => {
      const matrix = buildSkillMatrix({
        languages: ["Swift", "Swift", "C"],
        platforms: ["iOS", "iPadOS"],
      });

      expect(matrix).toEqual([
        { category: "languages", items: ["C", "Swift"] },
        { category: "platforms", items: ["iOS", "iPadOS"] },
      ]);
    });

    it("returns empty array for invalid matrix", () => {
      expect(buildSkillMatrix(null)).toEqual([]);
    });
  });

  describe("formatDateRange", () => {
    it("formats current periods", () => {
      expect(formatDateRange({ start: "June 2022", present: true })).toBe("June 2022 - Present");
    });

    it("formats closed periods", () => {
      expect(formatDateRange({ start: "June 2021", end: "April 2022" })).toBe(
        "June 2021 - April 2022"
      );
    });

    it("returns fallback values where available", () => {
      expect(formatDateRange({ end: "April 2022" })).toBe("April 2022");
      expect(formatDateRange({})).toBe("");
      expect(formatDateRange(null)).toBe("");
    });
  });

  describe("orderJourney", () => {
    it("sorts present roles first, then by start date descending", () => {
      const ordered = orderJourney([
        { company: "C", period: { start: "January 2019", present: false } },
        { company: "A", period: { start: "June 2022", present: true } },
        { company: "B", period: { start: "June 2021", present: false } },
      ]);

      expect(ordered.map((entry) => entry.company)).toEqual(["A", "B", "C"]);
    });

    it("returns empty for invalid journey", () => {
      expect(orderJourney(null)).toEqual([]);
    });
  });

  describe("buildProfileResponse", () => {
    it("creates a frontend-friendly payload", () => {
      const payload = buildProfileResponse({
        profile: {
          name: "Vijay",
          role: "iOS Dev",
          location: "India",
          summary: "Summary",
          elevatorPitch: "Pitch",
          experienceYears: 6,
        },
        contact: {
          linkedin: "linkedin.com/in/vijay",
          email: "test@example.com",
          phone: "123",
        },
        strengths: ["Problem Solving", "Swift", "Swift"],
      });

      expect(payload).toEqual({
        name: "Vijay",
        role: "iOS Dev",
        location: "India",
        summary: "Summary",
        elevatorPitch: "Pitch",
        experienceYears: 6,
        strengths: ["Problem Solving", "Swift"],
        links: {
          linkedin: "https://linkedin.com/in/vijay",
          email: "test@example.com",
          phone: "123",
        },
      });
    });

    it("provides safe defaults", () => {
      expect(buildProfileResponse({})).toEqual({
        name: "",
        role: "",
        location: "",
        summary: "",
        elevatorPitch: "",
        experienceYears: 0,
        strengths: [],
        links: {
          linkedin: "",
          email: "",
          phone: "",
        },
      });
    });
  });
});
