# Random Library

A Spicetify custom app that displays your saved Spotify albums and followed artists in a shuffled, filterable grid with on-demand artist discographies, edition deduplication, and random discovery. Find it in the left sidebar under the shuffle icon.

Companion to [Release List](https://github.com/daviidpaark/release-list); both apps share the same card and artwork design.

## Features

- **Albums, Artists, and Discover Modes**
  - **`Albums`**: Your saved albums, loaded from the local library.
  - **`Artists`**: A shuffled grid of the artists you follow.
  - **`Discover`**: A shuffled grid of releases from followed artists that are not in your library. Toggle **Albums**, **EPs**, and **Singles**. The shuffle gives every artist equal weight, editions of one title are grouped under the **`Eds ▾`** dropdown, and titles you already saved in any edition are left out. Requires [Release List](https://github.com/daviidpaark/release-list), and covers the releases inside its sync window.
- **Random Picks**
  - **`Random Album`** opens a random album from your saved collection. In **Discover** it picks a random artist first, then one of their unsaved releases.
  - **`Random Artist`** opens the full discography of a random followed artist.
  - Step back and forward through past random artists with **`◀ Previous`** / **`Next ▶`** and a step counter (e.g. `3 of 5`).
  - Selected release filters persist across **Random Artist** rolls, so you can keep discovering within one category.
- **Artist Discography**
  - Click any followed artist to open their discography inside the app.
  - Filter by `All`, `✓ In Library`, `Albums`, `EPs`, `Singles`, or `Alternative Editions`.
- **Edition Deduplication**
  - Groups standard, deluxe, expanded, anniversary, and remastered versions of the same album.
  - Shows your saved version when present; otherwise the most complete edition.
  - Switch between versions with the **`Eds ▾`** dropdown next to the artist name.
- **Cards and Artwork**
  - Hover to reveal a green play button that starts playback immediately.
  - `✓` badge on covers and edition dropdown items that are in your library.
  - Release type badge (`ALBUM`, `EP`, or `SINGLE`) below each cover. Spotify groups EPs with singles, so a single with 4 or more tracks is shown as an EP.
  - The grid scales from ultra-wide displays down to compact split-screen windows.
- **Search and Sort**
  - Debounced search by album title or artist name.
  - Sort by *Shuffled*, *Album A–Z / Z–A*, *Artist A–Z / Z–A*, or release date (*Newest* / *Oldest first*).
  - Shuffle order is preserved across Spotify restarts.
- **Refresh**: Click **`Refresh`** to sync newly saved albums and followed artists from Spotify (also clears random navigation history).
- **Export**: Export your saved albums as JSON or CSV from the **Export Saved Albums** entry in the profile menu.
- **Web Sync** (optional): Enter the address of a [Spicetify Library](https://github.com/daviidpaark/spicetify-library) container in **Settings** to browse your library from a phone. **Sync Now** and **Refresh** push your saved albums and followed artists to it.

## How It Works

- Saved album release dates and track counts load once in the background and are cached locally.
- If [Release List](https://github.com/daviidpaark/release-list) is installed, Random Library reuses its cached release data (read-only) before requesting anything from Spotify. The **Discover** mode is built entirely from that cache and sends no requests of its own.

## Requirements

- [Spicetify](https://spicetify.app) installed and configured (`spicetify backup` run at least once)
- Spotify desktop app

## Install

### Windows (PowerShell)

```powershell
iwr -useb "https://raw.githubusercontent.com/daviidpaark/random-library/main/install.ps1" | iex
```

### macOS / Linux

```bash
curl -fsSL "https://raw.githubusercontent.com/daviidpaark/random-library/main/install.sh" | bash
```

The script will:

1. Verify `spicetify` is in your PATH and locate your `config-xpui.ini`
2. Download `index.js` and `manifest.json` into your Spicetify `CustomApps/random-library/` folder
3. Remove the legacy `random-albums` app and register `random-library` in `config-xpui.ini`
4. Run `spicetify apply`

Restart Spotify if it was already open.

## Uninstall

### Windows (PowerShell)

```powershell
iwr -useb "https://raw.githubusercontent.com/daviidpaark/random-library/main/uninstall.ps1" | iex
```

### macOS / Linux

```bash
curl -fsSL "https://raw.githubusercontent.com/daviidpaark/random-library/main/uninstall.sh" | bash
```

## Icons

Icons come from [Material Icons](https://github.com/google/material-design-icons) (Apache 2.0), [Feather](https://github.com/feathericons/feather) (MIT), and the glyph set Spotify's desktop client exposes through Spicetify (`Spicetify.SVGIcons`).

## Disclaimer

This project is an independent, open-source custom app and is not affiliated with, sponsored by, or endorsed by Spotify. Spotify is a registered trademark of Spotify AB.

## AI Disclosure

> [!NOTE]
> This is a personal homelab project developed with the assistance of **GitHub Copilot (Claude Sonnet / Opus)**, **Google Antigravity (Gemini Flash / Pro)**, and **Claude Code (Claude Opus)**. It is shared publicly for other Spotify and Spicetify users. Feedback and issue reports are welcome.

## License

[MIT License](LICENSE) © 2026 David Park
