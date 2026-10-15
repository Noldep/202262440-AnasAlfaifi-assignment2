# Technical Documentation

## 1. Overview

This is a static, single-page portfolio website. It uses only standard browser technologies (HTML5, CSS3, and vanilla JavaScript ES2020). There is no framework, build tool, package installation, or backend server. Assignment 2 extends the Assignment 1 site with dynamic content, API data, browser storage, animations, and user feedback.

## 2. Architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic page structure, content, and `data-*` attributes used by the JavaScript |
| `css/styles.css` | Design tokens (CSS custom properties), layouts, components, dark theme, animations, responsive rules |
| `js/script.js` | All behavior, split into commented sections (listed below) |
| `docs/` | This document and the AI usage report |

`script.js` is loaded with `defer`, so it runs after the HTML is parsed without blocking rendering. Its sections are:

1. Theme toggle and safe storage helpers
2. Time-based greeting and footer year
3. Mobile navigation and active-section highlighting
4. Contact form validation, draft autosave, and submit feedback
5. Project explorer (filter, search, sort)
6. GitHub repositories (Fetch API)
7. Scroll animations and back-to-top button

## 3. Dynamic Content: Project Explorer

**HTML.** Each project `<article>` has two attributes:

```html
<article class="project-card" data-category="web-app javascript" data-title="Interactive Portfolio">
```

`data-category` holds one or more space-separated categories. The filter chips are `<button>` elements with `data-filter` and `aria-pressed`, so screen readers announce which filter is active.

**State.** A single object holds the current view:

```js
const projectState = { filter: "all", query: "", sort: "featured" };
```

Every control (chip click, search `input` event, sort `change` event) updates this object and calls `renderProjects()`. All rendering logic lives in one place, so the controls can never disagree with each other.

**Rendering.** `renderProjects()`:

