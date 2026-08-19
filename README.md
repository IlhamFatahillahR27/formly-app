# Formly - Interactive Section Flow Form Maker

**Formly** is a fullstack SaaS application built with Nuxt 4 and Supabase. It allows admins to create interactive surveys with section-based branching logic, manage questions via a visual canvas node diagram powered by `@vue-flow/core`, analyze response reports with real-time Chart.js visual charts, and export Excel-compatible CSV reports.

---

## 🚀 Tech Stack

- **Frontend:** Nuxt 4, Nuxt UI (`@nuxt/ui`), Tailwind CSS, Vue 3
- **Visual Node Canvas:** `@vue-flow/core` & `@vue-flow/additional-components`
- **Backend & Database:** Supabase (PostgreSQL DDL, Supabase Auth, Row Level Security / RLS)
- **Data Visualization:** Chart.js & `vue-chartjs`
- **CSV Generator:** PapaParse with UTF-8 BOM (`\ufeff`) & JSONB choice flattener
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
│   │   ├── analytics/
│   │   │   ├── ChartPie.vue            # Chart.js Doughnut chart component (bounded height, cutout: 65%)
│   │   │   └── ChartBar.vue            # Chart.js Bar chart component for rating distribution
│   │   ├── builder/
│   │   │   ├── FormLinearEditor.vue    # Linear section & question editor component
│   │   │   ├── CanvasFlowDesigner.vue  # Vue Flow visual canvas designer component
│   │   │   └── nodes/
│   │   │       └── SectionNode.vue     # Custom Vue Flow node with collapsible sections
│   │   └── survey/
│   │       ├── QuestionEditor.vue      # Question parameters, choices, USwitch required toggle & clear buttons
│   │       ├── QuestionInput.vue       # Guest input renderer with deselect re-click & Kosongkan Jawaban clear button
│   │       ├── PreviewBanner.vue       # Floating sticky banner for interactive preview mode
│   │       ├── DemoBanner.vue          # Sticky top banner indicating guest in-memory demo mode
│   │       └── ShareSurveyModal.vue    # Share modal with live QR code & high-res PNG graphic card exporter
│   ├── composables/
│   │   ├── useDemoState.ts             # In-memory reactive demo store & pre-loaded sample surveys
│   │   ├── useDemoMode.ts              # Demo flag detector, link preservation & exit handler
│   │   ├── useSurveys.ts               # Typed survey CRUD composable (supports live & demo modes)
│   │   ├── useSurveyBuilder.ts        # Single source of truth builder state & status toggle
│   │   ├── useSurveyRunner.ts         # Guest survey execution, dynamic logic engine & inactive state guard
│   │   └── useSurveyAnalytics.ts      # Analytics aggregator, section metrics & Excel-compatible CSV generator
│   ├── middleware/
│   │   ├── auth.global.ts    # Global route guard middleware for /admin/* with demo bypass
│   │   └── auth.ts           # Per-route auth guard middleware
│   └── pages/
│       ├── index.vue         # Landing page with dynamic Demo / Admin actions
│       ├── survey/
│       │   └── [id].vue      # Public guest survey execution, preview mode & dedicated Inactive Survey screen
│       └── admin/
│           ├── login.vue     # Admin login page (with automatic demo state cleanup)
│           ├── dashboard.vue # Admin survey dashboard (grid, search, filter, USwitch status toggle)
│           └── survey/
│               ├── create.vue        # Survey creation form page
│               └── [id]/
│                   ├── edit.vue      # Dual-mode survey builder page with live status toggle switch
│                   ├── analytics.vue # Analytics dashboard & section summary highlight boxes
│                   └── responses.vue # Detailed survey responses table & Section-grouped detail modal
├── supabase/
│   └── migrations/           # PostgreSQL DDL migrations & RLS policies
├── tests/
│   ├── unit/                 # Auth, demo mode, survey service, runner, builder logic & analytics unit tests
│   ├── component/            # Vue component, preview banner, charts & dual-mode sync tests
│   └── e2e/                  # Playwright E2E & CSV export tests
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

### Interactive Guest Demo Mode (Zero Database Persistence)
- **Direct Guest Exploration**: Guest users can experience the complete Admin Portal (`/admin/dashboard`, `/admin/survey/create`, `/admin/survey/[id]/edit`, `/admin/survey/[id]/analytics`, `/admin/survey/[id]/responses`, and `/survey/[id]`) without needing to register or authenticate.
- **In-Memory Reactive Store (`useDemoState.ts`)**: Pre-populated with 2 rich, realistic interactive surveys (Customer Satisfaction Survey and Tech Workshop Registration) featuring multiple sections, rating scales, multiple choice questions, branching logic rules, diagram node coordinates, and sample responses.
- **Zero Database Persistence**: All operations in demo mode (survey creation, question additions, logic rule wiring in Vue Flow, analytics review, response inspection, CSV downloads) run exclusively in-memory without creating or modifying records in Supabase.
- **Visual Flag & Sticky Demo Banner (`DemoBanner.vue`)**: Activated via the `?demo=true` query parameter. Displays an Amber/Indigo status banner across admin views with a direct "Keluar Demo" exit action.
- **Landing Page Integration (`/`)**: Features a "Coba Demo Interaktif" button on the home page for guests, which is automatically hidden when an authenticated admin user is detected.
- **Automatic State Cleanup upon Admin Login (`login.vue`)**: When a guest transitions from demo mode to authenticating into a live admin account, the in-memory demo state is automatically flushed (`clearDemoState()`) and redirected to live Supabase data.

