# Pattern: Video URL Curation

## Purpose

Systematically find and validate direct YouTube video URLs for exercise tutorials.

## When to Use

- Adding new exercises that need video tutorials
- Replacing broken or low-quality video links
- Updating search URLs to direct URLs for embedding

## Why Direct URLs Matter

| URL Type | Format | Behavior |
|----------|--------|----------|
| Direct | `youtube.com/watch?v=VIDEO_ID` | Embeds in-app via iframe |
| Search | `youtube.com/results?search_query=...` | Opens new browser tab |

SetLogger's `getYouTubeId()` only extracts IDs from direct URLs.

## Video Source Priority

1. **Nordic Performance Training** - Professional, concise form videos
2. **TylerPath** - Good technique breakdowns
3. **ATHLEAN-X** - Detailed explanations
4. **PureGym / Gym chains** - Simple "how to" format
5. **Physical therapy channels** - For mobility/warmup exercises

## Workflow

### Step 1: Identify Exercises Needing Videos
```bash
# Find exercises with search URLs
grep "youtube.com/results" src/data/exercises.json

# Count direct vs search URLs
grep -c "youtube.com/watch" src/data/exercises.json
grep -c "youtube.com/results" src/data/exercises.json
```

### Step 2: Search YouTube
Use Playwright to navigate to YouTube search:
```
https://www.youtube.com/results?search_query=[exercise]+proper+form+tutorial
```

### Step 3: Select Best Video
Criteria:
- Clear demonstration of proper form
- Under 3 minutes (for warmup/mobility)
- High view count (social proof)
- Professional quality
- No excessive talking/intro

### Step 4: Extract Video ID
From YouTube URL: `youtube.com/watch?v=VIDEO_ID`
The VIDEO_ID is the 11-character string after `v=`

### Step 5: Update exercises.json
```json
{
  "id": "ex-exercise-name",
  "name": "Exercise Name",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### Step 6: Run Backfill Script
```bash
npx tsx scripts/backfill-videos.ts
```

### Step 7: Verify
- Check grep shows zero search URLs remaining
- Test in-app that videos embed correctly

## Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Use YouTube Shorts URLs | Different format, may not embed | Use regular watch URLs |
| Use playlist URLs | Won't extract video ID | Use individual video URL |
| Use search URLs | Opens new tab, doesn't embed | Always use direct URLs |
| Skip backfill script | Database won't update | Always run after JSON changes |

## Example Session

```
Exercise: Dead Hang
Search: "dead hang proper form benefits"
Found: FitnessFAQs - 1.2M views - ShkBXOGK7A8
URL: https://www.youtube.com/watch?v=ShkBXOGK7A8
```

---

*Created: January 4, 2026*
*SetFlow v2.2.2*
