export interface Berita {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}