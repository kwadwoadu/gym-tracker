# Public Assets Layer - SetFlow

> PWA assets, icons, sounds, and manifest configuration

## Purpose

Govern static assets that power SetFlow's Progressive Web App functionality. These files are served directly without processing and are critical for the offline-first gym experience.

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | PWA Specialist |
| **Collaborators** | Audio Engineer (sounds), Frontend Specialist (icons) |

---

## Asset Structure

```
/public/
  icons/              -> PWA icons for all platforms
    icon-192x192.png      - Android/Chrome
    icon-512x512.png      - Android/Chrome
    apple-touch-icon.png  - iOS home screen
  sounds/             -> Audio cues for workout
    set-start.mp3         - Begin set indicator
    rest-warning.mp3      - 10 seconds remaining
    rest-complete.mp3     - Rest timer finished
    workout-complete.mp3  - Session done
    pr-celebration.mp3    - New personal record
  manifest.json       -> PWA manifest
  sw.js               -> Service worker
  workbox-*.js        -> Workbox runtime
  favicon.png         -> Browser tab icon
```

---

## PWA Manifest Rules

### Required Configuration
```json
{
  "name": "SetFlow",
  "short_name": "SetFlow",
  "description": "Track your gym workouts with progressive overload",
  "theme_color": "#0A0A0A",
  "background_color": "#0A0A0A",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "scope": "/",
  "icons": [...]
}
```

### Critical Rules
- `theme_color` must match app background (#0A0A0A)
- `display: standalone` for native-like experience
- `orientation: portrait` for gym usage
- All icon sizes must be provided

### Icon Requirements
| Size | Purpose | Required |
|------|---------|----------|
| 192x192 | Android home screen | Yes |
| 512x512 | Android splash screen | Yes |
| apple-touch-icon | iOS home screen | Yes |
| favicon.png | Browser tab | Yes |

---

## Sound Files

### Audio Cue System

| Sound | File | When Played | Duration |
|-------|------|-------------|----------|
| Set Start | `set-start.mp3` | User begins a set | ~0.5s |
| Rest Warning | `rest-warning.mp3` | 10 seconds remaining | ~0.5s |
| Rest Complete | `rest-complete.mp3` | Rest timer ends | ~1s |
| Workout Complete | `workout-complete.mp3` | Session finished | ~2s |
| PR Celebration | `pr-celebration.mp3` | New personal record | ~2s |

### Audio File Requirements
- Format: **MP3** (best iOS compatibility)
- Bitrate: 128kbps minimum
- Sample rate: 44.1kHz
- Duration: Keep under 3 seconds
- Volume: Normalized to -14 LUFS

### iOS Audio Rules
- Must use Web Audio API (not HTML5 audio)
- AudioContext requires user interaction to start
- Files must be cached by service worker
- See `/docs/patterns/audio-cue-system.md` for implementation

---

## Service Worker Rules

### Caching Strategy
| Asset Type | Strategy |
|------------|----------|
| HTML pages | Network first, cache fallback |
| JS/CSS | Cache first, network update |
| Images/Icons | Cache first |
| Sounds | Cache first (critical for offline) |
| API calls | Network only (sync operations) |

### Cache Naming
```javascript
const CACHE_NAME = 'setflow-v1';
// Increment version on breaking changes
```

### Files That MUST Be Cached
- All sound files (offline audio feedback)
- manifest.json
- All icons
- App shell (HTML, CSS, JS)

---

## iOS PWA Requirements

### Apple-Specific Meta Tags (in layout.tsx)
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
```

### iOS Limitations to Handle
1. **No vibration** - Use audio feedback instead
2. **AudioContext restrictions** - Resume on first touch
3. **No push notifications** - Use in-app notifications
4. **Safe area insets** - Account for notch/home indicator

### Testing Checklist
- [ ] Add to home screen works
- [ ] App launches in standalone mode
- [ ] Audio plays after first interaction
- [ ] Offline mode fully functional
- [ ] Data persists after app close

---

## Asset Generation

### Icon Generation Script
```bash
npm run generate-icons
# Generates all sizes from source icon
```

### Source Requirements
- Minimum 1024x1024 PNG
- Transparent background (icons)
- SetFlow logo centered

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| WAV sound files | Large file size | Use MP3 |
| Missing apple-touch-icon | iOS shows screenshot | Provide proper icon |
| Long audio files | Slow to load | Keep under 3 seconds |
| HTTP-only assets | PWA requires HTTPS | All assets over HTTPS |
| Uncached sounds | Silent offline | Cache in service worker |

---

## Cross-References

| Resource | Location |
|----------|----------|
| Audio implementation | `/src/lib/audio.ts` |
| Audio pattern | `/docs/patterns/audio-cue-system.md` |
| PWA config | `next.config.ts` |
| Offline pattern | `/docs/patterns/pwa-offline-sync.md` |

---

*Created: January 4, 2026*
