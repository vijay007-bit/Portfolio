async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return response.json();
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value || "";
  }
}

function renderStrengths(items) {
  const list = document.getElementById("strength-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function renderJourney(items) {
  const list = document.getElementById("journey-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  (items || []).forEach((entry) => {
    const card = document.createElement("article");
    card.className = "timeline-item";

    const title = document.createElement("h3");
    title.textContent = `${entry.title} | ${entry.company}`;

    const meta = document.createElement("p");
    meta.className = "timeline-meta";
    meta.textContent = `${entry.displayPeriod} | ${entry.location}`;

    card.appendChild(title);
    card.appendChild(meta);
    list.appendChild(card);
  });
}

function toLabel(value) {
  if (!value) {
    return "";
  }

  return value.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (char) => char.toUpperCase());
}

function renderSkills(categories) {
  const host = document.getElementById("skills-list");
  if (!host) {
    return;
  }

  host.innerHTML = "";
  (categories || []).forEach((category) => {
    const card = document.createElement("article");
    card.className = "skill-card";

    const title = document.createElement("h3");
    title.textContent = toLabel(category.category);
    card.appendChild(title);

    const list = document.createElement("ul");
    (category.items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    card.appendChild(list);
    host.appendChild(card);
  });
}

function renderWork(items) {
  const host = document.getElementById("work-list");
  if (!host) {
    return;
  }

  host.innerHTML = "";
  (items || []).forEach((entry) => {
    const card = document.createElement("article");
    card.className = "work-card";

    const title = document.createElement("h3");
    title.textContent = entry.name;

    const role = document.createElement("p");
    role.textContent = entry.role;

    const summary = document.createElement("p");
    summary.textContent = entry.summary;

    card.appendChild(title);
    card.appendChild(role);
    card.appendChild(summary);

    if (entry.link) {
      const anchor = document.createElement("a");
      anchor.href = entry.link;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.textContent = "Open project link";
      card.appendChild(anchor);
    }

    host.appendChild(card);
  });
}

function renderFuture(items) {
  const host = document.getElementById("future-list");
  if (!host) {
    return;
  }

  host.innerHTML = "";
  (items || []).forEach((entry) => {
    const card = document.createElement("article");
    card.className = "future-card";

    const title = document.createElement("h3");
    title.textContent = entry.title;

    const state = document.createElement("p");
    state.textContent = `Status: ${entry.status}`;

    const desc = document.createElement("p");
    desc.textContent = entry.description;

    card.appendChild(title);
    card.appendChild(state);
    card.appendChild(desc);
    host.appendChild(card);
  });
}

function wireContact(profile) {
  const linkedInCta = document.getElementById("linkedin-cta");
  const emailCta = document.getElementById("email-cta");

  if (linkedInCta) {
    linkedInCta.href = profile.links.linkedin;
  }
  if (emailCta) {
    emailCta.href = `mailto:${profile.links.email}`;
  }

  const emailLink = document.getElementById("contact-email");
  if (emailLink) {
    emailLink.href = `mailto:${profile.links.email}`;
    emailLink.textContent = profile.links.email;
  }

  setText("contact-phone", profile.links.phone);

  const linkedInLink = document.getElementById("contact-linkedin");
  if (linkedInLink) {
    linkedInLink.href = profile.links.linkedin;
    linkedInLink.textContent = profile.links.linkedin.replace(/^https?:\/\//, "");
  }
}

async function boot() {
  try {
    const [profile, journey, skills, work, future, education] = await Promise.all([
      getJson("/api/profile"),
      getJson("/api/journey"),
      getJson("/api/skills"),
      getJson("/api/featured-work"),
      getJson("/api/future-portfolio"),
      getJson("/api/education"),
    ]);

    setText("hero-name", profile.name);
    setText("hero-role", profile.role);
    setText("hero-summary", profile.summary);
    setText("about-pitch", profile.elevatorPitch);
    setText(
      "education-block",
      `${education.degree}\n${education.institution}\n${education.duration}`
    );
    setText("location-block", profile.location);

    renderStrengths(profile.strengths);
    renderJourney(journey.items);
    renderSkills(skills.categories);
    renderWork(work.items);
    renderFuture(future.items);
    wireContact(profile);
  } catch (error) {
    const heroSummary = document.getElementById("hero-summary");
    if (heroSummary) {
      heroSummary.textContent =
        "Portfolio content is temporarily unavailable. Please refresh to retry.";
    }
  }
}

boot();
