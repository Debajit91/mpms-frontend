# Minimal Project Management System (MPMS)

A minimal, production-minded Project Management System built as a recruitment assignment.  
The app provides a simple Admin Dashboard and User Panel to manage projects, sprints, and tasks, with basic reporting and progress tracking.

---

## Features

### Authentication & Roles

- JWT-based authentication (login, register, current user)
- Role-based access:
  - Admin
  - Manager
  - Member
- Public registration creates `Member` users
- Admin/Manager-only actions protected on both backend and frontend

### Admin / Manager Features

- Login to admin dashboard
- Project management:
  - View all projects in a grid/list
  - Create new project (title, client, status, dates)
  - Project detail view
- Sprint management:
  - View sprints per project
  - Create new sprint (title, sprint number auto, start/end dates)
- Task management:
  - View all tasks for a project
  - Create task under a specific sprint
  - Set status, priority, due date
  - Inline status updates (To Do / In Progress / Review / Done)
- Reports (per project):
  - Total tasks
  - Completed tasks
  - Tasks by status (todo / in_progress / review / done)
  - Sprint count
  - Time logged (aggregated from tasks)
  - Progress percentage and visual progress bar

### Member Features

- Login to user panel
- View accessible projects
- View sprints and tasks under a project
- See own project progress and task status
- (Depending on role rules) Update task statuses where allowed

### UI / UX

- Next.js App Router with TypeScript
- Clean, minimal dashboard-style layout
- Landing page with hero and navigation to Login / Sign up
- Responsive layout:
  - Works on desktop, tablet, and mobile
- Simple, readable design using Tailwind CSS

---

## Tech Stack

### Frontend

- Next.js (App Router, TypeScript)
- React
- Tailwind CSS v4
- Axios (API client)

### Backend

- Node.js
- Express.js (TypeScript)
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for auth
- Role-based middleware

---

## High-Level Architecture

- Frontend and backend are separate applications.
- Frontend communicates with backend via REST APIs.
- Backend manages:
  - Auth
  - Users
  - Projects
  - Sprints
  - Tasks
  - Summary/reporting endpoints
- Frontend consumes these APIs and renders:
  - Auth flow
  - Admin dashboard
  - Project detail with sprints and tasks
  - Progress summaries

---

## Live Demo

Replace these with your actual deployed URLs:

- Frontend: `https://mpms-frontend.vercel.app`
- Backend: `https://mpms-iota.vercel.app`

---

## Test Credentials

Example admin user (seeded via API or DB):

- Role: Admin  
- Email: `admin@example.com`  
- Password: `password123`

Example member user (optional):

- Role: Member  
- Email: `member@example.com`  
- Password: `password123`

---


