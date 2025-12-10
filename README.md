Minimal Project Management System (MPMS)

A production-oriented project management application built as a technical assessment.
Includes an Admin Dashboard and User Panel for managing projects, sprints, tasks, and progress reporting with role-based authentication.

Features

Authentication and Roles
• JWT-based login, register, current user
• Role-based access system: Admin, Manager, Member
• Public registration creates Member users
• Protected API routes and restricted UI actions based on role

Admin / Manager Capabilities

Project Management
• View all projects in a grid/list
• Create a project with: title, client, description, start date, end date, status
• Edit project details
• Delete projects
• Project details page includes:
– Total task count
– Completed tasks
– Tasks by status
– Number of sprints
– Progress percentage with progress bar

Sprint Management
• View all sprints under a project
• Create a sprint (title, auto-increment sprint number, start/end dates)
• Edit sprint details
• Delete sprint
• Sprint-level progress display showing “X of Y tasks done” with progress bar

Task Management
• View tasks grouped under their respective sprints
• Create a task with: title, description, priority, status, due date
• Edit task (title, description, priority, due date)
• Delete task
• Inline status update: To Do, In Progress, Review, Done
• Priority and status badges for improved clarity
• Task description preview inside task cards

Reporting
• Project summary includes:
– Total tasks
– Completed tasks
– Tasks categorized by status
– Number of sprints
– Visual progress bar
• Sprint-level progress indicators
• Time logging support (model-ready)

Member Capabilities
• View accessible projects
• View project sprints and tasks
• Read task details (description, priority, due date)
• Update task status where allowed
• Track project and sprint progress

User Interface and Experience
• Built with Next.js App Router using TypeScript
• Clean dashboard layout
• Tailwind CSS v4 for responsive design
• Toast notifications for feedback
• Fully responsive for desktop, tablet, and mobile
• Modal-based create and edit forms
• Clear hierarchy of Project → Sprint → Task

Tech Stack

Frontend
• Next.js 14 (App Router, TypeScript)
• React
• Tailwind CSS v4
• Axios with interceptors

Backend
• Node.js
• Express.js with TypeScript
• MongoDB with Mongoose
• JSON Web Tokens (JWT)
• Role-based authorization middleware
• REST API architecture

Architecture Overview
Frontend communicates with backend through REST APIs.
Backend handles authentication, authorization, CRUD operations, and reporting.
MongoDB stores all users, projects, sprints, tasks, and metrics.

Live Demo

Frontend: https://your-frontend-url.vercel.app

Backend API: https://your-backend-url.vercel.app

(Replace with actual deployed URLs)

Test Credentials

Admin User
Email: admin@example.com

Password: password123

Member User
Email: member@example.com

Password: password123

Local Installation

Backend

cd backend

npm install

npm run dev

Frontend

cd frontend

npm install

npm run dev

Completed Requirements Summary
• JWT authentication and role-based system
• Full CRUD for projects
• Full CRUD for sprints
• Full CRUD for tasks (including description)
• Inline task status update
• Project summary and progress bar
• Sprint-level progress
• Responsive UI
• Toast notifications
• Project status filter
• Clean and modular REST API structure

Notes
This project meets the core functional requirements with a scalable architecture.
Additional features like Kanban view, team management UI, comments, attachments, and extended reporting can be added in the future if needed.

End of README