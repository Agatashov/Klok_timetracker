# Time Tracking App — Requirements Specification

## Product summary

A personal time-tracking tool for a freelancer/consultant who needs to log
hours against clients and projects, understand where their time actually
went, and hand clients a clean read-only summary — without giving them
access to the underlying workspace. Logging time should be as close to
zero-friction as possible; understanding time and sharing it should each
have their own dedicated view rather than being crammed into one screen.

Single-user tool. No authentication/accounts required for the owner; no
login required for anyone viewing a shared statement link.

---

## Primary user & core jobs

- **Who:** a solo consultant/freelancer tracking billable and non-billable
  hours across multiple clients and projects.
- **Job 1 — Log it fast:** capture what I worked on with minimal steps,
  whether I'm describing it after the fact or timing it live.
- **Job 2 — Understand it:** see where my time actually went — today, this
  week, this month, by client/project — without manually tallying a list.
- **Job 3 — Hand it off:** give a client or collaborator a clean summary
  for a date range, without exposing my full history or requiring them to
  create an account.
- **Job 4 — Keep the taxonomy tidy:** rename/merge/retire the projects,
  clients, and tags I organize time with, as an occasional admin task —
  not a daily one.

---

## Functional requirements

### A. Logging a time entry

1. A user can create a time entry with: a free-text description, a date,
   a duration, an optional project, zero or more tags, and a billable
   yes/no flag.
2. Duration can be entered either as a **duration value** (accepts
   flexible formats: "1h 30m", "1h30m", "90m", "1.5h", "1:30") or as an
   **explicit start time + end time**, with duration derived from the
   difference. Only one of the two is required at a time.
3. If start/end time is used and end time is earlier than start time
   (crossing midnight), duration must still compute correctly (wrap to
   next day) rather than going negative.
4. A user can select an existing project from a searchable list, or
   create a brand-new project inline (name + optional client name) without
   leaving the entry form. The newly created project is immediately
   selected.
5. A user can select zero or more existing tags from a searchable,
   multi-select list, or create brand-new tags inline by typing a name
   not already in the list. New tags are immediately selected.
6. The description field is optional; if left blank, the entry is still
   saved (with a neutral placeholder description) rather than blocked.
7. Date defaults to today; a user can log an entry for a different day.
8. A newly created entry appears in the entry history immediately without
   a full page reload.

### B. Live timer

9. A user can start a live timer instead of entering a duration. While
   running, elapsed time is visibly ticking (updates at least once per
   second) in a clock format (HH:MM:SS).
10. While the timer runs, the user can still set/change description,
    project, tags, and billable flag — these are captured at the moment
    the timer is stopped, not frozen at start time.
11. Stopping the timer immediately creates a time entry using the actual
    wall-clock start and stop times (so the entry has a real time range,
    not just a duration).
12. A running timer survives a page reload or navigating away and back —
    it does not lose elapsed time or reset. (Persisted client-side at
    minimum; a cross-device/cross-session requirement would need
    server-side persistence of "currently running" state.)
13. Only one timer runs at a time.

### C. Conversational / natural-language logging

14. A user can type a free-text sentence describing what they did and
    have the system parse it into a structured entry, rather than filling
    a form. Example inputs that must parse correctly:
    - "2h bug fixes on Acme, billable"
    - "1h30m client call #standup"
    - "45m unpaid standup"
    - "worked on design review for 1.5h yesterday"
15. The parser must extract, from anywhere in the sentence: a duration,
    a billable/non-billable signal (keywords like "billable",
    "unpaid"/"non-billable"), hashtag-style tags (`#tag`), a mention of an
    **existing** project by name, and a day reference ("today"/
    "yesterday"). Whatever text remains after removing these becomes the
    description, with dangling connector words/punctuation cleaned up
    (e.g. no leftover "on ," artifacts).
