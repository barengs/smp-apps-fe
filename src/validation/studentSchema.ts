"use client";

import { z } from 'zod';

export const studentEditSchema = z.object({
  parent_id: z.string().optional(),
  nis: z.string().min(1, 'NIS wajib diisi'),
  period: z.string().min(1, 'Periode wajib diisi'),
  nik: z.string().min(1, 'NIK wajib diisi'),
  kk: z.string().optional(),
  first_name: z.string().min(1, 'Nama depan wajib diisi'),
  last_name: z.string().optional().nullable(),
  gender: z.enum(['L', 'P'], { required_error: 'Jenis kelamin wajib diisi' }),
  address: z.string().optional().nullable(),
  born_in: z.string().optional().nullable(),
  born_at: z.string().optional().nullable(),
  last_education: z.string().optional().nullable(),
  village_id: z.number().int().optional().nullable(),
  village: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  hostel_id: z.number().int().optional().nullable(),
  program_id: z.number({ required_error: 'Program wajib dipilih' }).int(),
  status: z.string().min(1, 'Status wajib diisi'),
  photo: z.string().optional().nullable(),
  user_id: z.number().int().optional().nullable(),
  deleted_at: z.string().optional().nullable(),
});

export type StudentEditFormValues = z.infer<typeof studentEditSchema>;