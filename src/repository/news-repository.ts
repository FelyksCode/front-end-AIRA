/**
 * News Repository
 * Bertanggung jawab untuk semua raw API call terkait fitur News.
 * Layer ini TIDAK boleh melakukan mapping/transformasi data.
 */

const getBaseUrl = () => import.meta.env.VITE_AI_BACKEND_URL;

/**
 * Mengambil semua artikel berita.
 */
export async function getNewsListRaw(): Promise<any[]> {
  const res = await fetch(`${getBaseUrl()}/news`);
  if (!res.ok) throw new Error(`Failed to fetch news list: ${res.status}`);
  return await res.json();
}

/**
 * Mengambil detail satu artikel berita berdasarkan ID.
 */
export async function getNewsDetailRaw(id: string | number): Promise<any> {
  const res = await fetch(`${getBaseUrl()}/news/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch news detail (id=${id}): ${res.status}`);
  return await res.json();
}

/**
 * Mengambil gambar dari path relatif sebagai Blob.
 * Digunakan untuk mengkonversi image path dari backend menjadi object URL.
 */
export async function fetchImageBlobRaw(imagePath: string): Promise<Blob> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return await res.blob();
}
