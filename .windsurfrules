# BabySoothe-AI- Local Project Rule Set

This document defines the local coding, process, and quality standards for the BabySoothe-AI- project, synthesizing actual project artifacts, hackathon context, and best practices from Semantic Seed Venture Studio Coding Standards V3.0.

---

## 1. Project Scope & Philosophy
- **Purpose:** Rapid prototyping of a desktop app that detects baby moods via microphone and plays soothing sounds.
- **Status:** Experimental hackathon MVP. Not for real-world baby monitoring or safety.
- **Principle:** Favor simplicity, clarity, and hackability over polish. Prioritize working code and clear demo value.

## 2. Backlog & Workflow
- **Backlog:** All features, bugs, and chores are tracked in `issues.json` and mirrored as GitHub Issues.
- **Workflow:**
  1. Start from the top unstarted story (see `sprintplan.md`).
  2. Use branches: `feature/{id}` for features, `bug/{id}` for bugs, `chore/{id}` for chores.
  3. TDD/BDD is encouraged but not mandatory for hackathon speed. If used, write failing tests first, then make them pass, then refactor.
  4. Make frequent WIP commits to avoid losing progress.
  5. Pull requests should reference the relevant issue ID.
  6. Mark stories as Finished/Delivered in both local tracking and GitHub.

## 3. Coding Style
- **Language:** Python 3.9+ (primary), optionally JS/Electron for alternative UI.
- **Naming:**
  - Use `snake_case` for Python variables/functions.
  - Use `PascalCase` for classes.
  - Use `camelCase` for JS (if present).
- **Formatting:**
  - 4-space indentation.
  - Lines ≤ 80 characters when possible.
  - Use meaningful, up-to-date comments. Avoid stale comments.
- **Files:**
  - Main script: `main.py` (or `index.js` for Electron).
  - Place audio files in `sounds/`.
  - Place docs in Markdown files in project root.

## 4. Testing
- **Approach:**
  - Unit tests are optional for MVP but encouraged for core logic.
  - Use BDD style if writing tests (see Semantic Seed example).
  - Manual testing via UI and demo is acceptable for hackathon.
- **Test Structure:**
  - If present, separate unit, integration, and functional tests.

## 5. Architecture & Data Model
- **MVP:**
  - All audio processing and logic are local (no cloud for hackathon).
  - See `datamodel.md` for a scalable Supabase/Postgres model (future).
- **Core Loop:**
  - Listen via microphone → detect mood (rule-based or mock) → play/stop sound.
  - UI should display app state (Idle, Listening, Crying, Playing, Calm, etc.).

## 6. Security & Privacy
- **All audio stays local.** No network transmission of baby audio.
- **User data (settings, recordings) is local only for MVP.**
- **Warn users about volume hazards and privacy (see README.md).**

## 7. Documentation
- **README.md:** Always update if setup or usage changes.
- **prd.md:** Reference for requirements and goals.
- **sprintplan.md:** Reference for backlog, priorities, and DoD.
- **datamodel.md:** Reference for future scalable backend.

## 8. Definition of Done (DoD)
- App launches and runs on at least one dev machine.
- UI window appears.
- Start button activates listening; status is visible.
- Loud input triggers "Crying" state and sound playback.
- Quiet input triggers "Calm" state and stops playback.
- Stop button deactivates listening.
- Code is minimally commented and understandable.

## 9. Quality & Hackathon Practices
- Optimize for demo-ability and clear core loop.
- If blocked, mock or stub complex features (e.g., AI detection).
- Keep codebase clean: remove dead code, comment hacks.
- Make end-of-day commits, even if incomplete.

---

This rule set is tailored for the BabySoothe-AI- hackathon/MVP phase. For production or compliance work, refer to the full Semantic Seed Venture Studio Coding Standards V2.0 and extend/strengthen these rules as needed.
