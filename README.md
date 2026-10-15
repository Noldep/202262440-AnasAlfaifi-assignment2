# Anas Alfaifi's Interactive Portfolio — Assignment 2

An interactive, responsive single-page portfolio built with HTML, CSS, and vanilla JavaScript for SWE 363 (Web Engineering) at KFUPM. This assignment builds on the [Assignment 1 portfolio](https://github.com/Noldep/202262440-AnasAlfaifi-assignment1) and focuses on interactivity, data handling, and user feedback.

**Live site:** <https://noldep.github.io/202262440-AnasAlfaifi-assignment2/>

**Source code:** <https://github.com/Noldep/202262440-AnasAlfaifi-assignment2>

## Technologies

- **HTML5**: semantic structure and accessible forms
- **CSS3**: custom properties, Grid, Flexbox, keyframe animations, media queries
- **JavaScript (ES2020)**: DOM events, Fetch API, `async/await`, `localStorage` / `sessionStorage`, `IntersectionObserver`
- **GitHub REST API**: public repository data
- No frameworks, libraries, or build tools

## Features at a Glance

| From Assignment 1 | New in Assignment 2 |
| --- | --- |
| Responsive layout (desktop, tablet, mobile) | Project filter, live search, and sorting |
| Light/dark theme saved in `localStorage` | Live GitHub repositories (API) with loading and error states |
| Time-based greeting | Contact form draft autosave and character counter |
| Mobile navigation menu | Scroll-reveal, fade-in, and loading animations |
| Contact form validation | Profile photo linking to LinkedIn, back-to-top button, and real project cards with code links |
| Active link highlighting while scrolling | Mobile horizontal-scroll bug fix |

## How Assignment 2 Meets the Requirements

| Requirement | Feature | Where |
| --- | --- | --- |
| Dynamic content | Project explorer: category filter chips, live search while typing, and A–Z / Z–A sorting with a live results count | Projects section |
| Data handling (API) | Latest repositories fetched from the public **GitHub REST API**, cached for 10 minutes | GitHub section |
| Data handling (storage) | Contact form drafts autosaved to `localStorage` and restored on return; theme preference saved | Contact form, header |
| Data handling (form) | Validation with inline errors, character counter, and confirmation message | Contact form |
| Animation & transitions | Hero entrance, scroll-reveal sections, fade-in when filtering, skeleton loading shimmer, animated form messages, hover effects | Whole page |
| Error handling & feedback | "Loading…" skeletons, friendly API errors (offline, timeout, rate limit) with a **Try again** button, "No projects found" empty state, form error/success messages | Projects, GitHub, Contact |

Other improvements:

- Profile photo card at the top of the hero section that links to my LinkedIn profile, with a small game: the **first click makes the photo run away** to an empty spot on the screen with a random message (such as "Pardon me." or "Innovative?"), and **clicking it again opens LinkedIn** in a new tab. The photo is resized to 320px (25 KB) so the page loads fast.
- **Connect with me on LinkedIn** button in the contact section scrolls back up to the profile card and makes it glow, so the page has a single LinkedIn link that is easy to find from the bottom.
- Back-to-top button that appears once you scroll past the hero.
- Fixed a horizontal-scroll bug on phones that existed in Assignment 1.
- Every animation is turned off for visitors who enable "reduce motion".
- Storage access is wrapped in `try/catch`, so the site still works when the browser blocks storage (for example, in some private-browsing modes).

## How to Use the Features

1. **Visit LinkedIn:** Click the photo card at the top. It runs away! Click it again where it lands to open LinkedIn.
2. **Filter projects:** In *Projects*, click **Web apps**, **UI design**, or **JavaScript**. Type in the search box (for example `fetch`) to filter live. Use the dropdown to sort. If nothing matches, click **Clear filters**.
3. **GitHub repositories:** Scroll to *Live from GitHub*. Repositories load automatically. If loading fails, read the message and click **Try again**.
4. **Contact form:** Start typing a message, then refresh the page. Your draft is restored. Submit with empty fields to see the errors, or with valid input to see the confirmation. **Clear draft** removes the saved text.
5. **Theme:** Use the sun/moon button. Your choice is remembered next time.

## Project Structure

```text
.
├── README.md
├── index.html                  # Page structure and content
├── css/
│   └── styles.css              # Design tokens, layout, components, animations
├── js/
│   └── script.js               # Theme, navigation, explorer, GitHub API, form, motion
├── assets/
│   └── images/
│       └── profile.jpg         # Profile photo (resized to 320px)
├── docs/
│   ├── ai-usage-report.md      # How AI tools were used
│   └── technical-documentation.md
└── .gitignore
```

## Run Locally

No installation, build step, or package manager is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Noldep/202262440-AnasAlfaifi-assignment2.git
   cd 202262440-AnasAlfaifi-assignment2
   ```
2. Open the site using **one** of these options:
   - **Simplest:** double-click `index.html` to open it in your browser.
   - **VS Code:** install the **Live Server** extension, right-click `index.html`, then choose *Open with Live Server*.
   - **Python:** run the command below, then visit <http://localhost:8000>.
     ```bash
     python -m http.server 8000
     ```

An internet connection is needed for the Google Fonts and the GitHub section. Everything else works offline. When offline, the GitHub section shows a friendly error message.

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, select `main` and `/ (root)`, then click **Save**.
4. After about a minute the site is live at <https://noldep.github.io/202262440-AnasAlfaifi-assignment2/>.
5. To update the live site later, commit your changes and run `git push`. GitHub Pages redeploys automatically.

## Troubleshooting

| Problem | Solution |
| --- | --- |
| GitHub section says the request limit was reached | GitHub allows 60 requests per hour without login. Wait a few minutes, then click **Try again**. |
| GitHub section says you are offline | Check your internet connection, then click **Try again**. |
| Theme or form draft is not remembered | Your browser may be blocking site storage (for example, in private mode). The site still works, but it can't save preferences. |
| Fonts look different | Google Fonts need an internet connection; the site falls back to system fonts. |
| Live site shows an old version | Wait a minute after pushing, then hard-refresh with **Ctrl + Shift + R**. |

## Browser Support

Tested in current Chrome at desktop (1280px) and mobile (375px) widths, in light and dark themes. The code uses widely supported features (`fetch`, `IntersectionObserver`, `localStorage`, CSS Grid, `color-mix()`), so it should also work in current Edge, Firefox, and Safari.

## Development Workflow

Each feature was built on its own branch and merged into `main` during development. The final submission on `main` combines that work into a single `HW2` commit. The branches were:

| Branch | Purpose |
| --- | --- |
| `feature/project-explorer` | Filter, search, sort, and empty state |
| `feature/github-api` | GitHub API repositories with loading/error/empty states |
| `feature/contact-form-ux` | Draft autosave, character counter, submit feedback |
| `feature/scroll-animations` | Scroll reveal, hero entrance, back-to-top, mobile fix |
| `docs/assignment2` | README, technical documentation, AI report |
| `feature/linkedin`, `feature/hero-linkedin`, `feature/profile-photo`, `fix/single-linkedin`, `feature/linkedin-jump`, `feature/runaway-photo` | LinkedIn profile card with photo in the hero (a single LinkedIn link), a contact-section button that jumps to it, and the "catch me" runaway effect |

## Known Limitations

- The contact form is a front-end demo: it validates input but does not send messages, because the site has no backend.
- Project cards are written directly in HTML; adding a project means editing `index.html`.

## AI Use (Summary)

Claude (in Claude Code) was used to plan the new features, write the first version of the JavaScript and CSS, find and fix a mobile layout bug, run automated browser tests, and draft the documentation. I tested the site in my browser, requested changes (such as the LinkedIn links and README improvements), and applied my Assignment 1 feedback by replacing placeholder content and example projects with my real email and my real coursework. ChatGPT was used in Assignment 1 for the original page. Full details are in [`docs/ai-usage-report.md`](docs/ai-usage-report.md).

## Documentation

- [Technical Documentation](docs/technical-documentation.md)
- [AI Usage Report](docs/ai-usage-report.md)

## Author

- **Name:** Anas Alfaifi
- **Student ID:** 202262440
- **Email:** [anasalfaifi1@gmail.com](mailto:anasalfaifi1@gmail.com)
- **LinkedIn:** [anas-farhan-b90901336](https://www.linkedin.com/in/anas-farhan-b90901336/)
- **Repository:** `202262440-AnasAlfaifi-assignment2`
