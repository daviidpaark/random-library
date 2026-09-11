# Random Library Instructions

## Repository Role & Architecture
- Spicetify custom app for Spotify that displays saved Spotify albums and followed artists in a fast, shuffled, filterable grid with on-demand discography exploration, smart edition prioritization, and random discovery.
- Built with vanilla JavaScript, CSS, and Spicetify / Spotify desktop client internal APIs.

## Spicetify UI & Manifest Conventions
- Preserve existing Spotify and Spicetify APIs, UI conventions, and manifest contracts.
- **Sidebar Icons:** Keep inactive and active sidebar icon states visually distinct: use `icon` for the default state and `active-icon` for the selected state.
- Follow the standardized artwork and card formats (shared styling conventions with `release-list`).

## Development & Validation
- Run the narrowest relevant check after each edit:
  - Check JavaScript syntax:
    ```bash
    node -c random-library/index.js
    ```
  - Validate manifest JSON:
    ```bash
    node -e "JSON.parse(require('fs').readFileSync('random-library/manifest.json', 'utf8'))"
    ```
- Verify that automated CI checks pass before concluding changes.

## Releases & CI
- CI runs on push and pull requests to `main` via `.github/workflows/ci.yml`, checking JavaScript syntax and validating `manifest.json`.
- Documentation-only or test-only changes do not require a new release tag.
- Prefer current major versions of GitHub Actions and address Node.js runtime deprecation warnings promptly.

## Git Workflow
- Do not commit or push unless explicitly requested by the user.
- Keep commits focused and scoped to this repository.

## Performance, Resource Lifecycle & Memory Hygiene
- **Event Debouncing:** Debounce high-frequency search input events and filter toggles to prevent redundant re-renders and heavy array traversals.
- **DOM Efficiency:** Avoid generating unnecessary DOM nodes for massive collections; reuse elements or render on demand to keep Spotify desktop UI responsive.
- **Cleanup on Unmount:** Clean up custom window event listeners, ResizeObservers, or recurring intervals when navigating away from the custom app.
