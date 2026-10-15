"use strict";

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const navigationLinks = document.querySelectorAll('.primary-nav a[href^="#"]');
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

// Read and write localStorage safely; it can throw when storage is blocked.
function readSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The site still works; the preference just won't be remembered.
  }
}

// Use a saved preference when available; otherwise respect the device setting.
const savedTheme = readSetting("portfolio-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
  );
  document.querySelector('meta[name="theme-color"]').content =
    theme === "dark" ? "#0e1219" : "#f4f2ec";
}

applyTheme(savedTheme || preferredTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  saveSetting("portfolio-theme", nextTheme);
});

// Change the opening greeting based on the visitor's local time.
const currentHour = new Date().getHours();
const greeting =
  currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
document.querySelector("#greeting").textContent = greeting;
document.querySelector("#current-year").textContent = new Date().getFullYear();

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(willOpen));
  menuToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
  navigation.classList.toggle("open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

navigationLinks.forEach((link) => link.addEventListener("click", closeMenu));

// Highlight the navigation item for the section currently in view.
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55%", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

function setError(field, message) {
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  field.parentElement.querySelector(".error-message").textContent = message;
}

function validateForm() {
  const name = form.elements.name;
  const email = form.elements.email;
  const message = form.elements.message;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  setError(name, name.value.trim().length < 2 ? "Please enter at least 2 characters." : "");
  setError(email, !emailPattern.test(email.value.trim()) ? "Please enter a valid email." : "");
  setError(message, message.value.trim().length < 10 ? "Please enter at least 10 characters." : "");

  return !form.querySelector(".invalid");
}

// ---------------------------------------------------------------------------
// Contact form: draft autosave, character counter, and submit feedback.
// ---------------------------------------------------------------------------
const DRAFT_KEY = "portfolio-contact-draft";
const submitButton = form.querySelector(".submit-button");
const submitLabel = submitButton.querySelector(".button-label");
const clearDraftButton = document.querySelector("#clear-draft");
const messageField = form.elements.message;
const messageCount = document.querySelector("#message-count");
let draftTimer;

function showFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status is-${type}`;
  // Restart the slide-in animation for every new message.
  formStatus.style.animation = "none";
  void formStatus.offsetWidth;
  formStatus.style.animation = "";
}

function updateMessageCount() {
  const length = messageField.value.length;
  messageCount.textContent = `${length} / ${messageField.maxLength}`;
  messageCount.classList.toggle("near-limit", length >= messageField.maxLength - 50);
}

function saveDraft() {
  const draft = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    message: messageField.value,
  };
  const hasContent = Object.values(draft).some((value) => value.trim());

  try {
    if (hasContent) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // If storage is blocked the form still works; the draft just isn't kept.
  }
  clearDraftButton.hidden = !hasContent;
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
  clearDraftButton.hidden = true;
}

function restoreDraft() {
  let draft = null;
  try {
    draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
  } catch {
    return;
  }
  if (!draft) return;

  ["name", "email", "message"].forEach((key) => {
    if (typeof draft[key] === "string") form.elements[key].value = draft[key];
  });
  clearDraftButton.hidden = false;
  showFormStatus("Welcome back! Your unsent draft was restored.", "info");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showFormStatus("Please fix the highlighted fields, then try again.", "error");
    form.querySelector(".invalid").focus();
    return;
  }

  // Simulate a short network request so the visitor sees progress feedback.
  submitButton.disabled = true;
  submitLabel.textContent = "Sending…";
  showFormStatus("Sending your message…", "info");

  setTimeout(() => {
    const firstName = form.elements.name.value.trim().split(/\s+/)[0];
    showFormStatus(`Thanks, ${firstName}! Your message passed validation (demo only — nothing was sent).`, "success");
    form.reset();
    clearDraft();
    updateMessageCount();
    submitButton.disabled = false;
    submitLabel.textContent = "Send message";
  }, 900);
});

form.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    if (field.classList.contains("invalid")) validateForm();
    if (field === messageField) updateMessageCount();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 300);
  });
});

clearDraftButton.addEventListener("click", () => {
  form.reset();
  form.querySelectorAll(".invalid").forEach((field) => setError(field, ""));
  clearDraft();
  updateMessageCount();
  showFormStatus("Draft cleared.", "info");
  form.elements.name.focus();
});

restoreDraft();
updateMessageCount();

// ---------------------------------------------------------------------------
// Project explorer: category filter, live search, and sorting.
// ---------------------------------------------------------------------------
const projectGrid = document.querySelector("#project-grid");
const projectCards = Array.from(projectGrid.querySelectorAll(".project-card"));
const filterChips = document.querySelectorAll(".filter-chip");
const projectSearch = document.querySelector("#project-search");
const projectSort = document.querySelector("#project-sort");
const projectCount = document.querySelector("#project-count");
const projectEmpty = document.querySelector("#project-empty");

const projectState = { filter: "all", query: "", sort: "featured" };

// Remember the original HTML order so "Featured" can restore it.
projectCards.forEach((card, index) => {
  card.dataset.order = index;
  card.dataset.search = card.querySelector(".project-content").textContent.toLowerCase();
});

function sortProjects(cards) {
  const byTitle = (a, b) => a.dataset.title.localeCompare(b.dataset.title);
  if (projectState.sort === "az") return cards.sort(byTitle);
  if (projectState.sort === "za") return cards.sort((a, b) => byTitle(b, a));
  return cards.sort((a, b) => a.dataset.order - b.dataset.order);
}

function renderProjects() {
  const query = projectState.query.trim().toLowerCase();
  let visibleCount = 0;

  sortProjects(projectCards.slice()).forEach((card) => {
    const categories = card.dataset.category.split(" ");
    const matchesFilter = projectState.filter === "all" || categories.includes(projectState.filter);
    const matchesQuery = !query || card.dataset.search.includes(query);
    const isVisible = matchesFilter && matchesQuery;

    // Re-appending moves the card into its sorted position.
    projectGrid.append(card);
    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
      // Restart the fade-in animation each time the list changes.
      card.classList.remove("is-entering");
      void card.offsetWidth;
      card.classList.add("is-entering");
    }
  });

  projectEmpty.hidden = visibleCount > 0;
  projectCount.textContent =
    visibleCount === projectCards.length
      ? `Showing all ${visibleCount} projects`
      : `Showing ${visibleCount} of ${projectCards.length} projects`;
}

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    projectState.filter = chip.dataset.filter;
    filterChips.forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
    renderProjects();
  });
});

projectSearch.addEventListener("input", () => {
  projectState.query = projectSearch.value;
  renderProjects();
});

projectSort.addEventListener("change", () => {
  projectState.sort = projectSort.value;
  renderProjects();
});

document.querySelector("#clear-filters").addEventListener("click", () => {
  projectState.filter = "all";
  projectState.query = "";
  projectSearch.value = "";
  filterChips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.filter === "all")));
  renderProjects();
  projectSearch.focus();
});

projectGrid.addEventListener("animationend", (event) => {
  event.target.classList.remove("is-entering");
});

renderProjects();

// ---------------------------------------------------------------------------
// GitHub repositories loaded from the public GitHub REST API.
// ---------------------------------------------------------------------------
const GITHUB_USER = "Noldep";
const REPO_CACHE_KEY = "github-repos";
const REPO_CACHE_MINUTES = 10;
const repoList = document.querySelector("#repo-list");
const repoStatus = document.querySelector("#repo-status");

function readRepoCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(REPO_CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < REPO_CACHE_MINUTES * 60 * 1000) return cached.repos;
  } catch {
    // Storage can be unavailable (e.g. private browsing); just fetch again.
  }
  return null;
}

function saveRepoCache(repos) {
  try {
    sessionStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    // Caching is optional, so ignore storage errors.
  }
}

function formatUpdated(dateString) {
  const days = Math.round((new Date(dateString) - Date.now()) / 86400000);
  if (days > -1) return "Updated today";
  if (days > -30) return `Updated ${new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(days, "day")}`;
  return `Updated ${new Date(dateString).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`;
}

function showRepoLoading() {
  repoList.setAttribute("aria-busy", "true");
  repoStatus.className = "repo-status";
  repoStatus.textContent = "Loading repositories from GitHub…";
  repoList.innerHTML = '<li class="repo-card repo-skeleton" aria-hidden="true"><i></i><i></i><i></i></li>'.repeat(3);
}

function showRepoMessage(message, type, withRetry) {
  repoList.removeAttribute("aria-busy");
  repoList.innerHTML = "";
  repoStatus.className = `repo-status is-${type}`;
  repoStatus.textContent = message;

  if (withRetry) {
    const retryButton = document.createElement("button");
    retryButton.className = "button button-ghost retry-button";
    retryButton.type = "button";
    retryButton.textContent = "Try again";
    retryButton.addEventListener("click", () => loadRepos({ skipCache: true }));
    repoStatus.append(retryButton);
  }
}

function createRepoCard(repo) {
  const item = document.createElement("li");
  item.className = "repo-card";

  // textContent (not innerHTML) keeps API data from being treated as HTML.
  const title = document.createElement("a");
  title.className = "repo-name";
  title.href = repo.url;
  title.target = "_blank";
  title.rel = "noopener noreferrer";
  title.textContent = repo.name;

  const description = document.createElement("p");
  description.textContent = repo.description || "No description yet.";

  const meta = document.createElement("div");
  meta.className = "repo-meta";
  meta.innerHTML = `<span class="repo-language"></span><span>★ ${repo.stars}</span><span>${formatUpdated(repo.updated)}</span>`;
  meta.querySelector(".repo-language").textContent = repo.language || "Docs";

  item.append(title, description, meta);
  return item;
}

function renderRepos(repos) {
  repoList.removeAttribute("aria-busy");
  repoList.innerHTML = "";

  if (repos.length === 0) {
    showRepoMessage("No public repositories yet. New projects will appear here once they are published.", "empty");
    return;
  }

  repoStatus.className = "repo-status";
  repoStatus.textContent = `Showing ${repos.length} recently updated ${repos.length === 1 ? "repository" : "repositories"}.`;
  repos.forEach((repo) => repoList.append(createRepoCard(repo)));
}

async function loadRepos({ skipCache = false } = {}) {
  const cached = skipCache ? null : readRepoCache();
  if (cached) {
    renderRepos(cached);
    return;
  }

  showRepoLoading();

  // Give up after 8 seconds so the visitor is never stuck on "Loading…".
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`,
      { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal }
    );

    if (response.status === 403 || response.status === 429) throw new Error("rate-limit");
    if (!response.ok) throw new Error("bad-response");

    const repos = (await response.json())
      .filter((repo) => !repo.fork)
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        updated: repo.pushed_at || repo.updated_at,
      }));

    saveRepoCache(repos);
    renderRepos(repos);
  } catch (error) {
    let message = "Sorry, GitHub projects could not be loaded right now. Please try again.";
    if (!navigator.onLine) message = "You appear to be offline. Check your internet connection and try again.";
    else if (error.name === "AbortError") message = "GitHub is taking too long to respond. Please try again.";
    else if (error.message === "rate-limit") message = "GitHub's hourly request limit was reached. Please wait a few minutes and try again.";
    showRepoMessage(message, "error", true);
  } finally {
    clearTimeout(timeout);
  }
}

