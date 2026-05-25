/**
 * Diagnosis Repository
 * Bertanggung jawab untuk semua raw API call terkait fitur Diagnosis.
 * Layer ini TIDAK boleh melakukan mapping/transformasi data.
 */

const getBaseUrl = () => import.meta.env.VITE_AI_BACKEND_URL;

/**
 * Mengambil daftar cancer yang mendukung fitur diagnosis.
 */
export async function getCancerListRaw(): Promise<any[]> {
  const res = await fetch(`${getBaseUrl()}/cancers/?ai_feature=diagnosis`);
  if (!res.ok) throw new Error(`Failed to fetch cancer list: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Mengambil daftar feature options untuk cancer tertentu (diagnosis).
 */
export async function getFeatureOptionsRaw(cancerSlug: string): Promise<any[]> {
  const res = await fetch(
    `${getBaseUrl()}/cancers/${cancerSlug}/feature-options?ai_feature=diagnosis`
  );
  if (!res.ok) throw new Error(`Failed to fetch feature options: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Mengambil detail info sebuah cancer (nama + deskripsi).
 */
export async function getCancerDetailRaw(cancerSlug: string): Promise<any> {
  const res = await fetch(
    `${getBaseUrl()}/cancers/${cancerSlug}?ai_feature=diagnosis`
  );
  if (!res.ok) throw new Error(`Failed to fetch cancer detail: ${res.status}`);
  return await res.json();
}

/**
 * Mengirim file CSV untuk prediksi diagnosis.
 * Mengembalikan raw Response agar model layer bisa mengolah status & body.
 */
export async function submitDiagnosisPredictionRaw(
  cancerSlug: string,
  formData: FormData
): Promise<Response> {
  return await fetch(`${getBaseUrl()}/cancers/${cancerSlug}/predict`, {
    method: "POST",
    body: formData,
  });
}

/**
 * Mengirim file CSV untuk prediksi async (non-blocking).
 * Backend langsung return 202 + job_id tanpa menunggu AI selesai.
 * Mengembalikan raw Response agar model layer bisa handle status 202 / 503.
 */
export async function submitDiagnosisAsyncRaw(
  cancerSlug: string,
  formData: FormData
): Promise<Response> {
  return await fetch(`${getBaseUrl()}/cancers/${cancerSlug}/predict-async`, {
    method: "POST",
    body: formData,
  });
}

/**
 * Polling: cek status job async berdasarkan job_id.
 * Mengembalikan raw Response untuk ditangani di model layer.
 */
export async function getPredictionJobStatusRaw(jobId: string): Promise<Response> {
  return await fetch(`${getBaseUrl()}/prediction-result/${jobId}`);
}

/**
 * Mengirim gene file + image file untuk prediksi multi-modal.
 */
export async function submitMultiModalPredictionRaw(
  cancerSlug: string,
  formData: FormData
): Promise<any> {
  const url = `${getBaseUrl()}/cancers/${cancerSlug}/predict?ai_feature=gene+image&feature_key=gene_image`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Multi-modal prediction failed: ${res.status}`);
  return await res.json();
}
