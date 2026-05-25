/**
 * News Model
 * Bertanggung jawab untuk:
 * 1. Mendefinisikan interface/tipe data yang digunakan oleh pages/components
 * 2. Memetakan (mapping) data raw dari repository ke tipe yang bersih
 * 3. Menyediakan fungsi use-case yang dipanggil oleh pages/components
 *
 * Pages/components HANYA boleh mengimpor dari sini, bukan dari repository langsung.
 */

import {
  getNewsListRaw,
  getNewsDetailRaw,
  fetchImageBlobRaw,
} from "../repository/news-repository";

// ─────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────

export interface NewsItem {
  id: number;
  title: string;
  image_url: any;
  category: string;
  body: string;
  created_at: string;
  created_by: string;
  objectUrl?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Image resolver (private helper)
// Menangani berbagai format image_url yang dikembalikan backend:
//   - Buffer  { type: "Buffer", data: number[] }
//   - String path relatif  "/uploads/news/img.jpg"
//   - Blob instance
//   - Blob/data URL (sudah siap pakai)
// ─────────────────────────────────────────────────────────────

async function resolveImageUrl(imageData: any): Promise<string | null> {
  if (!imageData) return null;

  // Format Buffer dari backend Node.js
  if (imageData?.type === "Buffer" && Array.isArray(imageData.data)) {
    try {
      return URL.createObjectURL(
        new Blob([new Uint8Array(imageData.data)], { type: "image/jpeg" })
      );
    } catch {
      return null;
    }
  }

  // String: bisa berupa path relatif atau URL siap pakai
  if (typeof imageData === "string") {
    if (imageData.startsWith("blob:") || imageData.startsWith("data:"))
      return imageData;
    try {
      const blob = await fetchImageBlobRaw(imageData);
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }

  // Blob langsung
  if (imageData instanceof Blob) return URL.createObjectURL(imageData);

  return null;
}

// ─────────────────────────────────────────────────────────────
// Mapper functions (private)
// ─────────────────────────────────────────────────────────────

function mapNewsItem(raw: any): NewsItem {
  return {
    id:         raw.id,
    title:      raw.title,
    image_url:  raw.image_url,
    category:   raw.category,
    body:       raw.body,
    created_at: raw.created_at,
    created_by: raw.created_by,
  };
}

// ─────────────────────────────────────────────────────────────
// Use-case functions (dipanggil oleh pages/components)
// ─────────────────────────────────────────────────────────────

/**
 * Mengambil semua artikel berita beserta resolved image URL-nya.
 */
export async function getNewsList(): Promise<NewsItem[]> {
  const raw   = await getNewsListRaw();
  const items = raw.map(mapNewsItem);

  // Resolve semua gambar secara paralel
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      objectUrl: await resolveImageUrl(item.image_url),
    }))
  );
}

/**
 * Mengambil detail satu artikel berita beserta resolved image URL-nya.
 */
export async function getNewsDetail(id: string | number): Promise<NewsItem> {
  const raw  = await getNewsDetailRaw(id);
  const item = mapNewsItem(raw);
  return {
    ...item,
    objectUrl: (await resolveImageUrl(item.image_url)) ?? undefined,
  };
}
