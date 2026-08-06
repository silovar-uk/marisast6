# GitHub Pages deployment notes

Production Pages runs use a shared `pages-production` concurrency group and do not cancel an active deployment. New pushes or manual runs wait for the current deployment to finish.

Pull-request validation uses a PR-specific concurrency group and may cancel stale validation runs from the same pull request.

The workflow uses Node 24-compatible official actions:

- `actions/checkout@v7`
- `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`

When a production run is in `deployment_queued`, do not start another manual deployment. The queue can take several minutes.
