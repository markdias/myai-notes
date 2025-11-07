# PR Preview Deployment Setup

This repository includes multiple options for PR preview deployments:

## Option 1: Downloadable Artifact (Active by Default)

**File:** `.github/workflows/pr-preview-artifact.yml`

**Status:** ✅ Ready to use (no setup required)

This workflow uploads the site as a downloadable artifact when a PR is opened. The bot will comment on the PR with download instructions.

### How it works:
1. When a PR is created/updated, the site is packaged
2. A GitHub Actions artifact is created
3. A comment is posted on the PR with download link
4. Testers download and run locally

**Pros:**
- No external dependencies
- No secrets required
- Works out of the box

**Cons:**
- Requires download and local setup
- Not a live URL
- Extra steps for testers

---

## Option 2: GitHub Pages PR Previews (New Default)

**File:** `.github/workflows/pr-preview-pages.yml`

**Status:** ✅ Ready to use (no secrets required)

This workflow publishes each pull request to a unique folder on the existing GitHub Pages site
(e.g., `https://<owner>.github.io/myai-notes/pr/123/`). Preview directories are cleaned up
automatically when the PR is closed.

### How it works:
1. Triggered by `pull_request_target` events
2. Checks out the PR branch and copies the static site into `pr/<PR_NUMBER>/`
3. Commits the preview directory to the `gh-pages` branch
4. Comments on the PR with a direct link to the preview
5. Removes the folder and leaves a comment when the PR is closed

### Notes:
- Works alongside the standard `deploy.yml` workflow. The deployment job now preserves the `pr/`
  directory so live previews survive the main site updates.
- Requires GitHub Pages to already be set up for the repository (handled by `deploy.yml`).
- Uses the default `GITHUB_TOKEN`; no additional secrets are necessary.

**Pros:**
- Fully hosted preview using the existing Pages site
- Automatic PR comments and cleanup
- No external dependencies or credentials

**Cons:**
- Preview directories live within the public Pages site (discoverable if someone knows the URL)
- Updates rely on write access to the repository's `gh-pages` branch (works for collaborators; fork
  PRs are still processed safely via `pull_request_target`)

## Option 3: Live Preview with Surge.sh (Optional)

**File:** `.github/workflows/pr-preview.yml`

**Status:** ⚠️ Requires setup (workflow is shipped as `.disabled`)

This workflow deploys to a live URL using Surge.sh (e.g., `myai-notes-pr-123.surge.sh`). Enable it by
renaming `pr-preview.yml.disabled` to `pr-preview.yml` after completing the setup below.

### Setup Instructions:

1. **Install Surge CLI locally:**
   ```bash
   npm install -g surge
   ```

2. **Create a Surge account (free):**
   ```bash
   surge login
   ```
   - Enter your email and create a password
   - Verify your email

3. **Get your Surge token:**
   ```bash
   surge token
   ```
   - Copy the token that's displayed

4. **Add token to GitHub Secrets:**
   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SURGE_TOKEN`
   - Value: Paste the token from step 3
   - Click "Add secret"

5. **Enable the workflow:**
   - The workflow will automatically trigger on new PRs
   - Each PR gets a unique URL: `myai-notes-pr-[number].surge.sh`
   - The bot will comment with the live preview URL

6. **Cleanup:**
   - Previews are automatically removed when PRs are closed
   - You can manually remove with: `surge teardown myai-notes-pr-123.surge.sh`

**Pros:**
- Live, accessible URL
- Easy for testers (just click a link)
- Automatic cleanup

**Cons:**
- Requires Surge account
- Requires SURGE_TOKEN secret setup
- External dependency

---

## Switching Between Options

### To use Downloadable Artifacts (default):
- Keep `pr-preview-artifact.yml` enabled
- Delete or disable `pr-preview.yml`

### To use GitHub Pages Previews only:
- Keep `pr-preview-pages.yml` enabled (default)
- Disable `pr-preview-artifact.yml` if you no longer want the downloadable ZIP

### To use Live Surge Previews:
1. Complete the Surge setup above
2. Rename `pr-preview.yml.disabled` to `pr-preview.yml`
3. Disable other preview workflows if you only want Surge URLs

### To use multiple preview types:
- Enable any combination of the workflows (artifact, GitHub Pages, Surge)
- Each workflow will comment separately with its instructions

---

## Testing the Setup

After pushing a PR, check:
1. The "Actions" tab shows the workflow running
2. A bot comment appears on the PR with preview instructions
3. The preview is accessible/downloadable

## Troubleshooting

### Surge deployment fails
- Verify `SURGE_TOKEN` is set correctly in repository secrets
- Check token is still valid: `surge token`
- Ensure surge.sh is not having outages

### No comment on PR
- Check workflow permissions include `pull-requests: write`
- Verify the workflow ran successfully in Actions tab

### Artifact not available
- Artifacts are retained for 30 days
- Check the workflow run in Actions tab for the artifact

---

## Alternative: Other Preview Services

You can also use:
- **Netlify Deploy Previews** (requires Netlify account)
- **Vercel Previews** (requires Vercel account)
- **Cloudflare Pages** (requires Cloudflare account)
- **GitHub Pages with PR directories** (complex setup)

Each has different trade-offs in terms of setup complexity and features.
