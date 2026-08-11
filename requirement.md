# Software Requirements Specification (SRS): Formly

## 1. Executive Summary & Tech Stack

### 1.1 Project Overview
[cite_start]Formly adalah aplikasi web *Form Maker* ringan berbasis fullstack SaaS yang memungkinkan Admin membuat survei interaktif berbasis *Section Flow*, mengelola pertanyaan dinamis via *Canvas Node Diagram*, serta menganalisis laporan respon dalam bentuk grafik statistik[cite: 214]. [cite_start]Aplikasi ini menyediakan halaman survei publik yang dapat diakses oleh pengguna *Guest* secara fleksibel tanpa perlu melakukan proses login[cite: 215].

### 1.2 Tech Stack Architecture
* [cite_start]**Frontend Framework:** Nuxt 3 (Vue.js 3 - Minimal Template + Nuxt UI / Tailwind CSS) [cite: 216]
* [cite_start]**Canvas / Visual Diagram:** `@vue-flow/core` & `@vue-flow/additional-components` (Vue Flow untuk Node Canvas Diagram) [cite: 376]
* [cite_start]**Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Row Level Security / RLS) [cite: 216]
* [cite_start]**Component Library:** Nuxt UI (`@nuxt/ui`) + Iconify Icons [cite: 216]
* [cite_start]**Data Visualization:** Chart.js + `vue-chartjs` (atau Recharts) [cite: 216]
* [cite_start]**State & Data Fetching:** Nuxt Built-in Composables (`useFetch`, `useAsyncData`, `useState`, `useSupabaseClient`, `useSupabaseUser`) [cite: 216]
* [cite_start]**Type Safety:** Supabase CLI Auto-generated Types (`types/supabase.ts`) [cite: 216]

---

## 2. Database Schema & RLS Security

### 2.1 Complete SQL Migration Script
[cite_start]AI Agent WAJIB menggunakan skema DDL PostgreSQL berikut sebagai fondasi basis data di Supabase[cite: 217]:

```sql
-- 1. Tabel Surveys
CREATE TABLE public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_section_id UUID, -- Menentukan section PERTAMA yang akan dibuka guest
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabel Sections (Ditambahkan Posisi Canvas & Default Next Section)
CREATE TABLE public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position_x FLOAT NOT NULL DEFAULT 0, -- Koordinat X di Canvas
    position_y FLOAT NOT NULL DEFAULT 0, -- Koordinat Y di Canvas
    default_next_section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL, -- Fallback "What Next?"
    is_end_section BOOLEAN NOT NULL DEFAULT false, -- Jika true, section ini mengakhiri survei
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabel Questions
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text', 'multiple_choice', 'rating')),
    is_required BOOLEAN NOT NULL DEFAULT true,
    options JSONB, -- Opsi Pilihan Ganda: [{"id": "opt_1", "text": "Kategori A"}, ...]
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabel Section Logic (Ditambahkan Operator Panah & Trigger)
CREATE TABLE public.section_logic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    source_section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE, -- Section Asal
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE, -- Pertanyaan Pemicu
    
    -- Jenis Operator Panah
    operator TEXT NOT NULL DEFAULT 'selected' CHECK (operator IN ('selected', 'filled', 'equals', 'not_equals', 'greater_than', 'less_than')),
    
    condition_value JSONB, -- Nilai pemicu (null jika operator = 'filled')
    target_section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE, -- Section Tujuan Panah
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabel Responses
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabel Answers
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign Key Constraint untuk Surveys -> Start Section (Circular Safety)
ALTER TABLE public.surveys 
ADD CONSTRAINT fk_surveys_start_section 
FOREIGN KEY (start_section_id) REFERENCES public.sections(id) ON DELETE SET NULL;

-- Indexing Optimasi Kueri
CREATE INDEX idx_questions_section_id ON public.questions(section_id);
CREATE INDEX idx_sections_survey_id ON public.sections(survey_id);
CREATE INDEX idx_section_logic_survey_id ON public.section_logic(survey_id);
CREATE INDEX idx_section_logic_question_id ON public.section_logic(question_id);
CREATE INDEX idx_section_logic_target_section_id ON public.section_logic(target_section_id);
CREATE INDEX idx_responses_survey_id ON public.responses(survey_id);
CREATE INDEX idx_answers_response_id ON public.answers(response_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);

```

