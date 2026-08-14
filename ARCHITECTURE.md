# Architecture — Student Launch

## Product boundary

Student Launch is structured as a reusable student-planning core with school-specific configuration layered on top.

```text
Student Launch Core
  ├─ student profile
  ├─ academics / transcript
  ├─ career + major Path Scan
  ├─ postsecondary route comparison
  ├─ college/training comparison
  ├─ funding / net-cost planning
  ├─ mission queue / next actions
  └─ privacy + official-resource handoff

School Configuration
  ├─ branding
  ├─ school/district/state identity
  ├─ pathways and programs
  ├─ readiness checklist
  ├─ school code
  ├─ official resources
  ├─ local funding context
  ├─ languages
  └─ pilot/adoption disclaimer
```

## Current public-demo implementation

The demo is intentionally dependency-light and runs entirely in the browser.

- student state persists in localStorage
- school configurations are data objects
- custom school editions can be created from School Setup
- changing the selected school updates branding, programs, readiness checks, resources, and local context
- no client-side API key is required

## Production upgrade path

A production school deployment should add:

1. authenticated student, counselor, and school-admin roles
2. server-side school configuration storage
3. row-level authorization / tenant isolation
4. encrypted student records where central persistence is actually needed
5. verified external program, deadline, scholarship, and cost data
6. import/export and counselor handoff workflows
7. audit logging for configuration and student-facing recommendations
8. accessibility, localization, district policy, and FERPA/privacy review before institutional adoption

## Design principle

Adding another school should be primarily a configuration/onboarding task rather than a software rebuild. McClure is the first configured pilot; the core application remains school-agnostic.