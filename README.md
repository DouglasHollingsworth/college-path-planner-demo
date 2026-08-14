# College Path Planner Demo

A public, demo-safe college planning system that turns a student profile into a practical path: academic fit, career direction, college strategy, financial-aid priorities, application tasks, and a next-best-action plan.

## What this demonstrates

- student profile intake
- major and career-path exploration
- college-fit scoring with transparent reasoning
- reach / target / likely grouping
- affordability and aid planning prompts
- scholarship/application task tracking
- priority compression into the next best action
- explainable decision support instead of black-box recommendations

## Live demo

After GitHub Pages is enabled, the site will be available at:

`https://douglaskai09.github.io/college-path-planner-demo/`

## Public-demo design

This repository uses a fictional student profile and local browser storage. It does not contain private student records or claim to provide official admissions decisions, scholarship eligibility, or financial-aid determinations.

The public version uses a transparent deterministic recommendation engine so visitors can inspect how decisions are made. A production version could connect to verified college datasets, scholarship sources, application deadlines, authenticated family/student accounts, and server-side AI analysis.

## Decision signature

**Profile → Explore → Match → Fund → Plan → Act → Verify**

Every recommendation should answer two questions:

1. Why is this being recommended?
2. What should the student do next?

## Production path

A production implementation could use Next.js, Supabase/PostgreSQL, authenticated student/family workspaces, official data integrations, server-side AI, deadline notifications, document tracking, and source-aware verification.

## Important limitation

This is a portfolio demonstration, not an admissions, legal, or financial-aid service. Real-world decisions should be verified against current official college, FAFSA, VA, state, and scholarship sources.