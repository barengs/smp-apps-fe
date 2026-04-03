/**
 * Utility for PDF Exports using @react-pdf/renderer
 */

/**
 * Converts an image URL to a base64 Data URL.
 * Essential for rendering images in @react-pdf/renderer reliably, 
 * bypassing most CORS/Network issues during document generation.
 */
export const imageUrlToBase64 = async (url: string): Promise<string | undefined> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Image fetch failed: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Error pre-fetching image for PDF:', err);
    return undefined;
  }
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
