# AI Usage Report — Assignment 2

## 1. Tools Used

| Tool | Assignment | How it was used |
| --- | --- | --- |
| **Claude (Claude Code in VS Code)** | Assignment 2 | Feature planning, code generation, debugging, automated browser testing, documentation drafting, and reviewing my work against grader feedback |
| **ChatGPT** | Assignment 1 | Initial page structure, responsive CSS, starter JavaScript, and documentation (this site's starting point) |

## 2. How I Used Claude

### Planning against the requirements

I gave Claude the Assignment 2 brief and my Assignment 1 code. It first checked what Assignment 1 already had (saved theme, form validation, greeting), so that Assignment 2 would add clearly *new* work instead of repeating features. We mapped one feature to each requirement:

- Dynamic content → project filter, live search, and sort
- Data handling → GitHub REST API (relevant to a developer portfolio) and a `localStorage` form draft
- Animation → scroll reveal, fade-ins, loading shimmer, animated messages
- Feedback → loading, error with retry, empty states, form messages

### Code generation

Claude wrote the first versions of the new HTML, CSS, and JavaScript. It followed the existing code style: the same CSS variables, naming, and comment density. Each feature was developed on its own Git branch.

### Debugging

- **Mobile horizontal scroll.** Automated tests showed the page was 750px wide on a 375px phone, and the same bug existed in Assignment 1. Hiding elements one by one traced it to the mobile menu. The cause was `backdrop-filter` on the header, which makes the header the containing block for `position: fixed` children. The fix was `overflow-x: clip` on the header.
- **Animation conflict.** `animation-fill-mode: both` on cards would have locked their `transform` and broken the hover effect, so `backwards` was used instead.
- **Contrast.** In dark mode the contact panel is light, so the pink error text from Assignment 1 was hard to read. A darker red was added.
- **Layout overlap.** After a LinkedIn icon was added to the footer, a screenshot showed the back-to-top button covering the copyright text, so padding was added.

### Testing

Claude wrote a Playwright script that drove Chrome through every feature, including simulated API failures (network error, HTTP 403, empty response) and a 375px mobile view. The results are in the technical documentation.

### Documentation

Claude drafted the README, technical documentation, and this report, and later reviewed the README against my Assignment 1 grade.

## 3. Example Prompts

- "Here is the Assignment 2 brief and my Assignment 1 code. Implement the requirements on top of my portfolio."
- "Add some option for people to connect to my LinkedIn."
- "When they press my LinkedIn, make my photo appear in empty space like it's running away; it should be pressable after the 2nd click."
- "Explain how my website is on the internet." / "How does my GitHub repo differ from a real website?"
- "Look into the README and edit it based on what is written."
- *(Pasted my Assignment 1 README grade and feedback)*: fix the same problems in Assignment 2.

## 4. My Review and Changes to the AI Output

- **Tested the site myself.** I opened the site in my browser and tried the features: filters and search, the GitHub section, the contact form, and the theme toggle.
- **Requested and refined features.** I asked for a way for visitors to connect with me on LinkedIn, then provided my own profile photo for the top of the page. After trying several LinkedIn buttons around the page, I decided to keep only one: the photo card at the top, which links to my profile, so the page stays clean. Visitors at the bottom of the page could no longer find it, so I asked for a button in the contact section that scrolls back up to the card instead of adding a second link. The card now glows when they arrive. I then designed a playful interaction: when visitors click my photo, it should run away to an empty part of the screen, and only open LinkedIn on the second click. Testing showed that on phones the full card had no empty space to move into, so it was changed to shrink to just the photo while it runs, matching my idea of "my photo running away".
- **Applied my Assignment 1 feedback.** My Assignment 1 README lost marks for leftover placeholder text. I brought that feedback in and had the following corrected before submitting:
  - The placeholder email `your.email@example.com` was replaced with my real email.
  - Two example projects carried over from Assignment 1 ("Campus Events Dashboard" and "SocialBook Interface") were **not real work of mine**, so I had them removed. The project section now shows only my real projects: my Assignment 1 and Assignment 2 portfolios, with links to their code.
  - "Before submitting" notes and fill-in sections were removed from the documentation.
- **Reviewed the README.** I asked for the README to be checked and improved. A live-site link, a features overview, the Git branch workflow, troubleshooting, and known limitations were added.
- **Learned the deployment concepts.** I asked how a website gets onto the internet and how a GitHub repository differs from a live website, before deploying with GitHub Pages.

## 5. Understanding the AI Output

Key concepts I can explain from this code:

- **Single state object + one render function:** every control updates `projectState`, then `renderProjects()` redraws, so the UI always matches the state.
- **`async/await` with `try/catch/finally`:** errors from `fetch`, bad HTTP status codes (`response.ok` is false; `fetch` does not throw for them), and `AbortController` timeouts all end up in one `catch`. `finally` clears the timer.
- **Caching and lazy loading:** `sessionStorage` avoids repeated API calls (GitHub allows 60 unauthenticated requests per hour), and `IntersectionObserver` waits until the section is near the screen before fetching.
- **XSS safety:** repository descriptions come from outside the site, so they are inserted with `textContent`, not `innerHTML`.
- **Debouncing:** the draft is saved 300ms after typing stops, not on every key press.
- **Progressive enhancement:** content is visible without JavaScript; animations only apply after JS adds `.reveal-ready`, and are disabled for reduced-motion users.
- **Static hosting:** GitHub Pages serves the same files to every visitor; there is no backend, which is why the contact form is a demo.

## 6. Benefits and Challenges

**Benefits:** AI turned the requirements into concrete features quickly, explained browser behavior I didn't know (such as `backdrop-filter` creating a containing block), and tested error cases that are hard to trigger by hand, such as a GitHub rate limit.

**Challenges:** AI output must be checked against reality, not just against the code. The biggest lesson came from my Assignment 1 grade: the AI-generated content included placeholder text and example projects that did not represent me. AI cannot know which details are true about a person, so I now review all personal content and replace anything that is not accurate.

## 7. Responsible Use

AI was used as an assistant, not a replacement for learning. I tested the result, directed the changes, and can explain how each feature works; I am responsible for the final submission. No code was copied from classmates. All AI use is disclosed in this report.
