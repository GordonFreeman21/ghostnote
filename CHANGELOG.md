# Changelog

All notable changes to GhostNote will be documented here.

The format is based on Keep a Changelog, and this project uses semantic-ish versioning for releases.
(If you’re not doing releases yet, treat the versions as milestones.)

## [Unreleased]

### Added
- “Digital Vapour” UI direction (Cyber‑Noir dark mode + glass surfaces).
- Splash screen (K7 logo + “GhostNote — Product from K7 Digital”).
- Optional username (stored locally in the browser only; not sent to the server).
- Info drawer with:
  - Zero‑knowledge explanation
  - Reality check / safety notes
  - “What is K7 Digital?” section

### Changed
- Composer page layout to centered vault container with improved readability.
- Viewer page layout to match the new design system and readability rules.
- Brand mark: replaced stylized “O” with a thin-line ghost icon.

### Improved
- Better contrast and readability for logs, panels, and message content.
- UI-only micro-interactions (noise overlay / subtle effects) without changing core encryption logic.

### Fixed
- Static asset path issues by using absolute URLs (e.g. `/app.css`, `/ui.js`) so styles load correctly on `/n/<id>` routes.
- Reduced “blank page” risk by ensuring composer and viewer pages are no longer identical and include required DOM IDs.

### Security
- Clarified threat model in the UI (link/key leakage, passphrase benefits, burn-on-read limitations).

## [0.1.0] - Initial
### Added
- Client-side encryption and note creation flow.
- Viewer page with decryption flow.
- Basic options: TTL, burn-on-view, optional passphrase.