### 2.2 Row Level Security (RLS) Rules

Setiap tabel WAJIB mengaktifkan RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`) dengan kebijakan:

1. **`public.surveys` & `public.sections` & `public.questions` & `public.section_logic**`
* 
**SELECT (Public/Guest):** Diizinkan jika `surveys.is_active = true`.


* 
**ALL (Admin/Owner):** Diizinkan HANYA JIKA `auth.uid() = surveys.admin_id`.




2. **`public.responses` & `public.answers**`
* 
**INSERT (Public/Guest):** Diizinkan tanpa autentikasi (Role `anon` & `authenticated`).


* 
**SELECT (Admin/Owner):** Diizinkan HANYA jika Admin adalah pemilik survei terkait.


* 
**UPDATE/DELETE:** Ditolak untuk semua pengguna (Immutable).





---

## 3. Detailed Feature Specifications

### 3.1 Module 1: Admin Authentication & Security

* 
**REQ-AUTH-01 (Login Admin):** Halaman `/admin/login` menggunakan Supabase Auth (`signInWithPassword`). Pesan error ditampilkan via `UAlert`/Toast bawaan Nuxt UI.


* 
**REQ-AUTH-02 (Route Protection):** Middleware `/middleware/auth.ts` memproteksi seluruh route `/admin/*` via `useSupabaseUser()`. Redirect ke `/admin/login` jika tidak ada sesi.


* 
**REQ-AUTH-03 (Logout):** Tombol logout menjalankan `supabase.auth.signOut()` lalu redirect ke `/admin/login`.



### 3.2 Module 2: Survey Builder & Canvas Designer (Dual Mode)

* **REQ-BUILDER-VIEW (Dual-Mode Editor):**
* Halaman `/admin/survey/[id]/edit` memiliki sakelar mode (Tabs): **Form Linear Editor** vs **Canvas Designer**.


* Menggunakan *Single Source of Truth*: Perubahan di Form Linear otomatis terupdate di Canvas Designer dan sebaliknya.




* **REQ-CANVAS-DESIGNER (Vue Flow Integration):**
* Tampilan berbasis node menggunakan library **Vue Flow**.


* Fitur Canvas: *Zoom In/Out*, *Panning*, serta *Infinite Workspace* (canvas melebar otomatis).


* **Collapsible Nodes:** Section dapat di-*expand/collapse* untuk menampilkan daftar pertanyaan. Pertanyaan pilihan ganda dapat di-*expand* untuk menampilkan opsi jawaban.


* 
**Interactive Connecting Edges:** Admin dapat menarik garis panah dari suatu opsi/pertanyaan ke *Section* tujuan.


* Menyimpan koordinat `position_x` dan `position_y` ke DB saat node digeser.




* **REQ-LOGIC-BRANCHING (Advanced Logic Rules):**
* Mendukung operator garis panah: `selected` (Opsi dipilih), `filled` (Jawaban diisi/tidak kosong), `equals`, `not_equals`, `greater_than`, `less_than`.


* Pengaturan `default_next_section_id` ("What Next?") sebagai fallback jika tidak ada kondisi yang terpenuhi.


* Penanda `is_end_section` untuk menandai akhir dari alur survei.





### 3.3 Module 3: Interactive Sandbox Preview

* **REQ-PREVIEW-MODE (New Tab Preview Flag):**
* Di halaman editor terdapat tombol **Preview** yang membuka tab baru ke URL `/survey/[id]?preview=true`.


* 
**Floating Preview Banner:** Tampilan publik mendeteksi `route.query.preview === 'true'` dan menampilkan banner peringatan: *"⚠️ Mode Preview: Jawaban tidak akan disimpan."*.


* 
**Bypass Database Insert:** Saat pengguna menekan tombol Submit di Mode Preview, transaksi `INSERT` ke Supabase **di-bypass** (tidak disimpan) dan langsung menampilkan alert simulasi sukses.





### 3.4 Module 4: Guest Survey Execution & Dynamic Logic

* **REQ-GUEST-FLOW (Dynamic Navigation & Back Tracking):**
* Halaman `/survey/[id]` dibuka publik oleh *Guest* tanpa login.


* Navigasi berdasarkan evaluasi `section_logic`: Jika opsi A dipilih, arahkan ke `target_section_id`. Jika tidak ada logic, gunakan `default_next_section_id`.


* 
**State Elimination (Kasus Kembali ke Section Kategori):** Frontend menyimpan array `completedCategories` di `useState`. Jika user kembali ke Section Kategori, opsi kategori yang sudah pernah diselesaikan otomatis dielektrik/dihilangkan dari pilihan.




* **REQ-GUEST-SUBMIT (Atomic Submission):**
* Validasi *front-end* untuk pertanyaan `is_required = true`.


* Saat tombol Submit Final di tekan, simpan data ke `public.responses` dan `public.answers` secara berurutan (*Atomic Transaction*).





### 3.5 Module 5: Reporting & Analytics Dashboard (Admin)

* **REQ-REP-ANALYTICS (Graphical Summary):**
* Route `/admin/survey/[id]/analytics` menampilkan visualisasi grafik.


* 
*Multiple Choice & Rating:* Tampilan *Pie Chart* / *Bar Chart* berbasis SQL Aggregation (`COUNT`, `GROUP BY`).


* 
*Text Responses:* Tampilan daftar respon teks terbaru.




* **REQ-REP-RESPONSES (Detail Responses & CSV Export):**
* Route `/admin/survey/[id]/responses` menampilkan tabel interaktif `UTable`.


* Tombol **Export CSV** untuk mengunduh seluruh data jawaban responden dalam format `.csv`.





---

## 4. Directory Structure Standards

AI Agent WAJIB menyusun struktur folder sesuai standar Nuxt 3 berikut:

```text
formly-app/
├── assets/
│   └── css/main.css
├── components/
│   ├── AppNavbar.vue
│   ├── survey/
│   │   ├── QuestionEditor.vue
│   │   ├── QuestionInput.vue
│   │   └── PreviewBanner.vue
│   ├── builder/
│   │   ├── FormLinearEditor.vue
│   │   ├── CanvasFlowDesigner.vue
│   │   └── nodes/
│   │       └── SectionNode.vue      # Custom Node Vue Flow
│   └── analytics/
│       ├── ChartBar.vue
│       └── ChartPie.vue
├── middleware/
│   └── auth.ts
├── pages/
│   ├── index.vue
│   ├── survey/
│   │   └── [id].vue                 # Public Guest Survey & Preview Page
│   └── admin/
│       ├── login.vue
│       ├── dashboard.vue
│       └── survey/
│           ├── create.vue
│           └── [id]/
│               ├── edit.vue         # Builder (Linear & Canvas View)
│               ├── analytics.vue    # Analytics Graphs
│               └── responses.vue    # Detail Answers Table
├── types/
│   └── supabase.ts                  # Auto-generated Supabase Types
├── app.vue
├── nuxt.config.ts
└── .env

```

---

## 5. Coding Rules & Implementation Constraints for AI Agent

AI Agent HARUS mematuhi aturan penulisan kode berikut:

1. **Type Safety Strictness:** Dilarang keras menggunakan tipe `any`. Gunakan tipe otomatis dari `types/supabase.ts` yang di-generate via CLI Supabase.


2. 
**Nuxt UI First Strategy:** Utamakan komponen bawaan Nuxt UI (`UButton`, `UInput`, `UTextarea`, `USelect`, `UTable`, `UCard`, `UModal`, `UTabs`, `UToggle`, `UNotifications`).


3. **Canvas Performance:** Gunakan komponen kustom Vue Flow secara efisien. Pastikan event `onNodeDragStop` memicu *debounce save* ke database agar tidak membombardir kueri ke Supabase saat node digeser.


4. 
**Data Fetching Pattern:** Gunakan `useAsyncData` atau `useFetch` untuk SSR datafetching.


5. **Security & Secrets:** Dilarang mengekspos `SUPABASE_SERVICE_ROLE_KEY` di client-side. Gunakan `useSupabaseClient()` dan manfaatkan RLS Postgres.