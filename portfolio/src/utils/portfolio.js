const MONTH_INDEX = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function normalizeUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function dedupeAndSort(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const unique = new Set();
  values.forEach((value) => {
    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized) {
        unique.add(normalized);
      }
    }
  });

  return [...unique].sort((a, b) => a.localeCompare(b));
}

function buildSkillMatrix(skillMatrix) {
  if (!skillMatrix || typeof skillMatrix !== "object") {
    return [];
  }

  return Object.keys(skillMatrix)
    .sort((a, b) => a.localeCompare(b))
    .map((category) => ({
      category,
      items: dedupeAndSort(skillMatrix[category]),
    }));
}

function formatDateRange(period) {
  if (!period || typeof period !== "object") {
    return "";
  }

  const start = period.start || "";
  const end = period.present ? "Present" : period.end || "";

  if (!start && !end) {
    return "";
  }
  if (!start) {
    return end;
  }
  if (!end) {
    return start;
  }

  return `${start} - ${end}`;
}

function parsePeriodStart(period) {
  if (!period || !period.start || typeof period.start !== "string") {
    return Number.NEGATIVE_INFINITY;
  }

  const parts = period.start.trim().split(/\s+/);
  if (parts.length !== 2) {
    return Number.NEGATIVE_INFINITY;
  }

  const monthName = parts[0].toLowerCase();
  const year = Number.parseInt(parts[1], 10);
  const month = MONTH_INDEX[monthName];

  if (Number.isNaN(year) || month === undefined) {
    return Number.NEGATIVE_INFINITY;
  }

  return new Date(year, month, 1).getTime();
}

function orderJourney(journey) {
  if (!Array.isArray(journey)) {
    return [];
  }

  return [...journey].sort((a, b) => {
    if (a?.period?.present && !b?.period?.present) {
      return -1;
    }
    if (!a?.period?.present && b?.period?.present) {
      return 1;
    }

    return parsePeriodStart(b?.period) - parsePeriodStart(a?.period);
  });
}

function buildProfileResponse(content) {
  const profile = content?.profile || {};
  const contact = content?.contact || {};
  const strengths = dedupeAndSort(content?.strengths || []);

  return {
    name: profile.name || "",
    role: profile.role || "",
    location: profile.location || "",
    summary: profile.summary || "",
    elevatorPitch: profile.elevatorPitch || "",
    experienceYears: profile.experienceYears || 0,
    strengths,
    links: {
      linkedin: normalizeUrl(contact.linkedin),
      email: contact.email || "",
      phone: contact.phone || "",
    },
  };
}

module.exports = {
  normalizeUrl,
  dedupeAndSort,
  buildSkillMatrix,
  formatDateRange,
  orderJourney,
  buildProfileResponse,
};
