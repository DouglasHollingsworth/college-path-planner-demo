# Architecture

## Public demo

```text
Student profile
   ↓
Readiness model
   ↓
Major-path mapper
   ↓
College-fit engine
   ↓
Funding-priority rules
   ↓
Next-best-action compressor
   ↓
Task tracker + decision audit
```

The public version is intentionally deterministic and browser-only. That keeps the logic inspectable and avoids exposing credentials or private student records.

## Production architecture

```text
Authenticated student/family workspace
        ↓
Next.js application
        ↓
Profile + goals + documents
        ↓
Verified data services
  ├─ college/program data
  ├─ deadlines
  ├─ scholarship sources
  ├─ financial-aid sources
  └─ benefit/program sources
        ↓
Decision service
  ├─ eligibility/rules
  ├─ fit scoring
  ├─ cost comparison
  ├─ source-aware AI analysis
  └─ next-best-action engine
        ↓
Supabase/PostgreSQL
  ├─ student profile
  ├─ schools
  ├─ applications
  ├─ scholarships
  ├─ tasks
  └─ source/audit records
```

## Engineering principles

- Separate factual eligibility from recommendations.
- Show the reason behind every important recommendation.
- Label estimates and inferred values.
- Keep source links and verification dates with time-sensitive facts.
- Never treat a model-generated admissions prediction as an official decision.
- Keep student PII private and access-controlled in production.
- Compress a large planning problem into a clear next action without hiding the underlying plan.