// Only call the API when the section is about to scroll into view.
if ("IntersectionObserver" in window) {
  const repoObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      repoObserver.disconnect();
      loadRepos();
    },
    { rootMargin: "400px 0px" }
  );
  repoObserver.observe(document.querySelector("#github"));
} else {
  loadRepos();
}

// ---------------------------------------------------------------------------
// Scroll animations and back-to-top button.
// ---------------------------------------------------------------------------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  // The class is only added when JS runs, so content stays visible without JS.
  root.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
}

const backToTop = document.querySelector(".back-to-top");
const heroSection = document.querySelector(".hero");

if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    backToTop.classList.toggle("visible", !entry.isIntersecting);
  }).observe(heroSection);
}

// ---------------------------------------------------------------------------
// "Connect with me on LinkedIn" in the contact section scrolls back up to the
// profile card (the page's only LinkedIn link) and makes it glow briefly.
// ---------------------------------------------------------------------------
const profileCard = document.querySelector("#profile-card");

document.querySelector(".profile-jump").addEventListener("click", (event) => {
  event.preventDefault();
  profileCard.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  profileCard.focus({ preventScroll: true });

  // Start the glow only once the card is fully on screen, so the visitor sees it.
  const glowObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      glowObserver.disconnect();
      profileCard.classList.remove("is-highlighted");
      void profileCard.offsetWidth;
      profileCard.classList.add("is-highlighted");
    },
    { threshold: 1 }
  );
  glowObserver.observe(profileCard);
});

