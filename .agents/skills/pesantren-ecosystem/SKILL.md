---
name: pesantren-ecosystem
description: >
  Knowledge base ekosistem sistem manajemen pesantren yang mencakup tiga repositori:
  smp-be (Laravel backend utama), smp-fe (React frontend), dan bank-santri (Laravel banking backend).
  Berguna untuk memahami arsitektur, fitur, model, API routes, pola komunikasi antar-service,
  dan gotcha/known issues dari sistem pesantren ini.
---

# Pesantren Ecosystem Knowledge Item

Lihat artifacts/pesantren_ecosystem_ki.md untuk detail lengkap.

## Quick Reference

### Repositori
- `smp-be` → c:\Users\DELL\Developer\pesantren\smp-be (Laravel 12, port 8000)
- `smp-fe` → c:\Users\DELL\Developer\pesantren\smp-fe (React 18 + Vite, port 5173)
- `bank-santri` → c:\Users\DELL\Developer\pesantren\bank-santri (Laravel 12, port 8001)

### Known Issue bank-santri
- `npm install` gagal karena `laravel-vite-plugin` tidak support Vite 8
- Solusi: `npm install --legacy-peer-deps` atau downgrade Vite ke ^7.0.0

### Key Model Relationships (smp-be)
- Account.account_number = Student.nis (NIS santri adalah nomor rekening bank)
- Staff.user_id → User.id (staf punya akun user)
- Student terhubung ke: Program, Hostel, Room, ParentProfile, StudentLeave, StudentViolation, StudentCard, StudentAgreement

### Komunikasi Antar Service
- smp-be → bank-santri: Header `X-Internal-Key`, endpoint `/api/internal/*`
- bank-santri → smp-be: Callback webhook `POST /api/internal/transaction/activate-callback`
- Koperasi → bank-santri: Header `X-Koperasi-Key`, endpoint `/api/koperasi/*`
