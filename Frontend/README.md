<div align="center">

# ✨ Ripple
### Your story universe. Connected.
**A lore-aware writing workspace for building worlds, preserving canon, and keeping every story detail consistent.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Repository](https://github.com/mehulikhanra904-prog/RIPPLE) · [Issues](https://github.com/mehulikhanra904-prog/RIPPLE/issues)

</div>

---

## 📚 Contents
- [About](#-about-ripple)
- [Problem](#-the-problem)
- [Vision and workflow](#-our-approach)
- [Features](#-features)
- [Architecture](#-system-architecture)
- [Technology stack](#-technology-stack)
- [Project structure](#-project-structure)
- [Installation](#-getting-started)
- [Configuration](#-environment-configuration)
- [Backend integration](#-backend-integration)
- [Roadmap](#-roadmap)
- [Limitations](#-known-limitations)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Author and license](#-author--license)

## 🌌 About Ripple

Writing a long story is more than drafting chapters. A fictional universe can contain hundreds of characters, locations, relationships, historical events, rules, and timelines. As the story grows, remembering every detail—and ensuring new chapters do not contradict earlier ones—becomes difficult.

**Ripple** is a story-intelligence workspace designed to help writers organize fictional worlds and interact with story knowledge in a connected way.

The project explores **Retrieval-Augmented Generation (RAG)**, a connected **CanonGraph**, lore-aware chat, and continuity review. Ripple aims to make story knowledge easier to navigate, query, and maintain while keeping the writer in control of creative decisions.

> **Status:** Ripple is under active development. This repository currently contains a React frontend prototype/starter. Some screens use illustrative sample data; backend-powered functionality requires API and data integration.

## 🎯 The Problem

Writers working on novels, series, role-playing campaigns, or shared fictional universes often encounter:

- **Scattered lore:** notes, chapters, documents, and character sheets are difficult to search together.
- **Forgotten details:** facts introduced earlier can be lost as manuscripts grow.
- **Continuity conflicts:** ages, dates, locations, abilities, relationships, and event sequences may contradict earlier chapters.
- **Limited AI context:** a generic assistant may not know the complete universe or distinguish established canon from new suggestions.
- **Complex relationships:** connections between characters, events, places, and artifacts are hard to visualize.

## 💡 Our Approach

Ripple's product direction is to make story knowledge structured, searchable, and connected:

1. **Organize story material** into stories and chapters.
2. **Retrieve relevant lore** before responding to story questions.
3. **Connect canon entities** such as characters, places, and events.
4. **Ask natural-language questions** through a lore-aware chat interface.
5. **Review possible continuity conflicts** with context so the writer can decide what to change.

Ripple is intended to assist the author—not automatically overwrite or dictate canon.

## ✨ Features

### 🏠 Overview Dashboard
A central workspace for the selected story, with a quick view of chapter activity, canon information, graph connections, and continuity indicators. Current metrics are sample values.

### 📚 Story Library
A story-oriented interface for navigating projects and chapters. Story cards and management entry points are present; persistent creation, upload, and storage require backend integration.

### 💬 Lore Chat
A conversational UI for asking about characters, places, events, and lore. The frontend includes a starter API helper; answer quality and grounding depend on the backend retrieval pipeline.

### 🕸️ CanonGraph
A graph-oriented view intended to represent:
- Characters
- Locations
- Events
- Objects and artifacts
- Factions
- Relationships and connections

The current graph is a visual preview, not a live graph database explorer.

### 🛡️ Continuity Auditor
A dedicated interface for reviewing potential story inconsistencies. The long-term goal is to compare new material with established canon and present findings for human review. Current scores/findings are illustrative.

### 🎨 Workspace
- Dark UI with violet/indigo accents
- Collapsible desktop sidebar
- Mobile navigation
- Story selector
- Responsive layout
- Lucide React icons

## 🧠 System Architecture

### Conceptual architecture

```text
       ┌───────────────────────────────┐
       │          Ripple UI            │
       │   React + TypeScript + Vite   │
       └──────────────┬────────────────┘
                      │ HTTP / JSON
                      ▼
       ┌───────────────────────────────┐
       │          FastAPI API          │
       │ Chat · Stories · Graph · Audit│
       └──────────────┬────────────────┘
                      │
       ┌──────────────▼────────────────┐
       │     Story Processing / RAG    │
       │ Chunking · Embeddings · Search│
       │ Retrieval · LLM response      │
       └─────────┬─────────────┬───────┘
                 │             │
       ┌─────────▼──────┐ ┌────▼────────────┐
       │ Vector storage │ │ Canon / Graph  │
       │ Story chunks   │ │ Entities/links │
       └────────────────┘ └────────────────┘
```

This diagram describes the **intended integration direction**, not a claim that every component is already implemented or connected.

### Planned RAG lifecycle
1. Import story material.
2. Process and chunk text.
3. Generate embeddings for chunks.
4. Retrieve relevant passages for a question.
5. Provide retrieved context to the language model.
6. Return a response, ideally with source references.

### Planned canon and continuity lifecycle
1. Identify entities and facts in story material.
2. Store entities and relationships in a canon representation.
3. Compare new content with previously recorded facts.
4. Surface possible conflicts for writer review.

## 🧰 Technology Stack

| Technology | Role |
|---|---|
| React | Component-based frontend |
| TypeScript | Typed application code |
| Vite | Development server and production bundler |
| Tailwind CSS | Utility-first styling setup |
| Lucide React | UI icons |
| Axios | HTTP requests |
| FastAPI | Python API layer (integration target) |
| Sentence Transformers | Intended embedding generation |
| Ollama / Llama 3.2 | Intended local model integration |
| SQLite / vector storage | Intended persistence and retrieval |

The backend stack and implementation details may evolve as development progresses.

## 📁 Project Structure

```
RIPPLE/
├── src/
│   ├── App.tsx             # Main UI and workspace screens
│   ├── api.ts              # Axios/FastAPI helper functions
│   ├── main.tsx            # React entry point
│   └── styles.css           # Global styles and responsive UI
├── .env.example             # Example frontend environment config
├── index.html               # HTML entry and browser title
├── package.json              # Dependencies and scripts
├── package-lock.json         # npm dependency lockfile (if present)
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or newer (current LTS recommended)
- npm (comes with Node.js)
- Git
- VS Code or another editor

Check your installation:

```bash
node --version
npm --version
git --version
```

### 1. Clone the repository

```bash
git clone https://github.com/mehulikhanra904-prog/RIPPLE.git
cd RIPPLE
```

### 2. Install dependencies

```bash
npm install
```

If npm warns that a package install script was blocked, inspect the package and npm prompt before approving it. Avoid approving unknown scripts blindly.

### 3. Configure environment

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

Edit `.env` if your API runs at a different address.

### 4. Start development

```bash
npm run dev
```

Open the URL Vite prints—usually **http://localhost:5173**. Keep the terminal running while using the app; stop with `Ctrl + C`.

### 5. Production build

```bash
npm run build
npm run preview
```

The build output is generated in `dist/`.

## ⚙️ Environment Configuration

Set the frontend API URL in `.env`:

```env
VITE_API_URL=http://localhost:8000
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | FastAPI base URL | `http://localhost:8000` |

Vite exposes `VITE_*` values to browser code. **Never store private API keys, passwords, database credentials, or secrets in frontend environment variables.** Restart Vite after editing `.env`.

## 🔌 Backend Integration

Frontend API helpers are in **`src/api.ts`**:

| Helper | Request | Purpose |
|---|---|---|
| `getHealth()` | `GET /health` | Check API availability |
| `askLore(question, storyId)` | `POST /chat` | Send a question and story identifier |

These are starter contracts—not a guarantee that your backend currently exposes these routes. Match the URL, payload, and response handling to your actual FastAPI implementation. The chat UI currently reads an `answer` or `response` field.

### Example FastAPI CORS configuration

Allow the Vite origin during local development:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Suggested API areas (future integration)

| Area | Responsibility |
|---|---|
| Health | Service readiness |
| Stories | List/create/update/delete stories |
| Chapters | Import and retrieve chapter text |
| Chat | RAG-powered question answering |
| Canon graph | Retrieve entities and relationships |
| Continuity | Submit content and retrieve audit findings |

## 🧭 How to Use the Workspace

1. Open **Overview** for the story workspace snapshot.
2. Select a story using the story selector/sidebar.
3. Visit **Stories** to explore the library interface.
4. Open **Lore Chat** and enter a question (backend required).
5. Explore **CanonGraph** to inspect the graph preview.
6. Review **Continuity Auditor** to see the audit interface.

Some controls are currently scaffolding; their presence does not mean persistent backend functionality is implemented.

## 🗺️ Roadmap

### Frontend
- [x] Responsive workspace shell and navigation
- [x] Overview dashboard UI
- [x] Story library screen scaffold
- [x] Lore Chat interface
- [x] CanonGraph preview
- [x] Continuity Auditor screen
- [ ] Connect story management to APIs
- [ ] Add upload progress and document states
- [ ] Improve loading, empty, and error states
- [ ] Improve accessibility and keyboard navigation

### AI and data
- [ ] Connect story ingestion and chunking
- [ ] Integrate embeddings and vector retrieval
- [ ] Ground Lore Chat answers in retrieved sources
- [ ] Display source references in answers
- [ ] Connect live canon entities and relationships
- [ ] Implement continuity checks against established facts
- [ ] Add human review/feedback for audit findings
- [ ] Persist stories and workspace data

### Product
- [ ] Authentication and user workspaces
- [ ] Story export and backup
- [ ] Production deployment
- [ ] API documentation and tests

## ⚠️ Known Limitations

- Dashboard numbers and activity entries are demo data.
- Story cards and controls are not fully backed by persistent storage.
- CanonGraph is a preview, not a live graph database visualization.
- Continuity scores/findings are illustrative.
- Lore Chat requires a running FastAPI server and compatible `POST /chat`.
- The frontend does not implement embeddings, vector search, or LLM inference itself.
- AI accuracy and continuity detection require evaluation with real story material.

## 🧯 Troubleshooting

**`node` or `npm` not recognized:** Install Node.js, restart VS Code/terminal, and verify the version commands.

**Port 5173 is busy:** Vite may select another port. Use the address printed in the terminal.

**Chat cannot connect:** Start FastAPI, check `VITE_API_URL`, verify the route and payload, configure CORS, and inspect browser DevTools Console/Network.

**Environment changes do not apply:** Restart the Vite server after changing `.env`.

**Build fails:** Run `npm install`, then `npm run build`. Resolve the first reported TypeScript/module error before continuing.

## 🤝 Contributing

Suggestions, bug reports, and contributions are welcome!

1. Fork this repository.
2. Create a branch: `git checkout -b feat/your-feature`.
3. Make your changes.
4. Run `npm run build` to check the frontend.
5. Commit: `git commit -m "feat: describe your change"`.
6. Push and open a Pull Request.

For bugs or ideas, open a [GitHub Issue](https://github.com/mehulikhanra904-prog/RIPPLE/issues). Keep changes focused and never commit secrets or local environment files.

## 👩‍💻 Author & License

**Mehuli Khanra**  
B.Tech Computer Science & Engineering · Aspiring Agentic AI / ML Engineer

- GitHub: [@mehulikhanra904-prog](https://github.com/mehulikhanra904-prog)
- LinkedIn: [Mehuli Khanra](https://www.linkedin.com/in/mehuli-khanra-736964390/)

**License:** No license has been added yet. Until one is selected and committed, default copyright applies; do not assume reuse or redistribution permission.

---

<div align="center">

### Ripple
*Every detail has a place. Every story stays connected.*

**Built with curiosity, code, and ✨**

</div>
