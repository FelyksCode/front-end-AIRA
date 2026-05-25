/**
 * Diagnosis Model
 * Bertanggung jawab untuk:
 * 1. Mendefinisikan interface/tipe data yang digunakan oleh pages/components
 * 2. Memetakan (mapping) data raw dari repository ke tipe yang bersih
 * 3. Menyediakan fungsi use-case yang dipanggil oleh pages/components
 *
 * Pages/components HANYA boleh mengimpor dari sini, bukan dari repository langsung.
 */

import {
  getCancerListRaw,
  getFeatureOptionsRaw,
  getCancerDetailRaw,
  submitDiagnosisPredictionRaw,
  submitMultiModalPredictionRaw,
  submitDiagnosisAsyncRaw,
  getPredictionJobStatusRaw,
} from "../repository/diagnosis-repository";

// ─────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────

export interface CancerItem {
  name: string;
  slug: string;
}

export interface CancerDetail {
  name: string;
  description: string;
}

export interface FeatureOption {
  ai_data_type: string;
  key: string;
  label: string;
}

export interface PredictionResult {
  prediction: number;
  probability?: number;
  top_features?: Array<{ name: string; importance: number }>;
}

export type SubmitDiagnosisResult =
  | { success: true; data: PredictionResult }
  | { success: false; error: string; rawResponse?: string };

// ── Async / Job types ──────────────────────────────────────

/**
 * Dikembalikan oleh submitDiagnosisAsync setelah backend menerima request (202).
 */
export type SubmitAsyncResult =
  | { success: true; job_id: string; cached?: boolean; note?: string }
  | { success: false; error: string; unavailable?: boolean };

/**
 * Status sebuah job yang dikembalikan saat polling.
 * Discriminated union — bisa digunakan langsung dengan switch/type narrowing.
 */
export type PollJobResult =
  | { status: "processing"; elapsed_ms?: number }
  | {
      status: "completed";
      result: PredictionResult;
      is_cache_hit?: boolean;
      total_time_ms?: number;
    }
  | { status: "failed"; error: string }
  | { status: "not_found" }
  | { status: "unavailable" };

// ─────────────────────────────────────────────────────────────
// Mapper functions (private — hanya digunakan di dalam model ini)
// ─────────────────────────────────────────────────────────────

function mapCancerItem(raw: any): CancerItem {
  return { name: raw.name, slug: raw.slug };
}

function mapFeatureOption(raw: any): FeatureOption {
  return {
    ai_data_type: raw.ai_data_type,
    key: raw.key,
    label: raw.label,
  };
}

function mapCancerDetail(raw: any): CancerDetail | null {
  if (!raw?.description) return null;
  return { name: raw.name, description: raw.description };
}

function mapPredictionResult(raw: any): PredictionResult {
  return {
    prediction: raw.prediction,
    probability: raw.probability,
    top_features: raw.top_features,
  };
}

// ─────────────────────────────────────────────────────────────
// Use-case functions (dipanggil oleh pages/components)
// ─────────────────────────────────────────────────────────────

/**
 * Mengambil daftar cancer yang tersedia untuk diagnosis.
 */
export async function getDiagnosisCancerList(): Promise<CancerItem[]> {
  const raw = await getCancerListRaw();
  return raw.map(mapCancerItem);
}

/**
 * Mengambil daftar feature options (ai_data_type, key, label) untuk cancer tertentu.
 */
export async function getDiagnosisFeatureOptions(
  cancerSlug: string
): Promise<FeatureOption[]> {
  const raw = await getFeatureOptionsRaw(cancerSlug);
  return raw.map(mapFeatureOption);
}

/**
 * Mengambil detail cancer (nama + deskripsi) untuk ditampilkan di form.
 */
export async function getDiagnosisCancerDetail(
  cancerSlug: string
): Promise<CancerDetail | null> {
  const raw = await getCancerDetailRaw(cancerSlug);
  return mapCancerDetail(raw);
}

