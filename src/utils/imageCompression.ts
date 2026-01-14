"use client";

export interface CompressOptions {
  maxSizeKB?: number; // target maksimum ukuran (KB)
  maxWidth?: number;  // lebar maksimum
  maxHeight?: number; // tinggi maksimum
  quality?: number;   // kualitas awal (0-1) untuk JPEG
}

const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else {
        // Fallback jika toBlob gagal
        const dataUrl = canvas.toDataURL(type, quality);
        const byteString = atob(dataUrl.split(",")[1]);
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        resolve(new Blob([ab], { type: mimeString }));
      }
    }, type, quality);
  });

const getScaledDimensions = (w: number, h: number, maxW: number, maxH: number) => {
  let width = w;
  let height = h;
  if (width > maxW || height > maxH) {
    const scale = Math.min(maxW / width, maxH / height);
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
  }
  return { width, height };
};

const replaceExtWithJpg = (name: string) => {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? `${name.slice(0, idx)}.jpg` : `${name}.jpg`;
};

export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<File> {
  const {
    maxSizeKB = 2048,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.9,
  } = opts;

  // Jika sudah kecil, tidak perlu kompres
  const sizeKB = Math.round(file.size / 1024);
  if (sizeKB <= maxSizeKB) return file;

  // Muat gambar
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  // Siapkan canvas dengan dimensi tereskalasi
  let { width, height } = getScaledDimensions(img.naturalWidth || img.width, img.naturalHeight || img.height, maxWidth, maxHeight);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Turunkan kualitas bertahap sampai memenuhi ukuran
  let q = quality;
  let blob = await canvasToBlob(canvas, "image/jpeg", q);
  let resultKB = Math.round(blob.size / 1024);

  // Kurangi kualitas jika masih terlalu besar
  while (resultKB > maxSizeKB && q > 0.4) {
    q = q - 0.1;
    blob = await canvasToBlob(canvas, "image/jpeg", q);
    resultKB = Math.round(blob.size / 1024);
  }

  // Jika masih terlalu besar, perkecil dimensi sedikit dan coba lagi
  if (resultKB > maxSizeKB) {
    const dimScale = 0.85;
    width = Math.max( Math.floor(width * dimScale), 300 );
    height = Math.max( Math.floor(height * dimScale), 300 );
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // reset kualitas ke 0.8 lalu turun lagi
    q = Math.min(q, 0.8);
    blob = await canvasToBlob(canvas, "image/jpeg", q);
    resultKB = Math.round(blob.size / 1024);
    while (resultKB > maxSizeKB && q > 0.3) {
      q = q - 0.1;
      blob = await canvasToBlob(canvas, "image/jpeg", q);
      resultKB = Math.round(blob.size / 1024);
    }
  }

  const newName = replaceExtWithJpg(file.name);
  const compressedFile = new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
  return compressedFile;
}