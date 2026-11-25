/**
 * Utility for PDF Exports using @react-pdf/renderer
 */

/**
 * Converts a Blob image (including WebP) into a PNG Data URL via same-origin ObjectURL + Canvas.
 */
const blobToPngDataUrl = (blob: Blob): Promise<string | undefined> => {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new window.Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Failed converting image blob to PNG:', err);
        resolve(undefined);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(undefined);
    };

    img.src = objectUrl;
  });
};

/**
 * Extracts clean relative storage path (without leading slash or `storage/` prefix).
 */
const extractStorageRelativePath = (input: string): string | null => {
  const trimmed = (input || '').trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return null;
  }

  const STORAGE_BASE_URL = (import.meta.env.VITE_STORAGE_BASE_URL as string) || '';
  const cleanStorageBase = STORAGE_BASE_URL.endsWith('/')
    ? STORAGE_BASE_URL.slice(0, -1)
    : STORAGE_BASE_URL;

  if (cleanStorageBase && trimmed.startsWith(cleanStorageBase)) {
    const rel = trimmed.slice(cleanStorageBase.length).replace(/^\/+/, '');
    return rel.replace(/^storage\//i, '') || null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const storageIdx = parsed.pathname.indexOf('/storage/');
      if (storageIdx !== -1) {
        return parsed.pathname.slice(storageIdx + '/storage/'.length).replace(/^\/+/, '') || null;
      }
    } catch {
      // ignore invalid URL
    }
    return null;
  }

  if (trimmed.startsWith('/storage/') || trimmed.startsWith('storage/')) {
    return trimmed.replace(/^\/?storage\//i, '').replace(/^\/+/, '') || null;
  }

  if (!trimmed.startsWith('/') && (trimmed.startsWith('student-card/') || trimmed.startsWith('uploads/'))) {
    return trimmed;
  }

  return null;
};

/**
 * Converts an image URL to a base64 PNG Data URL.
 * Essential for rendering WebP/cross-origin images reliably in @react-pdf/renderer.
 */
export const imageUrlToBase64 = async (url: string): Promise<string | undefined> => {
  if (!url) return undefined;

  if (/^data:image\/(png|jpeg|jpg);base64,/i.test(url)) {
    return url;
  }

  const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string) || '').replace(/\/+$/, '');
  const relativePath = extractStorageRelativePath(url);

  const candidates: string[] = [];
  if (relativePath) {
    if (API_BASE_URL) {
      candidates.push(`${API_BASE_URL}/master/image-proxy?path=${encodeURIComponent(relativePath)}`);
    }
    candidates.push(`/storage/${relativePath}`);
    const fullUrl = getFullStorageUrl(relativePath);
    if (fullUrl) candidates.push(fullUrl);
  } else {
    candidates.push(url);
  }

  const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

  for (const fetchUrl of uniqueCandidates) {
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) continue;
      const blob = await response.blob();
      const dataUrl = await blobToPngDataUrl(blob);
      if (dataUrl) return dataUrl;
    } catch (err) {
      console.warn(`Failed fetching image from ${fetchUrl}:`, err);
    }
  }

  return undefined;
};

/**
 * Resolves the official Kop Surat (from student-card settings or passed path/URL)
 * into a PNG base64 Data URL ready for @react-pdf/renderer, with static fallback.
 */
export const resolveKopSuratBase64 = async (
  kopSuratPathOrUrl?: string | null
): Promise<string | undefined> => {
  if (kopSuratPathOrUrl) {
    const direct = await imageUrlToBase64(kopSuratPathOrUrl);
    if (direct) return direct;
  }

  const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string) || '').replace(/\/+$/, '');
  if (API_BASE_URL) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/main/student-card/setting`, { headers });
      if (res.ok) {
        const json = await res.json();
        const remoteKop = json?.data?.kop_surat;
        if (remoteKop) {
          const remoteBase64 = await imageUrlToBase64(remoteKop);
          if (remoteBase64) return remoteBase64;
        }
      }
    } catch (err) {
      console.warn('Gagal mengambil pengaturan kop surat:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const fallbackUrl = `${window.location.origin}/images/KOP PESANTREN.png`;
    return await imageUrlToBase64(fallbackUrl);
  }

  return undefined;
};

/**
 * Constructs a full storage URL from a relative path and the VITE_STORAGE_BASE_URL.
 * Handles leading/trailing slashes gracefully.
 */
export const getFullStorageUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;

  const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string;
  if (!STORAGE_BASE_URL) return path;

  const cleanBase = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
};

/**
 * Helper to format dates consistently in reports
 */
export const formatReportDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};
