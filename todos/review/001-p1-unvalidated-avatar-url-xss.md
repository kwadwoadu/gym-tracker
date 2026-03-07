---
id: REV-001
severity: P1
agent: security-sentinel
status: done
file: src/app/api/community/profile/route.ts
line: 34-40
created: 2026-03-07
---

# Unvalidated avatarUrl allows XSS via img src injection

## Description
PUT endpoint accepts avatarUrl without protocol validation. Malicious javascript: or data: URIs could be injected and rendered across community components via `<img src={avatarUrl}>`.

## Proposed Fix
Add URL validation before saving:
```typescript
const validateImageUrl = (url: string | null): boolean => {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
};
if (avatarUrl && !validateImageUrl(avatarUrl)) {
  return NextResponse.json({ error: "Invalid avatar URL" }, { status: 400 });
}
```

## Context
Found during review of commits c2cf8d6, 29c184d.
