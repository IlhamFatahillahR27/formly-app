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
3. Copy and run the script in:
   `supabase/migrations/20260811000000_init_formly_schema.sql`

---

## 📁 Project Directory Structure

```text
formly-app/
├── app/
│   ├── app.vue               # Root Nuxt UI App container
│   └── pages/
│       └── index.vue         # Landing page
├── supabase/
│   └── migrations/           # PostgreSQL DDL migrations & RLS policies
├── types/
│   └── supabase.ts           # Database TypeScript definitions
├── .env.example              # Environment variables template
├── nuxt.config.ts            # Nuxt 4 module configurations
├── package.json              # Project dependencies & scripts
├── requirement.md            # Software Requirements Specification (SRS)
└── roadmap.md                # Master implementation roadmap
```

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

Run test suite:

```bash
npm run test
```