1. Copies the card array and sorts it (`featured` restores the original HTML order saved in `data-order`; `az`/`za` use `localeCompare`).
2. For each card, checks the category filter and the search text (matched against the card's lowercase text, which is cached once in `data-search`).
3. Re-appends each card to the grid, which moves existing nodes into sorted order without rebuilding the HTML, and sets `card.hidden`.
4. Restarts a CSS fade-in on visible cards (`is-entering`, removed again on `animationend`).
5. Updates the live results count (`aria-live="polite"`) and shows the **No projects found** empty state when nothing matches. The **Clear filters** button resets the state and returns focus to the search box.

## 4. Data Handling

### 4.1 GitHub REST API

The *Live from GitHub* section calls:

```
GET https://api.github.com/users/Noldep/repos?sort=updated&per_page=12
```

This is a public endpoint that needs no API key. The response is trimmed to the fields the UI needs (name, description, URL, language, stars, last push date), forks are removed, and the 6 most recently updated repositories are shown.

| Concern | Implementation |
| --- | --- |
| Loading state | Three shimmering skeleton cards plus "Loading repositories from GitHub…"; the list has `aria-busy="true"` |
| Timeout | An `AbortController` cancels the request after 8 seconds |
| Errors | Specific friendly messages for offline (`navigator.onLine`), timeout (`AbortError`), rate limit (HTTP 403/429), and any other failure, each with a **Try again** button |
| Empty result | "No public repositories yet…" message |
| Performance | Fetching is deferred until the section is within 400px of the viewport (`IntersectionObserver`), and results are cached in `sessionStorage` for 10 minutes to save requests (the unauthenticated limit is 60/hour) |
| Security | API text is inserted with `textContent`, never `innerHTML`, so repository descriptions cannot inject HTML |
| Dates | `Intl.RelativeTimeFormat` displays "Updated 3 days ago"; older dates use `toLocaleDateString` |

### 4.2 localStorage

| Key | Stored value | Purpose |
| --- | --- | --- |
| `portfolio-theme` | `"light"` or `"dark"` | Remembers the theme choice |
| `portfolio-contact-draft` | JSON `{ name, email, message }` | Restores an unsent contact form draft |

The draft is saved 300ms after the visitor stops typing (debounced with `setTimeout`/`clearTimeout`), removed when the form is empty, submitted successfully, or cleared with **Clear draft**. All storage calls are wrapped in `try/catch`, because browsers can throw when storage is disabled. In that case the site keeps working without saving.

### 4.3 Form Validation

`validateForm()` checks name (≥ 2 characters), email (simple pattern), and message (≥ 10 characters). Each invalid field gets the `invalid` class, `aria-invalid="true"`, and an inline message. Focus moves to the first invalid field, and a summary appears in the `role="status"` region. Errors re-validate live as the user corrects them. The message has `maxlength="500"` and a live counter that turns orange near the limit. On valid input, the button shows **Sending…** and is disabled for a simulated 900ms request. Then a personalized confirmation appears ("Thanks, Sara!…").

## 5. Animations and Transitions

| Effect | Technique |
| --- | --- |
| Hero entrance | CSS `@keyframes hero-in` on page load (card delayed 150ms) |
| Scroll reveal | `IntersectionObserver` adds `.is-visible` to elements with `data-reveal`; CSS transitions `opacity` and `translate` |
| Filter fade-in | `@keyframes card-in` on project cards and repo cards |
| Loading shimmer | Animated `background-position` gradient on skeleton cards |
| Form / API messages | `@keyframes status-in` slide-in, restarted for each new message |
| Hover | Lift and shadow on cards, buttons, chips, and links |
| Profile card glow | The contact section's **Connect with me on LinkedIn** button scrolls to the profile card; an `IntersectionObserver` (`threshold: 1`) starts the `profile-glow` animation only once the card is fully visible |

Design decisions:

- Only `opacity` and `transform`/`translate` are animated, because the browser can animate these without recalculating layout.
- The independent `translate` property is used so that reveal effects do not overwrite the hero card's `transform: rotate(2deg)`.
- `.reveal-ready` is added to `<html>` by JavaScript. If JavaScript fails, content is never left invisible.
- With `prefers-reduced-motion: reduce`, the reveal is skipped in JS, and CSS reduces all animation and transition durations to near zero.

## 6. Runaway Profile Card

The profile card at the top is the page's only LinkedIn link, and it reacts with a small game.

1. **First click:** `preventDefault()` stops the link. The card gets the `is-escaped` class, which shrinks it to just the round photo, and `findEmptySpot()` picks a new position.
2. **Finding empty space:** the function tries up to 60 random positions inside the visible part of the hero (below the header, leaving room for the hint bubble). For each one it adds up how much it would overlap the header, greeting, heading, intro, buttons, code card, and back-to-top button, and adds a penalty for spots closer than 160px to the current position, so the photo really "runs". The spot with the lowest score wins (the first spot with zero overlap ends the search early).
3. **Moving:** the card moves with the CSS `translate` property, animated with a bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` easing. `translate` is used instead of `transform` so it doesn't conflict with the hover lift. A speech bubble shows a random message from the `RUNAWAY_MESSAGES` list (never the same one twice in a row). The bubble wraps long messages, and the empty-spot search measures it first so it stays on screen. A hidden `role="status"` region tells screen-reader users to activate the link again.
4. **Second click:** the click is no longer blocked, so the browser opens LinkedIn in a new tab. After 700ms the card returns to its original place.
5. **Edge cases:** Ctrl/Cmd/Shift-clicks are never blocked, so "open in new tab" still works. Resizing the window sends the card home. With reduced motion, the CSS media query removes the animation, so the card moves instantly.

The contact section's **Connect with me on LinkedIn** button scrolls up to this card and makes it glow once it is fully visible (`IntersectionObserver` with `threshold: 1`).

## 7. Responsive Design

- Breakpoint `900px`: two-column sections become one column; the repo grid becomes two columns.
- Breakpoint `720px`: mobile navigation, single-column projects and repos, and a full-width search field.
- **Bug fix:** the header's `backdrop-filter` makes it the containing block for the fixed mobile menu, so the hidden off-screen menu made the page 750px wide on a 375px phone. Adding `overflow-x: clip` to the header removes the sideways scroll without breaking the sticky header.

## 8. Accessibility

- Semantic landmarks, a skip link, and a logical heading order.
- Filter chips use `aria-pressed`; search and sort have visually hidden labels.
- Live regions (`aria-live`, `role="status"`) announce result counts, loading, errors, and form messages.
- All controls are native buttons, links, inputs, and selects, so they work with the keyboard.
- Visible focus styles, and color contrast checked in both themes (dark-theme form errors were darkened for readability).

## 9. Compatibility

Uses `fetch`, `async/await`, `AbortController`, `IntersectionObserver` (with a fallback that loads repositories immediately), `Intl.RelativeTimeFormat`, CSS Grid, the `translate` property, and `color-mix()`. All are supported in current Chrome, Edge, Firefox, and Safari.

## 10. Testing

The features were tested in Chrome, both by hand and with an automated Playwright script:

| Test | Result |
| --- | --- |
| Filter "UI design" | 1 of 2 projects shown |
| Search "fetch" / "zzzz" | 1 of 2 projects shown / empty state with Clear filters |
| Sort Z–A | Order reversed correctly |
| GitHub API (live) | Repository cards rendered |
| API network failure → Try again | Friendly error shown, retry loads data |
| API HTTP 403 | Rate-limit message shown |
| API empty array | Empty-state message shown |
| Submit empty form | Three inline errors and a summary message |
| Type, then reload | Draft restored, "Clear draft" visible |
| Valid submit | "Sending…" state, confirmation, draft cleared |
| Mobile (375px), dark theme | No horizontal scroll, layout stacks correctly |
| Profile card, 1st click (desktop and 375px) | Does not open LinkedIn; photo moves to an empty spot with no overlap |
| Profile card, 2nd click | Opens LinkedIn in a new tab; card returns home |
| Console | No JavaScript errors |

Manual checklist: keyboard-only navigation, theme persistence after refresh, and enabling "reduce motion" in the operating system.

## 11. Known Limitations and Future Work

- The contact form is a front-end demo; connecting a service such as Formspree would make it send real messages.
- Project data is written in HTML. A later version could load it from a JSON file to make adding projects easier.
