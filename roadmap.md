# Formly - Master Project Roadmap & Execution Plan

> **Formly** adalah aplikasi web *Form Maker* ringan berbasis fullstack SaaS yang memungkinkan Admin membuat survei interaktif berbasis *Section Flow*, mengelola pertanyaan dinamis via *Canvas Node Diagram*, serta menganalisis laporan respon dalam bentuk grafik statistik.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** Nuxt 4 / Vue 3 (`app/` structure, minimal template + Nuxt UI)
- **Canvas / Visual Diagram:** `@vue-flow/core` & `@vue-flow/additional-components`
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Row Level Security / RLS)
- **Component Library:** Nuxt UI (`@nuxt/ui`) + Iconify Icons
- **Data Visualization:** Chart.js + `vue-chartjs`
- **Testing Suite:** Vitest + `@nuxt/test-utils` (Unit & Component Testing), `@playwright/test` (E2E Testing), Supabase local / RLS test suite
- **Type Safety:** Supabase CLI Auto-generated Types (`types/supabase.ts`)

---

## 📂 Project Directory Standard

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
│   │       └── SectionNode.vue
│   └── analytics/
│       ├── ChartBar.vue
│       └── ChartPie.vue
├── middleware/
│   └── auth.ts
├── pages/
│   ├── index.vue
│   ├── survey/
│   │   └── [id].vue
│   └── admin/
│       ├── login.vue
│       ├── dashboard.vue
│       └── survey/
│           ├── create.vue
│           └── [id]/
│               ├── edit.vue
│               ├── analytics.vue
│               └── responses.vue
├── types/
│   └── supabase.ts
├── tests/
│   ├── unit/
│   ├── component/
│   ├── rls/
│   └── e2e/
├── app.vue
├── nuxt.config.ts
├── requirement.md
└── roadmap.md
```

---

## 🚩 Phased Implementation Roadmap

---

### Phase 1: Environment Setup, Dependencies & Database Schema Foundation
**Goal:** Persiapan lingkungan pengembangan, konfigurasi Nuxt modules, migrasi database PostgreSQL Supabase lengkap dengan RLS, serta penyiapan pengujian.

#### 📝 Tasks Checklist
- [x] **Dependencies Installation:**
  - Install `@nuxtjs/supabase`, `@vue-flow/core`, `@vue-flow/additional-components`
  - Install `chart.js`, `vue-chartjs`, `papaparse` (untuk CSV export)
  - Install testing tools: `vitest`, `@nuxt/test-utils`, `@playwright/test`
- [x] **Nuxt Configuration:**
  - Update `nuxt.config.ts` untuk mendaftarkan `@nuxt/ui` dan `@nuxtjs/supabase`
  - Setup `.env` untuk `SUPABASE_URL` dan `SUPABASE_KEY`
- [x] **Database Migration (PostgreSQL DDL):**
  - Jalankan script SQL migrasi tabel: `surveys`, `sections`, `questions`, `section_logic`, `responses`, `answers`
  - Buat kueri indeks untuk performa: `idx_questions_section_id`, `idx_sections_survey_id`, `idx_section_logic_survey_id`, dll.
  - Tambahkan foreign key circular safety (`fk_surveys_start_section`)
- [x] **Row Level Security (RLS):**
  - Aktifkan RLS di 6 tabel
  - Kebijakan Public SELECT untuk survey & section yang `is_active = true`
  - Kebijakan Public INSERT untuk `responses` & `answers`
  - Kebijakan Admin ALL HANYA jika `auth.uid() = surveys.admin_id`
  - Immutability pada `responses` & `answers` (UPDATE & DELETE ditolak untuk semua role)
- [x] **Type Generation:**
  - Generate TypeScript types dari Supabase ke `types/supabase.ts`

#### 🧪 Backend Testing Strategy
- **RLS Integration Tests (`tests/rls/policies.spec.ts`):**
  - Menguji akses role `anon` (Guest) untuk SELECT survei aktif (berhasil) vs non-aktif (gagal).
  - Menguji role `anon` saat INSERT ke `responses` dan `answers` (berhasil).
  - Menguji role `anon` saat mencoba UPDATE/DELETE `responses` (gagal/ditolak).
  - Menguji isolasi data antar Admin (Admin A tidak dapat me-read/write survei milik Admin B).

#### 🎨 UI Testing Strategy
- **Test Infrastructure Setup (`tests/component/setup.spec.ts`):**
  - Inisialisasi Vitest environment dengan `@nuxt/test-utils`.
  - Verifikasi mounting komponen Vue sederhana berjalan tanpa error.

---

### Phase 2: Admin Authentication & Route Protection (Module 1)
**Goal:** Implementasi autentikasi Admin via Supabase Auth dan sistem proteksi route.

#### 📝 Tasks Checklist
- [x] **Admin Login Page (`pages/admin/login.vue`):**
  - Form login email & password menggunakan komponen `UInput`, `UForm`, `UButton`
  - Penanganan autentikasi via `useSupabaseClient().auth.signInWithPassword()`
  - Notifikasi error login menggunakan `UNotifications` / `UAlert`
- [x] **Route Protection Middleware (`middleware/auth.ts`):**
  - Proteksi seluruh route di bawah `/admin/*` menggunakan `useSupabaseUser()`
  - Auto-redirect ke `/admin/login` jika sesi tidak valid/kosong
- [x] **Navigation & Header (`components/AppNavbar.vue`):**
  - Tampilkan profil admin yang sedang login
  - Tombol Logout yang menjalankan `supabase.auth.signOut()` lalu redirect ke `/admin/login`

#### 🧪 Backend Testing Strategy
- **Auth Helper & API Tests (`tests/unit/auth.spec.ts`):**
  - Test fungsi wrapper Auth composables saat mengembalikan user session aktif maupun `null`.
  - Verifikasi bahwa token sesi Supabase valid disimpan di client state.

#### 🎨 UI Testing Strategy
- **Login Component Test (`tests/component/login.spec.vue.ts`):**
  - Test validasi input email & password kosong (menampilkan pesan peringatan UI).
  - Test penanganan submit form dan pengubahan status tombol (loading state).
- **Route Guard E2E Test (`tests/e2e/auth-guard.spec.ts`):**
  - Test pengguna unauthenticated membuka `/admin/dashboard` langsung diarahkan ke `/admin/login`.
  - Test login sukses berhasil membawa user ke `/admin/dashboard`.

---

### Phase 3: Admin Survey Management Dashboard
**Goal:** Halaman dashboard untuk mengelola daftar survei (CRUD dasar & status toggle).

#### 📝 Tasks Checklist
- [x] **Dashboard Page (`pages/admin/dashboard.vue`):**
  - Menampilkan daftar survei milik admin terautentikasi dalam format grid/tabel (`UTable` / `UCard`)
  - Status indikator aktif/non-aktif (`UToggle` / `UBadge`)
  - Action buttons: Edit Builder, Analytics, Detail Responses, Hapus Survei
- [x] **Survey Creation Page (`pages/admin/survey/create.vue`):**
  - Form pembuat survei baru (Judul & Deskripsi)
  - Otomatis membuat initial *Section* pertama dan menyetel `start_section_id`
- [x] **Survey Composables / Services (`composables/useSurveys.ts`):**
  - Logic data fetching survei (`useAsyncData` / `useFetch`)
  - Function toggle `is_active` dan hapus survei (`DELETE`)

#### 🧪 Backend Testing Strategy
- **CRUD Operations Test (`tests/unit/surveys-service.spec.ts`):**
  - Unit test fungsi pembuat survei (memastikan `admin_id` terisi otomatis dari user yang login).
  - Unit test fungsi soft/hard delete dan cascade deletion pada section & question terkait.

#### 🎨 UI Testing Strategy
- **Dashboard Component Test (`tests/component/dashboard.spec.ts`):**
  - Test rendering list survei kosong (menampilkan state empty data yang ramah pengguna).
  - Test interaksi tombol toggle status survei memicu perubahan indikator visual.
- **E2E Survey Lifecycle (`tests/e2e/survey-crud.spec.ts`):**
  - Admin membuat survei baru -> Survei tampil di dashboard -> Admin dapat mengubah status -> Admin menghapus survei.

---

### Phase 4: Dual-Mode Survey Builder & Canvas Designer (Module 2)
**Goal:** Editor pembuatan survei interaktif dengan dua tampilan synchronized: Form Linear Editor & Visual Canvas Flow Designer.

#### 📝 Tasks Checklist
- [ ] **Editor Container (`pages/admin/survey/[id]/edit.vue`):**
  - Tab Switcher (`UTabs`): **Form Linear Editor** vs **Canvas Designer**
  - *Single Source of Truth* state management (perubahan di satu view langsung merefleksikan view lainnya)
- [ ] **Form Linear Editor (`components/builder/FormLinearEditor.vue` & `QuestionEditor.vue`):**
  - Pengelolaan section & urutan pertanyaan (`order_index`)
  - Pilihan tipe pertanyaan: `short_text`, `long_text`, `multiple_choice`, `rating`
  - Form pembuatan opsi pilihan ganda dan penandaan `is_required`
- [ ] **Canvas Flow Designer (`components/builder/CanvasFlowDesigner.vue`):**
  - Integrasi Vue Flow (`@vue-flow/core`)
  - Canvas controls: *Zoom In/Out*, *Panning*, *Infinite Workspace*
  - Node kustom `SectionNode.vue`: Collapsible section (expand/collapse pertanyaan & opsi)
  - Interactive Connecting Edges: Penarikan garis panah dari opsi/pertanyaan ke section tujuan
  - Debounced saving untuk koordinat node (`position_x`, `position_y`) pada event `onNodeDragStop`
- [ ] **Advanced Logic Branching Rule Manager:**
  - Pengaturan operator panah: `selected`, `filled`, `equals`, `not_equals`, `greater_than`, `less_than`
  - Pengaturan fallback `default_next_section_id` ("What Next?")
  - Penanda `is_end_section` untuk mengakhiri survei

#### 🧪 Backend Testing Strategy
- **Debounced Save & Logic Persistence Test (`tests/unit/builder-logic.spec.ts`):**
  - Test bahwa pembaruan posisi node hanya mengirim 1 kueri ke Supabase setelah jeda debounce (misal 500ms).
  - Test pembuatan record pada `section_logic` memvalidasi relasi `source_section_id` dan `target_section_id`.

#### 🎨 UI Testing Strategy
- **State Synchronization Test (`tests/component/dual-mode-sync.spec.ts`):**
  - Test penambahan pertanyaan di Form Linear Editor secara instan memperbarui jumlah node/child di Canvas Designer.
- **Canvas Interaction Test (`tests/component/vue-flow-node.spec.ts`):**
  - Test fitur expand/collapse pada `SectionNode.vue`.
  - Test pembentukan garis hubung (*edge*) antar node memicu event pembaruan logic rule.

---

### Phase 5: Guest Survey Execution & Dynamic Logic Engine (Module 4)
**Goal:** Halaman publik untuk pengisian survei oleh Guest secara dinamis sesuai flow logika pertanyaan.

#### 📝 Tasks Checklist
- [ ] **Public Survey Page (`pages/survey/[id].vue`):**
  - Dapat diakses secara terbuka tanpa autentikasi (Guest mode)
  - Tampilan pertanyaan berdasarkan section aktif
- [ ] **Dynamic Navigation Engine:**
  - Evaluator `section_logic`: Jika opsi tertentu dipilih, hitung section tujuan (`target_section_id`)
  - Evaluator fallback: Gunakan `default_next_section_id` jika tidak ada kondisi yang terpenuhi
- [ ] **State Elimination & Back Tracking:**
  - Simpan array `completedCategories` dalam `useState`
  - Jika Guest menekan tombol Back ke section kategori, opsi yang sudah selesai otomatis dihilangkan dari pilihan
- [ ] **Atomic Submission:**
  - Validasi front-end untuk pertanyaan `is_required = true`
  - Submit final menyimpan data ke `public.responses` dan `public.answers` secara atomic

#### 🧪 Backend Testing Strategy
- **Atomic Insert & Logic Engine Test (`tests/unit/survey-submission.spec.ts`):**
  - Test fungsi penyimpan jawaban memastikan `response_id` yang sama digunakan pada seluruh record `answers`.
  - Test evaluasi kueri logika untuk operator `equals`, `not_equals`, `greater_than`, `less_than`, dan `filled`.

#### 🎨 UI Testing Strategy
- **Guest Flow & Branching UI Test (`tests/component/guest-flow.spec.ts`):**
  - Test validasi form: Tombol Next/Submit terhalang jika pertanyaan wajib belum diisi.
  - Test navigasi bercabang: Memilih "Pilihan A" membawa pengguna ke Section 2, sedangkan "Pilihan B" membawa ke Section 3.
- **E2E Guest Experience Test (`tests/e2e/guest-survey.spec.ts`):**
  - Guest membuka URL survei -> Mengisi pertanyaan -> Mengikuti branching flow -> Berhasil submit.

---

### Phase 6: Interactive Sandbox Preview Mode (Module 3)
**Goal:** Fitur pratinjau survei interaktif untuk Admin tanpa mengotori data asli di database.

#### 📝 Tasks Checklist
- [ ] **Preview Launcher:**
  - Tombol **Preview** di Builder yang membuka tab baru ke `/survey/[id]?preview=true`
- [ ] **Floating Preview Banner (`components/survey/PreviewBanner.vue`):**
  - Mendeteksi `route.query.preview === 'true'`
  - Tampilkan banner floating warning: *"⚠️ Mode Preview: Jawaban tidak akan disimpan."*
- [ ] **Database Bypass Handler:**
  - Interseptor submit pada mode preview untuk me-bypass `INSERT` ke Supabase
  - Tampilkan alert/modal simulasi sukses submit tanpa menyimpan data ke DB

#### 🧪 Backend Testing Strategy
- **Preview Isolation Test (`tests/unit/preview-bypass.spec.ts`):**
  - Unit test handler submit memverifikasi fungsi Supabase client `insert()` SAMA SEKALI tidak dipanggil saat flag `preview=true`.

#### 🎨 UI Testing Strategy
- **Preview Component Test (`tests/component/preview-banner.spec.ts`):**
  - Test banner peringatan muncul saat URL mengandung parameter `preview=true` dan tersembunyi jika parameter tidak ada.
- **Preview E2E Simulation (`tests/e2e/preview-mode.spec.ts`):**
  - Admin mengeklik tombol preview -> Tab baru terbuka dengan banner floating -> Admin mengisi form sampai akhir -> Modal sukses simulasi muncul tanpa ada record baru di database.

---

### Phase 7: Reporting, Analytics Dashboard & CSV Export (Module 5)
**Goal:** Visualisasi grafik statistik hasil respon survei dan fitur unduh data jawaban.

#### 📝 Tasks Checklist
- [ ] **Analytics Page (`pages/admin/survey/[id]/analytics.vue`):**
  - Visualisasi pertanyaan *Multiple Choice* & *Rating* menggunakan Chart.js (`ChartBar.vue`, `ChartPie.vue`)
  - Aggregation data berbasis SQL (`COUNT`, `GROUP BY`)
  - Feed daftar respon teks terbaru untuk tipe `short_text` dan `long_text`
- [ ] **Detail Responses Page (`pages/admin/survey/[id]/responses.vue`):**
  - Tabel interaktif `UTable` menampilkan riwayat jawaban responden per baris
  - Pagination, sorting, dan filter data
- [ ] **CSV Export Engine:**
  - Tombol **Export CSV** menggunakan `papaparse` / custom CSV exporter
  - Format ekspor menyusun kolom berdasarkan pertanyaan dan baris berdasarkan responden

#### 🧪 Backend Testing Strategy
- **Analytics Aggregation & CSV Formatter Test (`tests/unit/analytics.spec.ts`):**
  - Test kueri SQL aggregation menghitung persentase pilihan ganda secara akurat.
  - Test utility converter JSON-to-CSV menghasilkan string CSV dengan header dan escape character yang benar.

#### 🎨 UI Testing Strategy
- **Analytics Rendering Test (`tests/component/analytics-charts.spec.ts`):**
  - Test komponen `ChartPie` dan `ChartBar` me-render canvas grafik tanpa crash saat menerima dataset nol atau besar.
- **Responses Table & Export E2E Test (`tests/e2e/analytics-export.spec.ts`):**
  - Test navigasi ke halaman responses -> Verifikasi data tabel sesuai -> Memicu aksi tombol Export CSV.

---

### Phase 8: Type Safety, UI Polish & End-to-End Test Suite Execution
**Goal:** Pembersihan kode (zero `any`), audit performa, dan pengujian menyeluruh (E2E) seluruh aplikasi.

#### 📝 Tasks Checklist
- [ ] **Type Safety Audit:**
  - Verifikasi seluruh file TypeScript/Vue tidak menggunakan `any`
  - Pastikan seluruh data fetching menggunakan auto-generated types dari `types/supabase.ts`
- [ ] **UI/UX Refinement:**
  - Konsistensi penggunaan komponen Nuxt UI (`UButton`, `UInput`, `UTextarea`, `USelect`, `UTable`, `UModal`, `UTabs`, `UToggle`, `UNotifications`)
  - Optimasi antarmuka untuk berbagai ukuran layar (responsive layout)
- [ ] **Performance Audit:**
  - Pastikan event canvas Vue Flow aman dari memory leak dan tidak membebani browser

#### 🧪 Backend Testing Strategy
- **Full Backend Regression Suite (`npm run test:backend`):**
  - Menjalankan seluruh test unit, RLS policies, dan API service wrapper secara otomatis.

#### 🎨 UI Testing Strategy
- **Full E2E Regression Suite (`npm run test:e2e`):**
  - Menjalankan pengujian E2E lengkap mencakup seluruh flow:
    1. Admin Login
    2. Membuat Survei & Section
    3. Mengatur Logic Branching di Canvas Editor
    4. Menguji Preview Mode
    5. Guest Pengisian Survei Publik
    6. Admin Memeriksa Grafik Analytics & Melakukan Export CSV

---

## 📊 Summary of Quality Assurance & Testing Matrix

| Phase | Module / Feature Area | Backend Testing Focus | UI / E2E Testing Focus |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Setup & DB Schema | Supabase RLS Policies & Roles | Vitest & Nuxt Test Setup |
| **Phase 2** | Admin Auth | Supabase Auth Composables | Login Form & Route Guard Redirect |
| **Phase 3** | Survey Management | CRUD Services & Deletion Logic | Dashboard Table & Lifecycle E2E |
| **Phase 4** | Dual-Mode Builder | Debounced Save & Logic Rules DB | Dual-View State Sync & Vue Flow Nodes |
| **Phase 5** | Guest Execution | Atomic DB Inserts & Branch Logic | Form Validation & Dynamic Flow E2E |
| **Phase 6** | Preview Sandbox | DB Insert Bypass Verification | Preview Banner & Simulation Modal |
| **Phase 7** | Analytics & CSV | SQL Aggregation & CSV Generator | Chart Rendering & Export Trigger |
| **Phase 8** | QA & Polish | Complete Backend Test Suite | Complete Playwright E2E Regression |

---
*Roadmap ini merupakan panduan utama eksekusi proyek **Formly**. Setiap perubahan fitur wajib mengacu dan memperbarui dokumen ini.*
