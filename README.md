# Formly - Interactive Section Flow Form Maker

**Formly** is a fullstack SaaS application built with Nuxt 4 and Supabase. It allows admins to create interactive surveys with section-based branching logic, manage questions via a visual canvas node diagram powered by `@vue-flow/core`, and analyze response reports with real-time charts.

---

## 🚀 Tech Stack

- **Frontend:** Nuxt 4, Nuxt UI (`@nuxt/ui`), Tailwind CSS, Vue 3
- **Visual Node Canvas:** `@vue-flow/core` & `@vue-flow/additional-components`
- **Backend & Database:** Supabase (PostgreSQL DDL, Supabase Auth, Row Level Security / RLS)
- **Data Visualization:** Chart.js & `vue-chartjs`
- **Type Safety:** Supabase auto-typed definitions (`types/supabase.ts`)
- **Testing:** Vitest, `@nuxt/test-utils`, `@playwright/test`

---

## 🛠️ Getting Started

### 1. Installation

Install project dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your remote Supabase credentials:

```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=<your-anon-public-key>
```

### 3. Database Migration (Supabase Dashboard)

To set up your Supabase PostgreSQL database tables, relationships, indexes, and Row Level Security (RLS) policies:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Copy and run the scripts in order:
   - Initial Schema: `supabase/migrations/20260811000000_init_formly_schema.sql`
   - Multi-Iteration Loop Support: `supabase/migrations/20260812000000_add_iteration_index_and_max_rating.sql`

---

## 📁 Project Directory Structure

```text
formly-app/
├── app/
│   ├── app.vue               # Root Nuxt UI App container
│   ├── components/
│   │   ├── builder/
│   │   │   ├── FormLinearEditor.vue    # Linear section & question editor component
│   │   │   ├── CanvasFlowDesigner.vue  # Vue Flow visual canvas designer component
│   │   │   └── nodes/
│   │   │       └── SectionNode.vue     # Custom Vue Flow node with collapsible sections
│   │   └── survey/
│   │       ├── QuestionEditor.vue      # Question parameters, choices, max rating & logic rules editor
│   │       ├── QuestionInput.vue       # Guest question input renderer, Google Reviews star rating & validation
│   │       ├── PreviewBanner.vue       # Floating sticky banner for interactive preview mode
│   │       └── ShareSurveyModal.vue    # Share modal with live QR code & high-res PNG graphic card exporter
│   ├── composables/
│   │   ├── useSurveys.ts               # Typed survey CRUD composable
│   │   ├── useSurveyBuilder.ts        # Single source of truth builder state & debounced position save
│   │   └── useSurveyRunner.ts         # Guest survey execution, dynamic logic engine & multi-iteration submission
│   ├── middleware/
│   │   └── auth.ts           # Route guard middleware for /admin/*
│   └── pages/
│       ├── index.vue         # Landing page
│       ├── survey/
│       │   └── [id].vue      # Public guest survey execution & preview page
│       └── admin/
│           ├── login.vue     # Admin login page
│           ├── dashboard.vue # Admin survey dashboard (grid, search, filter, status toggle)
│           └── survey/
│               ├── create.vue        # Survey creation form page
│               └── [id]/
│                   ├── edit.vue      # Dual-mode survey builder page
│                   ├── analytics.vue # Analytics dashboard page (Phase 7 placeholder)
│                   └── responses.vue # Survey responses & CSV export (Phase 7 placeholder)
├── supabase/
│   └── migrations/           # PostgreSQL DDL migrations & RLS policies
├── tests/
│   ├── unit/                 # Auth, survey service, runner & builder logic unit tests
│   ├── component/            # Vue component, preview banner & dual-mode sync tests
│   └── e2e/                  # Playwright E2E tests
├── types/
│   └── supabase.ts           # Database TypeScript definitions
├── .env.example              # Environment variables template
├── nuxt.config.ts            # Nuxt 4 module configurations
├── package.json              # Project dependencies & scripts
├── requirement.md            # Software Requirements Specification (SRS)
└── roadmap.md                # Master implementation roadmap
```

---

## 💻 Key Modules & Features

