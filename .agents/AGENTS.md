# AGENTS.md — Workspace Rules (smp-fe)

## Tech Stack Frontend (smp-fe)
- React 18 + TypeScript + Vite 6
- Semua route ada di `src/App.tsx` — JANGAN buat file routing baru
- Styling: Tailwind CSS (WAJIB) + shadcn/ui components
- State management: Redux Toolkit + RTK Query
- Form: React Hook Form + Zod
- Package manager: **pnpm** (gunakan `pnpm` bukan `npm` atau `yarn`)

## Rules Pengembangan Frontend
1. Halaman baru di `src/pages/{modul}/NamaPage.tsx`
2. Komponen reusable di `src/components/`
3. Selalu gunakan shadcn/ui components, jangan buat UI dari scratch
4. Tambahkan route baru di `src/App.tsx` dalam `<Route element={<ProtectedRoute />}>` jika butuh auth
5. Gunakan existing RTK Query slices di `src/store/slices/` sebelum membuat yang baru

## Konteks Ekosistem
- smp-fe berkomunikasi dengan DUA backend: smp-be (akademik) dan bank-santri (keuangan)
- JWT token dari smp-be digunakan untuk auth ke smp-be
- Halaman keuangan (`/keuangan/*` dan `/wali-santri/tagihan`, `/wali-santri/transaksi`) menggunakan bank-santri API
- NIS santri = nomor rekening di bank-santri
