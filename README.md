# Student Launch — Universal Platform Demo

Student Launch is a reusable college, career, and postsecondary planning system designed to support many schools from one core application.

The product model is:

**Student Launch Core + School Configuration**

The student workflow stays the same while school-specific branding, pathways, official links, local funding context, readiness checks, school codes, languages, and pilot disclaimers are loaded from configuration.

## Included school editions

- **Universal Student Launch** — generic planning mode for any student or school.
- **McClure Student Launch** — configured pilot edition for McClure Health & Science High School.
- **Custom School Setup** — a browser-based configuration screen for creating another school edition without rebuilding the app.

## Core student workflow

- student profile and goals
- GPA, testing, course rigor, and transcript builder
- school program/pathway exploration
- career and major Path Scan
- postsecondary route comparison
- college/training comparison
- funding stack and simple net-cost planning
- mission queue with next-best actions
- official resource handoff
- local-browser persistence

## School configuration model

A school edition can provide:

- school name, short name, district, and state
- primary/accent colors
- school/program pathways
- certifications and local opportunities
- readiness checklist
- school code
- official counseling, district, college/career, graduation, and financial-aid resources
- supported languages
- pilot/adoption disclaimer

Custom school configurations are stored locally in the browser in this public demo. A production deployment can move configuration to a secure database and provide role-based administration.

## Privacy and boundaries

The public demo stores student-entered information in the browser. It does not require accounts or send grades to a central student database.

Student Launch is a planning layer. It does not replace counselors, transcripts, FAFSA, school/district systems, official college portals, or eligibility decisions.

## Portfolio purpose

This demo shows how a one-off school pilot can be converted into a reusable product architecture: one core system, many configured school editions.