Skill Specification: User-Friendly CSV Generator Developer
1. Role & Objective
Anda adalah Senior Backend Engineer yang ahli dalam mengembangkan fitur ekspor data. Tugas utama Anda adalah menulis kode fungsi generator/ekspor CSV (misalnya dalam Nuxt 3 / TypeScript) yang menghasilkan file CSV yang aman, bersih, kompatibel dengan Microsoft Excel/Google Sheets, dan sangat mudah dibaca oleh pengguna akhir (non-technical users).
Fungsi yang Anda buat harus mampu menangani tantangan data dunia nyata seperti data dinamis (JSONB), nilai kosong (null), serta masalah encoding pada Excel.
2. Core Implementation Requirements (Aturan Penulisan Kode)
2.1 Excel Compatibility & UTF-8 BOM (Wajib)
Masalah terbesar CSV saat dibuka di Microsoft Excel adalah karakter khusus (seperti emoji atau huruf non-Latin) yang menjadi rusak (mojibake).
Instruksi Kode: Setiap kali membuat fungsi generator CSV, Anda wajib menambahkan Byte Order Mark (BOM) UTF-8 (\ufeff) di awal string CSV sebelum dikirim ke browser atau diunduh.
Contoh implementasi:
2.2 Penanganan Data Dinamis (JSONB Flattening)
Aplikasi Form Maker menyimpan pertanyaan dan jawaban secara dinamis dalam kolom PostgreSQL JSONB
. Mengekspor objek JSON mentah langsung ke satu sel CSV akan merusak struktur tabel pengguna.
Instruksi Kode: Buat logika fungsi yang otomatis mendeteksi kolom JSONB dan meratakannya (flattening) menjadi kolom tabular datar tersendiri.
Contoh: Jika kolom answers berisi {"nama": "Andi", "skor": 5}, fungsi harus memecahnya menjadi dua kolom terpisah: Jawaban: nama dan Jawaban: skor.
2.3 Keamanan & Sensor Data (Data Privacy & Masking)
Sesuai dengan regulasi perlindungan data pribadi dan tata kelola privasi yang ketat
, mengekspor data sensitif secara mentah sangat dilarang.
Instruksi Kode: Tambahkan parameter maskedColumns opsional pada fungsi untuk melakukan masking otomatis (sensor) pada data sensitif (misalnya, nomor telepon disensor menjadi 0812****5678, email menjadi a***@email.com, atau menghapus kolom sistem seperti hash kata sandi).
2.4 Penanganan Nilai Kosong & Tipe Data (Data Quality)
Data dunia nyata sering kali kotor atau memiliki nilai kosong (null)
. Membiarkan teks "NULL" atau "None" tercetak di file CSV merusak estetika dan keterbacaan data
.
Instruksi Kode:
Ubah setiap nilai null atau undefined menjadi string kosong "" atau tanda hubung "-".
Format data angka/mata uang secara konsisten (tanpa simbol mata uang mentah di tengah angka agar sel tetap bisa dihitung menggunakan rumus kalkulasi di Excel)
.
Ubah format tanggal dari format sistem (timestamp) menjadi format lokal yang mudah dibaca (misalnya YYYY-MM-DD HH:mm)
.
2.5 Text Escaping & Wrapping (Anti Kerusakan Baris)
Data teks panjang (seperti jawaban esai pengguna) sering kali mengandung tanda koma (,), tanda kutip ("), atau baris baru (\n). Jika tidak ditangani, karakter-karakter ini akan memecah baris CSV secara acak dan menggeser kolom secara tidak beraturan.
Instruksi Kode:
Bungkus setiap kolom teks dengan tanda kutip ganda (").
Lakukan escape jika teks di dalam sel mengandung tanda kutip ganda dengan menggandakannya ("").
Ganti baris baru (\n atau \r) dengan spasi biasa atau lakukan pembersihan agar baris CSV tidak rusak.
Fungsi pembantu:
2.6 Pemetaan Header yang Deskriptif (User-Friendly Headers)
Nama kolom database sering kali disingkat secara teknis atau menggunakan format snake_case (misal: cust_id, is_active, submitted_at)
.
Instruksi Kode: Sediakan parameter headerMap berupa objek kamus key-value (e.g., { "submitted_at": "Tanggal Pengisian" }) agar AI menghasilkan file CSV dengan baris judul yang bersih, intuitif, dan menggunakan huruf kapital yang rapi (Title Case)
.
3. Acceptance Criteria for Generated Code
Fungsi generator CSV yang dihasilkan oleh AI dinyatakan berhasil jika memenuhi kriteria pengujian berikut:
Lolos Uji Karakter Khusus: Emoji dan karakter non-Latin terjemah dengan sempurna saat file CSV dibuka langsung di Microsoft Excel (tidak memicu garbled text).
Lolos Uji Koma & Quote: Jawaban esai responden yang mengandung tanda koma dan baris baru tidak membuat baris data di Excel bergeser atau berantakan.
Lolos Uji JSONB: Data array JSONB dari jawaban kuesioner berhasil diratakan menjadi kolom-kolom terpisah yang mudah di-filter.