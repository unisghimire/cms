# Tips to Increase GitHub Stars

Use these **after** you push the repo to GitHub. They help with discoverability and credibility.

## 1. Repo setup (one-time)

- **Description** (under the repo name):  
  e.g. `Full-stack consultancy CRM: React, TypeScript, Supabase. Leads, visa applications, documents, invoices.`
- **Topics** (Add topics):  
  `react`, `typescript`, `supabase`, `nodejs`, `express`, `material-ui`, `consultancy`, `crm`, `postgresql`
- **Website** (if you deploy): Add the live demo URL.
- **Pin** the repo to your profile so it shows on your GitHub page.

## 2. README and visuals

- Replace `YOUR_USERNAME` in the README with your real GitHub username (e.g. in the Star History badge link).
- Add a **screenshot or short GIF** of the app at the top of the README (e.g. dashboard or leads list).  
  Example:
  ```markdown
  ## Screenshot
  ![Dashboard](docs/screenshot.png)
  ```
- Optionally add a one-line **“One-liner”** at the very top:  
  *“Open-source CRM for consultancies – manage leads, visas, documents & invoices with React + Supabase.”*

## 3. Community and sharing

- **Star your own repo** (optional but common).
- Share the repo where it’s relevant:
  - Reddit: r/reactjs, r/typescript, r/SideProject, r/opensource (read each sub’s rules).
  - Dev.to / Hashnode: short “I built a consultancy CRM with React and Supabase” post with repo link.
  - Twitter/X or LinkedIn: one post with repo link and what problem it solves.
- Add a **“Star this repo”** or **“If this helped you, give it a star”** line at the end of the README (you already have a support section).

## 4. Quality signals

- **README**: Clear quick start, features, and tech stack (already in place).
- **LICENSE**: MIT is friendly for stars and reuse (already added).
- **CONTRIBUTING.md**: Makes it easier for others to contribute (already added).
- **Issues / PRs**: Label issues (e.g. `good first issue`, `help wanted`) to attract contributors.
- **Releases**: When you have a stable version, create a **Release** (e.g. v1.0.0) with a short changelog; it looks more polished.

## 5. Optional but helpful

- **GitHub Actions**: Add a simple CI (e.g. `npm run build` or lint) so the README shows a “build passing” badge.
- **Star History**: After you have a few stars, the [Star History](https://star-history.com) badge in the README will show a chart (replace `YOUR_USERNAME` in the link).
- **Deploy a demo**: Deploy the frontend (e.g. Vercel/Netlify) and backend (e.g. Railway/Render) and put the live URL in the README and repo “Website” field.

## Checklist before going public

- [ ] No real keys or passwords in the repo (only `.env.example` with placeholders).
- [ ] `.env` and `supabase/SAMPLE_USER_CREDENTIALS.txt` are in `.gitignore`.
- [ ] README has your GitHub username where needed and a clear “Quick start”.
- [ ] Description and topics are set on the GitHub repo page.