16. The system must **not** guess/auto-create a new project from free
    text — it only links to projects that already exist by exact/known
    name. (Rationale: a wrong auto-created project is worse than an
    unlinked entry the user can fix in two clicks.) New *tags* mentioned
    via `#hashtag` syntax MAY be auto-created, since tags are low-risk and
    low-cost to fix.
17. If no duration can be found in the sentence, the system must reject
    the input with a clear, actionable message rather than silently
    creating a zero-duration or garbage entry.
18. A user can ask a **question** instead of logging, and get a computed
    answer instead of a new entry. Must support at least: "how much
    (time) today/yesterday/this week/this month/all time", and the same
    scoped to a specific project by name ("how much on Acme this month").
    The system must distinguish a question from a log statement (e.g. via
    question-like phrasing or a trailing "?") so a log sentence is never
    misfiled as a query and vice versa.
19. Both log confirmations and question answers should be presented
    conversationally (a response to what the user just said), and the
    conversation history for the current session should remain visible
    as the user keeps interacting.

### D. Editing and deleting entries

20. A user can edit any existing entry's description, date, duration/time
    range, project, tags, and billable flag, prefilled with current
    values.
21. A user can delete an entry, with the deletion taking effect
    immediately in any list/summary that depends on it.

### E. Entry history / list

22. All entries are viewable in a single history, grouped by calendar
    day, each day showing a day total.
23. Each entry row/card shows: description, project (if any), tags (if
    any), billable status (if true), the time range (if the entry has
    one) or just duration, and the duration.
24. The list must reflect current data after any create/edit/delete
    without requiring a manual refresh.
25. An empty state (no entries yet) must be handled with guidance on how
    to create the first entry, not a blank/broken screen.

### F. Projects

26. A user can create, rename, and delete projects.
27. Each project has: a name, a visual color identifier (from a fixed
    palette is acceptable), and an optional link to a client.
28. Deleting a project must **not** delete its time entries — entries
    just become unlinked ("no project"), preserving history.
29. The management view shows, per project, how many time entries
    reference it.
30. Project color is used consistently everywhere a project appears
    (entry rows, pickers, breakdown charts) as a quick visual identifier.

### G. Clients

31. A user can create, rename, and delete clients, independent of
    projects.
32. A client has a name (minimum viable — additional fields like contact
    info are out of scope unless a future need arises).
33. A project can optionally be linked to one client.
34. Deleting a client must **not** delete or break its projects — they
    just become unlinked from that client.
35. Typing a client name while creating/editing a project should
    reuse an existing client of that name (case-sensitive exact match is
    acceptable) rather than creating a duplicate, and create a new client
    automatically if no match exists.
36. The management view shows, per client, how many projects reference
    it.

### H. Tags

37. A user can create, rename, and delete tags.
38. Tags are many-to-many with time entries (one entry can have multiple
    tags; one tag can apply to many entries).
39. The management view shows, per tag, how many time entries use it.
40. Renaming a tag updates its label everywhere it's already applied,
    without needing to re-tag entries individually.

### I. Overview / insights dashboard

41. A user can view aggregate totals for a selectable period: **this
    week**, **this month**, or **all time**.
42. For the selected period, show: total hours, billable hours (and
    billable hours as a % of the period total), and count of distinct
    days with at least one entry logged.
43. For week/month periods, show a comparison against the immediately
    preceding period of the same length (e.g. this week vs. last week) as
    a percentage delta. This comparison is not shown for "all time" (no
    meaningful prior period).
44. For week/month periods, show a day-by-day trend (bar chart or
    equivalent) of hours logged per day within that period, so a user can
    spot which days were heavy/light at a glance.
45. Show a breakdown of time by project (and its client, if any) for the
    selected period, sorted by time descending, with each project's share
    visually proportional (e.g. a bar whose length reflects its share of
    the period total) alongside the exact duration.
46. From the breakdown view, a user can jump directly into creating a
    shareable statement pre-scoped to the exact date range currently
    being viewed.

### J. Shareable statements ("reports")

47. A user can create a "statement": a saved combination of a title, a
    date range (from/to), and an optional single-project filter.