### Admin Survey Management Dashboard & Share Suites (Phase 3 & Extensions)
- **Dashboard View (`/admin/dashboard`)**: Lists all surveys owned by the logged-in admin (or in-memory demo surveys). Features real-time search filtering, status toggling using `USwitch` (Active/Public vs Draft/Inactive), section and response counters, and action links to Builder, Share QR, Analytics, Responses, and Delete confirmation modal.
- **Share & Graphic QR Card Exporter (`ShareSurveyModal.vue`)**: Allows admins to copy the public survey link with Toast notifications, view a live interactive QR Code preview, and export a high-resolution (1000x1300px) branded PNG graphic card.
- **Survey Creation (`/admin/survey/create`)**: Form page to create a new survey. Automatically initializes an initial section ("Section 1") in `public.sections` and updates `public.surveys.start_section_id`.

### Dual-Mode Survey Builder & Canvas Designer (Phase 4)
- **Builder Editor View (`/admin/survey/[id]/edit`)**: Interactive survey authoring suite with synchronized dual views (**Form Linear Editor** and **Canvas Flow Designer**) and a header `USwitch` status toggle for live publishing/unpublishing.
- **Form Linear Editor (`FormLinearEditor.vue` & `QuestionEditor.vue`)**: Full management of survey sections and questions (`short_text`, `long_text`, `multiple_choice`, `rating`). Includes dynamic option management, `USwitch` toggle for Required vs Optional state, "Kosongkan Teks" & "Kosongkan Opsi" buttons, customizable rating max star scale (1-10 stars), and inline Logic Branching Rule editor.
- **Canvas Flow Designer (`CanvasFlowDesigner.vue` & `SectionNode.vue`)**: Drag-and-drop visual node map powered by `@vue-flow/core` with debounced coordinate saving (500ms).

### Guest Survey Execution & Dedicated Inactive Survey View (Phase 5)
- **Public Survey Page (`/survey/[id]`)**: Accessible to guest users. Features step progress tracking, required field validation, category elimination in looped survey flows, and multi-iteration database persistence.
- **Dedicated Inactive Survey Screen**: Displays a friendly, branded "Survei Sedang Tidak Aktif" card with a lock icon, survey title badge, scan notice, and reload/home navigation buttons when a guest accesses an inactive survey.
- **Deselect & Clear Answer Capabilities (`QuestionInput.vue`)**: Allows users to deselect/uncheck choice options or star ratings by clicking again on an already selected item. Includes a "Kosongkan Jawaban" reset button for instant answer clearing.

### Interactive Sandbox Preview Mode (Phase 6)
- **Preview Launcher & Sticky Banner**: Opens `/survey/[id]?preview=true` in a new tab with a sticky warning banner (`PreviewBanner.vue`).
- **Database Bypass**: Intercepts submission during preview mode to bypass database `insert()` operations, displaying a simulated completion screen without polluting live response data.

### Analytics Report, Section Highlights & Excel-Compatible CSV Exporter (Phase 7)
- **Analytics Dashboard (`/admin/survey/[id]/analytics`)**: High-level KPI stat cards (Total Responden, Total Pertanyaan & Section, Rata-rata Rating, Respon Terakhir), **Section Executive Summary Highlight Boxes** (Section Average Rating, Top Choice Option, Section Participation Volume), and Chart.js visualizations (Responsive Doughnut chart, Bar chart for Rating distribution, Scrollable Text response feed).
- **Responses Grid Table (`/admin/survey/[id]/responses`)**: Nuxt UI v3 UTable grid with short hash Response IDs (`#042d544c`), formatted Indonesian date/timestamps (`12 Agu 2026, 18.46`), search filter, pagination, and a **Response Detail Modal** that groups respondent answers under Section headers with an explicit close button (`Tutup Modal`).
- **Excel-Compatible CSV Generator (`useSurveyAnalytics.ts`)**: Built adhering to `.skills/csv-generator.md` specification. Includes UTF-8 BOM (`\ufeff`) header prefix for Microsoft Excel compatibility, section-grouped column headers (`[Section 1: Judul Section] P1: Teks Pertanyaan`), short Response IDs (`#042d544c`), clean JSONB choice object extraction (recursively parses JSON choice objects into clean strings to prevent `[object Object]`), and CSV text escaping.

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