### Admin Survey Management Dashboard & Share Suites (Phase 3 & Extensions)
- **Dashboard View (`/admin/dashboard`)**: Lists all surveys owned by the logged-in admin. Features real-time search filtering, status toggling (Active/Public vs Inactive/Draft), section and response counters, and action links to Builder, Share QR, Analytics, Responses, and Delete confirmation modal.
- **Share & Graphic QR Card Exporter (`ShareSurveyModal.vue`)**: Allows admins to copy the public survey link with Toast notifications, view a live interactive QR Code preview, and export a high-resolution (1000x1300px) branded PNG graphic card. The exported card features Formly branding, formatted survey title, description, QR code, public URL, and scan instructions.
- **Survey Creation (`/admin/survey/create`)**: Form page to create a new survey. Automatically initializes an initial section ("Section 1") in `public.sections` and updates `public.surveys.start_section_id`.
- **Survey Composable (`useSurveys.ts`)**: Provides typed helper methods for `fetchSurveys()`, `createSurvey()`, `toggleSurveyStatus()`, and `deleteSurvey()`.

### Dual-Mode Survey Builder & Canvas Designer (Phase 4)
- **Builder Editor View (`/admin/survey/[id]/edit`)**: Interactive survey authoring suite with synchronized dual views: **Form Linear Editor** and **Canvas Flow Designer**. Features a top toolbar with real-time saving status, survey metadata, and a **Preview** button opening `/survey/[id]?preview=true` in a new tab.
- **Form Linear Editor (`FormLinearEditor.vue` & `QuestionEditor.vue`)**: Full management of survey sections (reordering, fallback "What Next?" next section selection, Start / End section flags) and questions (`short_text`, `long_text`, `multiple_choice`, `rating`). Includes dynamic option management for choice questions, customizable rating max star scale (1-10 stars with live editor preview), and an inline Logic Branching Rule editor.
- **Canvas Flow Designer (`CanvasFlowDesigner.vue` & `SectionNode.vue`)**: Drag-and-drop visual node map powered by `@vue-flow/core` featuring custom collapsible `SectionNode` cards, interactive connecting edge arrows, zoom/pan controls, background grid, and mini-map.
- **Debounced Position Saving & Logic Branching**: Automatically saves node canvas coordinates (`position_x`, `position_y`) with a 500ms debounce buffer on `onNodeDragStop`. Interactive line drawing connects choice options or sections to create/update `section_logic` branching rules and fallback section routes.
- **Builder Composable (`useSurveyBuilder.ts`)**: Serves as the Single Source of Truth managing reactive survey state, section CRUD, question CRUD, section logic rules, and debounced database persistence.

### Guest Survey Execution, Google Reviews Rating & Multi-Iteration Logic (Phase 5)
- **Public Survey Page (`/survey/[id]`)**: Accessible to unauthenticated guest users. Fetches active survey data, section sequence, questions, and section logic rules from Supabase. Features step progress tracking, required field validation, and responsive input components (`QuestionInput.vue`).
- **Google Reviews Style Rating Component**: Renders an interactive star rating scale matching Google Reviews UI (`#fbbc04` gold stars, hover highlight from star 1 to N, clickable rating scale, score indicator). Supports configurable max star rating up to 10.
- **Unlocked Choice Selection & Category Elimination**: Ensures all choice options remain unlocked and clickable in returned sections. In looped survey flows, previously completed category choices are tracked in `completedCategories` and automatically hidden from choice lists when looping back to category sections.
- **Multi-Iteration Database Persistence**: Preserves answers across all section visits/loops in a session. Inserts rows into `public.answers` tagged with `iteration_index`, ensuring full data retention without overwriting prior loop answers.
- **Dynamic Navigation Engine**: Evaluates `section_logic` rules for operators (`selected`, `filled`, `equals`, `not_equals`, `greater_than`, `less_than`) based on guest inputs to calculate target sections (`target_section_id`). Falls back seamlessly to `default_next_section_id` when conditions are unfulfilled.
- **Runner Composable (`useSurveyRunner.ts`)**: Encapsulates guest state, navigation stack, validation errors, state elimination, dynamic logic rule evaluation, multi-iteration section answer snapshots, and atomic DB insertion.

### Interactive Sandbox Preview Mode (Phase 6)
- **Preview Launcher**: Clicking the **Preview Mode** button in Builder opens `/survey/[id]?preview=true` in a new browser tab.
- **Sticky Preview Banner (`PreviewBanner.vue`)**: Detects `preview=true` or `preview=1` route query. Renders a sticky warning banner pinned directly under the Navbar (`sticky top-16 z-40`).
- **Database Insertion Bypass**: Automatically intercepts survey submission during preview mode to bypass Supabase `insert()` operations, displaying a simulated completion screen without polluting live survey responses in the database.

---

## 💻 Development Commands

Start the local development server:

```bash
npm run dev
```

Prepare Nuxt types & build output:

```bash
npx nuxi prepare
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run unit & component test suite:

```bash
npm run test
```

Run Playwright E2E tests:

```bash
npm run test:e2e
```