profileCard.addEventListener("animationend", (event) => {
  if (event.animationName === "profile-glow") profileCard.classList.remove("is-highlighted");
});

// ---------------------------------------------------------------------------
// Runaway profile card: the first click makes the card jump to an empty spot
// in the hero; clicking it again (once caught) opens LinkedIn.
// ---------------------------------------------------------------------------
const profileHint = profileCard.querySelector(".profile-hint");
const profileStatus = document.querySelector("#profile-status");
const HERO_OBSTACLES =
  ".site-header, .eyebrow, #hero-title, .hero-intro, .hero-actions, .hero-card, .hero-footnote, .back-to-top.visible";
const RUNAWAY_MESSAGES = [
  "How many times are you going to try that?",
  "Pardon me.",
  "Sitting in one place all the time is killing me.",
  "Just checking have you viewed my whole page?",
  "Innovative?",
  "Not innovative?",
  "Refreshing the page too many times is bad for my health",
];
let profileOffset = { x: 0, y: 0 };
let lastMessage = "";

// Pick a random message, never the same one twice in a row.
function pickRunawayMessage() {
  const choices = RUNAWAY_MESSAGES.filter((message) => message !== lastMessage);
  lastMessage = choices[Math.floor(Math.random() * choices.length)];
  return lastMessage;
}

