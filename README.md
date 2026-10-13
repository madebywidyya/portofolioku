# Widiya Sari — Portfolio (Google Sheets + Apps Script)

Portfolio dinamis yang memakai **Google Sheets** sebagai database dan **Apps Script** sebagai API.  
Gratis 100%, cocok untuk GitHub Pages.

---

## Fitur

| Fitur | Keterangan |
|-------|------------|
| **Dynamic Content** | Semua teks (profile, journey, hobbies, projects, dll) diedit di Google Sheets |
| **Guestbook** | Pengunjung bisa kirim pesan → kamu approve di sheet |
| **Contact Form** | Form kontak → data masuk sheet + notifikasi email (opsional) |
| **Visitor Counter** | Total kunjungan ditampilkan di hero |
| **Gallery Dinamis** | Foto dari sheet (pakai URL) |
| **Support / QRIS** | Section donasi dengan QRIS |
| **Dark / Light Mode** | Toggle tema |
| **Fallback** | Kalau Apps Script gagal, pakai `data.json` lokal |

---

## Struktur File

```
portfolio-gsheets/
├── index.html          ← halaman utama
├── style.css           ← styling
├── script.js           ← logic frontend
├── config.js           ← URL Apps Script + token (WAJIB diisi)
├── data.json           ← fallback data
├── ftprofil.jpg        ← foto profil
├── qris.jpg            ← gambar QRIS
├── CNAME               ← custom domain (vdysri.my.id)
├── apps-script/
│   └── Code.gs         ← kode Google Apps Script
└── README.md           ← panduan ini
```

---

## Setup (Langkah demi Langkah)

### 1. Buat Google Spreadsheet

1. Buka [https://sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**
2. Rename jadi `Portfolio Widiya`
3. Copy **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_INI/edit
   ```

### 2. Pasang Apps Script

1. Di spreadsheet: **Extensions → Apps Script**
2. Hapus kode default, paste seluruh isi file `apps-script/Code.gs`
3. Ganti 2 baris ini:
   ```js
   const SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";
   const API_TOKEN = "widiya-portfolio-2026";   // boleh diganti
   const ADMIN_EMAIL = "emailkamu@gmail.com";   // opsional, untuk notifikasi
   ```
4. **Save** (Ctrl+S)

### 3. Jalankan Setup Otomatis

1. Di Apps Script editor, pilih fungsi **`setupSpreadsheet`** di dropdown
2. Klik **Run**
3. Izinkan permission (Review permissions → Allow)
4. Cek spreadsheet: semua sheet + sample data sudah terisi otomatis

### 4. Deploy sebagai Web App

1. Di Apps Script: **Deploy → New deployment**
2. Type: **Web app**
3. Settings:
   - Description: `Portfolio API`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik **Deploy**
5. Copy **Web App URL** (bentuknya `https://script.google.com/macros/s/XXXX/exec`)

### 5. Hubungkan ke Website

Buka file `config.js` dan isi:

```js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec",  // tempel di sini
  API_TOKEN: "widiya-portfolio-2026",   // harus sama dengan di Code.gs
  USE_FALLBACK: true
};
```

### 6. Deploy ke GitHub Pages

1. Buat repo baru di GitHub (atau pakai yang sudah ada)
2. Upload semua file di folder ini (kecuali folder `apps-script` — itu hanya untuk referensi)
3. Settings → Pages → Source: **Deploy from a branch** → branch `main` / `root`
4. Kalau pakai custom domain, pastikan file `CNAME` sudah ada

---

## Cara Edit Konten

Cukup buka Google Spreadsheet-nya:

| Sheet | Cara Edit |
|-------|-----------|
| **Profile** | Ubah nilai di kolom `value` |
| **Journey / Hobbies / dll** | Tambah / hapus / edit baris |
| **Messages** | Kolom `approved` → ubah jadi `TRUE` supaya muncul di website |
| **Gallery** | Isi kolom `image` dengan URL foto, `size` = `tall` / `wide` / kosong |
| **Stats** | Otomatis diupdate oleh script (jangan dihapus) |
| **Social** | Isi link Instagram, GitHub, Email |

**Tidak perlu commit/push ke GitHub** setiap kali update konten.

---

## Moderasi Guestbook

1. Buka sheet **Messages**
2. Pesan baru otomatis `approved = FALSE`
3. Baca pesannya → kalau oke, ubah jadi `TRUE`
4. Refresh website → pesan muncul

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Data tidak muncul | Cek `APPS_SCRIPT_URL` & `API_TOKEN` di `config.js` |
| CORS / fetch error | Pastikan Web App access = **Anyone** |
| Token invalid | Token di `config.js` harus sama persis dengan `Code.gs` |
| SetupSpreadsheet error | Pastikan SPREADSHEET_ID benar |
| Notifikasi email tidak masuk | Isi `ADMIN_EMAIL` dan izinkan MailApp |

---

## Keamanan Sederhana

- Token rahasia mencegah orang lain menulis data sembarangan
- Guestbook & Contact butuh approve manual
- Jangan share Spreadsheet ID atau token ke publik

---

Dibuat dengan 🤍 untuk Widiya Sari  
Keep learning, keep creating, keep becoming.