48. Creating a statement generates a unique, unguessable link that can be
    shared with anyone — no account or login required to view it.
49. The public statement view is **read-only** and must not expose any
    navigation back into the private app, any way to edit/create/delete
    data, or any entries/data outside the statement's specified date
    range/project filter.
50. The public statement view must show, computed live from current data
    (not a frozen snapshot at creation time): total hours, billable
    hours, average daily hours, and an itemized table of every matching
    entry (description, project + client, tags, time range, date,
    duration), plus a grand total.
51. The statement-creation form must offer quick shortcuts for common
    ranges (this week / this month / last month) so the user doesn't have
    to manually compute and type dates for the common case.
52. A user can view all previously created statements in one place, copy
    any statement's link to the clipboard, and delete a statement (which
    revokes the link — it should 404 or equivalent after deletion).
53. A statement's date range can be pre-filled by deep link (e.g. arriving
    from the Overview breakdown) rather than always starting blank.

### K. Cross-cutting / product-shell requirements

54. There is a persistent, low-friction way to navigate between: logging
    time, viewing insights, and managing statements — these being the
    high-frequency destinations.
55. Project/client/tag management, being a low-frequency admin task, is
    reachable but does not need equal visual weight to the high-frequency
    destinations (e.g. it can live behind a single settings entry point
    rather than three separate top-level nav items).
56. There is a marketing/landing entry point, separate from the working
    app, that explains what the product does and offers a way in — this
    does not need to be authenticated or share the app's internal
    navigation chrome.
57. The application must be usable on a mobile-width viewport: no
    horizontal page scrolling, navigation must not clip/overflow, and
    wide elements (tables) should scroll within their own container
    rather than breaking page layout.
58. Keyboard focus must be visible on all interactive elements; motion
    effects must be reduced/disabled when the user's system preference
    requests reduced motion.

---

## Data model (minimum viable shape)

- **TimeEntry**: description, date, optional startTime, optional
  endTime, durationSeconds, billable (bool), optional projectId, many
  tags, createdAt/updatedAt.
- **Project**: name, color, optional clientId.
- **Client**: name (unique).
- **Tag**: name (unique), many-to-many with TimeEntry.
- **Statement/Report**: title, dateFrom, dateTo, optional projectId
  filter, unique shareable slug, createdAt.

Relationships: Project → Client is many-to-one, optional. TimeEntry →
Project is many-to-one, optional, and must **not** cascade-delete entries
when the project is deleted (set-null instead). TimeEntry ↔ Tag is
many-to-many.

---

## Non-functional requirements

- **Timezone correctness:** date-only values (which calendar day an entry
  belongs to) must be handled in local time consistently on both write
  and read paths — converting through UTC (e.g. naive use of
  `toISOString()`) is a known source of off-by-one-day bugs and must be
  avoided.
- **Persistence:** entries, projects, clients, tags, and statements must
  survive a server restart — a relational database is expected, not
  in-memory state (the live-timer's "currently running" state is the one
  exception that may reasonably be client-side only).
- **No data loss on relationship cleanup:** deleting a project, client,
  or tag must never delete time entries; only the reference is removed.
- **Responsiveness of updates:** create/edit/delete actions should be
  reflected in any dependent view (list, dashboard totals) without
  requiring the user to manually refresh the page.
- **Privacy boundary:** the public statement view is a hard boundary —
  no code path should let a statement viewer reach owner-only data,
  actions, or navigation.

---

## Explicit non-goals (decided out of scope)

- Multi-user accounts, authentication, or per-user data isolation.
- Automatic creation of new projects from parsed natural language (only
  tags may be auto-created this way).
- Computing a monetary invoice amount from billable hours (a rate field
  and currency handling would be a distinct future feature, not covered
  here).
- Editing a statement after creation (title/range are fixed once
  created; the workaround is delete-and-recreate).
- Real-time collaboration or multi-device sync of a running timer.
