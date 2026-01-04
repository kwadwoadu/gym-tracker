# Prisma Schema Layer - SetFlow

> Database schema governance, migration safety, and data protection rules

## Purpose

Govern the Prisma/PostgreSQL database schema for SetFlow. This layer handles cloud sync data, user accounts (via Clerk), and any server-side persistence.

**Note**: SetFlow is primarily offline-first using IndexedDB (Dexie.js). Prisma/PostgreSQL is used for:
- Cloud sync backup
- Cross-device data transfer
- User authentication metadata

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | Database Specialist |
| **Collaborators** | Sync Specialist, Software Engineer, Security Specialist (AduOS) |

---

## Schema Safety Rules

### Critical: Never Do These Without Explicit Confirmation
1. **DROP TABLE** - Destroys user workout data permanently
2. **DELETE CASCADE** - May remove linked workout history
3. **ALTER COLUMN (destructive)** - Data loss risk
4. **TRUNCATE** - Wipes all table data

### Required Before Schema Changes
1. Back up production data
2. Test migration locally first
3. Review migration SQL (`npx prisma migrate diff`)
4. Get explicit user approval for destructive changes

---

## Migration Workflow

### Local Development
```bash
# 1. Modify schema.prisma
# 2. Generate migration
npx prisma migrate dev --name descriptive-name

# 3. Apply to local DB
npx prisma db push

# 4. Regenerate client
npx prisma generate
```

### Production Deployment
```bash
# Migrations run automatically on Vercel deploy
# Schema changes trigger: npx prisma migrate deploy
```

### Rollback Strategy
- Keep migration history in git
- Document rollback SQL in migration folder
- Test rollback locally before deploying

---

## Data Protection Rules

### Workout Logs Are Sacred
- **Never auto-delete** workout logs
- **Never modify** historical workout data without consent
- **Always soft-delete** (add `deletedAt` timestamp) instead of hard delete

### Personal Records
- PRs are derived from workout logs
- Never recalculate without user consent
- Keep audit trail of PR changes

### User Data
- Clerk handles authentication
- Store only `clerkUserId` reference
- GDPR: Support full data export and deletion

---

## Key Models

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| User | Clerk user mapping | All user data |
| SyncData | Cloud backup blob | User |
| Device | Multi-device tracking | User |

### Note on Data Model
Most data lives in **IndexedDB** (client-side), not PostgreSQL:
- Exercises, Programs, WorkoutLogs, Sets, PRs, Achievements

PostgreSQL stores:
- Sync snapshots (compressed JSON blobs)
- Device registration
- User metadata

---

## JSON Fields

When storing complex nested data (sync blobs), use Prisma's JSON type:

```prisma
model SyncData {
  id        String   @id @default(cuid())
  userId    String
  data      Json     // Compressed workout data
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Accessing JSON in Queries
```typescript
// Read
const sync = await prisma.syncData.findFirst({
  where: { userId },
  orderBy: { updatedAt: 'desc' }
});
const workouts = sync.data.workouts;

// Write
await prisma.syncData.create({
  data: {
    userId,
    data: { workouts, exercises, prs }
  }
});
```

---

## Environment Rules

### Development
- Use local PostgreSQL or SQLite
- Safe to reset: `npx prisma db push --force-reset`
- Seed data available: `npx prisma db seed`

### Production
- PostgreSQL on Neon/Vercel
- **Never force-reset**
- **Never push without migration**
- Use `npx prisma migrate deploy` only

### Environment Variables
```env
# Development
DATABASE_URL="postgresql://..."

# Production (set in Vercel)
DATABASE_URL="postgresql://..." # Neon connection string
```

---

## Common Mistakes to Avoid

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| `db push` in production | Overwrites migration history | Use `migrate deploy` |
| Deleting migrations | Breaks deployment | Keep all migration files |
| Changing field types | Data loss | Create new field, migrate, delete old |
| Missing `@updatedAt` | Stale data tracking | Always include on mutable models |
| Direct SQL in app code | Bypasses Prisma safety | Use Prisma client only |

---

## Prisma Commands Reference

| Command | Use Case |
|---------|----------|
| `npx prisma generate` | Regenerate client after schema change |
| `npx prisma db push` | Apply schema to dev DB (no migration) |
| `npx prisma migrate dev` | Create migration for schema change |
| `npx prisma migrate deploy` | Apply migrations to production |
| `npx prisma studio` | Visual database browser |
| `npx prisma db seed` | Run seed script |

---

## Cross-References

| Resource | Location |
|----------|----------|
| IndexedDB schema | `/src/lib/db.ts` |
| Sync logic | `/src/lib/sync.ts` |
| Sync API routes | `/src/app/api/sync/` |
| Data model overview | `/CLAUDE.md` |

---

*Created: January 4, 2026*
