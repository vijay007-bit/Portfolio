async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return response.json();
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let details = "";
    try {
      const data = await response.json();
      details = data?.error || "";
    } catch (_error) {
      details = "";
    }

    throw new Error(details || `Request failed: ${url}`);
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

const twinState = {
  history: [],
  busy: false,
};

function getTwinTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function appendTwinMessage(role, text) {
  const log = document.getElementById("twin-log");
  if (!log) {
    return;
  }

  const isUser = role === "user";
  const wrapper = document.createElement("article");
  wrapper.className = `twin-row ${isUser ? "twin-row-user" : "twin-row-assistant"}`;

  const avatar = document.createElement("span");
  avatar.className = `twin-message-avatar ${
    isUser ? "twin-message-avatar-user" : "twin-message-avatar-assistant"
  }`;
  avatar.textContent = isUser ? "YOU" : "DV";

  const bubble = document.createElement("div");
  bubble.className = `twin-message ${isUser ? "twin-message-user" : "twin-message-assistant"}`;

  const message = document.createElement("p");
  message.textContent = text;
  bubble.appendChild(message);

  const time = document.createElement("span");
  time.className = "twin-time";
  time.textContent = getTwinTimeLabel();
  bubble.appendChild(time);

  if (isUser) {
    wrapper.appendChild(bubble);
    wrapper.appendChild(avatar);
  } else {
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
  }

  log.appendChild(wrapper);
  log.scrollTop = log.scrollHeight;
}

function setTwinTyping(isTyping) {
  const typing = document.getElementById("twin-typing");
  if (!typing) {
    return;
  }

  typing.classList.toggle("active", Boolean(isTyping));
}

function setTwinStatus(text, isError) {
  const status = document.getElementById("twin-status");
  if (!status) {
    return;
  }

  status.textContent = text;
  status.classList.toggle("error", Boolean(isError));
}

function setTwinBusy(isBusy) {
  twinState.busy = isBusy;
  const button = document.getElementById("twin-send");
  const input = document.getElementById("twin-input");

  if (button) {
    button.disabled = isBusy;
    button.textContent = isBusy ? "Thinking..." : "Send";
  }
  if (input) {
    input.disabled = isBusy;
  }

  setTwinTyping(isBusy);

  if (isBusy) {
    setTwinStatus("", false);
    return;
  }

  const status = document.getElementById("twin-status");
  if (status && !status.textContent.trim()) {
    setTwinStatus("Digital Twin is ready.", false);
  }
}

async function submitTwinQuestion(message) {
  const trimmed = message.trim();
  if (!trimmed || twinState.busy) {
    return;
  }

  appendTwinMessage("user", trimmed);
  twinState.history.push({ role: "user", content: trimmed });
  if (twinState.history.length > 8) {
    twinState.history = twinState.history.slice(-8);
  }

  setTwinBusy(true);

  try {
    const data = await postJson("/api/chat", {
      message: trimmed,
      history: twinState.history,
    });

    appendTwinMessage("assistant", data.reply);
    twinState.history.push({ role: "assistant", content: data.reply });
    if (twinState.history.length > 8) {
      twinState.history = twinState.history.slice(-8);
    }

    setTwinStatus("Digital Twin is ready.", false);
  } catch (error) {
    setTwinStatus(error.message || "Unable to reach Digital Twin right now.", true);
  } finally {
    setTwinBusy(false);
  }
}

function wireDigitalTwin(profile) {
  const form = document.getElementById("twin-form");
  const input = document.getElementById("twin-input");
  const prompts = document.getElementById("twin-prompts");

  if (!form || !input || !prompts) {
    return;
  }

  appendTwinMessage(
    "assistant",
    `Hi, I am ${profile.name}'s Digital Twin. Ask me anything about career journey, skills, and projects.`
  );
  setTwinTyping(false);
  setTwinStatus("Digital Twin is ready.", false);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value;
    input.value = "";
    await submitTwinQuestion(message);
    input.focus();
  });

  input.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    const message = input.value;
    input.value = "";
    await submitTwinQuestion(message);
    input.focus();
  });

  prompts.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const prompt = target.dataset?.prompt;
    if (!prompt) {
      return;
    }

    if (input) {
      input.value = prompt;
    }

    await submitTwinQuestion(prompt);
  });
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
    wireDigitalTwin(profile);
  } catch (error) {
    const heroSummary = document.getElementById("hero-summary");
    if (heroSummary) {
      heroSummary.textContent =
        "Portfolio content is temporarily unavailable. Please refresh to retry.";
    }
  }
}

boot();
