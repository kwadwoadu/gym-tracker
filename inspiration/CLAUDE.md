# Design Inspiration Index

Design screenshots and references for Gym Tracker.

## Screenshot Sources

Screenshots analyzed from 6 gym apps (22 total screens):
- **Fitbod** - Exercise cards, workout summary
- **Ladder** - Yellow accent, workout overview
- **Tempo** - Rest timer, muscle visualization
- **Peloton Strength+** - Video integration, workout customization
- **Bevel** - Progress charts, calendar view
- **Apple Fitness** - Clean stats, activity rings

## Location
`/assets/Gym Mode screens/`

## Key Design Patterns Extracted

### Color
- Dark mode dominant (#0A0A0A to #1A1A1A backgrounds)
- Lime/yellow accent (#CDFF00) for CTAs and highlights
- High contrast text (white on dark)

### Components
1. **Exercise Card**: Square thumbnail, bold name, muted details
2. **Rest Timer**: Circular countdown, progress ring animation
3. **Set Logger**: Large +/- buttons, "last week" comparison
4. **Superset Group**: Letter badge (A, B, C), grouped exercises
5. **Bottom Navigation**: 4 items, icon + label

### Layout
- Bottom navigation (4-5 items)
- Full-width sticky CTAs
- Card-based exercise lists
- Safe area respect (notch, home indicator)

### Animation
- Timer pulse on each second
- Spring animation on set complete
- Slide transitions between pages
- Pulsing glow at 10 seconds rest warning

## Usage

When building components, reference these patterns:
```
See: /assets/Gym Mode screens/Gym Mode screens [N].png
```

Screenshot mapping:
- 0-3: Fitbod (cards, summary, calendar)
- 4-7: Tempo (rest timer, muscle viz)
- 8-11: Bevel (progress charts)
- 12-17: Apple Fitness (stats, rings)
- 18-21: Peloton/Ladder (video, customize)
