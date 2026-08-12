# WebGen AI

WebGen AI is a full-stack website generation platform with a React/Vite frontend and an Express/MongoDB backend. It allows authenticated users to generate responsive React websites from natural language prompts, preview and edit generated code, request AI-guided revisions, publish sites publicly, and export projects as downloadable bundles.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Backend](#backend)
  - [Server Setup](#server-setup)
  - [API Endpoints](#api-endpoints)
  - [Database Models](#database-models)
  - [AI Services](#ai-services)
- [Frontend](#frontend)
  - [React App Structure](#react-app-structure)
  - [Client Behavior](#client-behavior)
- [Authentication](#authentication)
- [Publishing and Preview](#publishing-and-preview)
- [Project Export](#project-export)
- [Environment Variables](#environment-variables)
- [Setup and Run](#setup-and-run)
- [Dependencies](#dependencies)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)

---

## Project Overview

WebGen AI is designed to automate website creation using AI. Users can log in, provide an idea prompt, and the backend generates a complete React project using an AI service. The app supports:

- project creation from natural language prompts
- progressive generation with real-time status updates
- code editing and auto-save
- AI revision prompts for existing generated projects
- public publishing of completed sites
- download/export of generated project source code

---

## Key Features

- **AI project generation:** Create website projects from user prompts.
- **Progressive file generation:** Backend stores project state and updates files as they are created.
- **Chat-style revisions:** Submit revision prompts and let AI patch files.
- **Protected user accounts:** Email/password authentication with JWT cookies.
- **Public publishing:** Publish projects for public access without authentication.
- **Project export:** Download a generated project as a ZIP with starter `package.json`, `vite.config.js`, and app files.

---

## Architecture

The project is split into two applications:

1. **Client (`client/`)**
   - React 19 application with Vite.
   - Uses `react-router-dom` for navigation.
   - Stores auth state and project editing state in a React context.
   - Communicates with the backend through Axios.

2. **Server (`server/`)**
   - Express 5 server API.
   - Uses MongoDB through Mongoose.
   - Handles authentication, project storage, AI generation, revision operations, and publishing.
   - Integrates with the OpenRouter API for AI-driven generation.

---

## Folder Structure

Root structure:

- `client/` - Frontend application.
- `server/` - Backend application.

Key subfolders:

- `client/src/api/` - Axios API client.
- `client/src/components/` - Reusable UI components.
- `client/src/context/` - Application context provider.
- `client/src/pages/` - Page route components.
- `client/src/utils/` - Utility helpers such as export logic.
- `server/controllers/` - API controller handlers.
- `server/routes/` - API route definitions.
- `server/middleware/` - Express middleware for auth.
- `server/models/` - Mongoose data models.
- `server/services/` - AI generation, diff application, prompt definitions, normalization.
- `server/config/` - Database connection code.

---

## Backend

### Server Setup

The backend entrypoint is `server/server.js`.

- Loads environment variables with `dotenv`.
- Connects to MongoDB via `server/config/db.js`.
- Enables CORS for allowed origins defined by `ORIGINS`.
- Uses `cookie-parser` and JSON body parsing.
- Mounts auth and project routes.
- Provides centralized error handling.

### API Endpoints

**Auth routes (`/api/auth`)**
- `POST /register` - Create a new user and set a JWT session cookie.
- `POST /login` - Authenticate a user and set a JWT session cookie.
- `POST /logout` - Clear the session cookie.
- `GET /me` - Return the authenticated user's profile.

**Project routes (`/api/projects`)**
- `POST /` - Create a new AI-generated project from a prompt.
- `GET /` - List all projects for the authenticated user.
- `GET /:id` - Get full details of a single project.
- `DELETE /:id` - Delete a project.
- `PUT /:id/files` - Save edited project files.
- `POST /:id/publish` - Publish a project publicly.
- `POST /:id/chat` - Send a revision prompt to AI and apply patch operations.
- `GET /public/:id` - Fetch a publicly published project's files without auth.

### Database Models

**`User`**
- `name`: String
- `email`: String (unique)
- `password`: String (hashed with bcrypt)
- timestamps

**`Project`**
- `name`: String
- `description`: String
- `files`: Mixed object storing file content and hashes
- `messages`: Array of chat messages for assistant/user context
- `version`: Number
- `owner`: ObjectId link to `User`
- `published`: Boolean
- `status`: `pending`, `generating`, `revising`, `completed`, or `failed`
- `filesPlanned`: Planned file list from AI generation
- `filesGenerated`: Generated file paths
- `currentFile`: Current file in progress
- `error`: Error message when generation fails
- timestamps

### AI Services

The AI integration is primarily in `server/services/ai.js` and `server/controllers/projectController.js` / `server/controllers/chatController.js`.

Generation flow:

1. `generateProject(prompt, callbacks)` plans files with AI using a schema.
2. Files are generated in parallel by `generateSingleFile`.
3. Each file is validated and normalized before being saved.
4. The project is updated progressively with status and generated files.
5. If files fail, fallback placeholder content is generated for robustness.

Revision flow:

- `reviseProject(prompt, manifest, relevantFiles, recentMessages)` sends current file manifest and contents to AI.
- AI returns operations (`create`, `update`, `delete`) and a short description.
- `applyOperations` applies changes in `server/services/diff.js`.

Other AI-related files:

- `server/services/prompts.js` - System prompts for file planning and revision.
- `server/services/contentNormalizer.js` - Cleans AI-generated code and escaped characters.

### Auth Middleware

`server/middleware/authMiddleware.js` verifies the JWT in the `token` cookie and attaches the decoded user to `req.user`.

---

## Frontend

### React App Structure

The React app lives in `client/src/`.

Main application files:

- `client/src/App.jsx` - React router configuration.
- `client/src/context/AppContext.jsx` - Global state for user, projects, active project, and actions.
- `client/src/pages/AuthPage.jsx` - Login/register UI.
- `client/src/pages/HomePage.jsx` - Landing page and project list.
- `client/src/pages/BuilderPage.jsx` - Builder workspace with file explorer, chat panel, preview, publish.
- `client/src/pages/PreviewPage.jsx` - Full page project preview.
- `client/src/pages/PublishPage.jsx` - Public published site viewer.

Common pages:

- `AuthLayout` protects authenticated routes.
- `GuestLayout` redirects logged-in users away from auth pages.

### Client Behavior

The frontend uses `axios` with `withCredentials: true` to send cookies to the backend.

Key features:

- Auth checks on load via `/api/auth/me`.
- Project listing from `/api/projects`.
- Project loading from `/api/projects/:id`.
- Project creation via `/api/projects`.
- Chat revision via `/api/projects/:id/chat`.
- Publishing via `/api/projects/:id/publish`.
- Public fetch via `/api/projects/public/:id`.
- Auto-save of manual code edits through debounced `PUT /api/projects/:id/files`.
- Export to ZIP using `jszip` and `file-saver`.

### UI Components

Notable reusable components include:

- `PromptInput` - Prompt entry field for project generation.
- `BuilderHeader` - Controls and buttons for the builder.
- `ChatPanel` - Chat interface for revision prompts.
- `FileExplorer` - Browse generated project files.
- `PreviewPanel` / `FullPagePreview` - Render generated web app content.
- `AgentProgressDashboard` - Show generation progress and status.
- `PublishModel` - Publish success dialog.
- `Loading` - Loading spinner and placeholder.

---

## Authentication

Authentication is cookie-based JWT using `jsonwebtoken`.

- Login / register endpoints set a `token` cookie.
- The backend checks this cookie for protected routes.
- Logout clears the cookie.
- `AuthLayout` requires an authenticated session.

---

## Publishing and Preview

Users can publish a project publicly using `POST /api/projects/:id/publish`.

- Published projects become accessible at `/publish/:id`.
- Public routes do not require authentication.
- The public page loads the project and renders it using `FullPagePreview`.

---

## Project Export

The frontend export feature is implemented in `client/src/utils/exportProject.js`.

It:

- Collects generated project files from the active project.
- Detects dependencies from imports.
- Creates a ZIP package with:
  - `package.json`
  - `vite.config.js`
  - `index.html`
  - `src/index.jsx`
  - generated `src/*` files
- Triggers download via `file-saver`.

---

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/webgen-ai
JWT_SECRET=your_jwt_secret
ORIGINS=http://localhost:5173
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
AI_MAX_CONCURRENCY=6
NODE_ENV=development
```

Notes:

- `ORIGINS` is a comma-separated list of allowed frontend origins.
- `OPENROUTER_API_KEY` is required for AI generation.
- `OPENROUTER_MODEL` defaults to `openrouter/free` if not set.
- `AI_MAX_CONCURRENCY` controls parallel file generation.

---

## Setup and Run

### Backend

From the project root:

```bash
cd server
npm install
npm run dev
```

This starts the Express server on `http://localhost:3000` by default.

### Frontend

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

This starts the Vite app, usually on `http://localhost:5173`.

### Full Flow

1. Register or login in the frontend.
2. Enter a prompt on the home page.
3. The backend creates a project and starts AI generation.
4. The builder page polls project status until completion.
5. Edit code, send revision prompts, publish, or export the project.

---

## Dependencies

### Client

- `react`
- `react-dom`
- `react-router-dom`
- `react-hot-toast`
- `axios`
- `jszip`
- `file-saver`
- `lodash.debounce`
- `lucide-react`
- `moment`
- `tailwindcss`
- `vite`
- `@vitejs/plugin-react`
- `oxlint`

### Server

- `express`
- `mongoose`
- `dotenv`
- `cookie-parser`
- `cors`
- `bcrypt`
- `jsonwebtoken`
- `@ai-sdk/openai`
- `ai`
- `p-map`
- `zod`
- `nodemon` (dev)

---

## Troubleshooting

- `401 Unauthorized` on API requests: confirm the frontend is using credentials and the backend is setting `ORIGINS` correctly.
- AI generation errors: verify `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.
- MongoDB connection failures: verify `MONGODB_URI` and that MongoDB is running.
- CORS issues: ensure `ORIGINS` includes the frontend origin.

---

## Notes

- The backend saves AI state progressively so users can watch generation in real time.
- Revision requests work by sending the current file manifest and contents to the AI, then applying patch operations.
- Published projects are retrievable by anyone with the publish URL.
- The export feature produces a standalone Vite/React app bundle.

---

## Recommended Improvements

If you extend this project, consider adding:

- better validation and sanitization for prompts and file updates
- role-based access control
- file-level preview/edit diff support
- stable public hosting for generated preview files
- more robust AI prompt logging and error diagnostics

---

## License

This repository does not include a license file. Add one if you plan to publish or share the code.
