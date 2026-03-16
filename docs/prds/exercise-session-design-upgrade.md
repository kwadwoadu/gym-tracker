# PRD: Exercise Session Design Upgrade

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-11
> **Priority:** P2
> **Type:** Visual Enhancement

---

## 1. Problem

The exercise session interface is functional but visually basic compared to the 10x mockup design. Key gaps:
- RPE uses a slider instead of the more gym-friendly pill selector from the mockup
- Weight display is standard size instead of the huge 56px/900 weight display
- Set indicators are 32px instead of the 36px circles from the mockup
- No tempo badge visible during exercise
- Completed set badges exist in carousel but aren't tappable for editing

### Design reference
- 10x mockup: `docs/setflow-10x-mockup.html` (lines 294-493)
- Design tokens: `docs/setflow-evolved-demo.html` (lines 11-29)

---

## 2. Solution

Upgrade SetLogger and WorkoutCarousel to match the 10x mockup design:

1. **RPE pills**: Replace slider with circular RPE pills (1-10, selected = lime bg black text)
2. **Huge weight display**: Increase weight to 48px/900 weight with -1px letter-spacing
3. **Set indicator upgrade**: Increase to 36px circles with done/active/empty states
4. **Tempo badge**: Show tempo as a lime pill badge in carousel
5. **Completed set badges**: Already tappable in carousel via `onEditSet`

---

## 3. Files to Modify

| File | Change |
|------|--------|
| `src/components/workout/set-logger.tsx` | RPE pills replacing slider, bigger weight display |
| `src/components/workout/workout-carousel.tsx` | Larger set indicators, tempo badge |

---

## 4. Implementation Checklist

1. [ ] Replace RPE slider with RPE pill selector (10 circles, selected = lime)
2. [ ] Increase weight display to 48px font-weight 900
3. [ ] Increase set indicator circles to 36px (w-9 h-9)
4. [ ] Add tempo badge in carousel exercise cards
5. [ ] Visual verification against 10x mockup

---

*Created: 2026-03-11*