function overlapArea(a, b) {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return width > 0 && height > 0 ? width * height : 0;
}

// Try random spots inside the visible part of the hero and keep the one that
// covers the least content (ideally none) and is far from where the card is.
function findEmptySpot() {
  const card = profileCard.getBoundingClientRect();
  const hero = heroSection.getBoundingClientRect();
  const gap = 16;
  const header = document.querySelector(".site-header").getBoundingClientRect();
  // Keep room above and beside the photo for the message bubble.
  const hintSpace = profileHint.offsetHeight + 14;
  const hintSide = Math.max((profileHint.offsetWidth - card.width) / 2, 0);
  const area = {
    left: Math.max(hero.left, 0) + gap + hintSide,
    top: Math.max(hero.top, header.bottom, 0) + gap + hintSpace,
    right: Math.min(hero.right, window.innerWidth) - gap - card.width - hintSide,
    bottom: Math.min(hero.bottom, window.innerHeight) - gap - card.height,
  };
  const obstacles = Array.from(document.querySelectorAll(HERO_OBSTACLES), (element) => element.getBoundingClientRect());
  let best = null;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const left = area.left + Math.random() * Math.max(area.right - area.left, 0);
    const top = area.top + Math.random() * Math.max(area.bottom - area.top, 0);
    const spot = { left: left - gap, top: top - gap, right: left + card.width + gap, bottom: top + card.height + gap };
    const distance = Math.hypot(left - card.left, top - card.top);
    const covered = obstacles.reduce((total, rect) => total + overlapArea(spot, rect), 0);
    const score = covered + (distance < 160 ? 1e6 : 0);

    if (!best || score < best.score) best = { left, top, score };
    if (score === 0) break;
  }
  return best;
}

function moveProfileCard(x, y) {
  profileOffset = { x, y };
  profileCard.style.translate = x || y ? `${x}px ${y}px` : "";
}

function runAway() {
  // Shrink to the photo first, so the empty-spot search uses the small size.
  // Set the message first too, so the search can leave room for the bubble.
  profileCard.classList.add("is-escaped");
  profileHint.textContent = pickRunawayMessage();
  const card = profileCard.getBoundingClientRect();
  const spot = findEmptySpot();
  moveProfileCard(profileOffset.x + spot.left - card.left, profileOffset.y + spot.top - card.top);

  profileStatus.textContent = "The profile card moved. Activate it again to open LinkedIn.";
}

function returnHome() {
  profileCard.classList.remove("is-escaped");
  profileStatus.textContent = "";
  moveProfileCard(0, 0);
}

profileCard.addEventListener("click", (event) => {
  // Let Ctrl/Cmd/Shift-clicks through so "open in new tab" still works.
  if (event.ctrlKey || event.metaKey || event.shiftKey) return;

  if (!profileCard.classList.contains("is-escaped")) {
    event.preventDefault();
    runAway();
    return;
  }

  // Caught! The link opens normally; the card goes back to its place.
  profileHint.textContent = "You got me!";
  setTimeout(returnHome, 700);
});

// If the layout changes while the card is away, send it home to stay tidy.
window.addEventListener("resize", () => {
  if (profileCard.classList.contains("is-escaped")) returnHome();
});