/**
 * Mengirim file CSV dan mendapatkan hasil prediksi diagnosis.
 * Mengembalikan objek bertipe SubmitDiagnosisResult (success/failure) agar
 * halaman tidak perlu mengetahui detail HTTP response.
 */
export async function submitDiagnosis(params: {
  cancerSlug: string;
  datasetLabel: string;
  file: File;
}): Promise<SubmitDiagnosisResult> {
  const { cancerSlug, datasetLabel, file } = params;

  const fd = new FormData();
  fd.append("ai_feature", "diagnosis");
  fd.append("feature_key", datasetLabel);
  fd.append("file", file);

  const res  = await submitDiagnosisPredictionRaw(cancerSlug, fd);
  const text = await res.text();

  if (!res.ok) {
    const error = text.includes("Invalid CSV")
      ? "Invalid CSV format. Please check your file headers."
      : text || "Server error.";
    return { success: false, error, rawResponse: text };
  }

  try {
    const result = JSON.parse(text);
    return { success: true, data: mapPredictionResult(result) };
  } catch {
    return {
      success: false,
      error: "Server returned invalid JSON. Raw response shown below.",
      rawResponse: text,
    };
  }
}

/**
 * Mengirim file CSV ke endpoint async.
 * Mengembalikan SubmitAsyncResult — halaman tidak perlu tahu HTTP 202/503.
 */
export async function submitDiagnosisAsync(params: {
  cancerSlug: string;
  datasetLabel: string;
  file: File;
}): Promise<SubmitAsyncResult> {
  const { cancerSlug, datasetLabel, file } = params;

  const fd = new FormData();
  fd.append("ai_feature", "diagnosis");
  fd.append("feature_key", datasetLabel);
  fd.append("file", file);

  const res = await submitDiagnosisAsyncRaw(cancerSlug, fd);

  // Redis disabled di backend
  if (res.status === 503) {
    const data = await res.json().catch(() => ({}));
    return {
      success: false,
      error: data.error || "Async processing is currently unavailable.",
      unavailable: true,
    };
  }

  if (!res.ok) {
    const text = await res.text();
    return { success: false, error: text || "Failed to queue async job." };
  }

  const data = await res.json();
  return {
    success: true,
    job_id: data.job_id,
    cached: data.cached,
    note: data.note,
  };
}

/**
 * Polling satu kali untuk status job async.
 * Dipanggil berulang oleh AsyncJobPanel dengan adaptive backoff.
 */
export async function pollPredictionJob(jobId: string): Promise<PollJobResult> {
  const res = await getPredictionJobStatusRaw(jobId);

  if (res.status === 503) return { status: "unavailable" };
  if (res.status === 404) return { status: "not_found" };
  if (!res.ok) throw new Error(`Unexpected poll response: ${res.status}`);

  const data = await res.json();

  switch (data.status) {
    case "processing":
      return { status: "processing", elapsed_ms: data.elapsed_ms };

    case "completed":
      return {
        status: "completed",
        result: mapPredictionResult(data.result),
        is_cache_hit: data.is_cache_hit ?? false,
        total_time_ms: data.total_time_ms,
      };

    case "failed":
      return {
        status: "failed",
        error: data.error || "AI processing failed. Please try again.",
      };

    default:
      // Status tidak dikenal — anggap masih processing
      return { status: "processing" };
  }
}

/**
 * Mengirim gene file + image file untuk prediksi multi-modal.
 */
export async function submitMultiModalDiagnosis(params: {
  cancerSlug: string;
  geneFile: File;
  imageFile: File;
}): Promise<any> {
  const { cancerSlug, geneFile, imageFile } = params;

  const formData = new FormData();
  formData.append("gene_file", geneFile);
  formData.append("image_file", imageFile);

  return await submitMultiModalPredictionRaw(cancerSlug, formData);
}
