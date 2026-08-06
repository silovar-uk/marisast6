# GitHub Pages publishing notes

This repository is a static HTML/CSS/JavaScript site and is published directly from the `main` branch root.

## Repository setting

In **Settings → Pages → Build and deployment**, use:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/(root)`

The root `.nojekyll` file prevents Jekyll processing and allows the files to be served as committed.

## GitHub Actions

`.github/workflows/pages.yml` is validation-only. It checks JavaScript syntax, Year 4 data, readability, contrast, icons, the immersive lab layer, and branch-publishing readiness. It does not create or cancel GitHub Pages deployments.

This separation avoids the repository-specific `deployment_queued` state that affected artifact-based `actions/deploy-pages` deployments on 2026-08-06.
